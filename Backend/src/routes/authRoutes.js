const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const passport = require('../config/passport');
const authRateLimiter = require('../middleware/authRateLimiter');
const otpRateLimiter = require('../middleware/otpRateLimiter');

const ensureProviderEnabled = (provider) => (req, res, next) => {
  if (!passport.socialProviders?.[provider]) {
    return res.status(501).json({ error: `${provider} auth is not configured` });
  }
  return next();
};

// Google OAuth routes
router.get('/google', ensureProviderEnabled('google'), passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', ensureProviderEnabled('google'), passport.authenticate('google', { session: false }), authController.googleCallback);

// Apple OAuth routes
router.get('/apple', ensureProviderEnabled('apple'), passport.authenticate('apple', { scope: ['email'] }));
router.get('/apple/callback', ensureProviderEnabled('apple'), passport.authenticate('apple', { session: false }), authController.appleCallback);

router.post('/register', authRateLimiter, authController.register);
router.post('/verify-otp', otpRateLimiter, authController.verifyOTP);
router.post('/resend-otp', otpRateLimiter, authController.resendOTP);
router.post('/login', authRateLimiter, authController.login);
router.post('/verify-login-otp', otpRateLimiter, authController.verifyLoginOTP);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', otpRateLimiter, authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/request-delete-account', authMiddleware, authRateLimiter, authController.requestDeleteAccount);
router.post('/confirm-delete-account', authMiddleware, authRateLimiter, authController.confirmDeleteAccount);

module.exports = router;
