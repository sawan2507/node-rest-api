// admin.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const admin = require("./admin");

const restaurant = {
  async create(res) {

    // Check if email already exists
    const existingEmail = await admin.findByEmail(res.admin_email);
    if (existingEmail) {
      return { status: false, message: "Email already in use.", id: 0 };
    }
    
    // Check if mobile already exists
    const existingMobile = await admin.findByMobile(res.admin_mobile);
    if (existingMobile) {
      return { status: false, message: "Mobile number already in use.", id: 0 };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(res.password, 10);

    const slug = res.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // Replace spaces/symbols with dash
        .replace(/^-+|-+$/g, '');      // Trim starting/ending dashes

    const random = Math.random().toString(36).substring(2, 8);

    const restaurantSlug = `${slug}-${random}`;

    // Insert new restaurant into the database
    const [profile] = await db.execute(
      "INSERT INTO `restaurants` (`slug`, `name`, `address`, `email`, `mobile`) VALUES (?, ?, ?, ?, ?)",
      [restaurantSlug, res.name, res.address, res.admin_email, res.admin_mobile]
    );

    // Insert new admin into the database
    const [result] = await db.execute(
      "INSERT INTO `admins` (`restaurant_id`, `username`, `email`, `mobile`, `password`, `role`) VALUES (?, ?, ?, ?, ?, ?)",
      [profile.insertId, res.name, res.admin_email, res.admin_mobile, hashedPassword, res.role]
    );

    return {
      status: false,
      message: "User registered successfully.",
      id: result.insertId,
    };
  },

  async findByUsername(username) {
    // const connection = await db();
    const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `username` = ?",
      [username]
    );
    return rows[0];
  },

  async findByEmail(email) {
    // const connection = await db();
    console.log("Looking for email........");
    const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `email` = ?",
      [email]
    );

    return rows[0];
  },

  async findByMobile(mobile) {
    // const connection = await db();
    console.log("Looking for mobile........");
    const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `mobile` = ?",
      [mobile]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM `restaurants` WHERE `id` = ?",
      [id]
    );
    return rows[0];
  },

  async findBySlug(slug, scanner_slug) {
    const [rows] = await db.execute(
      "SELECT * FROM `restaurants` WHERE `slug` = ?",
      [slug]
    );

    const restaurantId = rows[0].id

    let whereClauses = [];
    let values = [];

    // Build WHERE clauses dynamically
    if (restaurantId) {
      whereClauses.push("products.restaurant_id = ?");
      values.push(restaurantId);
    }

      // Join with AND if multiple filters exist
      let whereSQL = "";
      if (whereClauses.length > 0) {
        whereSQL = "WHERE " + whereClauses.join(" AND ");
      }

    const query = `
      SELECT 
        (SELECT name FROM restaurants WHERE restaurants.id = products.restaurant_id) AS res_name, 
        products.* 
      FROM products 
      ${whereSQL} 
      ORDER BY id DESC
    `;

    console.log("Final Query:", query);
    console.log("Values:", values);

    const products = await db.execute(query, values);

    const categories = await db.execute('SELECT * FROM `categories` WHERE restaurant_id = ?', [restaurantId]);

    const [scanners] = await db.execute('SELECT * FROM `scanners` WHERE slug = ?', [scanner_slug]);

    return {
      restaurants: rows[0],
      products: products[0],
      categories: categories[0],
      scanner: scanners[0],
    }
  },

  async updateProfile(params, id) {
    // const connection = await db();
    const [rows] = await db.execute(
      "UPDATE `restaurants` set `logo` = ?, `banner` = ?, `name` = ?, `address` = ?, `email` = ?, `mobile` = ?, `status` = ? WHERE `id` = ?",
      [params.logo, params.banner, params.name, params.address, params.email, params.mobile, params.status, id]
    );

    await db.execute(
      "UPDATE `admins` set `username` = ?,`email` = ?, `mobile` = ? WHERE `id` = ?",
      [params.admin_name, params.admin_email, params.admin_mobile, params.admin_id]
    );

    console.log('params -------', params)

    return rows[0];
  },

  async updateRestaurantProfile(params, id) {
    // const connection = await db();
    const [rows] = await db.execute(
      "UPDATE `restaurants` set `logo` = ?, `banner` = ?, `name` = ?, `address` = ?, `email` = ?, `mobile` = ?, `status` = ? WHERE `id` = ?",
      [params.logo, params.banner, params.name, params.address, params.email, params.mobile, params.status, id]
    );

    return rows[0];
  },

  async updateRestaurantToken(id, token) {
    // const connection = await db();
    const [rows] = await db.execute(
      "UPDATE `restaurants` set `next_available_token` = ? WHERE `id` = ?",
      [token, id]
    );

    return rows[0];
  },

  async updatePassword(password, id) {
    // Hash the password

    const hashedPassword = await bcrypt.hash(password, 10);
    // const connection = await db();
    const [rows] = await db.execute(
      "UPDATE `restaurants` set `password` = ? WHERE `id` = ?",
      [hashedPassword, id]
    );
    return rows[0];
  },

  async list() {
    // const connection = await db();
    const [rows] = await db.execute(`SELECT 
        restaurants.*, 
        admins.id AS admin_id,
        admins.username AS admin_name, 
        admins.email AS admin_email, 
        admins.mobile AS admin_mobile,
        (
            SELECT COUNT(orders.id)
            FROM orders 
            WHERE orders.restaurant_id = restaurants.id
        ) AS total_orders
    FROM restaurants
    JOIN admins ON admins.restaurant_id = restaurants.id
    WHERE admins.role = ?`, ['admin']);
    return rows;
  },

  async delete(id) {
    // const connection = await db();
    const [rows] = await db.execute('DELETE FROM `restaurants` WHERE `id` = ?', [id]);
    return rows;
  },

};

module.exports = restaurant;
