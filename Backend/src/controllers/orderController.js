const { Order, OrderItem, Cart, CartItem, Coupon, ProductVariant, Product, User, sequelize } = require('../models');
const { initializeTransaction } = require('../services/paymentService');
const { Op } = require('sequelize');
const crypto = require('crypto');

const calculateItemPrice = (variant) => {
  const basePrice = Number(variant.Product.base_price);
  const adjustment = Number(variant.price_adjustment || 0);
  return basePrice + adjustment;
};

const refreshProductStock = async (productId, transaction) => {
  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    attributes: ['stock'],
    transaction,
  });
  const totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  await Product.update({ stock: totalStock }, { where: { id: productId }, transaction });
};

const computeWelcomeDiscount = async ({ userId, cartItems, transaction }) => {
  if (!cartItems?.length) {
    return { eligible: false, amount: 0, applies_to: null, reason: 'cart_empty' };
  }

  const existingOrderCount = await Order.count({
    where: { user_id: userId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (existingOrderCount > 0) {
    return { eligible: false, amount: 0, applies_to: null, reason: 'not_first_order' };
  }

  const firstItem = cartItems[0];
  const firstVariant = await ProductVariant.findByPk(firstItem.product_variant_id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
    include: [{ model: Product }],
  });
  if (!firstVariant) {
    return { eligible: false, amount: 0, applies_to: null, reason: 'variant_not_found' };
  }

  const unitPrice = calculateItemPrice(firstVariant);
  const amount = Number(((unitPrice * 10) / 100).toFixed(2));
  return {
    eligible: amount > 0,
    amount,
    applies_to: {
      product_variant_id: firstVariant.id,
      product_name: firstVariant.Product?.name || 'Product',
      quantity_affected: 1,
      discount_rate: 10,
    },
    reason: amount > 0 ? 'eligible' : 'invalid_price',
  };
};

exports.getDiscountPreview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{ model: CartItem }],
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.json({
        welcome_discount_eligible: false,
        welcome_discount_amount: 0,
        welcome_discount_message: 'Add items to cart to see discount preview',
        applies_to: null,
      });
    }

    const preview = await sequelize.transaction(async (transaction) => (
      computeWelcomeDiscount({ userId, cartItems: cart.CartItems, transaction })
    ));

    return res.json({
      welcome_discount_eligible: preview.eligible,
      welcome_discount_amount: preview.amount,
      welcome_discount_message: preview.eligible
        ? '10% first-order discount applies to one product unit'
        : 'No first-order discount available',
      applies_to: preview.applies_to,
    });
  } catch (err) {
    return next(err);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode } = req.body;
    const userId = req.user.id;

    // Get user's cart
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{
        model: CartItem,
        include: [{ model: ProductVariant, include: [{ model: Product }] }],
      }],
    });
    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const checkoutResult = await sequelize.transaction(async (transaction) => {
      let subtotal = 0;
      const stockTouchedProductIds = new Set();
      let firstItemUnitPrice = 0;

      const lockedVariants = {};
      for (let index = 0; index < cart.CartItems.length; index += 1) {
        const item = cart.CartItems[index];
        const lockedVariant = await ProductVariant.findByPk(item.product_variant_id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
          include: [{ model: Product }],
        });
        if (!lockedVariant) {
          throw new Error(`Product variant ${item.product_variant_id} was not found`);
        }
        if (Number(lockedVariant.stock) < Number(item.quantity)) {
          const available = Number(lockedVariant.stock);
          throw new Error(`Insufficient stock for ${lockedVariant.Product.name}. Available: ${available}`);
        }
        lockedVariants[item.product_variant_id] = lockedVariant;
        const unitPrice = calculateItemPrice(lockedVariant);
        if (index === 0) {
          firstItemUnitPrice = unitPrice;
        }
        subtotal += unitPrice * Number(item.quantity);
      }

      let discount = 0;
      let coupon = null;
      let welcomeDiscountApplied = false;
      let welcomeDiscountAmount = 0;
      let welcomeDiscountTarget = null;

      if (couponCode) {
        coupon = await Coupon.findOne({
          where: {
            code: couponCode,
            valid_from: { [Op.lte]: new Date() },
            valid_until: { [Op.gte]: new Date() },
            usage_limit: { [Op.gt]: sequelize.col('used_count') },
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (coupon) {
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * Number(coupon.discount_value)) / 100;
          } else {
            discount = Number(coupon.discount_value);
          }
          discount = Math.min(discount, subtotal);
          coupon.used_count = Number(coupon.used_count || 0) + 1;
          await coupon.save({ transaction });
        }
      } else {
        const preview = await computeWelcomeDiscount({
          userId,
          cartItems: cart.CartItems,
          transaction,
        });
        if (preview.eligible && firstItemUnitPrice > 0) {
          // One-time 10% off for new users, applied to exactly one product unit.
          discount = Math.min(preview.amount, subtotal);
          welcomeDiscountApplied = discount > 0;
          welcomeDiscountAmount = discount;
          welcomeDiscountTarget = preview.applies_to;
        }
      }

      const total = subtotal - discount;
      const orderNumber = `ORD-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

      const newOrder = await Order.create({
        user_id: userId,
        order_number: orderNumber,
        total,
        discount,
        coupon_id: coupon ? coupon.id : null,
        shipping_address: shippingAddress,
        status: 'pending',
        payment_status: 'pending',
      }, { transaction });

      for (const item of cart.CartItems) {
        const variant = lockedVariants[item.product_variant_id];
        const price = calculateItemPrice(variant);

        await OrderItem.create({
          order_id: newOrder.id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price,
        }, { transaction });

        variant.stock = Number(variant.stock) - Number(item.quantity);
        await variant.save({ transaction });
        stockTouchedProductIds.add(variant.product_id);
      }

      for (const productId of stockTouchedProductIds) {
        await refreshProductStock(productId, transaction);
      }

      await CartItem.destroy({ where: { cart_id: cart.id }, transaction });
      return {
        order: newOrder,
        total,
        welcome_discount_applied: welcomeDiscountApplied,
        welcome_discount_amount: welcomeDiscountAmount,
        welcome_discount_message: welcomeDiscountApplied
          ? '10% first-order discount applied to one product unit'
          : null,
        welcome_discount_target: welcomeDiscountTarget,
      };
    });

    // Initialize payment
    const paymentReference = `PAY-${checkoutResult.order.id}-${Date.now()}`;
    const paymentData = await initializeTransaction(
      req.user.email,
      checkoutResult.total,
      paymentReference,
      { orderId: checkoutResult.order.id }
    );

    res.json({
      order: checkoutResult.order,
      payment: paymentData,
      welcome_discount_applied: checkoutResult.welcome_discount_applied,
      welcome_discount_amount: checkoutResult.welcome_discount_amount,
      welcome_discount_message: checkoutResult.welcome_discount_message,
      welcome_discount_target: checkoutResult.welcome_discount_target,
    });
  } catch (err) {
    if (String(err.message).startsWith('Insufficient stock')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!['pending', 'paid', 'processing'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    await sequelize.transaction(async (transaction) => {
      for (const item of order.OrderItems) {
        item.ProductVariant.stock = Number(item.ProductVariant.stock || 0) + Number(item.quantity);
        await item.ProductVariant.save({ transaction });
        await refreshProductStock(item.ProductVariant.product_id, transaction);
      }

      order.status = 'cancelled';
      order.cancelled_at = new Date();
      order.status_note = 'Cancelled by customer';
      await order.save({ transaction });
    });

    return res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem, include: [{ model: ProductVariant, include: [{ model: Product }] }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem, include: [{ model: ProductVariant, include: [{ model: Product }] }] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      attributes: [
        'id',
        'order_number',
        'status',
        'status_note',
        'payment_status',
        'out_for_delivery_at',
        'delivered_at',
        'cancelled_at',
        'refunded_at',
        'updated_at',
      ],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
