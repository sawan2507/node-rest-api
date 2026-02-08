const admin = require("firebase-admin")
const nodemailer = require("nodemailer")
const fs = require('fs')
const puppeteer = require('puppeteer')
const path = require('path')

// Load service account key (download from Firebase Console)
// const serviceAccount = require("../desktop-web-push-notification-firebase-adminsdk-fbsvc-d7a90a13bf.json");
const axios = require("axios");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const sendNotification = ({ token, title, body, data }) => {
  console.log('token, title, body, data ', token, title, body, data)
  const message = {
    data,
    token
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

const sendAllNotification = ({ token, title, body, data }) => {

  const message = {
    data,
    token
  };

  admin
    .messaging()
    .sendEachForMulticast(message)
    .then((response) => {
      console.log("Successfully sent:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

async function sendMail(tomail, subject, html) {
  // Create SMTP transporter
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or your SMTP host (e.g., smtp.mail.yahoo.com)
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "sawanshakya95@gmail.com",
      pass: "ssol rzfr iaig hbok",
    },
  });

  // Define email options
  let mailOptions = {
    from: '"Easy Restaurant" <sawanshakya95@gmail.com>',
    to: tomail,
    subject: subject,
    text: "This is a plain text email!",
    html: html,
  };

  // Send mail
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: " + info.response);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

const printBill = (token, {items, restaurants}) => {
  let itemTr = ''
  let subtotal = 0
  let tax = 0
  let total = 0
  items.map((item) => {
    itemTr +=`<tr>
      <td>${item.title}</td>
      <td class="right">${item.quantity}</td>
      <td class="right">${item.special_price}</td>
    </tr>`

    subtotal += parseFloat(item.special_price * item.quantity)
    tax += parseFloat(item.tax)
  })
  total = parseFloat(subtotal) + parseFloat(tax)

  let html = `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Restaurant Token Receipt</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background: #fff;
      display: flex;
      justify-content: center;
      padding: 10px;
    }

    .receipt {
      width: 58mm;
      max-width: 58mm;
      border: 1px dashed #000;
      padding: 10px;
    }

    .center {
      text-align: center;
    }

    .bold {
      font-weight: bold;
    }

    .line {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }

    .items td {
      font-size: 13px;
    }

    .items {
      width: 100%;
      border-collapse: collapse;
    }

    .items th,
    .items td {
      text-align: left;
      padding: 3px 0;
    }

    .right {
      text-align: right;
    }

    .totals td {
      padding: 3px 0;
    }

    @media print {
      body {
        background: none;
      }

      .receipt {
        border: none;
      }
    }
  </style>
</head>

<body>
  <div class="receipt">
    <div class="center bold">${restaurants.name}</div>
    <div class="center">${restaurants.address}</div>
    <div class="center">Ph: +91 ${restaurants.mobile}</div>
    <div class="line"></div>

    <table style="width:100%; font-size:13px;">
      <tr>
        <td>Token:</td>
        <td class="right">${token}</td>
      </tr>
      <tr>
        <td>Type:</td>
        <td class="right">Dine-In</td>
      </tr>
      <tr>
        <td>Date:</td>
        <td class="right">${new Date().toDateString()}</td>
      </tr>
    </table>

    <div class="line"></div>
    <table class="items">
      <thead>
        <tr>
          <th>Item</th>
          <th class="right">Qty</th>
          <th class="right">Amt</th>
        </tr>
      </thead>
      <tbody>
      ${itemTr}
      </tbody>
    </table>

    <div class="line"></div>
    <table class="totals" style="width:100%; font-size:13px;">
      <tr>
        <td>Subtotal</td>
        <td class="right">₹${subtotal}</td>
      </tr>
      <tr>
        <td>CGST (2.5%)</td>
        <td class="right">₹${tax/2}</td>
      </tr>
      <tr>
        <td>SGST (2.5%)</td>
        <td class="right">₹${tax/2}</td>
      </tr>
      <tr class="bold">
        <td>Total</td>
        <td class="right">₹${total}</td>
      </tr>
    </table>

    <div class="line"></div>
    <div class="center">Thank You! Visit Again</div>
    <div class="center" style="font-size:12px;">Powered by ${restaurants.name}</div>
  </div>
  <div class="line"></div>
</body>

</html>`;
  return html;
};

async function htmlToPdf(htmlContent, outPath) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outPath, width: '101.6mm', printBackground: true });
  await browser.close();
}

async function pdfUrlToBase64(pdfUrl) {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer", // important!
    });

    // Convert the binary data to Base64
    const base64 = Buffer.from(response.data, "binary").toString("base64");

    // Add the PDF MIME type prefix (optional)
    const base64Pdf = `data:application/pdf;base64,${base64}`;

    return base64Pdf;
  } catch (error) {
    console.error("Error converting PDF to base64:", error.message);
    throw error;
  }
}

// Convert Base64 → local file
async function base64ToLocalFile(base64String) {
  const matches = base64String.match(/^data:application\/pdf;base64,(.+)$/);
  const base64Data = matches ? matches[1] : base64String;
  const buffer = Buffer.from(base64Data, "base64");
  const filePath = path.join(process.cwd(), "temp.pdf");
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// Convert a remote PDF URL → local file
async function pdfUrlToLocalFile(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(process.cwd(), "temp.pdf");
  fs.writeFileSync(filePath, response.data);
  return filePath;
}

module.exports = {
  sendNotification,
  sendMail,
  printBill,
  htmlToPdf,
  pdfUrlToBase64,
  base64ToLocalFile,
  pdfUrlToLocalFile,
  sendAllNotification
};
