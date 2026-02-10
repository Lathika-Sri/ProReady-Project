const express = require('express');
const router = express.Router();
const Streak = require('../models/Streak');
const auth = require('../middleware/auth');

// Get user streak
router.get('/', auth, async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.user.id })
      .populate('resourceStreaks.resourceId', 'name icon');
    
    if (!streak) {
      streak = new Streak({ userId: req.user.id });
      await streak.save();
    }
    
    res.json({ streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;