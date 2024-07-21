import dbConnect from "/utils/dbConnect";
import { NextResponse } from "next/server";
import * as Participants from "@/models/Participants";
import * as Verifications from "@/models/Verifications";
import * as Matches from "@/models/Matches";
import Event from "/models/Event";

import {
  isSubscribed,
  transporter,
  footerText,
  footerHtml,
} from "/utils/emailHelpers";

import { createMatches } from "@/utils/createMatches";

export async function GET(request, { params }) {
  const [type, eventID] = params.type;

  try {
    console.log(`Connecting to database...`);
    await dbConnect();
    console.log(`Fetching event with ID: ${eventID}`);
    const event = await Event.findOne({ _id: eventID });

    if (!event) {
      console.warn(`Event not found: ${eventID}`);
      return NextResponse.json({ noEvent: true });
    }

    const VerificationsType = Verifications[`Verificari_live_${type}`];
    console.log(`Fetching verification for type: ${type}`);
    const verification = await VerificationsType.findOne({
      round: { $exists: true },
    }).select("round");

    if (!verification) {
      throw new Error("Verification not found");
    }

    let round = verification.round;
    const isFinalRound =
      (type === "catan" && round === 3) ||
      ((type === "cavaleri" || type === "whist") && round === 2) ||
      (type === "rentz" && round === 1) ||
      false;

    if (round === 0) {
      console.log(`Returning initial round: ${round}`);
      return NextResponse.json({ round, isFinalRound });
    }

    let MatchesType = Matches[`Meciuri_live_${type}_${round}`];
    console.log(`Checking round scores for round: ${round}`);
    const roundScores = await MatchesType.find({ score: null }).count();
    const allScoresSubmitted = roundScores === 0;

    if (!allScoresSubmitted) {
      console.log(`Not all scores submitted for round: ${round}`);
      return NextResponse.json({ round, isFinalRound });
    }

    if (isFinalRound) {
      console.log(`Final round detected: ${round}`);
      await VerificationsType.updateOne(
        { stop: true },
        { stop: false, timer: null }
      );
      return NextResponse.json({ round, isFinalRound });
    }

    round++;
    console.log(`Starting next round: ${round}`);
    await VerificationsType.updateOne({ stop: true }, { round, timer: null });

    MatchesType = Matches[`Meciuri_live_${type}_${round}`];
    const ParticipantType = Participants[`Participanti_live_${type}`];
    let participantsNumber = await ParticipantType.countDocuments();

    if (type === "whist") {
      participantsNumber = 12;
    }

    const playersPerTable = "6";

    console.log(`Fetching participants for type: ${type}`);
    const participants = await ParticipantType.aggregate([
      {
        $lookup: {
          from: `clasament_live_${type}`,
          localField: "id",
          foreignField: "id",
          as: "participants",
        },
      },
      {
        $unwind: {
          path: "$participants",
        },
      },
      {
        $project: {
          id: 1,
          name: 1,
          email: 1,
          punctetotal: "$participants.punctetotal",
          scorjocuri: "$participants.scorjocuri",
          procent: "$participants.procent",
          licitari: "$participants.licitari",
        },
      },
      {
        $addFields: {
          sort1: {
            $cond: {
              if: { $eq: [type, "whist"] }, // Check if type is 'whist'
              then: "$procent", // Use 'procent' for 'whist'
              else: "$scorjocuri", // Use 'scorjocuri' otherwise
            },
          },
          sort2: {
            $cond: {
              if: { $eq: [type, "whist"] }, // Check if type is 'whist'
              then: "$licitari", // Use 'licitari' for 'whist'
              else: "$procent", // Use 'procent' otherwise
            },
          },
        },
      },
      {
        $sort: {
          punctetotal: -1, // Always sort by 'punctetotal' first
          sort1: -1, // Conditionally sort by either 'procent' or 'scorjocuri'
          sort2: -1, // Conditionally sort by either 'licitari' or 'procent'
        },
      },
    ]);

    console.log(`Creating matches for round: ${round}`);
    await createMatches(
      type,
      participantsNumber,
      playersPerTable,
      MatchesType,
      participants
    );

    participants
      .filter((participant) => participant.email)
      .forEach(async (participant) => {
        if (await isSubscribed(participant.email)) {
          console.log(`Sending email to: ${participant.email}`);
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: participant.email,
            subject: `Concurs ${type}`,
            text: `Start runda ${round} ${footerText(participant.email)}`,
            html: `<h1>Start runda ${round}</h1> ${footerHtml(
              participant.email
            )}`,
          });
        }
      });

    return NextResponse.json({ round, isFinalRound });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
