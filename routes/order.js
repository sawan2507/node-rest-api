const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const order = require('../models/order');
const multer = require('multer');
const path = require('path'); // Add this line
const { sendNotification, printBill, htmlToPdf } = require('../helpers/notification');
const scanner = require('../models/scanner');
const admin = require('../models/admin');
const restaurant = require('../models/restaurant');

const router = express.Router();

// Get Profile
router.post('/create', async (req, res) => {
  try {

    
    const response = await order.create(req.body);
    let fileName = response.id
    
    const admins = await admin.findByResId(req.body.restaurant_id)
    const restaurants = await restaurant.findById(req.body.restaurant_id)
    const scanners = await scanner.findById(req.body.scanner_id)
    
    let token = restaurants.next_available_token
    const html = await printBill(token, {
      items: req.body.products,
      restaurants:restaurants
    })

    await restaurant.updateRestaurantToken(req.body.restaurant_id, token + 1)

    await htmlToPdf(html, `tokens/${fileName}.pdf`)
      .then(()=> console.log('PDF created'))
      .catch(err => console.error(err));

    try {
      sendNotification({token:req.body.fcm_token, title:'Order Placed', body:'Your order placed successfully. please collect your token', data: {
        title:'Order Placed',
        body:'Your order placed successfully.',
        file:'',
        printerName:'Microsoft PDF'
        // restaurant:restaurants,
        // scanner:scanners
      }})
      
    } catch (error) {
      
    }

    sendNotification({token:admins.desktop_token, title:'Order Placed', body:'Received new order. please check latest orders', data: {
      title:'Order Placed',
      body:'Received new order. please check latest orders',
      file:`http://localhost:5000/tokens/${fileName}.pdf`,
      printerName:'Microsoft Print to PDF'
      // restaurant:restaurants,
      // scanner:scanners
    }})

    res.status(200).json({ message: 'Order Placed successfully', id:response.id, 'status' : true, 'data': [] });
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
