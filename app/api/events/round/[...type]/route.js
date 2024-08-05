import dbConnect from "/utils/dbConnect";
import { NextResponse } from "next/server";
import * as Participants from "@/models/Participants";
import * as Verifications from "@/models/Verifications";
import * as Matches from "@/models/Matches";
import Event from "/models/Event";
import Email from "/models/Email";

import {
  isSubscribed,
  transporter,
  emailFooterText,
  emailFooterHtml,
} from "/utils/emailHelpers";
import { convert } from "html-to-text";
import { eventName } from "@/utils/helpers";

import { createMatches } from "@/utils/createMatches";

export async function GET(request, { params }) {
  const [type, eventID] = params.type;

  if (type === "general") return NextResponse.json({ round: 0 });

  await dbConnect();
  const event = await Event.findOne({ _id: eventID });

  // If event not exists, redirect to homepage
  if (!event) {
    return NextResponse.json({ noEvent: true });
  }

  const VerificationsType = Verifications[`Verificari_live_${type}`];
  const verification = await VerificationsType.findOne({
    round: { $exists: true },
  }).select("round");
  let round = verification.round;

  const isFinalRound =
    type === "catan"
      ? round === 3
      : type === "cavaleri" || type === "whist"
      ? round === 2
      : type === "rentz"
      ? round === 1
      : false;

  if (round === 0) {
    return NextResponse.json({ round, isFinalRound });
  }

  let MatchesType = Matches[`Meciuri_live_${type}_${round}`];

  const roundScores = await MatchesType.find({
    score: null,
  }).count();
  const allScoresSubmitted = roundScores === 0;

  if (!allScoresSubmitted) {
    return NextResponse.json({ round, isFinalRound });
  }

  if (isFinalRound) {
    await VerificationsType.updateOne(
      { stop: true },
      { stop: false, timer: null }
    );
    return NextResponse.json({ round, isFinalRound });
  }

  // All scores submitted, start the next round
  round++;
  await VerificationsType.updateOne({ stop: true }, { round, timer: null });

  MatchesType = Matches[`Meciuri_live_${type}_${round}`];
  const ParticipantType = Participants[`Participanti_live_${type}`];
  let participantsNumber = await ParticipantType.countDocuments();

  if (type === "whist") {
    participantsNumber = 12;
  }
  const playersPerTable = "6";

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

  await createMatches(
    type,
    participantsNumber,
    playersPerTable,
    MatchesType,
    participants
  );

  // Send emails to all participants
  participants
    .filter((participant) => participant.email)
    .forEach(async (participant) => {
      if (await isSubscribed(participant.email)) {
        const email = await Email.findOne({ name: "start" });
        const emailSubject = email.subject.replace("{type}", eventName(type));
        const emailHtml = email.body.replace("{round}", round);
        const emailText = convert(emailHtml, {
          wordwrap: 130,
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: participant.email,
          subject: emailSubject,
          text: emailText + "\n\n" + emailFooterText(participant.email),
          html: emailHtml + emailFooterHtml(participant.email),
        });
      }
    });

  return NextResponse.json({ round, isFinalRound });
}
