const Item = require('../models/Item');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendItemAddedEmail } = require('../services/emailService');

// Create a new item
/**
 * Smart Save Logic:
 * 1. Always save to Items collection (user-specific)
 * 2. If barcode provided and source is 'manual', also save to Products collection (shared)
 * 3. This enables future users to find products via database in Step 2 of scanner priority
 */
exports.createItem = async (req, res) => {
  try {
    const { userId, itemName, category, expiryDate, reminderDaysBefore, itemImage, notes, barcode, source } = req.body;

    // Validate required fields
    if (!userId || !itemName || !category || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, itemName, category, expiryDate'
      });
    }

    // Step 1: Always save to Items collection (user-specific items)
    const newItem = new Item({
      userId,
      itemName,
      category,
      expiryDate,
      reminderDaysBefore: reminderDaysBefore || 1,
      itemImage: itemImage || null,
      notes: notes || null,
      barcode: barcode || null
    });

    await newItem.save();

    // Step 2: If barcode provided and source is 'manual', save to Products collection (shared)
    // This means: product not found in any API, so user entered manually
    // Next time someone scans same barcode, they'll find it in Step 2 of scanner
    let productSaveStatus = 'skipped'; // Will be 'created', 'already_exists', or 'skipped'
    
    if (barcode && source === 'manual') {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ barcode: barcode.trim() });
        
        if (!existingProduct) {
          // Create new product in shared collection
          const newProduct = new Product({
            barcode: barcode.trim(),
            itemName: itemName.trim(),
            category,
            itemImage: itemImage || null,
            source: 'manual'
          });
          await newProduct.save();
          productSaveStatus = 'created';
          console.log('✅ Product saved to shared collection:', barcode);
        } else {
          productSaveStatus = 'already_exists';
          console.log('ℹ️  Product already exists in shared collection:', barcode);
        }
      } catch (productError) {
        // Log error but don't fail the item save
        console.error('⚠️  Error saving product to shared collection:', productError.message);
        productSaveStatus = 'error';
      }
    }

    // Send email notification to user (asynchronously - don't wait)
    // This runs in background without blocking the API response
    User.findById(userId).then(user => {
      if (user && user.emailNotifications) {
        sendItemAddedEmail(user.email, user.name, itemName, expiryDate).catch(err => {
          console.error('⚠️  Item email failed to send in background:', err.message);
        });
      }
    }).catch(err => {
      console.error('⚠️  Error fetching user for email:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: newItem,
      productSaveStatus // For debugging/analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// Get all items for a user
exports.getItemsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const items = await Item.find({ userId }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};
