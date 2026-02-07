const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../../models/admin");
const restaurant = require("../../models/restaurant");
const auth = require("../../middleware/auth");
const scanner = require("../../models/scanner");
const order = require("../../models/order");
const product = require("../../models/product");
const category = require("../../models/category");

const router = express.Router();

/**
 * Admin Authentication
 */
router.post("/login", async (req, res) => {
  const { email, password, desktop_token } = req.body;
  try {
    const user = await admin.findByEmail(email);
    if (!user) return res.status(400).json({ status: false, message: "Invalid Email ID" });
    
    if (user.role != 'admin' && user.role != 'employee') return res.status(400).json({ status: false, message: "Not Authorised" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ status: false, message: "Invalid Passsword" });

    await admin.updateFcmToken(user.id, desktop_token)

    const token = jwt.sign(
      { id: user.id, data: user },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({ message: "Login Successfully", token, user });
  } catch (error) {
    res
      .status(400)
      .json({
        status: false, 
        message: error.message ?? "Something went wrong"
      });
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

    const emailCheck = await restaurant.updateRestaurantProfile(req.body, id);
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
router.get("/restaurant-profile/:id", auth, async (req, res) => {
  try {
    const restaurant_id = req.params.id
    const data = await restaurant.findById(restaurant_id);
    const statistics = await admin.statistics(restaurant_id)
    const lastSixMonth = await admin.lastSixMonth(restaurant_id)
    const dateWiseOrders = await admin.dateWiseOrders(restaurant_id)
    const categoryWiseOrders = await admin.categoryWiseOrders(restaurant_id)

    res.status(200).json({ message: "Restaurant Profile Successfully",
      data,
      statistics,
      dateWiseOrders,
      lastSixMonth,
      categoryWiseOrders
    })
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
    let params = req.body
    let slug = params.title.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, '')   // remove special characters
                    .replace(/\s+/g, '-')           // replace spaces with -
                    .replace(/-+/g, '-')
    await scanner.create({...params, slug:slug});
    res.status(200).json({ message: "Scanner Created Successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error logging in", error });
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

    const restaurant_id = req.user.data.restaurant_id
    const data = await restaurant.findById(restaurant_id);
    const statistics = await admin.statistics(restaurant_id)
    const lastSixMonth = await admin.lastSixMonth(restaurant_id)
    const dateWiseOrders = await admin.dateWiseOrders(restaurant_id)
    const categoryWiseOrders = await admin.categoryWiseOrders(restaurant_id)

    res.status(200).json({ message: 'Statistic success', 'status' : true,
      data,
      statistics,
      lastSixMonth,
      dateWiseOrders,
      categoryWiseOrders
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error listing blogs', status:false, data: {} });
  }
});

// Restaurant Category Lists 
router.get('/restaurant-category-list/:id', async (req, res) => {
  try {
    const response = await category.resList(req.params.id);
    res.status(200).json({ message: 'Category list success', 'status' : true, 'data': response });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Error registering user', status:false, data: {} });
  }
});

module.exports = router;