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
  const isAdmin = session?.user.role === "admin";
  const router = useRouter();

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
      label: "Detalii",
      content: editorContent(event, "detalii"),
    },
    {
      label: "Premii",
      content: editorContent(event, "premii"),
    },
    {
      label: "Regulament",
      content: editorContent(event, "regulament"),
    },
  ];

  if (!eventStarted) {
    tabs.push({
      label: "Inscriere",
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
      label: "Participanti",
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
  if (eventStarted && isPersonalMatch) {
    tabs.push({
      label: "Meci Propriu",
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

  if (eventStarted) {
    tabs.push(
      {
        label: "Meciuri",
        content: (
          <Matches
            type={type}
            round={round}
            host={session?.user.name}
            isAdmin={isAdmin}
          />
        ),
      },
      { label: "Clasament", content: <Ranking type={type} /> }
    );
  }

  if (isAdmin && type !== "general") {
    tabs.push({
      label: "Admin",
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
