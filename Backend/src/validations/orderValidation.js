const Joi = require('joi');

const checkoutSchema = Joi.object({
  shippingAddress: Joi.string().trim().min(5).max(500).required(),
  couponCode: Joi.string().trim().max(64).allow('', null).optional(),
  currency: Joi.string().trim().uppercase().valid('NGN', 'USD').optional(),
  paymentMethodId: Joi.number().integer().positive().optional(),
});

const orderIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const chargebackSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(500).optional(),
});

const adminUpdateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .trim()
    .valid('pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')
    .required(),
  status_note: Joi.string().trim().max(1000).allow('', null).optional(),
});

const adminResolveDisputeSchema = Joi.object({
  decision: Joi.string().trim().valid('approve_chargeback', 'reject_chargeback').required(),
  note: Joi.string().trim().max(1000).allow('', null).optional(),
});

module.exports = {
  checkoutSchema,
  orderIdParamSchema,
  chargebackSchema,
  adminUpdateOrderStatusSchema,
  adminResolveDisputeSchema,
};
