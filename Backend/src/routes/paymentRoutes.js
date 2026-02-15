const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/webhook', paymentController.webhook); // Paystack webhook (public)
router.get('/verify/:reference', paymentController.verify);
router.get('/verify', paymentController.verify);

module.exports = router;
