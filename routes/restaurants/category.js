const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Category = require('../../models/category');
const auth = require('../../middleware/auth');
const router = express.Router();

// Fetch
router.post('/create', auth, async (req, res) => {
  try {
    let data = await Category.create(req.body, req.user.data.restaurant_id);
    res.status(200).json({ message: data.message, 'status' : data.status });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Something went wrong', status:false });
  }
});

// Update
router.put('/update/:id', auth, async (req, res) => {
  try {
    const response = await Category.update(req.body, req.params.id);
    res.status(200).json({ message: 'Category updated success', 'status' : true });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error registering user', status:false });
  }
});

// Delete
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.status(200).json({ message: 'Category deleted success', 'status' : true });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error registering user', status:false });
  }
});

// List 
router.get('/list', auth, async (req, res) => {
  try {
    const response = await Category.list();
    res.status(200).json({ message: 'Category list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error registering user', status:false, data: {} });
  }
});

// Restaurant Category Lists 
router.get('/restaurant-category-list/:id', auth, async (req, res) => {
  try {
    const response = await Category.resList(req.params.id);
    res.status(200).json({ message: 'Category list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

module.exports = router;
