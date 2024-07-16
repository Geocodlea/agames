import { authOptions } from "/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

import { Typography } from "@mui/material";

import Events from "./Events";
import Leaderboard from "./Leaderboard";
import OldEvents from "./OldEvents";

import dbConnect from "/utils/dbConnect";
import User from "/models/User";

const Home = async () => {
  const session = await getServerSession(authOptions);

  await dbConnect();
  await User.updateOne({ _id: session?.user.id }, { lastActive: new Date() });

  return (
    <>
      <Typography variant="h1" gutterBottom>
        EVENIMENTE
      </Typography>
      <Typography variant="body1" mb={6}>
        TE AȘTEPTĂM LA CONCURSURI, JOCURI AMICALE SAU SESIUNI DE LEARN & PLAY,
        LIVE ȘI ONLINE, LA CELE MAI POPULARE BOARD GAMES.
      </Typography>
      <Events />
      <Leaderboard />
      <OldEvents />
    </>
  );
};

export default Home;
