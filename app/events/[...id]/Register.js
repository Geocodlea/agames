"use client";

import { useState, useEffect } from "react";
import styles from "@/app/page.module.css";
import { Box, Button, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "next/link";

import { AddToCalendarButton } from "add-to-calendar-button-react";
import AlertMsg from "@/components/AlertMsg";
import { getEventDates, eventName } from "@/utils/helpers";

export default function Register({ session, type, eventID, eventDate }) {
  const [alert, setAlert] = useState({ text: "", severity: "" });
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const getIsRegistered = async () => {
      const response = await fetch(
        `/api/events/register/${type}/${eventID}/${session?.user.id}`
      );
      const data = await response.json();
      setIsRegistered(data);
    };

    getIsRegistered();
  }, []);

  const register = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/register/${type}/${eventID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: session?.user }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setLoading(false);
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message);
      }

      setAlert({
        text: `Te-ai înscris cu succes`,
        severity: "success",
      });
      setIsRegistered(true);
    } catch (error) {
      setAlert({ text: `${error}`, severity: "error" });
    }
  };

  const unregister = async () => {
    try {
      const response = await fetch(`/api/events/register/${type}/${eventID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: session?.user.id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message);
      }

      setAlert({
        text: `Ai anulat înscrierea cu succes`,
        severity: "success",
      });
      setIsRegistered(false);
    } catch (error) {
      setAlert({ text: `${error}`, severity: "error" });
    }
  };

  return (
    <Box className={styles.grid}>
      {!isRegistered ? (
        <div>
          {session ? (
            session?.user.name ? (
              <Typography variant="body1" gutterBottom>
                Înscrie-te la Seara de {eventName(type)}, folosind butonul de
                mai jos:
              </Typography>
            ) : (
              <Typography variant="body1" gutterBottom>
                Pentru a te înscrie la Seara de {eventName(type)} trebuie să ai
                definit un nume în secțiunea <Link href="/profile">profil</Link>
              </Typography>
            )
          ) : (
            <Typography variant="body1" gutterBottom>
              Pentru a te înscrie la Seara de {eventName(type)} trebuie ca mai
              întâi să fii <Link href="/api/auth/signin">logat</Link>
            </Typography>
          )}
          <LoadingButton
            loading={loading}
            loadingIndicator="Înscriere..."
            variant="contained"
            className="btn btn-primary"
            onClick={register}
          >
            Înscriere
          </LoadingButton>
        </div>
      ) : (
        <div>
          <Typography gutterBottom>
            Te rugăm să folosești această opțiune dacă dorești să îți anulezi
            participarea:
          </Typography>
          <Button
            variant="contained"
            className="btn btn-primary"
            onClick={unregister}
          >
            Anulează înscriere
          </Button>
        </div>
      )}

      <div>
        <Typography gutterBottom>
          Dacă dorești să-ți salvezi data evenimentului în calendar, click mai
          jos:
        </Typography>

        <AddToCalendarButton
          name={type}
          options={["Apple", "Google", "iCal"]}
          location="AGames"
          startDate={getEventDates(type, eventDate, true)}
          endDate={getEventDates(type, eventDate, true)}
          startTime="19:15"
          endTime="23:00"
          timeZone="Europe/Bucharest"
        >
          Calendar
        </AddToCalendarButton>
      </div>
      <AlertMsg alert={alert} />
    </Box>
  );
}
