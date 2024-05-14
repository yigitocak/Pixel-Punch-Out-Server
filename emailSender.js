import "dotenv/config";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ES modules: __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

export const sendEmail = (mailTo) => {
  const code = generateCode();
  const filePath = path.join(__dirname, 'email.html');

  // Read the HTML template
  fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      return;
    }

    const htmlWithCode = html.replace('{{verification_code}}', code.toString());

    const mailOptions = {
      from: EMAIL,
      to: mailTo,
      subject: "Your Verification Code",
      html: htmlWithCode,
    };

    // Send the email
    const send = async () => {
      try {
        const info = await transporter.sendMail(mailOptions);
      } catch (err) {
        console.log(err);
      }
    };
    send();
  });

  return code;
};

// Example usage
const email = 'yigitockk@gmail.com';
sendEmail(email);
