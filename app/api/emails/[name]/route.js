import dbConnect from "/utils/dbConnect";
import Email from "/models/Email";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { name } = params;

  await dbConnect();
  const email = await Email.findOne({ name });

  return NextResponse.json(email);
}

export async function PUT(request, { params }) {
  const { name } = params;
  const body = await request.json();

  await dbConnect();
  await Email.updateOne({ name }, { text: body.data });

  return NextResponse.json({ success: true });
}
