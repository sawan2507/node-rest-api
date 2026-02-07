const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const response = await User.create(req.body);
    if(response.status) {
        res.status(200).json({ message: 'User registered', 'status' : response.status, 'data':[] });
    } else {
        res.status(200).json({ message: response.message, 'status' : response.status, 'data':[] });
    }

  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Something went wrong', error });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, data: user }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Invalid Credentials', error });
  }
});

module.exports = router;
