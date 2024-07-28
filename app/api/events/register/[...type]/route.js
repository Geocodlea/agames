import dbConnect from "/utils/dbConnect";
import { NextResponse } from "next/server";
import * as Participants from "@/models/Participants";
import * as Verifications from "@/models/Verifications";

import mongoose from "mongoose";
import { createParticipantsModel } from "@/utils/createModels";

import {
  isSubscribed,
  transporter,
  footerText,
  footerHtml,
} from "/utils/emailHelpers";

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

  if (type === "general") {
    await createParticipantsModel(eventID);
    const Participants = mongoose.models[`Participanti_live_${eventID}`];
    const participant = new Participants(session.user);
    await participant.save();

    return NextResponse.json({ success: true });
  }

  const ParticipantType = Participants[`Participanti_live_${type}`];
  const VerificationsType = Verifications[`Verificari_live_${type}`];

  await dbConnect();
  const eventStarted = await VerificationsType.findOne({
    round: { $gt: 0 },
  });
  if (eventStarted) {
    return NextResponse.json({
      success: false,
      message: "Evenimentul este început",
    });
  }

  const registeredParticipant = await ParticipantType.findOne({
    id: session.user.id,
  });

  if (registeredParticipant) {
    return NextResponse.json({ success: false, message: "Ești deja înscris" });
  }

  const participant = new ParticipantType(session.user);
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

  if (type === "general") {
    await createParticipantsModel(eventID);
    const Participants = mongoose.models[`Participanti_live_${eventID}`];
    await Participants.deleteOne({ id: user.id });

    return NextResponse.json({ success: true });
  }

  const ParticipantType = Participants[`Participanti_live_${type}`];

  await dbConnect();

  const registeredParticipant = await ParticipantType.findOne({
    id: user.id,
  });
  if (!registeredParticipant) {
    return NextResponse.json({ success: false, message: "Nu ești înscris" });
  }

  await ParticipantType.deleteOne({ id: user.id });

  return NextResponse.json({ success: true });
}
