import { logger } from "@repo/logger";

export interface NewResponseEmailData {
  creatorEmail: string;
  creatorName?: string | null;
  formTitle: string;
  formSlug: string;
  responseId: string;
  respondentEmail?: string | null;
  submittedAt: Date;
  dashboardUrl: string;
}

export interface RespondentConfirmationData {
  respondentEmail: string;
  formTitle: string;
  successMessage: string;
  appName: string;
}

export class EmailService {
  private resend: unknown = null;
  private fromAddress: string;
  private appName: string;

  constructor(opts: { apiKey?: string; fromAddress: string; appName: string }) {
    this.fromAddress = opts.fromAddress;
    this.appName = opts.appName;

    if (opts.apiKey) {

            // eslint-disable-next-line @typescript-eslint/no-require-imports
      const tryResend = async () => {
        try {
                    // @ts-ignore — resend is an optional runtime dep
          const { Resend } = await import("resend");
          this.resend = new Resend(opts.apiKey);
        } catch {
          logger.warn("Resend package not available — emails will be logged only");
        }
      };
      void tryResend();
    }
  }

  async sendNewResponseNotification(data: NewResponseEmailData): Promise<void> {
    const subject = `New response on "${data.formTitle}"`;
    const html = this.buildNewResponseHtml(data);

    await this.send({ to: data.creatorEmail, subject, html });
  }

  async sendRespondentConfirmation(data: RespondentConfirmationData): Promise<void> {
    const subject = `Your response to "${data.formTitle}" was received`;
    const html = this.buildConfirmationHtml(data);

    await this.send({ to: data.respondentEmail, subject, html });
  }

  private async send(opts: { to: string; subject: string; html: string }): Promise<void> {
    if (!this.resend) {
      logger.info("[EMAIL no-op]", { to: opts.to, subject: opts.subject });
      return;
    }

    try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resend = this.resend as any;
      await resend.emails.send({
        from: `${this.appName} <${this.fromAddress}>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
    } catch (error) {

      logger.error("Failed to send email", { to: opts.to, subject: opts.subject, error });
    }
  }

  private buildNewResponseHtml(data: NewResponseEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Form Response</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h2 style="color:#6d28d9">📋 New Response Received</h2>
  <p>Hi ${data.creatorName ?? "there"},</p>
  <p>
    Someone just submitted a response to your form
    <strong>"${data.formTitle}"</strong>.
  </p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold">Submitted at</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.submittedAt.toUTCString()}</td>
    </tr>
    ${data.respondentEmail ? `
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold">Respondent email</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.respondentEmail}</td>
    </tr>` : ""}
  </table>
  <a href="${data.dashboardUrl}/forms/${data.formSlug}/responses/${data.responseId}"
     style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
    View Response
  </a>
  <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="color:#6b7280;font-size:12px">
    You are receiving this because you own the form "${data.formTitle}" on ${this.appName}.
  </p>
</body>
</html>`;
  }

  private buildConfirmationHtml(data: RespondentConfirmationData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Response Received</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h2 style="color:#6d28d9">✅ Response Received</h2>
  <p>${data.successMessage}</p>
  <p style="color:#6b7280;font-size:12px;margin-top:32px">
    This confirmation was sent by ${data.appName} on behalf of the form creator.
  </p>
</body>
</html>`;
  }
}

export default EmailService;
