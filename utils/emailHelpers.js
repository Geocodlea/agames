import dbConnect from "./dbConnect";
import User from "../models/User";
import Email from "../models/Email";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { convert } from "html-to-text";

// Middleware function to check subscription status
const isSubscribed = async (email) => {
  await dbConnect();
  const user = await User.findOne({ email }).select("unsubscribed");

  if (!user || user.unsubscribed) {
    return false;
  }

  return true;
};

// Create a transporter with your email service provider's details
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create jwt token with user's email
const token = (email) => jwt.sign({ email }, process.env.NEXTAUTH_SECRET);

await dbConnect();
const emailFooter = await Email.findOne({ name: "footer" });
const emailFooterHtml = (email) =>
  emailFooter.body.replace(
    "{unsubscribe}",
    `<a href="${process.env.DEPLOYED_URL}/api/unsubscribe/${token(
      email
    )}" style="color: #999999; text-decoration: none;">unsubscribe</a>`
  );

const emailFooterText = (email) =>
  convert(emailFooterHtml(email), {
    wordwrap: 130,
  });

export { isSubscribed, transporter, emailFooterText, emailFooterHtml };
