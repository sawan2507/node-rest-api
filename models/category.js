// server.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const category = {
  async create(res) {
    const connection = await db();

    // Check if email already exists
    // const existingEmail = await this.findByEmail(res.email);
    // if (existingEmail) {
    //   return {'status':false, 'message': 'Email already in use.', 'id':0};
    // }

    // Insert new user into the database
    const [result] = await connection.execute(
      'INSERT INTO `categories` (`name`,`parent_id`,`status`) VALUES (?,?,?)',
      [res.name,res.parent_id,res.status]
    );
    return {'status':false, 'message': 'Category created success.', 'id' : result.insertId};
  },
  
  async findById(id) {
    const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `categories` WHERE `id` = ?', [id]);
    return rows[0];
  },

  async list() {
    const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `categories`');
    return rows;
  },
  
  async update(params, id) {
    const connection = await db();
    const [rows] = await connection.execute('UPDATE `categories` set `name` = ?, `parent_id` = ?, `status` = ? WHERE `id` = ?', [params.name, params.parent_id, params.status, id]);
    return rows[0];
  },

};

module.exports = category;
