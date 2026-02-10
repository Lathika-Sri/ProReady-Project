const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

// Get all resources (default + user's custom)
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.find({
      $or: [
        { isCustom: false },
        { userId: req.user.id }
      ]
    }).sort({ name: 1 });
    
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add custom resource
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, url, icon } = req.body;
    
    const resource = new Resource({
      name,
      category,
      url,
      icon,
      isCustom: true,
      userId: req.user.id
    });
    
    await resource.save();
    res.status(201).json({ message: 'Resource added', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete custom resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isCustom: true
    });
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;