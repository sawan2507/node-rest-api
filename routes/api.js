const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Get Profile
router.post('/contact/form', async (req, res) => {
  try {

    console.log('req.body ------- ', req.body)

    await User.sendContact(req.body)

    res.status(200).json({ message: 'Contact form submit', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: [] });
  }
});

module.exports = router;
