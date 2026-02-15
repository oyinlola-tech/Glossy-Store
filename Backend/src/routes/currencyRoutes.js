const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

router.get('/profile', currencyController.getProfile);

module.exports = router;
