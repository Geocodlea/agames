import { NextResponse } from "next/server";
import { transporter } from "/utils/emailHelpers";

export async function POST(request) {
  const data = await request.json();

  // Send the email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `Message from AGames - Contact Form`,
    text: `${data.message} \n\n Sent from: ${data.name} \n Email: ${data.email} \n Phone: ${data.phone}`,
    html: `<p>${data.message}</p>
           <p>Sent from: ${data.name}<br />
              Email: <a href="mailto:${data.email}">${data.email}</a><br />
              Phone: <a href="tel:${data.phone}">${data.phone}</p>`,
  });

  return NextResponse.json({ success: true });
}
