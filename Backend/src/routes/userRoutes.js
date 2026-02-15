const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const sensitiveActionRateLimiter = require('../middleware/sensitiveActionRateLimiter');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/wishlist', authMiddleware, userController.getWishlist);
router.post('/wishlist/:productId', authMiddleware, userController.addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, userController.removeFromWishlist);
router.get('/referral', authMiddleware, userController.getReferralInfo);
router.get('/payment-methods', authMiddleware, userController.getPaymentMethods);
router.patch('/payment-methods/:id/default', authMiddleware, sensitiveActionRateLimiter, userController.setDefaultPaymentMethod);
router.delete('/payment-methods/:id', authMiddleware, sensitiveActionRateLimiter, userController.deletePaymentMethod);

module.exports = router;
