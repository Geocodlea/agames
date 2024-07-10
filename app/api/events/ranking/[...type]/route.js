import dbConnect from "/utils/dbConnect";
import * as Clasament from "/models/Clasament";
import * as Verifications from "@/models/Verifications";
import { NextResponse } from "next/server";

import { sortOrder } from "@/utils/helpers";

export async function GET(request, { params }) {
  const [type] = params.type;

  const ClasamentType = Clasament[`Clasament_live_${type}`];
  const VerificationsType = Verifications[`Verificari_live_${type}`];

  await dbConnect();

  // For Whist Ranking
  const verification = await VerificationsType.findOne({
    round: { $exists: true },
  }).select("stop");
  const isFinished = !verification.stop;

  const clasament = await ClasamentType.aggregate(sortOrder(type, isFinished));

  return NextResponse.json(clasament);
}
