const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Get Profile
router.get('/profile/:id', auth, async (req, res) => {
  try {
    res.status(200).json({ message: 'User Profile', 'status' : true, 'data': req.user.data });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

// Update Profile
router.post('/update-profile/:id', auth, async (req, res) => {
  try {
      const response = await User.updateProfile(req.body, req.params.id);
      const profile = await User.findById(id);
    res.status(200).json({ message: 'Profile updated success', 'status' : true, 'data': profile });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

// Update Profile Password
router.post('/update-password/:id', auth, async (req, res) => {
  try {
    const is_exits = await User.findById(req.params.id);
    const isMatch = await bcrypt.compare(req.body.old_password, is_exits.password);
    
    if (!isMatch) return res.status(400).json({ message: 'Old password not matched', status:false});    
    if (req.body.password != req.body.confirm_password) return res.status(400).json({ message: 'New password and confirm password not matched', status:false});
    
    const response = await User.updatePassword(req.body.password, req.params.id);
    
    const profile = await User.findById(req.params.id);
    
    res.status(200).json({ message: 'Password updated success', 'status' : true });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', status:false });
  }
});

module.exports = router;
