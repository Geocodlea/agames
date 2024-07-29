import dbConnect from "/utils/dbConnect";
import { NextResponse } from "next/server";

import mongoose from "mongoose";
import {
  createParticipantsModel,
  createVerificationsModel,
} from "@/utils/createModels";

import {
  isSubscribed,
  transporter,
  footerText,
  footerHtml,
} from "/utils/emailHelpers";

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
  const session = await request.json();

  if (Object.keys(session).length === 0) {
    return NextResponse.json({ success: false, message: "Nu ești logat" });
  }

  if (!session.user.name) {
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
    id: session.user.id,
  });

  if (registeredParticipant) {
    return NextResponse.json({ success: false, message: "Ești deja înscris" });
  }

  const participant = new Participants(session.user);
  await participant.save();

  if (await isSubscribed(session.user.email)) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: session.user.email,
        subject: `Înscriere Seara de ${type}`,
        text: `Salutare ${
          session.user.name
        }, ne bucură înscrierea ta la Seara de ${type}. \r\n\r\n În cazul în care nu vei mai putea ajunge, te rugăm să ne anunți sau să îți anulezi înscrierea pe site: www.agames.ro \r\n\r\n Mulțumim, o zi frumoasă în continuare 😊 ${footerText(
          session.user.email
        )}`,
        html: `<p>Salutare ${session.user.name},</p>
               <p>Ne bucură înscrierea ta la Seara de ${type}.</p>
               <p>În cazul în care nu vei mai putea ajunge, te rugăm să ne anunți sau să îți anulezi înscrierea pe site: <a href="http://www.agames.ro">www.agames.ro</a></p>
               <p>Mulțumim, o zi frumoasă în continuare 😊</p>
               <p>${footerHtml(session.user.email)}</p>`,
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
