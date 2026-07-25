import { createHash, createHmac } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@workspace/backend/_generated/api";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  organizationId: z.string().trim().min(1).max(200),
  captchaToken: z.string().optional(),
  metadata: z
    .object({
      userAgent: z.string().max(1_000).optional(),
      language: z.string().max(100).optional(),
      languages: z.string().max(500).optional(),
      platform: z.string().max(200).optional(),
      vendor: z.string().max(200).optional(),
      screenResolution: z.string().max(100).optional(),
      viewportSize: z.string().max(100).optional(),
      timezone: z.string().max(200).optional(),
      timezoneOffset: z.number().optional(),
      cookieEnabled: z.boolean().optional(),
      referrer: z.string().max(2_000).optional(),
      currentUrl: z.string().max(2_000).optional(),
    })
    .optional(),
});

function getClientAddress(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function verifyCaptcha(token: string | undefined, address: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token) {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: address }),
      signal: AbortSignal.timeout(5_000),
    }
  );
  if (!response.ok) {
    return false;
  }
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function POST(request: NextRequest) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const proxySecret = process.env.WIDGET_PROXY_SECRET;
  if (!convexUrl || !proxySecret) {
    return NextResponse.json(
      { error: "Session service is not configured" },
      { status: 503 }
    );
  }

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const address = getClientAddress(request);
  if (!(await verifyCaptcha(parsed.data.captchaToken, address))) {
    return NextResponse.json(
      { error: "Bot verification failed" },
      { status: 403 }
    );
  }

  const clientAddressHash = createHash("sha256")
    .update(`${proxySecret}:${address}`)
    .digest("hex");
  const timestamp = Date.now();
  const signaturePayload = [
    timestamp,
    parsed.data.organizationId,
    clientAddressHash,
    parsed.data.name,
    parsed.data.email.toLowerCase(),
  ].join("\n");
  const signature = createHmac("sha256", proxySecret)
    .update(signaturePayload)
    .digest("hex");

  try {
    const client = new ConvexHttpClient(convexUrl);
    const contactSessionId = await client.action(
      api.public.contactSession.create,
      {
        name: parsed.data.name,
        email: parsed.data.email,
        organizationId: parsed.data.organizationId,
        metadata: parsed.data.metadata,
        clientAddressHash,
        timestamp,
        signature,
      }
    );
    return NextResponse.json({ contactSessionId }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown session error";
    const isRateLimited = /RATE_LIMITED|QUOTA_EXCEEDED|Too many requests/i.test(
      errorMessage
    );
    console.error("Contact session creation failed", {
      error: errorMessage,
    });
    return NextResponse.json(
      { error: "Unable to create contact session" },
      { status: isRateLimited ? 429 : 500 }
    );
  }
}
