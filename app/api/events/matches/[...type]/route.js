import { NextResponse } from "next/server";
import dbConnect from "/utils/dbConnect";
import * as Matches from "/models/Matches";
import * as Verifications from "/models/Verifications";
import * as Clasament from "/models/Clasament";
import * as Participants from "/models/Participants";

import { calculateScores } from "@/utils/calculateScores";
import { getMatches } from "@/utils/getMatches";

export async function GET(request, { params }) {
  const [type, round] = params.type;

  if (round === "undefined") return NextResponse.json({});

  const VerificationsType = Verifications[`Verificari_live_${type}`];

  const matches = await getMatches(type, round);
  const allMatches = [matches];

  // Get past rounds matches
  let matches1, matches2;
  if (round === "2") {
    matches1 = await getMatches(type, 1);
    allMatches.push(matches1);
  }
  if (round === "3") {
    matches1 = await getMatches(type, 1);
    matches2 = await getMatches(type, 2);
    allMatches.push(matches2, matches1);
  }

  await dbConnect();
  const verification = await VerificationsType.findOne().select("timer");
  const timer = verification?.timer;

  return NextResponse.json({ allMatches, timer });
}

export async function POST(request, { params }) {
  const [type, round] = params.type;
  const data = await request.json();

  if (!data.name) {
    return NextResponse.json({
      success: false,
      message: "Numele este obligatoriu",
    });
  }

  const ParticipantType = Participants[`Participanti_live_${type}`];
  const MatchesType = Matches[`Meciuri_live_${type}_${round}`];
  const ClasamentType = Clasament[`Clasament_live_${type}`];
  const VerificationsType = Verifications[`Verificari_live_${type}`];

  await dbConnect();
  const participant = new ParticipantType(data);
  await participant.save();
  const participantMatch = new MatchesType(data);
  await participantMatch.save();
  const participantClasament = new ClasamentType(data);
  await participantClasament.save();
  const participantVerification = new VerificationsType({ id: data.id });
  await participantVerification.save();

  return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
  const [type, round, host, isAdmin, targetRound, id] = params.type;
  const data = await request.json();
  const table = data.table;
  const name = data.name;

  const matchRound = isNaN(targetRound) ? round : targetRound;

  // Only for Whist
  const licitari = data.licitari;

  const score = typeof data.score !== "number" ? null : Number(data.score);
  const ParticipantType = Participants[`Participanti_live_${type}`];
  const MatchesType = Matches[`Meciuri_live_${type}_${matchRound}`];
  const VerificationsType = Verifications[`Verificari_live_${type}`];
  const ClasamentType = Clasament[`Clasament_live_${type}`];

  await dbConnect();

  if (isAdmin !== "true") {
    const eventFinished = await VerificationsType.findOne({ isStarted: false });
    if (eventFinished) {
      return NextResponse.json({
        success: false,
        message: "Evenimentul este încheiat",
      });
    }
  }

  // Update the score and find if all scores are filled
  await ParticipantType.updateOne({ id }, { name });
  await MatchesType.updateOne({ id }, { table, name, score, host, licitari });
  const tableScores = await MatchesType.find({
    table,
    score: null,
  });
  if (tableScores.length) {
    return NextResponse.json({ success: true });
  }

  // Find all players in the table
  const players = await MatchesType.find({
    table,
  })
    .select("id name score licitari")
    .sort({ score: -1 });

  const ids = players.map((player) => player.id);
  const names = players.map((player) => player.name);
  const scores = players.map((player) => player.score);
  const totalScore = scores.reduce((a, b) => a + b, 0);

  // Only for Whist
  const licitariAll = players.map((player) => player.licitari);

  const points = calculateScores(type, scores);

  // Update verifications only for catan and cavaleri
  const reducedTable = players.length === 3;
  if (type === "catan" || type === "cavaleri") {
    await VerificationsType.updateMany({ id: { $in: ids } }, [
      {
        $set: {
          [`meci${matchRound}`]: table,
          masa_redusa: reducedTable,
        },
      },
    ]);
  }

  await ClasamentType.updateMany({ id: { $in: ids } }, [
    {
      $set: {
        name: {
          $arrayElemAt: [names, { $indexOfArray: [ids, "$id"] }],
        },
        [`masar${matchRound}`]: table,
        [`puncter${matchRound}`]: {
          $arrayElemAt: [points, { $indexOfArray: [ids, "$id"] }],
        },
        [`scorjocr${matchRound}`]: {
          $arrayElemAt: [scores, { $indexOfArray: [ids, "$id"] }],
        },
        [`scortotalr${matchRound}`]: totalScore,
      },
    },
  ]);

  // Whist - different ranking
  if (type === "whist") {
    let maxScore;
    switch (players.length) {
      case 4:
        maxScore = 242;
        break;
      case 5:
        maxScore = 274;
        break;
      case 6:
        maxScore = 306;
        break;
    }

    await ClasamentType.updateMany({ id: { $in: ids } }, [
      {
        $set: {
          punctetotal: {
            $add: [
              { $ifNull: ["$puncter1", 0] },
              { $ifNull: ["$puncter2", 0] },
            ],
          },
          scorjocuri: {
            $add: [
              { $ifNull: ["$scorjocr1", 0] },
              { $ifNull: ["$scorjocr2", 0] },
            ],
          },
          scortotal: maxScore,
          procent: {
            $trunc: [
              {
                $multiply: [
                  {
                    $divide: ["$scorjocr1", maxScore],
                  },
                  100, // Multiply by 100
                ],
              },
              2, // Number of decimal places
            ],
          },
          licitari: {
            $arrayElemAt: [licitariAll, { $indexOfArray: [ids, "$id"] }],
          },
        },
      },
    ]);

    return NextResponse.json({ success: true });
  }

  await ClasamentType.updateMany({ id: { $in: ids } }, [
    {
      $set: {
        punctetotal: {
          $add: [
            { $ifNull: ["$puncter1", 0] },
            { $ifNull: ["$puncter2", 0] },
            { $ifNull: ["$puncter3", 0] },
          ],
        },
        scorjocuri: {
          $add: [
            { $ifNull: ["$scorjocr1", 0] },
            { $ifNull: ["$scorjocr2", 0] },
            { $ifNull: ["$scorjocr3", 0] },
          ],
        },
        scortotal: {
          $add: [
            { $ifNull: ["$scortotalr1", 0] },
            { $ifNull: ["$scortotalr2", 0] },
            { $ifNull: ["$scortotalr3", 0] },
          ],
        },
        procent: {
          $trunc: [
            {
              $multiply: [
                {
                  $add: [
                    {
                      $divide: [
                        { $ifNull: ["$scorjocr1", 0] },
                        { $ifNull: ["$scortotalr1", 1] }, // Avoid division by zero by defaulting to 1
                      ],
                    },
                    {
                      $divide: [
                        { $ifNull: ["$scorjocr2", 0] },
                        { $ifNull: ["$scortotalr2", 1] },
                      ],
                    },
                    {
                      $divide: [
                        { $ifNull: ["$scorjocr3", 0] },
                        { $ifNull: ["$scortotalr3", 1] },
                      ],
                    },
                  ],
                },
                100, // Multiply by 100
              ],
            },
            2, // Number of decimal places
          ],
        },
      },
    },
  ]);

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const [type, round, , , targetRound, id] = params.type;

  const matchRound = isNaN(targetRound) ? round : targetRound;

  const ParticipantType = Participants[`Participanti_live_${type}`];
  const MatchesType = Matches[`Meciuri_live_${type}_${matchRound}`];

  await dbConnect();
  await ParticipantType.deleteOne({ id });
  await MatchesType.deleteOne({ id });

  return NextResponse.json({ success: true });
}
