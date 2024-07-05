import dbConnect from "/utils/dbConnect";
import * as Clasament from "/models/Clasament";
import { NextResponse } from "next/server";

import { sortOrder } from "@/utils/helpers";

export async function GET(request, { params }) {
  const [type, round] = params.type;

  const ClasamentType = Clasament[`Clasament_live_${type}`];

  await dbConnect();
  const clasament = await ClasamentType.aggregate(sortOrder(type, round));

  return NextResponse.json(clasament);
}
