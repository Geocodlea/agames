import { authOptions } from "/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getProviders } from "next-auth/react";

import Providers from "./Providers";

export default async function Signin() {
  const session = await getServerSession(authOptions);
  if (session) redirect(`/`);

  const providers = await getProviders();

  return <Providers providers={providers} />;
}
