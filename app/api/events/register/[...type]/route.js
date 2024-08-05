import dbConnect from "/utils/dbConnect";
import Email from "/models/Email";
import { NextResponse } from "next/server";

import mongoose from "mongoose";
import {
  createParticipantsModel,
  createVerificationsModel,
} from "@/utils/createModels";

import {
  isSubscribed,
  transporter,
  emailFooterText,
  emailFooterHtml,
} from "/utils/emailHelpers";
import { convert } from "html-to-text";

export async function GET(request, { params }) {
  const [type, eventID, id] = params.type;

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];

  await dbConnect();
  const isRegistered = await Participants.exists({ id });

  return NextResponse.json(isRegistered ? true : false);
}

export async function POST(request, { params }) {
  const [type, eventID] = params.type;
  const data = await request.json();

  if (!data.user) {
    return NextResponse.json({ success: false, message: "Nu ești logat" });
  }

  if (!data.user.name) {
    return NextResponse.json({
      success: false,
      message: "Numele este obligatoriu",
    });
  }

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  await createVerificationsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];
  const Verifications = mongoose.models[`Verificari_live_${modelName}`];

  await dbConnect();
  const eventStarted = await Verifications.findOne({
    round: { $gt: 0 },
  });
  if (eventStarted) {
    return NextResponse.json({
      success: false,
      message: "Evenimentul este început",
    });
  }

  const registeredParticipant = await Participants.findOne({
    id: data.user.id,
  });

  if (registeredParticipant) {
    return NextResponse.json({ success: false, message: "Ești deja înscris" });
  }

  const participant = new Participants(data.user);
  await participant.save();

  if (await isSubscribed(data.user.email)) {
    const email = await Email.findOne({ name: "register" });
    const emailSubject = email.subject.replace("{type}", data.typeName);
    const emailHtml = email.body
      .replace("{name}", data.user.name)
      .replace("{type}", data.typeName);
    const emailText = convert(emailHtml, {
      wordwrap: 130,
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: data.user.email,
        subject: emailSubject,
        text: emailText + "\n\n" + emailFooterText(data.user.email),
        html: emailHtml + emailFooterHtml(data.user.email),
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Failed to send email",
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const [type, eventID] = params.type;
  const user = await request.json();

  if (Object.keys(user).length === 0) {
    return NextResponse.json({ success: false, message: "Nu ești logat" });
  }

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];

  await dbConnect();

  const registeredParticipant = await Participants.findOne({
    id: user.id,
  });
  if (!registeredParticipant) {
    return NextResponse.json({ success: false, message: "Nu ești înscris" });
  }

  await Participants.deleteOne({ id: user.id });

  return NextResponse.json({ success: true });
}
