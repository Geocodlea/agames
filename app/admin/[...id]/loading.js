import { Box, Paper, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Paper elevation={24} className="form-paper">
      <Stack spacing={2}>
        <Skeleton
          variant="rounded"
          width="80%"
          height={68}
          style={{ marginBottom: "2rem", alignSelf: "center" }}
        />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" swidth="100%" height={148} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Box sx={{ textAlign: "center" }}>
          <Skeleton variant="rounded" width={111} height={36} />
        </Box>
      </Stack>
    </Paper>
  );
}
