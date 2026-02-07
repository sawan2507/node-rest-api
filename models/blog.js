// server.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const blog = {
  async create(res) {
    // const connection = await db();

    // Insert new user into the database
    const [result] = await db.execute(
      'INSERT INTO `blogs` (`title`,`content`,`category_id`, `image`, `user_id`) VALUES (?, ?, ?, ?)',
      [res.title, res.description, res.category_id, res.image, res.user_id]
    );
    return {'status':false, 'message': 'Blog created success.', 'id' : result.insertId};
  },
  
  async findById(id) {
    // const connection = await db();
    const [rows] = await db.execute('SELECT * FROM `blogs` WHERE `id` = ?', [id]);
    return rows[0];
  },

  async list() {
    // const connection = await db();
    const [rows] = await db.execute('SELECT * FROM `blogs`');
    return rows;
  },
  
  async update(params, id) {
    // const connection = await db();
    const [rows] = await db.execute('UPDATE `blogs` set `title` = ?, `content` = ?, `category_id` = ?, `image` = ? WHERE `id` = ?', [params.title, params.description, params.category_id, params.image, id]);
    return rows[0];
  },

};

module.exports = blog;
