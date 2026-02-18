const {
  Category, Product, ProductImage, ProductColor, ProductSize, ProductVariant,
  FlashSale, FlashSaleProduct, Coupon, ContactMessage, User, Order, OrderItem,
  PaystackEvent,
} = require('../models');
const { sendContactReplyEmail } = require('../services/emailService');
const {
  orderIdParamSchema,
  adminUpdateOrderStatusSchema,
  adminResolveDisputeSchema,
} = require('../validations/orderValidation');
const {
  adminCreateUserSchema,
  adminUserIdParamSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  flashSaleCreateSchema,
  flashSaleUpdateSchema,
  couponCreateSchema,
  couponUpdateSchema,
  contactReplySchema,
  paymentEventQuerySchema,
} = require('../validations/adminValidation');
const {
  productCreateSchema,
  productUpdateSchema,
  productIdParamSchema,
} = require('../validations/productValidation');

const validateBody = (schema, body) => schema.validate(body, { abortEarly: true, stripUnknown: true });
const validateParams = (schema, params) => schema.validate(params, { abortEarly: true, convert: true, stripUnknown: true });

const syncProductStockFromVariants = async (productId) => {
  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    attributes: ['stock'],
  });
  if (!variants.length) return;
  const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  await Product.update({ stock: totalStock }, { where: { id: productId } });
};

