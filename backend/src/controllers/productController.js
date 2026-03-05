const Product = require('../models/Product');

/**
 * Get product by barcode from database
 * Step 2 in the scanner priority: If not found in external APIs, check MongoDB
 */
exports.getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode || barcode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    const product = await Product.findOne({ barcode: barcode.trim() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in database',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product found in database',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * Create a new product in the shared collection
 * Called when a user manually adds a product not found in any API
 */
exports.createProduct = async (req, res) => {
  try {
    const { barcode, itemName, category, itemImage, source } = req.body;

    // Validate required fields
    if (!barcode || !itemName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: barcode, itemName, category'
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ barcode: barcode.trim() });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product with this barcode already exists',
        data: existingProduct
      });
    }

    const newProduct = new Product({
      barcode: barcode.trim(),
      itemName: itemName.trim(),
      category,
      itemImage: itemImage || null,
      source: source || 'manual'
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

/**
 * Get all products with optional filtering
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, source, limit = 100, skip = 0 } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (source) filter.source = source;

    const products = await Product.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        returned: products.length
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * Search products by name or category
 */
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $or: [
        { itemName: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};
