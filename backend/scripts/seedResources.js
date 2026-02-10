const mongoose = require('mongoose');
const Resource = require('../models/Resource');
require('dotenv').config();

const defaultResources = [
  { name: 'LeetCode', category: 'DSA', url: 'https://leetcode.com', icon: '💻', isCustom: false },
  { name: 'GeeksforGeeks', category: 'DSA', url: 'https://geeksforgeeks.org', icon: '📚', isCustom: false },
  { name: 'TakeUForward', category: 'DSA', url: 'https://takeuforward.org', icon: '🎯', isCustom: false },
  { name: 'Coding Ninjas', category: 'DSA', url: 'https://codingninjas.com', icon: '🥷', isCustom: false },
  { name: 'HackerRank', category: 'DSA', url: 'https://hackerrank.com', icon: '🏆', isCustom: false },
  { name: 'YouTube', category: 'Development', url: 'https://youtube.com', icon: '📺', isCustom: false },
  { name: 'Udemy', category: 'Development', url: 'https://udemy.com', icon: '🎓', isCustom: false },
  { name: 'FreeCodeCamp', category: 'Web Dev', url: 'https://freecodecamp.org', icon: '🔥', isCustom: false },
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Resource.deleteMany({ isCustom: false });
    await Resource.insertMany(defaultResources);
    console.log('✅ Default resources seeded');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });