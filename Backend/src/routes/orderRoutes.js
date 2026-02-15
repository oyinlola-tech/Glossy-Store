const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const sensitiveActionRateLimiter = require('../middleware/sensitiveActionRateLimiter');

router.post('/checkout', authMiddleware, orderController.checkout);
router.get('/discount-preview', authMiddleware, orderController.getDiscountPreview);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:id/status', authMiddleware, orderController.getOrderStatus);
router.patch('/:id/cancel', authMiddleware, sensitiveActionRateLimiter, orderController.cancelOrder);
router.post('/:id/chargeback', authMiddleware, sensitiveActionRateLimiter, orderController.requestChargeback);
router.get('/:id', authMiddleware, orderController.getOrderDetails);

module.exports = router;
