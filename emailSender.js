import "dotenv/config";
import nodemailer from "nodemailer";

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;


const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

export const sendEmail = (mailTo) => {
  const code = generateCode()
  const mailOptions = {
    from: EMAIL,
    to: mailTo,
    subject: "Your Verification Code",
    text: `${code}`,
  };
  const send = async () => {
    try {
      const info = await transporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err);
    }
  };
  send();
  return code
};

