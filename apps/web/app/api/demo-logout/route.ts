import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("demo_session");
  
  redirect("/");
}
