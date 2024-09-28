// server.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const user = {
  async create(res) {
    const connection = await db();

    // Check if email already exists
    const existingEmail = await this.findByEmail(res.email);
    if (existingEmail) {
      return {'status':false, 'message': 'Email already in use.', 'id':0};
    }

    // Check if mobile already exists
    const existingMobile = await this.findByMobile(res.mobile);
    if (existingMobile) {
      return {'status':false, 'message': 'Mobile number already in use.', 'id':0};
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(res.password, 10);

    // Insert new user into the database
    const [result] = await connection.execute(
      'INSERT INTO `users` (`name`, `email`, `mobile`, `password`) VALUES (?, ?, ?, ?)',
      [res.name, res.email, res.mobile, hashedPassword]
    );
    return {'status':false, 'message': 'Mobile number already in use.', 'id' : result.insertId};
  },
  
  async findByUsername(username) {
    const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `username` = ?', [username]);
    return rows[0];
  },

  async findByEmail(email) {
    const connection = await db();
    console.log('email', email)
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);

    console.log('email', email)

    console.log('check email ', email, rows);
    return rows[0];
  },

  async findByMobile(mobile) {
    const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `mobile` = ?', [mobile]);
    console.log('check mobile ', mobile, rows);
    return rows[0];
  },
  
  async findById(id) {
    const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `id` = ?', [id]);
    return rows[0];
  },
  
  async updateProfile(params, id) {
    const connection = await db();
    const [rows] = await connection.execute('UPDATE `users` set `name` = ?, `email` = ?, `mobile` = ? WHERE `id` = ?', [params.name, params.email, params.mobile, id]);
    return rows[0];
  },
  
  async updatePassword(password, id) {
    // Hash the password

    console.log('update password');

    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db();
    const [rows] = await connection.execute('UPDATE `users` set `password` = ? WHERE `id` = ?', [hashedPassword, id]);
    return rows[0];
  },
};

module.exports = user;
