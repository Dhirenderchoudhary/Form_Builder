import { redirect } from "next/navigation";

/**
 * Legacy /forms/new route — redirects to /forms?new=1
 * which auto-opens the "Forge a New Scroll" dialog.
 * Keeps the URL pretty without needing a separate page.
 */
export default function NewFormRedirect() {
  redirect("/dashboard/forms?new=1");
}
