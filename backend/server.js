const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const QRCode = require('qrcode');
require('dotenv').config();

const MenuItem = require('./models/MenuItem');

const app = express();
app.use(cors());
app.use(express.json());

// Configurable IP and ports
const BACKEND_PORT = process.env.PORT || 5000;
const FRONTEND_PORT = 5173;
const IP = '192.168.0.102';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query);
    console.log('Fetched menu items:', menuItems.length);
    res.json(menuItems); // Includes image field if present
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Add a single menu item
app.post('/api/menu', adminAuth, async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    console.log('Added new menu item:', newItem);
    res.json(newItem);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update a menu item
app.put('/api/menu/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    console.log('Updated menu item with image:', updatedItem); // Updated log
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete a menu item
app.delete('/api/menu/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await MenuItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    console.log('Deleted menu item:', deletedItem);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Generate QR code
app.get('/api/qrcode', async (req, res) => {
  try {
    const url = `http://${IP}:${FRONTEND_PORT}/menu`;
    const qrCode = await QRCode.toDataURL(url);
    console.log('Generated QR code for URL:', url);
    res.json({ qrCode });
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(BACKEND_PORT, () => {
  console.log(`Server running on http://${IP}:${BACKEND_PORT}`);
});