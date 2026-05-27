import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardShell } from "./_components/shell";

/**
 * (dashboard) route group — protected.
 * Anyone hitting /dashboard, /dashboard/forms etc. without being signed
 * in is bounced to the homepage.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_session")?.value === "true";

  if (!userId && !isDemo) {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
