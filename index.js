const cors = require('cors')
const express = require('express')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const blogRoutes = require('./routes/blog')
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')
const apiRoutes = require('./routes/api')
const adminRoutes = require('./routes/admin')
const restaurantRoutes = require('./routes/restaurants/auth')
const restaurantCategoryRoutes = require('./routes/restaurants/category')
const restaurantProductRoutes = require('./routes/restaurants/product')
const dotenv = require('dotenv')
const path = require('path')
const Razorpay = require('razorpay')
const axios = require('axios');
const pdfParse = require('pdf-parse');
const https = require('https');

const fs = require("fs");

// import { getPrinters, print } from "pdf-to-printer";
// import pkg from ;
const { getPrinters, print } = require('pdf-to-printer');
const { sendMail, printBill, htmlToPdf, sendNotification, pdfUrlToLocalFile, base64ToLocalFile } = require('./helpers/notification')
const auth = require('./middleware/auth')

dotenv.config();

const app = express();
// connectDB();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/send-mail', (req, res) => {

  let token = 'ABC1001'
  const html = printBill(token, [{"name":"Tea","qty":"2","price":"15"},{"name":"Coffee","qty":"2","price":"15"}])

  htmlToPdf(html, `tokens/${token}.pdf`).then(()=> console.log('PDF created'))
  .catch(err => console.error(err));

  sendMail('sawanshakya1995@gmail.com', `Token Print ${new Date().toGMTString()}`, html)
  res.status(200).json({ message: "Mail sent success" });
});

app.use('/api', apiRoutes);

/**
 * Admin API's
 */
app.use('/api/admin', adminRoutes);

/**
 * Restaurant API's
 */
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/restaurant/categories', restaurantCategoryRoutes);
app.use('/api/restaurant/products', auth, restaurantProductRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/file', express.static(path.join(__dirname, 'file')));
app.use('/tokens', express.static(path.join(__dirname, 'tokens')));

/**
 * Printer Details
 */

app.get("/api/restaurant/printers", async (req, res) => {
  try {
    const printers = await getPrinters();
    res.json(printers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/restaurant/print", async (req, res) => {
  try {
    const { file, printerName } = req.body;
    if (!file || !printerName) return res.status(400).json({ error: "Missing params" });

    let filePath;

    if (file.startsWith("http")) {
      console.log("🌐 Detected URL, downloading...");
      filePath = await pdfUrlToLocalFile(file);
    } else {
      console.log("📄 Detected Base64, converting...");
      filePath = await base64ToLocalFile(file);
    }
    
    await print(filePath, {
      printer: printerName,
      paperSize: "58mm", // for 58mm printer
      // paperSize: "80mm", // for 80mm printer
      orientation: "portrait",
      scale: "fit", // auto fit
      silent: true
    });
    res.json({ status: "success", printer: printerName });
  } catch (err) {
    console.log('err', err)
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/send-notification", (req, res) => {

  console.log(req.body);

  sendNotification(req.body);

  res.json({"status":true})
})

/**
 * 
 */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
