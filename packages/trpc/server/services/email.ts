
import EmailService from "@repo/services/email";

let _email: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!_email) {
    _email = new EmailService({
      apiKey: process.env["RESEND_API_KEY"],
      fromAddress: process.env["EMAIL_FROM"] ?? "noreply@konohaforms.app",
      appName: process.env["APP_NAME"] ?? "Konoha Forms",
    });
  }
  return _email;
}
