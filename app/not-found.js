import { Typography } from "@mui/material";

export default function NotFound() {
  return (
    <>
      <Typography variant="h1" color={"error"}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page not found :(
      </Typography>
      <Typography variant="body2" gutterBottom>
        Ooooups! Looks like you got lost
      </Typography>
    </>
  );
}
