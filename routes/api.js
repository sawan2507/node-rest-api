const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');

const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: '',       // Replace with your Key ID
//   key_secret: '' // Replace with your Key Secret
// });

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

router.post('/create-order', async (req, res) => {
  const { total } = req.body; // amount in INR
  const options = {
    amount: total * 100, // amount in paise
    currency: 'INR',
    receipt: 'receipt#1'
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
