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
  ssl: {
      rejectUnauthorized: false,
      // ca: fs.readFileSync('./BaltimoreCyberTrustRoot.crt.pem')
  }
});


console.log('pool ----------- ', pool)

console.log('process.env.DB_HOST --------- ', process.env.DB_HOST)
console.log('process.env.DB_USER --------- ', process.env.DB_USER)
console.log('process.env.DB_PASS --------- ', process.env.DB_PASS)
console.log('process.env.DB_NAME --------- ', process.env.DB_NAME)

module.exports = pool;

// module.exports = connectDB;