// ---------- Admin Users ----------
exports.createAdminUser = async (req, res, next) => {
  try {
    const { error, value } = validateBody(adminCreateUserSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { name, email, password } = value;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const adminUser = await User.create({
      name,
      email,
      password_hash: password,
      role: 'admin',
      is_super_admin: false,
      email_verified: true,
      created_by_admin_id: req.user.id,
    });

    return res.status(201).json({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      is_super_admin: adminUser.is_super_admin,
      created_by_admin_id: adminUser.created_by_admin_id,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- Categories ----------
exports.createCategory = async (req, res, next) => {
  try {
    const { error, value } = validateBody(categoryCreateSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { name, description, parent_id } = value;
    const category = await Category.create({ name, description, parent_id });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.deleteAdminUser = async (req, res, next) => {
  try {
    const paramValidation = validateParams(adminUserIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const adminId = paramValidation.value.id;

    if (Number(req.user.id) === Number(adminId)) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    const adminUser = await User.findByPk(adminId);
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    if (adminUser.role !== 'admin') {
      return res.status(400).json({ error: 'Target user is not an admin account' });
    }

    if (adminUser.is_super_admin) {
      return res.status(403).json({ error: 'Super admin accounts cannot be deleted' });
    }

    await User.update(
      { created_by_admin_id: null },
      { where: { created_by_admin_id: adminUser.id } }
    );

    await adminUser.destroy();
    return res.json({ message: 'Admin user deleted' });
  } catch (err) {
    return next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(categoryUpdateSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const category = await Category.findByPk(paramValidation.value.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.update(bodyValidation.value);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const category = await Category.findByPk(paramValidation.value.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Products ----------
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{ model: ProductImage }, { model: ProductVariant }],
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const product = await Product.findByPk(paramValidation.value.id, {
      include: [{ model: ProductImage }, { model: ProductColor }, { model: ProductSize }, { model: ProductVariant }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { error, value } = validateBody(productCreateSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const {
      category_id,
      name,
      description,
      base_price,
      compare_at_price,
      discount_label,
      stock,
      colors,
      sizes,
      variants,
    } = value;

    const product = await Product.create({
      category_id,
      name,
      description,
      base_price,
      compare_at_price: compare_at_price || null,
      discount_label: discount_label || null,
      stock,
    });

    if (colors && colors.length) {
      await ProductColor.bulkCreate(colors.map((c) => ({ ...c, product_id: product.id })));
    }

    if (sizes && sizes.length) {
      await ProductSize.bulkCreate(sizes.map((s) => ({ size: s, product_id: product.id })));
    }

    if (variants && variants.length) {
      await ProductVariant.bulkCreate(variants.map((v) => ({ ...v, product_id: product.id })));
      await syncProductStockFromVariants(product.id);
    }

    if (req.files && req.files.length) {
      const images = req.files.map((file, index) => ({
        product_id: product.id,
        image_url: `/uploads/${file.filename}`,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(productUpdateSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const product = await Product.findByPk(paramValidation.value.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update(bodyValidation.value);

    // Handle colors: replace all (simplified)
    if (bodyValidation.value.colors) {
      await ProductColor.destroy({ where: { product_id: product.id } });
      await ProductColor.bulkCreate(bodyValidation.value.colors.map((c) => ({ ...c, product_id: product.id })));
    }

    // Handle sizes
    if (bodyValidation.value.sizes) {
      await ProductSize.destroy({ where: { product_id: product.id } });
      await ProductSize.bulkCreate(bodyValidation.value.sizes.map((s) => ({ size: s, product_id: product.id })));
    }

    // Handle variants
    if (bodyValidation.value.variants) {
      await ProductVariant.destroy({ where: { product_id: product.id } });
      await ProductVariant.bulkCreate(bodyValidation.value.variants.map((v) => ({ ...v, product_id: product.id })));
      await syncProductStockFromVariants(product.id);
    }

    // Handle images: new images replace old ones (simplified)
    if (req.files && req.files.length) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      const images = req.files.map((file, index) => ({
        product_id: product.id,
        image_url: `/uploads/${file.filename}`,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const product = await Product.findByPk(paramValidation.value.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Flash Sales ----------
exports.createFlashSale = async (req, res, next) => {
  try {
    const { error, value } = validateBody(flashSaleCreateSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { name, description, start_time, end_time, products } = value;
    const flashSale = await FlashSale.create({ name, description, start_time, end_time });
    if (products && products.length) {
      const productLinks = products.map((p) => ({
        flash_sale_id: flashSale.id,
        product_id: p.product_id,
        discount_price: p.discount_price,
      }));
      await FlashSaleProduct.bulkCreate(productLinks);
    }
    res.status(201).json(flashSale);
  } catch (err) {
    next(err);
  }
};

exports.getFlashSales = async (req, res, next) => {
  try {
    const flashSales = await FlashSale.findAll({
      include: [{ model: Product, through: { attributes: ['discount_price'] } }],
    });
    res.json(flashSales);
  } catch (err) {
    next(err);
  }
};

exports.updateFlashSale = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(flashSaleUpdateSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const flashSale = await FlashSale.findByPk(paramValidation.value.id);
    if (!flashSale) return res.status(404).json({ error: 'Flash sale not found' });
    await flashSale.update(bodyValidation.value);

    if (bodyValidation.value.products) {
      await FlashSaleProduct.destroy({ where: { flash_sale_id: flashSale.id } });
      const productLinks = bodyValidation.value.products.map((p) => ({
        flash_sale_id: flashSale.id,
        product_id: p.product_id,
        discount_price: p.discount_price,
      }));
      await FlashSaleProduct.bulkCreate(productLinks);
    }

    res.json(flashSale);
  } catch (err) {
    next(err);
  }
};

exports.deleteFlashSale = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const flashSale = await FlashSale.findByPk(paramValidation.value.id);
    if (!flashSale) return res.status(404).json({ error: 'Flash sale not found' });
    await flashSale.destroy();
    res.json({ message: 'Flash sale deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Coupons ----------
exports.createCoupon = async (req, res, next) => {
  try {
    const { error, value } = validateBody(couponCreateSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const coupon = await Coupon.create(value);
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(couponUpdateSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const coupon = await Coupon.findByPk(paramValidation.value.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.update(bodyValidation.value);
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const coupon = await Coupon.findByPk(paramValidation.value.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.destroy();
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Contact Messages ----------
exports.getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.replyToContactMessage = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(contactReplySchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const { reply } = bodyValidation.value;
    const message = await ContactMessage.findByPk(paramValidation.value.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.admin_reply = reply;
    message.replied_at = new Date();
    await message.save();

    await sendContactReplyEmail(message.email, message.name, reply);

    res.json({ message: 'Reply sent' });
  } catch (err) {
    next(err);
  }
};

// ---------- Users ----------
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ---------- Orders ----------
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
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

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const [users, products, orders, pendingSupport] = await Promise.all([
      User.count(),
      Product.count(),
      Order.count(),
      ContactMessage.count({ where: { replied_at: null } }),
    ]);

    return res.json({
      users,
      products,
      orders,
      pending_support_messages: pendingSupport,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const paramValidation = validateParams(orderIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(adminUpdateOrderStatusSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const { status, status_note } = bodyValidation.value;

    const order = await Order.findByPk(paramValidation.value.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'refunded' && status !== 'refunded') {
      return res.status(409).json({ error: 'Refunded orders cannot transition to another status' });
    }
    if (status === 'delivered' && !['out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(409).json({ error: 'Order must be out_for_delivery before marking delivered' });
    }

    order.status = status;
    order.status_note = status_note || null;
    if (status === 'out_for_delivery') order.out_for_delivery_at = new Date();
    if (status === 'delivered') order.delivered_at = new Date();
    if (status === 'cancelled') order.cancelled_at = new Date();
    if (status === 'refunded') order.refunded_at = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.resolveOrderDispute = async (req, res, next) => {
  try {
    const paramValidation = validateParams(orderIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(adminResolveDisputeSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const { decision, note } = bodyValidation.value;

    const order = await Order.findByPk(paramValidation.value.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.dispute_status !== 'pending') {
      return res.status(400).json({ error: 'No pending dispute found for this order' });
    }

    const resolutionNote = note ? String(note).trim() : null;
    const resolvedAt = new Date();

    if (decision === 'approve_chargeback') {
      order.status = 'refunded';
      order.refunded_at = resolvedAt;
      order.dispute_status = 'approved';
      order.dispute_resolved_at = resolvedAt;
      order.dispute_resolution_note = resolutionNote || 'Dispute approved. Chargeback issued by admin.';
      order.status_note = order.dispute_resolution_note;
    } else {
      order.dispute_status = 'rejected';
      order.dispute_resolved_at = resolvedAt;
      order.dispute_resolution_note = resolutionNote || 'Dispute rejected. No chargeback issued.';
      order.status_note = order.dispute_resolution_note;
    }

    await order.save();
    return res.json(order);
  } catch (err) {
    return next(err);
  }
};

exports.getPaymentEvents = async (req, res, next) => {
  try {
    const queryValidation = validateBody(paymentEventQuerySchema, req.query);
    if (queryValidation.error) return res.status(400).json({ error: 'Invalid query parameters' });
    const { event } = queryValidation.value;
    const where = {};
    if (event) {
      where.event = String(event);
    }
    const events = await PaystackEvent.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 200,
    });
    return res.json(events);
  } catch (err) {
    return next(err);
  }
};
