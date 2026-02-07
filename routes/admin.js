const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../models/admin");
const restaurant = require("../models/restaurant");
const auth = require("../middleware/auth");
const scanner = require("../models/scanner");
const order = require("../models/order");
const product = require("../models/product");

const router = express.Router();

/**
 * Admin Authentication
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid Email ID" });
    
    if (user.role != 'superadmin') return res.status(400).json({ message: "Not Authorised" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Passsword" });

    const token = jwt.sign(
      { id: user.id, data: user },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login Successfully", token, user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong", error });
  }
});

/**
 * Admin Profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    res.status(200).json({ message: 'User Profile', 'status' : true, 'data': req.user.data });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

/**
 * Update Admin Profile
 */
router.post('/profile', auth, async (req, res) => {
  try {

    await admin.updateProfile(req.body, req.user.data.id)

    const user = await admin.findById(req.user.data.id)

    res.status(200).json({ message: 'User Profile', 'status' : true, 'data': user });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

/**
 * Update Admin Profile Password
 */
router.put('/update-password', auth, async (req, res) => {
  try {
    const is_exits = await admin.findById(req.user.data.id);
    const isMatch = await bcrypt.compare(req.body.old_password, is_exits.password);
    
    if (!isMatch) return res.status(400).json({ message: 'Old password not matched', status:false});    
    if (req.body.password != req.body.confirm_password) return res.status(400).json({ message: 'New password and confirm password not matched', status:false});
    
    const response = await admin.updatePassword(req.body.password, req.user.data.id);
    
    const profile = await admin.findById(req.user.data.id);
    
    res.status(200).json({ message: 'Password updated success' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user' });
  }
});


/**
 * Create Restaurant
 */
router.post("/restaurant/create", auth,  async (req, res) => {
  try {
    const emailCheck = await restaurant.create(req.body);
    res.status(200).json({ message: "Restaurant Created Successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong", error });
  }
});

/**
 * Update Restaurant
 */
router.put("/restaurant/update/:id", auth,  async (req, res) => {
  try {

    const id = req.params.id

    const emailCheck = await restaurant.updateProfile(req.body, id);
    res.status(200).json({ message: "Restaurant Updated Successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * List Restaurant
 */
router.get("/restaurant", auth, async (req, res) => {
  try {
    const data = await restaurant.list();
    res.status(200).json({ message: "Restaurant List Successfully",  data});
  } catch (error) {

    console.log('error ---------- ', error)

    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * Delete Restaurant
 */
router.delete("/restaurant/:id", auth,  async (req, res) => {
  try {

    const id = req.params.id

    await restaurant.delete(id);
    res.status(200).json({ message: "Restaurant Deleted Successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * Create Scanner
 */
router.post("/scanner/create", auth, async (req, res) => {
  try {

    await scanner.create(req.body);
    res.status(200).json({ message: "Scanner Created Successfully" });
  } catch (error) {

    console.log('error 000000000000 ', error)

    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * Update Scanner
 */
router.put("/scanner/update/:id", auth, async (req, res) => {
  try {

    const id = req.params.id

    const emailCheck = await scanner.update(req.body, id);
    res.status(200).json({ message: "Scanner Updated Successfully" });
  } catch (error) {
    console.log('error' , error)
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * List Scanner
 */
router.get("/scanner/list", auth, async (req, res) => {
  try {
    const data = await scanner.list();
    res.status(200).json({ message: "Scanner List Successfully",  data});
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * Delete Scanner
 */
router.delete("/scanner/:id", auth, async (req, res) => {
  try {

    const id = req.params.id
    await scanner.delete(id);
    res.status(200).json({ message: "Restaurant Deleted Successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

/**
 * List Orders
 */
router.post("/orders/list", auth, async (req, res) => {
  try {
    console.log('req.query ', req.body)
    const data = await order.list(req.body);
    res.status(200).json({ message: "Order List Successfully",  data});
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});
/**
 * List Orders
 */
router.get("/orders/show/:id", auth, async (req, res) => {
  try {
    const id = req.params.id
    const data = await order.show(id);
    res.status(200).json({ message: "Order View Successfully",  data});
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

router.post("/orders/update-status/:id", auth, async (req, res) => {
  try {
    const id = req.params.id
    console.log('req.body,  ', req.body)
    const data = await order.updateStatus(id, req.body);
    res.status(200).json({ message: "Order View Successfully",  data});
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging in", error });
  }
});

// Lists 
router.post('/products/list', auth, async (req, res) => {
  try {
    console.log('req.params ------- ', req.body)
    const response = await product.list(req.body);
    res.status(200).json({ message: 'Product list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error listing blogs', status:false, data: {} });
  }
});

router.get('/statistics', auth, async (req, res) => {
  try {
    const response = await admin.statistics();
    res.status(200).json({ message: 'Statistic success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error listing blogs', status:false, data: {} });
  }
});

module.exports = router;
