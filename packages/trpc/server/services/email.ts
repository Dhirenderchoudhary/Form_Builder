
import EmailService from "@repo/services/email";

let _email: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!_email) {
    _email = new EmailService({
      apiKey: process.env["RESEND_API_KEY"],
      fromAddress: process.env["EMAIL_FROM"] ?? "noreply@formbuilder.dev",
      appName: process.env["APP_NAME"] ?? "FormCraft",
    });
  }
  return _email;
}
