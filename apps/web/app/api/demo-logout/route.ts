import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("demo_session");

  redirect("/");
}

export async function GET() {
  redirect("/");
}
