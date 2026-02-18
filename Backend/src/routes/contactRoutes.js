const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { optionalAuth } = require('../middleware/auth');
const contactRateLimiter = require('../middleware/contactRateLimiter');

router.post('/', contactRateLimiter, optionalAuth, contactController.submitContact);

module.exports = router;
