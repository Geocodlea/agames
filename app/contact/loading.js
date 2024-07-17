import { Skeleton, Stack, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 4, md: 8, lg: 16 }}
      sx={{ width: "100%" }}
    >
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Skeleton>
          <Typography variant="h3" gutterBottom>
            Send us a message
          </Typography>
        </Skeleton>
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={148} />
        <Skeleton
          variant="rounded"
          width={140}
          height={36}
          sx={{ alignSelf: "center" }}
        />
      </Stack>

      <Stack
        spacing={6}
        sx={{
          justifyContent: "center",
          alignSelf: "center",
          width: "50%",
        }}
      >
        <Stack spacing={2} direction="row">
          <Skeleton variant="circular" width={40} height={40} />
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Skeleton>
              <Typography variant="h5">Find us at</Typography>
            </Skeleton>
            <Skeleton variant="rounded" width="100%" height="15vh" />
          </Stack>
        </Stack>
        <Stack spacing={2} direction="row">
          <Skeleton variant="circular" width={40} height={40} />
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Skeleton>
              <Typography variant="h5">Contact</Typography>
            </Skeleton>
            <Skeleton variant="rounded" width="100%" height="10vh" />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
