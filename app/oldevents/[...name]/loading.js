import { Skeleton, Typography } from "@mui/material";

export default function Loading() {
  return (
    <>
      <Typography variant="h2" gutterBottom>
        <Skeleton width="50vw" />
      </Typography>
      <Skeleton variant="rounded" width="100%" height="50vh" />
    </>
  );
}
