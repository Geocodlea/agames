import dbConnect from "../../utils/dbConnect";
import User from "../../models/User";
import nodemailer from "nodemailer";

export default async () => {
  await dbConnect();

  const currentDate = new Date();

  // Calculate one minute ago from the current time
  const oneMinuteAgo = new Date(currentDate.getTime() - 1 * 60 * 1000);

  const users = await User.find().select("lastActive email");

  const emailPromises = users.map(async (user) => {
    // Compare the dates
    if (user.lastActive > oneMinuteAgo) {
      console.log("The date is within the last minute.");
    } else {
      console.log("The date is more than one minute old.");

      // Create a transporter with your email service provider's details
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      try {
        // Send the email
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `Message from AGames - TEST`,
          text: `TEST MAILLLLL`,
        });
        console.log(`Email sent to ${user.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
      }
    }
  });

  // await Promise.all(emailPromises);
};
