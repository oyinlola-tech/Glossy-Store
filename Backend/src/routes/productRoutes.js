const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:idOrSlug', productController.getProduct);
router.post('/:idOrSlug/rate', authMiddleware, productController.addRating);
router.post('/:idOrSlug/comment', authMiddleware, productController.addComment);

module.exports = router;
