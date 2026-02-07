const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const multer = require('multer');
const path = require('path'); // Add this line

const router = express.Router();

/**
 * Upload image path
 */
// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {

      console.log('req, file ----------------- ')

      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
          return cb(null, true);
      } else {
        cb('Error: File upload only supports the following filetypes - ' + filetypes);
      }
  }
}).single('image'); // Field name in form-data

// Get Profile
router.post('/create', async (req, res) => {
  try {
    Blog.create(req.body);

    res.status(200).json({ message: 'Blog created success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error creating blog', status:false, data: [] });
  }
});

// Update Category
router.post('/update/:id', async (req, res) => {
  try {
      const response = await Blog.update(req.body, req.params.id);
    res.status(200).json({ message: 'Blog updated success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error blog updating', status:false, data: {} });
  }
});

// Category Lists 
router.get('/list', async (req, res) => {
  try {
      const response = await Blog.list();
    res.status(200).json({ message: 'Blog list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error listing blogs', status:false, data: {} });
  }
});

router.post('/upload-blog-image', async (req, res) => {
  try {
    console.log('req, res ------------- ', req.body, req.params, res)
    // const response = await Blog.list();
    res.status(200).json({ message: 'Blog list success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error listing blogs', status:false, data: {} });
  }
});

// Create upload route
router.post('/upload-image', (req, res) => {
  upload(req, res, (err) => {
      console.log('req res', req, res)
      if (err) {
        return res.status(200).json({ message: err, status:false, image:''});
      }
      if (!req.file) {
        return res.status(200).json({ message: 'No file uploaded', status:false, image:''});
      }
      res.status(200).json({ message: 'File upload success', status:true, image:`${req.file.path}`});
  });
});

module.exports = router;
