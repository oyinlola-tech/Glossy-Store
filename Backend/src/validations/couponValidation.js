const Joi = require('joi');

const couponValidateSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(50).required(),
  cartTotal: Joi.number().min(0).required(),
});

module.exports = { couponValidateSchema };
