import { PortalShell } from "@/components/portal/PortalShell";
import { getSession } from "@/lib/db/session";
import { toMarketingHeaderUser } from "@/lib/marketing/headerUser";
import { handleRedirect } from "@/lib/redirect/handleRedirect";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function BaseLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }
  if (session.role !== "customer") {
    handleRedirect(session.role);
  }

  const user = toMarketingHeaderUser(session);

  return <PortalShell user={user}>{children}</PortalShell>;
}
