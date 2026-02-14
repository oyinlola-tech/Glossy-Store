const Joi = require('joi');

const emailSchema = Joi.string().trim().lowercase().email().required();
const otpSchema = Joi.string().trim().length(6).pattern(/^\d+$/).required();
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .required();

const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: Joi.string().trim().min(2).max(100).required(),
  referralCode: Joi.string().trim().max(64).optional(),
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
});

const verifyOTPSchema = Joi.object({
  email: emailSchema,
  otp: otpSchema,
  purpose: Joi.string().valid('registration', 'login', 'forgot_password', 'delete_account').required(),
});

const verifyLoginOTPSchema = Joi.object({
  email: emailSchema,
  otp: otpSchema,
});

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

const resendOTPSchema = Joi.object({
  email: emailSchema,
  purpose: Joi.string().valid('registration', 'login', 'forgot_password').required(),
});

const resetPasswordSchema = Joi.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema.invalid(Joi.ref('currentPassword')),
});

const confirmDeleteAccountSchema = Joi.object({
  otp: otpSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  verifyLoginOTPSchema,
  forgotPasswordSchema,
  resendOTPSchema,
  resetPasswordSchema,
  changePasswordSchema,
  confirmDeleteAccountSchema,
};
