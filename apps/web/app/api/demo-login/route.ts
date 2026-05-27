import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set("demo_session", "true", {
    path: "/",
    maxAge: 60 * 60 * 24, // 24-hour sandbox session
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  
  redirect("/dashboard");
}
