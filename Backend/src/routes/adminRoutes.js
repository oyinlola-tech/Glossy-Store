const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { secureProductImages } = require('../middleware/productImageSecurity');
const sensitiveActionRateLimiter = require('../middleware/sensitiveActionRateLimiter');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard/summary', adminController.getDashboardSummary);

// Admin account management (super admin only)
router.post('/admin-users', superAdminMiddleware, sensitiveActionRateLimiter, adminController.createAdminUser);
router.delete('/admin-users/:id', superAdminMiddleware, sensitiveActionRateLimiter, adminController.deleteAdminUser);

// Categories
router.post('/categories', sensitiveActionRateLimiter, adminController.createCategory);
router.put('/categories/:id', sensitiveActionRateLimiter, adminController.updateCategory);
router.delete('/categories/:id', sensitiveActionRateLimiter, adminController.deleteCategory);

// Products
router.get('/products', adminController.getProducts);
router.get('/products/:id', adminController.getProduct);
router.post('/products', sensitiveActionRateLimiter, upload.array('images', 10), secureProductImages, adminController.createProduct);
router.put('/products/:id', sensitiveActionRateLimiter, upload.array('images', 10), secureProductImages, adminController.updateProduct);
router.delete('/products/:id', sensitiveActionRateLimiter, adminController.deleteProduct);

// Flash Sales
router.post('/flash-sales', sensitiveActionRateLimiter, adminController.createFlashSale);
router.get('/flash-sales', adminController.getFlashSales);
router.put('/flash-sales/:id', sensitiveActionRateLimiter, adminController.updateFlashSale);
router.delete('/flash-sales/:id', sensitiveActionRateLimiter, adminController.deleteFlashSale);

// Coupons
router.post('/coupons', sensitiveActionRateLimiter, adminController.createCoupon);
router.get('/coupons', adminController.getCoupons);
router.put('/coupons/:id', sensitiveActionRateLimiter, adminController.updateCoupon);
router.delete('/coupons/:id', sensitiveActionRateLimiter, adminController.deleteCoupon);

// Contact Messages
router.get('/contact-messages', adminController.getContactMessages);
router.post('/contact-messages/:id/reply', sensitiveActionRateLimiter, adminController.replyToContactMessage);

// Users
router.get('/users', adminController.getUsers);

// Orders
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', sensitiveActionRateLimiter, adminController.updateOrderStatus);
router.patch('/orders/:id/dispute', sensitiveActionRateLimiter, adminController.resolveOrderDispute);

// Payments
router.get('/payments/events', adminController.getPaymentEvents);

module.exports = router;
