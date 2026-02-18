const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const paymentRateLimiter = require('../middleware/paymentRateLimiter');

router.post('/webhook', paymentRateLimiter, paymentController.webhook); // Squad webhook (public)
router.get('/verify/:reference', paymentRateLimiter, paymentController.verify);
router.get('/verify', paymentRateLimiter, paymentController.verify);

module.exports = router;
