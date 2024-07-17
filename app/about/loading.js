import styles from "/app/page.module.css";

import { Box, Stack, Skeleton, Typography } from "@mui/material";

export default function Loading() {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        <Skeleton width="50vw" />
      </Typography>

      <Skeleton variant="rounded" width="100%" height="50vh" />

      <Typography variant="h6" gutterBottom mt={4}>
        <Skeleton width="20vw" />
      </Typography>

      <Box className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack
            spacing={1.5}
            sx={{ margin: "20px", alignItems: "center" }}
            key={i}
          >
            <Skeleton variant="circular" width={80} height={80} />
            <Skeleton variant="rounded" width={85} height={32} />
            <Skeleton variant="rounded" width={100} height={20} />
            <Skeleton variant="rounded" width="100%" height={80} />
          </Stack>
        ))}
      </Box>
    </>
  );
}
