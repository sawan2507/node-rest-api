// server.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const product = {
  async create(res, restaurant_id) {
    
    let {
      title,
      description = '',
      special_price = null,
      price,
      category_id,
      file = null,
      tax = 0
    } = res;

    // ---------------- VALIDATION ----------------
    if (!restaurant_id || isNaN(restaurant_id)) {
      return { status: false, message: 'Invalid restaurant id.' + restaurant_id, id: '' };
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return { status: false, message: 'Product title is required.', id: '' };
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
      return { status: false, message: 'Invalid product price.', id: '' };
    }

    if (special_price !== null) {
      if (isNaN(special_price) || Number(special_price) < 0) {
        return { status: false, message: 'Invalid special price.', id: '' };
      }

      if (Number(special_price) > Number(price)) {
        return { status: false, message: 'Special price cannot be greater than price.', id: '' };
      }
    }

    if (!category_id || isNaN(category_id)) {
      return { status: false, message: 'Invalid category.', id: '' };
    }

    if (tax !== null && (isNaN(tax) || Number(tax) < 0)) {
      return { status: false, message: 'Invalid tax value.', id: '' };
    }

    // Insert new user into the database
    const [result] = await db.execute(
      'INSERT INTO `products` (`restaurant_id`, `title`,`description`,`special_price`,`price`,`category_id`, `image`, `tax`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [restaurant_id, title, description, special_price, price, category_id, file, tax]
    );
    return {'status':false, 'message': 'Product created success.', 'id' : result.insertId};
  },
  
  async findById(id) {
    // const connection = await db();
    const [rows] = await db.execute('SELECT * FROM `products` WHERE `id` = ?', [id]);
    return rows[0];
  },

  async list(filters, restaurant_id = 0) {
    
    let whereClauses = [];
    let values = [];

    // Build WHERE clauses dynamically
    if (restaurant_id) {
      whereClauses.push("products.restaurant_id = ?");
      values.push(restaurant_id);
    }

    if (filters.category_id) {
      whereClauses.push("products.category_id = ?");
      values.push(filters.category_id);
    }

    // Join with AND if multiple filters exist
    let whereSQL = "";
    if (whereClauses.length > 0) {
      whereSQL = "WHERE " + whereClauses.join(" AND ");
    }

    const query = `
      SELECT 
        (SELECT name FROM restaurants WHERE restaurants.id = products.restaurant_id) AS res_name,
        (SELECT COUNT(*) FROM order_items WHERE products.id = order_items.product_id) AS order_count, 
        products.* 
      FROM products 
      ${whereSQL} 
      ORDER BY id DESC
    `;

    console.log("Final Query:", query);
    console.log("Values:", values);

    const [rows] = await db.execute(query, values);
    return rows;
  },
  
  async update(params, id) {
    try {
      const {
        restaurant,
        title,
        description = '',
        category_id,
        file = null,
        tax = 0,
        status = 1
      } = params;

      console.log('params, id -------------- ', params, id)

      // ---------------- VALIDATION ----------------
      if (!id || isNaN(id)) {
        return { status: false, message: 'Invalid product id.' };
      }

      if (!title || typeof title !== 'string' || !title.trim()) {
        return { status: false, message: 'Product title is required.' };
      }

      if (!category_id || isNaN(category_id)) {
        return { status: false, message: 'Invalid category.' };
      }

      if (tax !== null && (isNaN(tax) || Number(tax) < 0)) {
        return { status: false, message: 'Invalid tax value.' };
      }

      if (![0, 1].includes(Number(status))) {
        return { status: false, message: 'Invalid status value.' };
      }
      // --------------------------------------------

      const [result] = await db.execute(
        `UPDATE products 
        SET  
            title = ?, 
            description = ?, 
            category_id = ?, 
            image = ?, 
            tax = ?, 
            status = ?
        WHERE id = ?`,
        [
          title.trim(),
          description,
          category_id,
          file,
          tax,
          status,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return { status: false, message: 'Product not found or no changes made.' };
      }

      console.log(result, 'result --------- ')

      return {
        status: true,
        message: 'Product updated successfully.'
      };

    } catch (error) {
      console.error('Product Update Error:', error);
      return {
        status: false,
        message: 'Something went wrong. Please try again.'
      };
    }
  },
  
  async delete(id) {
    const [rows] = await db.execute('DELETE FROM `products` WHERE `id` = ?', [id]);
    return rows[0];
  },

};

module.exports = product;
