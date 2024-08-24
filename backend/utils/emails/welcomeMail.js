// Import the necessary modules here
import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";
const configPath = path.resolve("backend", "config", "uat.env");
dotenv.config({ path: configPath });
export const sendWelcomeEmail = async (user) => {
  // Write your code here
  const transporter = nodemailer.createTransport({
    service:process.env.SMPT_SERVICE,
    auth: {
      user: process.env.STORFLEET_SMPT_MAIL,
      pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD
    }
  });
  try {
    await transporter.sendMail({
      from: process.env.STORFLEET_SMPT_MAIL,
      to: user.email,
      subject: 'Welcome to Storefleet',
      html: `
      <div style="text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #6c63ff;">Welcome to Storefleet</h1>
          <img src="cid:logo"/>
          <p>Hello, ${user.name}</p>
          <p>Thank you for registering with Storefleet. We're excited to have you as a new member of our community.</p>
          <a href="/" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #6c63ff; colo [ 3-=r: white; text-decoration: none; border-radius: 5px;">Get Started</a>
      </div>
  `,
      attachments: [
        {
          filename: 'logo.png',
          path: "logo.png",
          cid: 'logo'   
        }
      ]
    })
    console.log("sucess")
  } catch (err) {
    console.log(err)
  }

};
