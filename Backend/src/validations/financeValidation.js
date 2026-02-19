const Joi = require('joi');

const periodSchema = Joi.string().trim().valid('daily', 'weekly', 'monthly', 'yearly').default('daily');

const dateSchema = Joi.date().iso();

const financeSummaryQuerySchema = Joi.object({
  start: dateSchema.optional(),
  end: dateSchema.optional(),
});

const financeTrendsQuerySchema = Joi.object({
  period: periodSchema,
  start: dateSchema.optional(),
  end: dateSchema.optional(),
});

const financeTransactionsQuerySchema = Joi.object({
  type: Joi.string().trim().valid('all', 'sales', 'refunds').default('all'),
  start: dateSchema.optional(),
  end: dateSchema.optional(),
  limit: Joi.number().integer().min(1).max(200).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  financeSummaryQuerySchema,
  financeTrendsQuerySchema,
  financeTransactionsQuerySchema,
};
