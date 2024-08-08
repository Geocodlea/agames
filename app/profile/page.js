import { redirect } from "next/navigation";

import { authOptions } from "/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

import { Paper, Box, Stack, Typography } from "@mui/material";

import ProfileForm from "./ProfileForm";
import DeleteAccount from "./DeleteAccount";
import ProfileImage from "./ProfileImage";
import EditableDataGrid from "@/components/EditableDataGrid";

import dbConnect from "/utils/dbConnect";
import OldEvents from "@/models/OldEvents";
import { LEADERBOARD_POINTS, gameName } from "@/utils/helpers";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  let total = 0;

  if (!session) redirect(`/`);

  await dbConnect();
  const events = await OldEvents.aggregate([
    // Match documents where the `nume` field in `data` array matches the user name
    {
      $match: {
        "data.nume": session.user.name,
      },
    },
    // Project the index of the matched element
    {
      $project: {
        name: 1, // Include the `data` array in the output
        rankingPosition: {
          $indexOfArray: [
            "$data.nume", // Array to search
            session.user.name, // Value to find the index of
          ],
        },
      },
    },
  ]);

  const filteredEvents = events.map((event) => {
    const isCurrentYear = event.name.includes("2024");
    if (isCurrentYear) {
      total += LEADERBOARD_POINTS[event.rankingPosition];
    }

    return {
      name: gameName(event),
      link: `/oldevents/${event.name}`,
      leaderboard: isCurrentYear ? total : null,
    };
  });

  const columnsData = [
    {
      field: "nr",
      headerName: "Nr.",
      width: 50,
    },
    {
      field: "name",
      headerName: "Nume Joc",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "link",
      headerName: "Clasament",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "leaderboard",
      headerName: "Leaderboard",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
  ];

  return (
    <Paper elevation={24} className="form-paper">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-10rem",
          marginBottom: "3rem",
        }}
      >
        <ProfileImage />
      </Box>

      <Stack spacing={6}>
        <div>
          <Typography variant="h2">Profile</Typography>
          <ProfileForm />
        </div>

        <div>
          <Typography variant="h2">Istoric Participări</Typography>
          <EditableDataGrid
            columnsData={columnsData}
            rowsData={filteredEvents}
            pageSize={10}
            density={"compact"}
            disableColumnMenu={true}
          />
        </div>

        <div>
          <Box mb={2} mt={4}>
            <Typography variant="body1" gutterBottom>
              Toate datele contului vor fi șterse permanent și nu vei mai avea
              posibilitatea să reactivezi acest cont.
            </Typography>
          </Box>
          <DeleteAccount />
        </div>
      </Stack>
    </Paper>
  );
}
