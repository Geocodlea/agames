import EditableDataGrid from "@/components/EditableDataGrid";

import dbConnect from "/utils/dbConnect";
import Leaderboard from "/models/Leaderboard";

import { Box, Typography } from "@mui/material";

const LeaderboardTable = async () => {
  await dbConnect();
  const leaderboard = await Leaderboard.find({})
    .select("nume puncte")
    .sort({ puncte: -1 });

  const filteredLeaderboard = leaderboard.map((user) => ({
    name: user.nume,
    points: user.puncte,
  }));

  const columnsData = [
    {
      field: "nr",
      headerName: "Loc",
      width: 50,
    },
    {
      field: "name",
      headerName: "Nume",
      minWidth: 250,
      flex: 1,
    },
    {
      field: "points",
      headerName: "Puncte",
      width: 100,
    },
  ];

  return (
    <Box mb={8} mt={8} sx={{ width: "100%", maxWidth: "800px" }}>
      <Typography variant="h2">Leaderboard</Typography>
      <Typography>
        Suma punctajelor obținute în functie de locul din clasament: L1 - 100p,
        L2 - 70p, L3 - 50p, L4 - 35p, L5 - 25p
      </Typography>
      <EditableDataGrid
        columnsData={columnsData}
        rowsData={filteredLeaderboard}
        disableColumnMenu={true}
        pageSize={10}
      />
    </Box>
  );
};

export default LeaderboardTable;
