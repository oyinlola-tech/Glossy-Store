const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const contactRoutes = require('./contactRoutes');
const paymentRoutes = require('./paymentRoutes');
const couponRoutes = require('./couponRoutes');
const supportRoutes = require('./supportRoutes');
const categoryRoutes = require('./categoryRoutes');
const currencyRoutes = require('./currencyRoutes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/support', supportRoutes);
router.use('/categories', categoryRoutes);
router.use('/currency', currencyRoutes);

module.exports = router;
