import styles from "/app/page.module.css";

import { Box, Stack, Skeleton, Typography } from "@mui/material";

export default function Loading() {
  return (
    <>
      <Skeleton>
        <Typography variant="h1" gutterBottom>
          About Us
        </Typography>
      </Skeleton>

      <Skeleton variant="rounded" width="100%" height="50vh" />

      <Skeleton sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Here is our team:
        </Typography>
      </Skeleton>

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
