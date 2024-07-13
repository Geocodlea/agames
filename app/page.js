import { authOptions } from "/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

import styles from "./page.module.css";

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
      <h1 className={styles.title}>EVENIMENTE</h1>
      <p className={styles.description} style={{ marginBottom: "3rem" }}>
        TE AȘTEPTĂM LA CONCURSURI, JOCURI AMICALE SAU SESIUNI DE LEARN & PLAY,
        LIVE ȘI ONLINE, LA CELE MAI POPULARE BOARD GAMES.
      </p>
      <Events />
      <Leaderboard />
      <OldEvents />
    </>
  );
};

export default Home;
