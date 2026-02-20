const Joi = require('joi');

const strongPassword = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .required();

const adminCreateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: strongPassword,
});

const adminUserIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const categoryCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(1000).allow('', null).optional(),
  parent_id: Joi.number().integer().positive().allow(null).optional(),
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  description: Joi.string().trim().max(1000).allow('', null).optional(),
  parent_id: Joi.number().integer().positive().allow(null).optional(),
}).min(1);

const flashSaleCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  start_time: Joi.date().required(),
  end_time: Joi.date().greater(Joi.ref('start_time')).required(),
  products: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().positive().required(),
    discount_price: Joi.number().positive().required(),
  })).max(8).optional(),
});

const flashSaleUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  start_time: Joi.date().optional(),
  end_time: Joi.date().optional(),
  products: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().positive().required(),
    discount_price: Joi.number().positive().required(),
  })).max(8).optional(),
}).custom((value, helpers) => {
  if (value.start_time && value.end_time && new Date(value.end_time) <= new Date(value.start_time)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'flash sale time validation').min(1);

const couponCreateSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(50).required(),
  discount_type: Joi.string().valid('percentage', 'fixed').required(),
  discount_value: Joi.number().positive().required(),
  min_order_amount: Joi.number().positive().allow(null).optional(),
  valid_from: Joi.date().required(),
  valid_until: Joi.date().greater(Joi.ref('valid_from')).required(),
  usage_limit: Joi.number().integer().min(1).allow(null).optional(),
});

const couponUpdateSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(50).optional(),
  discount_type: Joi.string().valid('percentage', 'fixed').optional(),
  discount_value: Joi.number().positive().optional(),
  min_order_amount: Joi.number().positive().allow(null).optional(),
  valid_from: Joi.date().optional(),
  valid_until: Joi.date().optional(),
  usage_limit: Joi.number().integer().min(1).allow(null).optional(),
}).custom((value, helpers) => {
  if (value.valid_from && value.valid_until && new Date(value.valid_until) <= new Date(value.valid_from)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'coupon date validation').min(1);

const contactReplySchema = Joi.object({
  reply: Joi.string().trim().min(2).max(5000).required(),
});

const paymentEventQuerySchema = Joi.object({
  event: Joi.string().trim().max(100).optional(),
});

module.exports = {
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
};
