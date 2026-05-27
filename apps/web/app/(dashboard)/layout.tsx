import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  if (!userId) {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
