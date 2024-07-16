import { Box, Paper, Skeleton, Typography } from "@mui/material";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        <Skeleton width="50vw" />
      </Typography>

      <Skeleton
        variant="rounded"
        width="100%"
        height="10vh"
        sx={{ margin: "1rem 0 3rem" }}
      />

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

      <Skeleton
        variant="rounded"
        width="100%"
        height="40vh"
        sx={{ margin: "5rem 0" }}
      />

      <Skeleton variant="rounded" width="100%" height="40vh" />
    </>
  );
}
