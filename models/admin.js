// admin.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const admin = {
  async create(res) {
    
    // Check if email already exists
    const existingEmail = await this.findByEmail(res.email);
    if (existingEmail) {
      return { status: false, message: "Email already in use.", id: 0 };
    }

    // Check if mobile already exists
    const existingMobile = await this.findByMobile(res.mobile);
    if (existingMobile) {
      return { status: false, message: "Mobile number already in use.", id: 0 };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(res.password, 10);

    // Insert new user into the database
    const [result] = await db.execute(
      "INSERT INTO `admin` (`name`, `email`, `mobile`, `password`) VALUES (?, ?, ?, ?)",
      [res.name, res.email, res.mobile, hashedPassword]
    );
    console.log("User registered successfully....");
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
    try {
      console.log('email ---------- ', email)
      const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `email` = ?",
      [email]
      );

      return rows[0];
    } catch (error) {
      console.log('error ----------', error)
    }
    
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
    // const connection = await db();
    console.log("Searching for user........");

    const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `id` = ?",
      [id]
    );
    return rows[0];
  },
  async findByResId(id) {
    // const connection = await db();
    console.log("Searching for user........");

    const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `restaurant_id` = ?",
      [id]
    );
    return rows[0];
  },

  async updateProfile(params, id) {
    // const connection = await db();
    console.log("Updating user profile........");
    const [rows] = await db.execute(
      "UPDATE `admins` set `username` = ?, `email` = ?, `mobile` = ? WHERE `id` = ?",
      [params.username, params.email, params.mobile, id]
    );
    return rows[0];
  },
  async updateFcmToken(id, fcm_id) {
    // const connection = await db();
    console.log("Updating user profile........");
    const [rows] = await db.execute(
      "UPDATE `admins` set `desktop_token` = ? WHERE `id` = ?",
      [fcm_id, id]
    );
    return rows[0];
  },

  async updatePassword(password, id) {
    // Hash the password

    const hashedPassword = await bcrypt.hash(password, 10);
    // const connection = await db();
    const [rows] = await db.execute(
      "UPDATE `admins` set `password` = ? WHERE `id` = ?",
      [hashedPassword, id]
    );
    return rows[0];
  },

  async statistics(restaurant_id = 0) {
    if(restaurant_id > 0) {
      const products = await db.execute("SELECT COUNT(*) as total FROM `products` WHERE restaurant_id = ?", [restaurant_id]);
      const orders = await db.execute("SELECT COUNT(*) as total FROM `orders` WHERE restaurant_id = ?", [restaurant_id]);
      const earnings = await db.execute("SELECT SUM(orders.total) as total FROM `orders` WHERE restaurant_id = ?", [restaurant_id]);
      const categories = await db.execute("SELECT COUNT(*) as total FROM `categories` WHERE restaurant_id = ?", [restaurant_id]);
  
      return {
        restaurants:0,
        products:products[0][0]['total']??0,
        orders:orders[0][0]['total']??0,
        earnings:earnings[0][0]['total']??0,
        categories:categories[0][0]['total']??0
      }
    }
    const restaurants = await db.execute("SELECT COUNT(*) as total FROM `restaurants`");
    const products = await db.execute("SELECT COUNT(*) as total FROM `products`");
    const orders = await db.execute("SELECT COUNT(*) as total FROM `orders`");
    const earnings = await db.execute("SELECT SUM(orders.total) as total FROM `orders`");
    const categories = await db.execute("SELECT COUNT(*) as total FROM `categories`");

    return {
      restaurants:restaurants[0][0]['total']??0,
      products:products[0][0]['total']??0,
      orders:orders[0][0]['total']??0,
      earnings:earnings[0][0]['total']??0,
      categories:categories[0][0]['total']??0
    }

  },

  async dateWiseOrders(restaurant_id = 0) {
    if (restaurant_id > 0) {
      const res = await db.execute(`WITH RECURSIVE dates AS (
          SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS order_date
          UNION ALL
          SELECT DATE_ADD(order_date, INTERVAL 1 DAY)
          FROM dates
          WHERE order_date < LAST_DAY(CURDATE())
        )
        SELECT
          d.order_date,
          DATE_FORMAT(d.order_date, '%d %b') AS day,
          COALESCE(COUNT(o.id), 0) AS total_orders
        FROM dates d
        LEFT JOIN orders o
          ON DATE(o.created_at) = d.order_date
          AND o.restaurant_id = ?
        GROUP BY d.order_date
        ORDER BY d.order_date ASC`, [restaurant_id]);
      return res[0];
    }
    return [];
  },
  async categoryWiseOrders(restaurant_id = 0) {
    if (restaurant_id > 0) {
      const res = await db.execute(`SELECT 
          c.id AS category_id,
          c.name AS category_name,
          COUNT(DISTINCT o.id) AS total_orders
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE o.restaurant_id = ?
          AND MONTH(o.created_at) = MONTH(CURDATE())
          AND YEAR(o.created_at) = YEAR(CURDATE())
        GROUP BY c.id, c.name
        ORDER BY total_orders DESC`, [restaurant_id]);
      return res[0];
    }
    return [];
  },
  async lastSixMonth(restaurant_id = 0) {
    if(restaurant_id > 0) {
      const res = await db.execute(`WITH RECURSIVE months AS (
          SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS month_date
          UNION ALL
          SELECT DATE_SUB(month_date, INTERVAL 1 MONTH)
          FROM months
          WHERE month_date > DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
        )
        SELECT
          DATE_FORMAT(m.month_date, '%b %Y') AS month,
          COALESCE(COUNT(o.id), 0) AS total_orders
        FROM months m
        LEFT JOIN orders o
          ON DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(m.month_date, '%Y-%m')
          AND o.restaurant_id = ?
        GROUP BY m.month_date
        ORDER BY m.month_date ASC`, [restaurant_id])
      return res[0]
    }
    return []
  },

  async report(restaurant_id = 0, type="monthly", start_date = "", end_date = "") {
    if(restaurant_id > 0) {
      const monthly = await db.execute("SELECT DATE_FORMAT(created_at, '%d') as date, COUNT(*) FROM orders WHERE restaurant_id = ? GROUP BY DATE_FORMAT(created_at, '%d')", [restaurant_id]);
      const yearly = await db.execute("SELECT DATE_FORMAT(created_at, '%Y') as date, COUNT(*) FROM orders WHERE restaurant_id = ? GROUP BY DATE_FORMAT(created_at, '%Y')", [restaurant_id]);
      
    }
  }

};

module.exports = admin;
