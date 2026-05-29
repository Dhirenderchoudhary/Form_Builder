import type { Request, Response } from "express";
import { verifySignatureEdge } from "@upstash/qstash/verify";
import EmailService from "@repo/services/email";

export async function handleQStashWebhook(req: Request, res: Response) {
  const signature = req.headers["upstash-signature"] as string;
  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  try {
    const rawBody = req.body;
    const bodyText = Buffer.isBuffer(rawBody) 
      ? rawBody.toString('utf8') 
      : typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);

    const isValid = await verifySignatureEdge({
      signature,
      body: bodyText,
      url: `${process.env["BASE_URL"]}/api/webhooks/qstash/email`,
      clockTolerance: 300,
    }, process.env["QSTASH_CURRENT_SIGNING_KEY"], process.env["QSTASH_NEXT_SIGNING_KEY"]);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payload = JSON.parse(bodyText);
    const emailService = new EmailService({
      apiKey: process.env["RESEND_API_KEY"],
      fromAddress: process.env["EMAIL_FROM"] ?? "noreply@konohaforms.app",
      appName: process.env["APP_NAME"] ?? "Konoha Forms",
    });

    if (payload.type === "new_response") {
      if (typeof payload.data.submittedAt === "string") {
        payload.data.submittedAt = new Date(payload.data.submittedAt);
      }
      await emailService.sendNewResponseNotification(payload.data);
    } else if (payload.type === "respondent_confirmation") {
      await emailService.sendRespondentConfirmation(payload.data);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("QStash Webhook Error", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
