import { Box, Paper, Skeleton, Typography } from "@mui/material";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <>
      <Skeleton>
        <Typography variant="h1" gutterBottom>
          EVENIMENTE
        </Typography>
      </Skeleton>

      <Skeleton>
        <Typography variant="body1" mb={6}>
          TE AȘTEPTĂM LA CONCURSURI, JOCURI AMICALE SAU SESIUNI DE LEARN & PLAY,
          LIVE ȘI ONLINE, LA CELE MAI POPULARE BOARD GAMES.
        </Typography>
      </Skeleton>

      <Box className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper elevation={24} key={i}>
            <Skeleton variant="rounded" animation="wave" height={300} />
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ bgcolor: "grey.200" }}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              height={45}
              width={96}
              sx={{ margin: "auto" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", margin: "10px 20%" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", marginLeft: "30%", marginRight: "30%" }}
            />
          </Paper>
        ))}
      </Box>

      <Box mb={8} mt={8} sx={{ width: "100%", maxWidth: "800px" }}>
        <Skeleton>
          <Typography variant="h2">Leaderboard</Typography>
        </Skeleton>
        <Skeleton variant="rounded" width="100%" height="40vh" />
      </Box>

      <Box sx={{ width: "100%", maxWidth: "800px" }}>
        <Skeleton>
          <Typography variant="h2">Evenimente Anterioare</Typography>
        </Skeleton>
        <Skeleton variant="rounded" width="100%" height="40vh" />
      </Box>
    </>
  );
}
