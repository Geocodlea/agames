"use client";

import { useRouter } from "next/navigation";
import revalidate from "/utils/revalidate";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Tabs from "@/components/Tabs";
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

import AlertMsg from "@/components/AlertMsg";
import Stack from "@mui/material/Stack";
import Register from "./Register";
import Participants from "./Participants";
import Amical from "./Amical";
import Admin from "./Admin";
import PersonalMatch from "./PersonalMatch";
import Matches from "./Matches";
import Ranking from "./Ranking";
import Loading from "./loading";

import AssignmentIcon from "@mui/icons-material/Assignment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InfoIcon from "@mui/icons-material/Info";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ShieldIcon from "@mui/icons-material/Shield";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function EventPage({ params }) {
  const [type, id] = params.id;
  const { data: session } = useSession();
  const [round, setRound] = useState(0);
  const [isFinalRound, setIsFinalRound] = useState(false);
  const [event, setEvent] = useState({});
  const [eventStarted, setEventStarted] = useState(false);
  const [alert, setAlert] = useState({ text: "", severity: "" });
  const [loading, setLoading] = useState(true);
  const [isPersonalMatch, setIsPersonalMatch] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const isAdmin = session?.user.role === "admin";
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const getRound = async () => {
      const response = await fetch(`/api/events/round/${type}/${id}`);
      const data = await response.json();

      // If event not exists, redirect to homepage
      if (data.noEvent) {
        revalidate();
        router.push("/");
      }

      setRound(data.round);
      setIsFinalRound(data.isFinalRound);
      setIsPublished(data.isPublished);
      data.round === 0 ? setEventStarted(false) : setEventStarted(true);
    };

    getRound();
    const interval = setInterval(getRound, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getEvent = async () => {
      const response = await fetch(`/api/events/${id}`);
      const event = await response.json();

      setEvent(event);
      if (event) {
        setLoading(false);
      }
    };

    getEvent();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const saveData = async (data, tab) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          tab,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setAlert({
        text: `Saved`,
        severity: "success",
      });
    } catch (error) {
      setAlert({ text: `${error}`, severity: "error" });
    }
  };

  const editorContent = (event, tab) =>
    isAdmin ? (
      <Editor saveData={saveData} initialData={event[tab]} tab={tab} />
    ) : (
      <div dangerouslySetInnerHTML={{ __html: event[tab] || "" }} />
    );

  const tabs = [
    {
      label: isSmallScreen ? <AssignmentIcon /> : "Detalii",
      content: editorContent(event, "detalii"),
    },
    {
      label: isSmallScreen ? <EmojiEventsIcon /> : "Premii",
      content: editorContent(event, "premii"),
    },
    {
      label: isSmallScreen ? <InfoIcon /> : "Regulament",
      content: editorContent(event, "regulament"),
    },
  ];

  if (!eventStarted) {
    tabs.push({
      label: isSmallScreen ? <EventNoteIcon /> : "Inscriere",
      content: (
        <Register
          session={session}
          type={type}
          eventID={id}
          eventDate={event.date}
        />
      ),
    });
  }

  if (isAdmin || eventStarted) {
    tabs.push({
      label: isSmallScreen ? <GroupsIcon /> : "Participanti",
      content: (
        <Stack spacing={4}>
          <Participants
            type={type}
            round={round}
            isAdmin={isAdmin}
            eventID={id}
          />
          {isAdmin && type !== "general" && <Amical type={type} />}
        </Stack>
      ),
    });
  }

  const updatePersonalMatch = (result) => {
    setIsPersonalMatch(result);
  };
  if (eventStarted && isPersonalMatch && isPublished) {
    tabs.push({
      label: isSmallScreen ? <AssignmentIndIcon /> : "Meci Propriu",
      content: (
        <PersonalMatch
          type={type}
          round={round}
          host={session?.user.name}
          isAdmin={isAdmin}
          userID={session?.user.id}
          eventID={id}
          updatePersonalMatch={updatePersonalMatch}
        />
      ),
    });
  }

  if (eventStarted && (isAdmin || isPublished)) {
    tabs.push({
      label: isSmallScreen ? <ScoreboardIcon /> : "Meciuri",
      content: (
        <Matches
          type={type}
          round={round}
          host={session?.user.name}
          isAdmin={isAdmin}
        />
      ),
    });
  }

  if (eventStarted) {
    tabs.push({
      label: isSmallScreen ? <LeaderboardIcon /> : "Clasament",
      content: <Ranking type={type} />,
    });
  }

  if (isAdmin && type !== "general") {
    tabs.push({
      label: isSmallScreen ? <ShieldIcon /> : "Admin",
      content: (
        <Admin
          type={type}
          round={round}
          isFinalRound={isFinalRound}
          eventID={id}
        />
      ),
    });
  }

  return (
    <div className="editorContent">
      <Tabs tabContents={tabs} round={round} />
      <AlertMsg alert={alert} />
    </div>
  );
}
