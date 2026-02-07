// db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let connection;

// const connectDB = async () => {
//   if (!connection) {
//     connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASS,
//       database: process.env.DB_NAME,
//     });
//     console.log('MySQL connected');
//   }
//   return connection;
// };

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

// module.exports = connectDB;
