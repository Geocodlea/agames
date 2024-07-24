"use client";

import Image from "next/image";
import Link from "next/link";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import styles from "/app/page.module.css";
import { Box, Paper, Typography, Button, Skeleton } from "@mui/material";

import DeleteEvent from "./admin/DeleteEvent";
import AlertMsg from "@/components/AlertMsg";

import { getEventDates } from "@/utils/helpers";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [alert, setAlert] = useState({ text: "", severity: "" });
  const [loading, setLoading] = useState(true);
  const [deletedEvent, setDeletedEvent] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    const getEvents = async () => {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    };

    getEvents();
  }, [deletedEvent]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message);
      }

      setDeletedEvent(!deletedEvent);
      setAlert({
        text: `Event șters cu succes`,
        severity: "success",
      });
    } catch (error) {
      setAlert({ text: `${error}`, severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper elevation={24} key={i}>
            <Skeleton variant="rounded" animation="wave" height={300} />
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ bgcolor: "grey.200" }}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              height={36}
              width={83}
              sx={{ margin: "auto" }}
            />
            <Skeleton sx={{ fontSize: "2rem", margin: "10px 20%" }} />
            <Skeleton
              sx={{ fontSize: "2rem", marginLeft: "30%", marginRight: "30%" }}
            />
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <>
      <Box className={styles.grid}>
        {events.map((event) => (
          <Paper
            elevation={24}
            className={styles.card}
            key={event._id}
            style={{
              padding: 0,
            }}
          >
            <Box sx={{ position: "relative", height: "300px" }}>
              <Image
                alt="Event image"
                src={event.image}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "cover",
                }}
              />
              <Typography
                variant="h3"
                color="grey.100"
                sx={{
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  fontWeight: "bold",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  textShadow: "3px 3px 5px rgba(0, 0, 0, 0.7)",
                }}
              >
                {event.title}
              </Typography>
            </Box>
            <Box className={styles.description}>
              <p>{event.description}</p>
            </Box>
            <Box>
              <Link href={`/events/${event.type}/${event._id}`}>
                <Button variant="contained" className="btn btn-primary">
                  Detalii
                </Button>
              </Link>
            </Box>
            <Typography className={styles.code} align="center">
              {getEventDates(event.type, event.date)}
            </Typography>
            <Typography variant="overline" gutterBottom>
              {event.type === "cavaleri"
                ? "Catan - Orașe și Cavaleri"
                : event.type}
            </Typography>

            {isAdmin && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "1rem",
                }}
              >
                <Link href={`/admin/${event._id}`}>
                  <Button variant="contained" className="btn btn-primary">
                    Edit Event
                  </Button>
                </Link>

                <DeleteEvent handleDelete={handleDelete} id={event._id} />
              </Box>
            )}
          </Paper>
        ))}
      </Box>
      <AlertMsg alert={alert} />
    </>
  );
};

export default Events;
