const Joi = require('joi');

const cartItemIdParamSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
});

const addToCartSchema = Joi.object({
  productVariantId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(100).default(1),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required(),
});

module.exports = {
  cartItemIdParamSchema,
  addToCartSchema,
  updateCartItemSchema,
};
