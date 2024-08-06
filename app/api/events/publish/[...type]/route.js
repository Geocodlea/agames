import dbConnect from "/utils/dbConnect";
import { NextResponse } from "next/server";

import * as Verifications from "@/models/Verifications";

export async function PATCH(request, { params }) {
  const [type] = params.type;

  const VerificationsType = Verifications[`Verificari_live_${type}`];

  await dbConnect();
  await VerificationsType.updateOne({ isStarted: true }, { isPublished: true });

  return NextResponse.json({ success: true });
}
