// server.js
const connection = require('../config/db');
const bcrypt = require('bcryptjs');

const category = {
  async create(res, restaurant_id = 0) {
    try {
      const { name, parent_id = 0, status = 1, image = '' } = res;

      // ---------------- VALIDATION ----------------
      if (!restaurant_id || isNaN(restaurant_id)) {
        return { status: false, message: 'Invalid restaurant id.', id: '' };
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return { status: false, message: 'Category name is required.', id: '' };
      }

      if (parent_id !== null && isNaN(parent_id)) {
        return { status: false, message: 'Invalid parent category.', id: '' };
      }

      if (![0, 1].includes(Number(status))) {
        return { status: false, message: 'Invalid status value.', id: '' };
      }
      // --------------------------------------------

      // Insert new user into the database
      const [result] = await connection.execute(
        'INSERT INTO `categories` (`restaurant_id`,`name`,`parent_id`,`status`, `image`) VALUES (?, ?, ?, ?, ?)',
        [restaurant_id, name, parent_id, status, image]
      );
      return {'status':true, 'message': 'Category created success.', 'id' : result.insertId};
    } catch (error) {
      return {'status':false, 'message': error.message, 'id' : ''};
    }
  },
  
  async findById(id) {
    try {
      const [rows] = await connection.execute('SELECT * FROM `categories` WHERE `id` = ?', [id]);
      return rows[0];
    } catch (error) {
      return {};
    }
  },

  async list() {
    const [rows] = await connection.execute('SELECT * FROM `categories` ORDER BY id DESC');
    return rows;
  },

  async resList(restaurant_id) {
    // const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `categories` WHERE restaurant_id = ?', [restaurant_id]);
    return rows;
  },
  

  async update(params, id) {

    const { name, parent_id = 0, status = 1, image = '' } = params;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return { status: false, message: 'Category name is required.', id: '' };
    }

    if (parent_id !== null && isNaN(parent_id)) {
      return { status: false, message: 'Invalid parent category.', id: '' };
    }

    if (![0, 1].includes(Number(status))) {
      return { status: false, message: 'Invalid status value.', id: '' };
    }

    const [rows] = await connection.execute('UPDATE `categories` set `name` = ?, `parent_id` = ?, `status` = ?, `image` = ? WHERE `id` = ?', [name, parent_id, status, image, id]);
    
    return rows[0];
  },

  async delete(id) {
    
    const [rows] = await connection.execute('DELETE FROM `categories` WHERE `id` = ?', [id])

    return rows[0]
  },

};

module.exports = category;
