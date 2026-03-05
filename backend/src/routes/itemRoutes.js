const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Create a new item
router.post('/items', itemController.createItem);

// Get all items for a user
router.get('/items/:userId', itemController.getItemsByUserId);

// Get a single item by ID
router.get('/item/:id', itemController.getItemById);

// Update an item
router.put('/item/:id', itemController.updateItem);

// Delete an item
router.delete('/item/:id', itemController.deleteItem);

module.exports = router;
