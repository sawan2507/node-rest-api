// server.js
const connection = require('../config/db');
const bcrypt = require('bcryptjs');

const user = {
  async create(res) {
    console.log('Initiating database connection....')
    // const connection = await db();

    console.log('Checking if email already exists....')
    
    // Check if email already exists
    const existingEmail = await this.findByEmail(res.email);
    if (existingEmail) {
      console.log('Email already exists....')
      return {'status':false, 'message': 'Email already in use.', 'id':0};
    }

    console.log('Checking if mobile number already exists....')
    // Check if mobile already exists
    const existingMobile = await this.findByMobile(res.mobile);
    if (existingMobile) {
      console.log('Mobile number already exists....')
      return {'status':false, 'message': 'Mobile number already in use.', 'id':0};
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(res.password, 10);

    console.log('Registering user to database....')
    // Insert new user into the database
    const [result] = await connection.execute(
      'INSERT INTO `users` (`name`, `email`, `mobile`, `password`) VALUES (?, ?, ?, ?)',
      [res.name, res.email, res.mobile, hashedPassword]
    );
    console.log('User registered successfully....')
    return {'status':false, 'message': 'User registered successfully.', 'id' : result.insertId};
  },
  
  async findByUsername(username) {
    // const connection = await db();
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `username` = ?', [username]);
    return rows[0];
  },

  async findByEmail(email) {
    const connection = await db();
    console.log('Looking for email........')
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);

    return rows[0];
  },

  async findByMobile(mobile) {
    // const connection = await db();
    console.log('Looking for mobile........')
    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `mobile` = ?', [mobile]);
    return rows[0];
  },
  
  async findById(id) {
    // const connection = await db();
    console.log('Searching for user........')

    const [rows] = await connection.execute('SELECT * FROM `users` WHERE `id` = ?', [id]);
    return rows[0];
  },
  
  async updateProfile(params, id) {
    // const connection = await db();
    console.log('Updating user profile........')
    const [rows] = await connection.execute('UPDATE `users` set `name` = ?, `email` = ?, `mobile` = ? WHERE `id` = ?', [params.name, params.email, params.mobile, id]);
    return rows[0];
  },
  
  async updatePassword(password, id) {
    // Hash the password

    const hashedPassword = await bcrypt.hash(password, 10);
    // const connection = await db();
    const [rows] = await connection.execute('UPDATE `users` set `password` = ? WHERE `id` = ?', [hashedPassword, id]);
    return rows[0];
  },

  async sendContact(res) {
    console.log('Initiating database connection....')
    // const connection = await db();

    // Insert new user into the database
    const [result] = await connection.execute(
      'INSERT INTO `contacts` (`name`, `email`, `mobile`, `subject`, `message`) VALUES (?, ?, ?, ?, ?)',
      [res.name, res.email, res.mobile, res.subject, res.message]
    );
    console.log('Contact sent successfully....')
    return {'status':false, 'message': 'Contact sent successfully.', 'id' : result.insertId};
  },

};

module.exports = user;
