const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Product = require('../../models/product');
const multer = require('multer');
const path = require('path'); // Add this line
const auth = require('../../middleware/auth');

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

// Create
router.post('/create', async (req, res) => {
  try {

    console.log('req.body -------- ', req.user.data.id)

    const response = await Product.create(req.body, req.user.data.restaurant_id);
    console.log('response', response)
    res.status(200).json({ message: (response.message ?? 'Product created success') + response.id, 'status' : response.status ?? false });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error creating product', status:false });
  }
});

// Update
router.put('/update/:id', async (req, res) => {
  try {
      const response = await Product.update(req.body, req.params.id);
    res.status(200).json({ message: response.message ?? 'Product updated success', 'status' : response.status ?? true});
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error Product updating', status:false});
  }
});

// Delete
router.delete('/delete/:id', async (req, res) => {
  try {
      const response = await Product.delete(req.params.id);
    res.status(200).json({ message: 'Product deleted success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error Product updating', status:false, data: error });
  }
});

// Lists 
router.get('/list', async (req, res) => {
  try {
    const response = await Product.list(req.query, req.user.data.restaurant_id);
    res.status(200).json({ message: 'Product list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error listing products', status:false, data: {} });
  }
});

router.post('/upload-blog-image', async (req, res) => {
  try {
    console.log('req, res ------------- ', req.body, req.params, res)
    // const response = await Blog.list();
    res.status(200).json({ message: 'Blog list success', 'status' : true, 'data': [] });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message ?? 'Error listing blogs', status:false, data: {} });
  }
});

// Create upload route
router.post('/upload-image', (req, res) => {
  upload(req, res, (err) => {
    console.log('req res', err, req.file)
    try {
      if (err) {
        return res.status(200).json({ message: err, status:false, image:''});
      }
      if (!req.file) {
        return res.status(200).json({ message: 'No file uploaded', status:false, image:''});
      }
      res.status(200).json({ message: 'File upload success', status:true, image:`${req.file.path.replace('\/', '/')}`});
    } catch (error) {
      res.status(200).json({ message: error.message ?? 'File upload success', status:true, image:``});
    }
  });
});

module.exports = router;
