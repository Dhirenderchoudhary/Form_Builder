import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import UserService from "@repo/services/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const userService = new UserService();

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string;
}

function buildFullName(
  first: string | null,
  last: string | null
): string | null {
  return [first, last].filter(Boolean).join(" ") || null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix signature headers" },
      { status: 400 }
    );
  }

  const body = await request.text();
  const wh = new Webhook(secret);
  let event: { type: string; data: ClerkUserPayload };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 401 }
    );
  }

  const { type, data } = event;

  try {
    if (type === "user.created" || type === "user.updated") {
      const primaryEmail = data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      );

      if (!primaryEmail) {
        return NextResponse.json(
          { error: "No primary email found" },
          { status: 400 }
        );
      }

      await userService.upsertUser({
        clerkId: data.id,
        fullName: buildFullName(data.first_name, data.last_name),
        email: primaryEmail.email_address,
        profileImageUrl: data.image_url,
      });
    }

    if (type === "user.deleted") {
      await userService.deleteUserByClerkId(data.id);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
