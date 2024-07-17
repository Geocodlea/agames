import { Paper, Skeleton, Stack, Typography } from "@mui/material";

export default function Loading() {
  return (
    <>
      <Paper
        elevation={24}
        sx={{
          width: "100%",
          maxWidth: "750px",
          marginBottom: "3rem",
          padding: ["1rem 2rem", "2rem 4rem"],
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h2">
            <Skeleton width="50%" />
          </Typography>
          <Skeleton variant="rounded" width="100%" height={56} />
          <Skeleton variant="rounded" swidth="100%" height={148} />
          <Skeleton variant="rounded" width="100%" height={56} />
          <Skeleton variant="rounded" width="100%" height={56} />
          <Skeleton variant="rounded" width="100%" height={56} />

          <Skeleton
            variant="rounded"
            width={134}
            height={36}
            sx={{ alignSelf: "center" }}
          />
        </Stack>
      </Paper>

      <Stack spacing={2} width="100%">
        <Typography variant="h2" sx={{ alignSelf: "center" }} pb={2}>
          <Skeleton width="20vw" />
        </Typography>
        <Skeleton variant="rounded" width="100%" height="50vh" />
      </Stack>
    </>
  );
}
