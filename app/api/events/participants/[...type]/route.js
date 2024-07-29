import dbConnect from "/utils/dbConnect";
import { NextResponse } from "next/server";
import * as Matches from "/models/Matches";
import * as Clasament from "/models/Clasament";
import * as Verifications from "@/models/Verifications";
import User from "/models/User";

import mongoose from "mongoose";
import { createParticipantsModel } from "@/utils/createModels";

export async function GET(request, { params }) {
  const [type, eventID] = params.type;

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];

  await dbConnect();
  const participants = await Participants.find()
    .select("id name tel email obs rude")
    .sort("_id");

  return NextResponse.json(participants);
}

export async function POST(request, { params }) {
  const [type, round, eventID] = params.type;
  const data = await request.json();

  if (!data.name) {
    return NextResponse.json({
      success: false,
      message: "Numele este obligatoriu",
    });
  }

  await dbConnect();

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];

  const participant = new Participants(data);
  await participant.save();

  if (round !== "0") {
    const MatchesType = Matches[`Meciuri_live_${type}_${round}`];
    const ClasamentType = Clasament[`Clasament_live_${type}`];
    const VerificationsType = Verifications[`Verificari_live_${type}`];

    const participantMatch = new MatchesType(data);
    await participantMatch.save();
    const participantClasament = new ClasamentType(data);
    await participantClasament.save();
    const participantVerification = new VerificationsType({ id: data.id });
    await participantVerification.save();
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
  const [type, round, eventID, id] = params.type;
  const data = await request.json();

  if (!data.name) {
    return NextResponse.json({
      success: false,
      message: "Numele este obligatoriu",
    });
  }

  await dbConnect();
  await User.updateOne({ _id: id }, { obs: data.obs });

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];

  await Participants.updateOne({ id }, data);

  if (round !== "0") {
    const MatchesType = Matches[`Meciuri_live_${type}_${round}`];
    const ClasamentType = Clasament[`Clasament_live_${type}`];

    await MatchesType.updateOne({ id }, data);
    await ClasamentType.updateOne({ id }, data);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const [type, round, eventID, id] = params.type;

  await dbConnect();

  const modelName = type === "general" ? eventID : type;
  await createParticipantsModel(modelName);
  const Participants = mongoose.models[`Participanti_live_${modelName}`];

  await Participants.deleteOne({ id });

  if (round !== "0") {
    const MatchesType = Matches[`Meciuri_live_${type}_${round}`];
    await MatchesType.deleteOne({ id });
  }

  return NextResponse.json({ success: true });
}
