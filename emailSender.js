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
const FRONTEND_URL = process.env.FRONTEND_URL;

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

export const sendEmail = (mailTo, subject, mode) => {
  const code = generateCode();
  const filePath =
    mode === 1
      ? path.join(__dirname, "email.html")
      : path.join(__dirname, "forgot_email.html");

  // Read the HTML template
  fs.readFile(filePath, { encoding: "utf-8" }, (err, html) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      return;
    }

    let htmlWithCode;
    if (mode === 1) {
      htmlWithCode = html.replace("{{verification_code}}", code.toString());
    } else {
      const email = encodeURIComponent(mailTo); // Ensure the email is URL-encoded
      htmlWithCode = html.replace(
        "{{link}}",
        `${FRONTEND_URL}reset?email=${email}&code=${code}`,
      );
    }

    const mailOptions = {
      from: EMAIL,
      to: mailTo,
      subject: subject,
      html: htmlWithCode,
    };

    // Send the email
    const send = async () => {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response, mailTo);
      } catch (err) {
        console.error("Error sending email:", err);
      }
    };
    send();
  });

  return code;
};
