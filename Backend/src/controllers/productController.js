const { Product, Category, ProductImage, ProductColor, ProductSize, ProductVariant, Rating, Comment, FlashSale, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const {
  productIdParamSchema,
  productQuerySchema,
  ratingSchema,
  commentSchema,
} = require('../validations/productValidation');

const validateParams = (schema, params) => schema.validate(params, { abortEarly: true, convert: true, stripUnknown: true });
const validateQuery = (schema, query) => schema.validate(query, { abortEarly: true, convert: true, stripUnknown: true });
const validateBody = (schema, body) => schema.validate(body, { abortEarly: true, stripUnknown: true });

const formatPricing = (product) => {
  const currentPrice = Number(product.base_price);
  const originalPrice = product.compare_at_price !== null && product.compare_at_price !== undefined
    ? Number(product.compare_at_price)
    : null;
  const hasDiscount = originalPrice !== null && originalPrice > currentPrice;
  return {
    current_price: currentPrice,
    original_price: hasDiscount ? originalPrice : null,
    has_discount: hasDiscount,
    discount_label: hasDiscount ? product.discount_label : null,
  };
};

const formatAvailability = (product) => ({
  stock: Number(product.stock || 0),
  is_out_of_stock: Number(product.stock || 0) <= 0,
});

exports.getProducts = async (req, res, next) => {
  try {
    const { error, value } = validateQuery(productQuerySchema, req.query);
    if (error) return res.status(400).json({ error: 'Invalid query parameters' });
    const { category, minPrice, maxPrice, rating, flashSale, newArrivals, page, limit } = value;
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const where = {};
    if (category) where.category_id = category;
    if (minPrice !== undefined) where.base_price = { [Op.gte]: minPrice };
    if (maxPrice !== undefined) where.base_price = { ...where.base_price, [Op.lte]: maxPrice };
    if (rating) where.average_rating = { [Op.gte]: rating };

    const include = [
      { model: ProductImage },
      { model: ProductVariant, include: [{ model: ProductColor }, { model: ProductSize }] },
    ];
    if (flashSale === true) {
      include.push({
        model: FlashSale,
        where: {
          start_time: { [Op.lte]: new Date() },
          end_time: { [Op.gte]: new Date() },
        },
        required: true,
      });
    }
    if (newArrivals === true) {
      where.created_at = { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    const products = await Product.findAndCountAll({
      where,
      include,
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      distinct: true,
    });

    res.json({
      total: products.count,
      page: pageNumber,
      pages: Math.ceil(products.count / pageSize),
      products: products.rows.map((product) => ({
        ...product.toJSON(),
        ...formatPricing(product),
        ...formatAvailability(product),
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const product = await Product.findByPk(paramValidation.value.id, {
      include: [
        { model: ProductImage },
        { model: ProductColor },
        { model: ProductSize },
        { model: ProductVariant },
        { model: Rating, include: [{ model: User, attributes: ['id', 'name'] }] },
        { model: Comment, include: [{ model: User, attributes: ['id', 'name'] }] },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({
      ...product.toJSON(),
      ...formatPricing(product),
      ...formatAvailability(product),
    });
  } catch (err) {
    next(err);
  }
};

exports.addRating = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(ratingSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const { rating, review } = bodyValidation.value;
    const productId = paramValidation.value.id;
    const userId = req.user.id;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const [ratingRecord, created] = await Rating.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { rating, review },
    });
    if (!created) {
      ratingRecord.rating = rating;
      ratingRecord.review = review;
      await ratingRecord.save();
    }

    // Update product average rating
    const avg = await Rating.findOne({
      where: { product_id: productId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
    });
    await Product.update({ average_rating: avg.dataValues.avg }, { where: { id: productId } });

    res.json(ratingRecord);
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const paramValidation = validateParams(productIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(commentSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const { comment } = bodyValidation.value;
    const productId = paramValidation.value.id;
    const userId = req.user.id;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newComment = await Comment.create({
      user_id: userId,
      product_id: productId,
      comment,
    });
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};
