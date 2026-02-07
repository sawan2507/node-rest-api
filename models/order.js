// server.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const order = {
  async create(res) {
    // const connection = await db();
    let token_number = ''
    // Insert new user into  the database
    const [result] = await db.execute(
      'INSERT INTO `orders` (`restaurant_id`, `name`,`mobile`, `token_number`, `fcm_token`, `scanner_id`, `subtotal`, `tax`, `total`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [res.restaurant_id, res.name, res.mobile, token_number, res.fcm_token, res.scanner_id, res.subtotal, res.tax, res.total]
    );

    let orderId = result.insertId

    // console.log('res.products ----------- ', res.products)

    res.products.map(async (product, index) => {
      
      await db.execute(
        'INSERT INTO `order_items` (`order_id`,`product_id`, `title`, `description`, `price`, `special_price`, `quantity`, `tax`, `tax_amount`, `total`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, product.id, product.title, product.description, product.price, product.special_price, product.quantity, product.tax, product.tax_amount??0, product.special_price*product.quantity]
      );
    })

    return {'status':false, 'message': 'Order Placed successfully.', 'id' : orderId};
  },
  
  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM `blogs` WHERE `id` = ?', [id]);
    return rows[0];
  },

  async show(id) {
    const [rows] = await db.execute('SELECT (SELECT name FROM restaurants WHERE restaurants.id = orders.restaurant_id) as res_name, orders.* FROM `orders` WHERE `id` = ?', [id]);
    let row = rows[0];
    const [items] = await db.execute('SELECT * FROM `order_items` WHERE `order_id` = ?', [id]);
    row.items = items
    return row;
  },

  async list(req) {
    // const connection = await db();

    const restaurant_id = req.restaurant_id
    const status = req.status
    const limit = ` LIMIT ${req.offset}, ${req.limit}`
    let query = '';
    if(restaurant_id!='') {
      query += ` WHERE `
      query += ` restaurant_id=${restaurant_id}`
    }

    if(status!='') {
      query += ` AND status=${status}`
    }
    
    const [rows] = await db.execute(`SELECT (SELECT name FROM restaurants WHERE restaurants.id = orders.restaurant_id) as res_name, orders.* FROM orders ${query} ORDER BY id DESC ${limit}`);
    return rows;
  },

  async updateStatus(id, req) {
    const [rows] = await db.execute(`UPDATE orders set status = ? WHERE id = ?`, [req.status, id]);
    return rows;
  },

};

module.exports = order;
