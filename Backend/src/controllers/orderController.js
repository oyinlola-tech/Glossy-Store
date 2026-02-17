const { Order, OrderItem, Cart, CartItem, Coupon, ProductVariant, Product, User, sequelize } = require('../models');
const { initializeTransaction, chargeWithSavedCard } = require('../services/paymentService');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { getUserMethodWithToken } = require('../services/paymentMethodService');
const {
  checkoutSchema,
  orderIdParamSchema,
  chargebackSchema,
} = require('../validations/orderValidation');

const CHARGEBACK_REQUIRES_DISPUTE_STATUSES = new Set(['out_for_delivery', 'delivered']);
const validateBody = (schema, body) => schema.validate(body, { abortEarly: true, stripUnknown: true });
const validateParams = (schema, params) => schema.validate(params, { abortEarly: true, convert: true, stripUnknown: true });
const createHttpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

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

const rollbackFailedCheckout = async (userId, orderId) => {
  await sequelize.transaction(async (transaction) => {
    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [{ model: OrderItem }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) return;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const touchedProductIds = new Set();

    for (const item of order.OrderItems) {
      const variant = await ProductVariant.findByPk(item.product_variant_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (variant) {
        variant.stock = Number(variant.stock || 0) + Number(item.quantity || 0);
        await variant.save({ transaction });
        touchedProductIds.add(variant.product_id);
      }

      if (cart) {
        const existingCartItem = await CartItem.findOne({
          where: { cart_id: cart.id, product_variant_id: item.product_variant_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (existingCartItem) {
          existingCartItem.quantity = Number(existingCartItem.quantity || 0) + Number(item.quantity || 0);
          await existingCartItem.save({ transaction });
        } else {
          await CartItem.create({
            cart_id: cart.id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
          }, { transaction });
        }
      }
    }

    for (const productId of touchedProductIds) {
      await refreshProductStock(productId, transaction);
    }

    if (order.coupon_id) {
      const coupon = await Coupon.findByPk(order.coupon_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (coupon && Number(coupon.used_count || 0) > 0) {
        coupon.used_count = Number(coupon.used_count || 0) - 1;
        await coupon.save({ transaction });
      }
    }

    await OrderItem.destroy({ where: { order_id: order.id }, transaction });
    await order.destroy({ transaction });
  });
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
    const { error, value } = validateBody(checkoutSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { shippingAddress, couponCode, currency, paymentMethodId } = value;
    const userId = req.user.id;
    const normalizedCouponCode = couponCode ? String(couponCode).trim().toUpperCase() : null;

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

      if (normalizedCouponCode) {
        coupon = await Coupon.findOne({
          where: {
            code: normalizedCouponCode,
            valid_from: { [Op.lte]: new Date() },
            valid_until: { [Op.gte]: new Date() },
            [Op.or]: [
              { usage_limit: null },
              { usage_limit: { [Op.gt]: sequelize.col('used_count') } },
            ],
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!coupon) {
          throw createHttpError('Invalid or expired coupon');
        }
        if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
          throw createHttpError(`Minimum order amount is ${coupon.min_order_amount}`);
        }
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * Number(coupon.discount_value)) / 100;
        } else {
          discount = Number(coupon.discount_value);
        }
        discount = Math.min(discount, subtotal);
        coupon.used_count = Number(coupon.used_count || 0) + 1;
        await coupon.save({ transaction });
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
    const normalizedCurrency = String(currency || 'NGN').toUpperCase();
    if (!['NGN', 'USD'].includes(normalizedCurrency)) {
      return res.status(400).json({ error: 'Unsupported currency. Use NGN or USD.' });
    }
    const baseUrl = process.env.APP_BASE_URL ? String(process.env.APP_BASE_URL).replace(/\/+$/, '') : '';
    const callbackUrl = process.env.SQUAD_CALLBACK_URL || (baseUrl ? `${baseUrl}/payment/verify` : undefined);
    let paymentData;
    try {
      if (paymentMethodId) {
        const savedMethod = await getUserMethodWithToken(req.user.id, paymentMethodId);
        if (!savedMethod) {
          await rollbackFailedCheckout(userId, checkoutResult.order.id);
          return res.status(404).json({ error: 'Saved payment method not found' });
        }
        paymentData = await chargeWithSavedCard(
          req.user.email,
          checkoutResult.total,
          paymentReference,
          normalizedCurrency,
          savedMethod.token,
          { orderId: checkoutResult.order.id, paymentMethodId },
          callbackUrl
        );
        checkoutResult.order.payment_method = 'saved_card';
        await checkoutResult.order.save();
      } else {
        paymentData = await initializeTransaction(
          req.user.email,
          checkoutResult.total,
          paymentReference,
          { orderId: checkoutResult.order.id },
          normalizedCurrency,
          callbackUrl
        );
      }
    } catch (paymentErr) {
      try {
        await rollbackFailedCheckout(userId, checkoutResult.order.id);
      } catch (rollbackErr) {
        console.error('Checkout rollback failed:', rollbackErr?.message || rollbackErr);
      }
      if (paymentErr?.statusCode) {
        return res.status(paymentErr.statusCode).json({ error: paymentErr.message });
      }
      return res.status(502).json({ error: 'Unable to initialize payment. Please try again.' });
    }

    res.json({
      order: checkoutResult.order,
      payment: paymentData,
      welcome_discount_applied: checkoutResult.welcome_discount_applied,
      welcome_discount_amount: checkoutResult.welcome_discount_amount,
      welcome_discount_message: checkoutResult.welcome_discount_message,
      welcome_discount_target: checkoutResult.welcome_discount_target,
    });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    if (String(err.message).startsWith('Insufficient stock')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { error, value } = validateParams(orderIdParamSchema, req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const order = await Order.findOne({
      where: { id: value.id, user_id: req.user.id },
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

exports.requestChargeback = async (req, res, next) => {
  try {
    const paramValidation = validateParams(orderIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(chargebackSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });

    const order = await Order.findOne({
      where: { id: paramValidation.value.id, user_id: req.user.id },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment_status !== 'success') {
      return res.status(400).json({ error: 'Chargeback is only available for successful payments' });
    }
    if (order.status === 'refunded') {
      return res.status(400).json({ error: 'Order is already refunded' });
    }
    if (order.dispute_status === 'pending') {
      return res.status(409).json({ error: 'A dispute is already pending for this order' });
    }

    const reason = bodyValidation.value?.reason ? String(bodyValidation.value.reason).trim() : null;

    if (CHARGEBACK_REQUIRES_DISPUTE_STATUSES.has(order.status)) {
      order.dispute_status = 'pending';
      order.dispute_reason = reason;
      order.dispute_requested_at = new Date();
      order.dispute_resolved_at = null;
      order.dispute_resolution_note = null;
      order.status_note = 'Dispute raised by customer. Awaiting admin decision on chargeback.';
      await order.save();

      return res.status(202).json({
        message: 'Dispute created. Admin will decide whether to issue chargeback.',
        order,
      });
    }

    order.status = 'refunded';
    order.refunded_at = new Date();
    order.dispute_status = 'none';
    order.dispute_reason = null;
    order.dispute_requested_at = null;
    order.dispute_resolved_at = null;
    order.dispute_resolution_note = null;
    order.status_note = reason
      ? `Chargeback issued before delivery: ${reason}`
      : 'Chargeback issued before delivery';
    await order.save();

    return res.json({
      message: 'Chargeback issued successfully',
      order,
    });
  } catch (err) {
    return next(err);
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
    const { error, value } = validateParams(orderIdParamSchema, req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const order = await Order.findOne({
      where: { id: value.id, user_id: req.user.id },
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
    const { error, value } = validateParams(orderIdParamSchema, req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const order = await Order.findOne({
      where: { id: value.id, user_id: req.user.id },
      attributes: [
        'id',
        'order_number',
        'status',
        'status_note',
        'payment_status',
        'dispute_status',
        'dispute_reason',
        'dispute_requested_at',
        'dispute_resolved_at',
        'dispute_resolution_note',
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
