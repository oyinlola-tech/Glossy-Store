const Joi = require('joi');

const cartItemIdParamSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
});

const addToCartSchema = Joi.object({
  productVariantId: Joi.number().integer().positive().optional(),
  productId: Joi.number().integer().positive().optional(),
  quantity: Joi.number().integer().min(1).max(100).default(1),
  note: Joi.string().trim().max(500).allow('', null).optional(),
}).or('productVariantId', 'productId');

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required(),
  note: Joi.string().trim().max(500).allow('', null).optional(),
});

module.exports = {
  cartItemIdParamSchema,
  addToCartSchema,
  updateCartItemSchema,
};
