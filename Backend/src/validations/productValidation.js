const Joi = require('joi');

const productIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const productQuerySchema = Joi.object({
  category: Joi.number().integer().positive().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  rating: Joi.number().min(1).max(5).optional(),
  flashSale: Joi.boolean().truthy('true').falsy('false').optional(),
  newArrivals: Joi.boolean().truthy('true').falsy('false').optional(),
  page: Joi.number().integer().min(1).max(10000).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).custom((value, helpers) => {
  if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'min/max price validation');

const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().trim().max(1000).allow('', null).optional(),
});

const commentSchema = Joi.object({
  comment: Joi.string().trim().min(1).max(2000).required(),
});

const productCreateSchema = Joi.object({
  category_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(5000).allow('', null).optional(),
  base_price: Joi.number().positive().required(),
  compare_at_price: Joi.number().positive().allow(null).optional(),
  discount_label: Joi.string().trim().max(100).allow('', null).optional(),
  stock: Joi.number().integer().min(0).optional(),
  colors: Joi.array().items(Joi.object({
    color_name: Joi.string().trim().min(1).max(50).required(),
    color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
  })).optional(),
  sizes: Joi.array().items(Joi.string().trim().min(1).max(20)).optional(),
  variants: Joi.array().items(Joi.object({
    color_id: Joi.number().integer().positive().allow(null).optional(),
    size_id: Joi.number().integer().positive().allow(null).optional(),
    sku: Joi.string().trim().max(64).allow('', null).optional(),
    price_adjustment: Joi.number().min(-100000).max(100000).optional(),
    stock: Joi.number().integer().min(0).optional(),
    image_id: Joi.number().integer().positive().allow(null).optional(),
  })).optional(),
}).custom((value, helpers) => {
  if (value.compare_at_price !== null && value.compare_at_price !== undefined) {
    if (value.base_price && value.compare_at_price < value.base_price) {
      return helpers.error('any.invalid');
    }
  }
  return value;
}, 'compare_at_price validation');

const productUpdateSchema = Joi.object({
  category_id: Joi.number().integer().positive().optional(),
  name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(5000).allow('', null).optional(),
  base_price: Joi.number().positive().optional(),
  compare_at_price: Joi.number().positive().allow(null).optional(),
  discount_label: Joi.string().trim().max(100).allow('', null).optional(),
  stock: Joi.number().integer().min(0).optional(),
  colors: Joi.array().items(Joi.object({
    color_name: Joi.string().trim().min(1).max(50).required(),
    color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
  })).optional(),
  sizes: Joi.array().items(Joi.string().trim().min(1).max(20)).optional(),
  variants: Joi.array().items(Joi.object({
    color_id: Joi.number().integer().positive().allow(null).optional(),
    size_id: Joi.number().integer().positive().allow(null).optional(),
    sku: Joi.string().trim().max(64).allow('', null).optional(),
    price_adjustment: Joi.number().min(-100000).max(100000).optional(),
    stock: Joi.number().integer().min(0).optional(),
    image_id: Joi.number().integer().positive().allow(null).optional(),
  })).optional(),
}).custom((value, helpers) => {
  if (value.compare_at_price !== null && value.compare_at_price !== undefined && value.base_price !== undefined) {
    if (value.compare_at_price < value.base_price) {
      return helpers.error('any.invalid');
    }
  }
  return value;
}, 'compare_at_price validation').min(1);

module.exports = {
  productCreateSchema,
  productUpdateSchema,
  productIdParamSchema,
  productQuerySchema,
  ratingSchema,
  commentSchema,
};
