import dbConnect from "../../utils/dbConnect";
import User from "../../models/User";

import { transporter, footerText, footerHtml } from "../../utils/emailHelpers";

export default async () => {
  await dbConnect();

  // Get the current date
  const currentDate = new Date();

  // Calculate one year ago from the current date
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  // Combine one year and one month ago
  const oneYearAndOneMonthAgo = new Date(currentDate);
  oneYearAndOneMonthAgo.setFullYear(currentDate.getFullYear() - 1);
  oneYearAndOneMonthAgo.setMonth(currentDate.getMonth() - 1);

  const users = await User.find({
    lastActive: { $lt: oneYearAgo },
  }).select(" email lastActive");

  const emailPromises = users.map(async (user) => {
    // lastActive <= 1 year + 1 month ago delete account || lastActive < 1 year ago send mail
    if (user.lastActive <= oneYearAndOneMonthAgo) {
      await User.deleteOne({ _id: user._id });
    } else {
      const deletionDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 1)
      ).toLocaleDateString("ro-RO");
      const loginLink = `${process.env.DEPLOYED_URL}/auth/signin`;

      try {
        // Send the email
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Important Notice: Your Account is at Risk of Deletion",
          text: `Hi, \n\n We hope this message finds you well. \n\n Our records show that you haven’t logged into your account for over a year. To maintain our system’s efficiency and security, we periodically remove inactive accounts. \n\n Please be aware: If you do not log in within the next 30 days, your account will be permanently deleted. \n\n We value you as a user and would love to have you back. Please log in before ${deletionDate} to keep your account active: \n\n ${loginLink} \n\n Best regards, \n AGames Team \n\n P.S. If you no longer wish to keep your account, no action is required on your part. It will be automatically deleted after ${deletionDate}. ${footerText(
            user.email
          )}`,
          html: `
                <p>Hi,</p>
                <p>We hope this message finds you well.</p>
                <p>Our records show that you haven’t logged into your account for over a year. To maintain our system’s efficiency and security, we periodically remove inactive accounts.</p>
                <p><strong>Please be aware: If you do not log in within the next 30 days, your account will be permanently deleted.</strong></p>
                <p>We value you as a user and would love to have you back. Please log in before <strong>${deletionDate}</strong> to keep your account active:</p>
                <p><a href="${loginLink}" style="text-decoration: none; "><button style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; border: none; border-radius: 5px; cursor: pointer;">Log in to your account</button></a></p>
                <p>If you have any questions or need assistance, our support team is here to help.</p>
                <p>Best regards,<br />
                <strong>AGames Team</strong></p>
                <p>P.S. If you no longer wish to keep your account, no action is required on your part. It will be automatically deleted after <strong>${deletionDate}</strong>.</p>
                ${footerHtml(user.email)}
              `,
        });
      } catch (error) {
        console.error(error);
      }
    }
  });

  await Promise.all(emailPromises);
};
