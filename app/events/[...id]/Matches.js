import Link from "next/link";
import { useState, useEffect } from "react";
import EditableDataGrid from "@/components/EditableDataGrid";
import CountdownTimer from "@/components/CountdownTimer";
import { Box, Stack, Skeleton, Typography } from "@mui/material";

export default function Matches({ type, round, host, isAdmin }) {
  const [matches, setMatches] = useState([]);
  const [timer, setTimer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMatches = async () => {
      const data = await fetch(`/api/events/matches/${type}/${round}`);
      const result = await data.json();
      setMatches(result.allMatches);
      setTimer(result.timer);
      setLoading(false);
    };

    getMatches();

    const intervalId = setInterval(getMatches, 30000);

    return () => clearInterval(intervalId);
  }, [round]);

  if (loading) {
    return (
      <Stack spacing={6} sx={{ margin: "auto", maxWidth: "800px" }}>
        <Skeleton variant="rounded" width="60%" height={50} />
        <Skeleton variant="rounded" width="100%" height={250} />
        <Skeleton variant="rounded" width="100%" height={250} />
      </Stack>
    );
  }

  const columnsData = [
    {
      field: "id",
      headerName: "id",
    },
    {
      field: "table",
      headerName: "Masa",
      editable: isAdmin,
      width: 60,
    },
    {
      field: "nr",
      headerName: "Nr.",
      width: 50,
    },
    {
      field: "name",
      headerName: "Nume",
      editable: isAdmin,
      minWidth: 150,
      flex: 1,
    },

    {
      field: "score",
      headerName: "Scor",
      type: "number",
      editable: isAdmin,
      width: 80,
    },
  ];

  // Only for Whist
  if (type === "whist") {
    columnsData.push({
      field: "licitari",
      headerName: "Licitari Corecte",
      type: "number",
      editable: isAdmin,
      width: 120,
    });
  }

  return (
    <>
      {timer && <CountdownTimer targetDate={new Date(timer)} />}
      {matches &&
        matches.map((match, index) => (
          <Box
            sx={{
              margin: "0 auto 4rem",
              maxWidth: "800px",
            }}
            key={index}
          >
            <Typography variant="h2">
              Meciuri - Runda {round - index}
            </Typography>
            <Stack spacing={6}>
              {match.map((match, i) => (
                <Box key={i}>
                  <EditableDataGrid
                    columnsData={columnsData}
                    rowsData={match.participants}
                    pageSize={10}
                    apiURL={`/events/matches/${type}/${round}/${host}/${isAdmin}/${
                      round - index
                    }`}
                    alertText={"player"}
                    showAddRecord={isAdmin}
                    showActions={isAdmin}
                    disableColumnMenu={true}
                    hideSearch={true}
                    hideFooter={true}
                    hiddenColumn={"nr"}
                  />
                  {match.participants[0].host && (
                    <Box
                      p={2}
                      textAlign={"center"}
                      border={"1px solid rgb(224, 224, 224)"}
                      borderRadius={"4px"}
                    >
                      Rezultat trimis de: {match.participants[0].host}
                    </Box>
                  )}
                  {match.participants[0].img && (
                    <Box
                      p={2}
                      textAlign={"center"}
                      border={"1px solid rgb(224, 224, 224)"}
                      borderRadius={"4px"}
                    >
                      <Link href={match.participants[0].img} target="_blank">
                        Imagine Rezultat
                      </Link>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
    </>
  );
}
