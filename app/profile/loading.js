import styles from "/app/page.module.css";

import { Box, Paper, Skeleton, Typography, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Paper
      elevation={24}
      className={styles.card}
      sx={{
        width: "100%",
        maxWidth: "600px",
        marginBottom: "13rem",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          marginTop: "-10rem",
          marginBottom: "3rem",
        }}
      >
        <Skeleton
          variant="circular"
          animation="wave"
          width={250}
          height={250}
          sx={{ backgroundColor: "grey.200" }}
        />
      </Box>

      <Stack spacing={2}>
        <Skeleton variant="rounded" width={150} height={52} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width={250} height={41} />
        <Skeleton
          variant="rounded"
          width={175}
          height={44}
          style={{ margin: "1rem auto 3rem" }}
        />

        <Skeleton variant="rounded" width="100%" height="50vh" />
      </Stack>
    </Paper>
  );
}
