const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * Product Routes
 * Priority: External API → Database → Manual Entry
 */

/**
 * GET /api/products/barcode/:barcode
 * Step 2: Get product from database if not found in external APIs
 */
router.get('/products/barcode/:barcode', productController.getProductByBarcode);

/**
 * POST /api/products
 * Create a new product (used when manually adding a product not found anywhere)
 */
router.post('/products', productController.createProduct);

/**
 * GET /api/products
 * Get all products with optional filtering
 * Query params: ?category=Food&source=manual&limit=100&skip=0
 */
router.get('/products', productController.getAllProducts);

/**
 * GET /api/products/search/:query
 * Search products by name, category, or barcode
 */
router.get('/products/search/:query', productController.searchProducts);

module.exports = router;
