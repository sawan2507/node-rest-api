// admin.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const admin = require("./admin");
const QRCode = require('qrcode');

const scanner = {
  async create(res) {

    // Get the base64 url

    // Insert new restaurant into the database
    const [profile] = await db.execute(
      "INSERT INTO `scanners` (`admin_id`, `title`, `description`, `slug`, `restaurant_id`, `printer_id`, `printer_addr`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [res.admin_id, res.title, res.description, res.slug, res.restaurant_id, res.printer_id, res.printer_addr]
    );
    const [restaurant] = await db.execute(
      "SELECT * FROM `restaurants` WHERE (`id` = ?)",
      [res.restaurant_id]
    );

    await this.updateQrCode(res.slug, restaurant.slug)

    return {
      status: false,
      message: "Scanner added successfully.",
      id: profile.insertId,
    };
  },

  async update(params, id) {
    const [rows] = await db.execute(
      "UPDATE `scanners` set `title` = ?, `description` = ?, `printer_id` = ?, `printer_addr` = ? WHERE `id` = ?",
      [params.title, params.description, params.printer_id, params.printer_addr, id]
    );

    const [restaurant] = await db.execute(
      "SELECT * FROM `restaurants` WHERE (`id` = ?)",
      [params.restaurant_id]
    );
    await this.updateQrCode(params.slug, restaurant[0].slug)

    return rows[0];
  },

  async updateQrCode(id, res_id) {
    let awcode = await QRCode.toDataURL(`${process.env.FRONT_END_URL}${res_id}/${id}`)
    const [profile] = await db.execute(
      "UPDATE `scanners` set `image` = ? WHERE (`slug` = ?)",
      [awcode, id]
    );
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
    const [rows] = await db.execute(
      "SELECT * FROM `admins` WHERE `email` = ?",
      [email]
    );

    return rows[0];
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
      "SELECT * FROM `scanners` WHERE `id` = ?",
      [id]
    );
    return rows[0];
  },

  async list() {
    // const connection = await db();
    const [rows] = await db.execute('SELECT * FROM `scanners`');
    return rows;
  },

  async delete(id) {
    // const connection = await db();
    const [rows] = await db.execute('DELETE FROM `scanners` WHERE `id` = ?', [id]);
    return rows;
  },

};

module.exports = scanner;
