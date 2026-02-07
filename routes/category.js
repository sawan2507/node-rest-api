const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Category = require('../models/category');

const router = express.Router();

// Get Profile
router.post('/create', async (req, res) => {
  try {
    await Category.create(req.body);
    res.status(200).json({ message: 'Category created success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: [] });
  }
});

// Update Category
router.put('/update/:id', async (req, res) => {
  try {
    const response = await Category.update(req.body, req.params.id);
    res.status(200).json({ message: 'Category updated success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

// Category Lists 
router.get('/list', async (req, res) => {
  try {
    const response = await Category.list();
    res.status(200).json({ message: 'Category list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

// Restaurant Category Lists 
router.get('/restaurant-category-list/:id', async (req, res) => {
  try {
    const response = await Category.resList(req.params.id);
    res.status(200).json({ message: 'Category list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

module.exports = router;
