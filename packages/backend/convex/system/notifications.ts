"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server.js";
import { internal } from "../_generated/api.js";

/**
 * Notify the business's staff about a new lead or booking.
 * Uses Resend (email) and Twilio (SMS) via their REST APIs so we avoid extra
 * dependencies. If the relevant credentials are not configured, the channel is
 * skipped silently — the lead is still saved either way.
 */
export const notifyStaff = internalAction({
  args: {
    organizationId: v.string(),
    subject: v.string(),
    message: v.string(),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.runQuery(
      internal.system.bookingSettings.getByOrganizationId,
      { organizationId: args.organizationId }
    );

    await Promise.all([
      sendEmail(
        settings?.notifyEmail,
        args.subject,
        args.message,
        args.idempotencyKey
      ),
      sendSms(settings?.notifyPhone, `${args.subject}\n\n${args.message}`),
    ]);
  },
});

async function sendEmail(
  to: string | undefined,
  subject: string,
  body: string,
  idempotencyKey: string | undefined
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!to || !apiKey || !from) {
    return;
  }

  await fetchWithRetry("Resend email", () =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey
          ? { "Idempotency-Key": `${idempotencyKey}:email` }
          : {}),
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: body,
      }),
      signal: AbortSignal.timeout(5_000),
    })
  );
}

async function sendSms(to: string | undefined, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!to || !accountSid || !authToken || !from) {
    return;
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body });
  await fetchWithRetry("Twilio SMS", () =>
    fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        signal: AbortSignal.timeout(5_000),
      }
    )
  );
}

async function fetchWithRetry(
  operation: string,
  request: () => Promise<Response>
): Promise<void> {
  const delays = [250, 500];
  let lastError: unknown;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    let response: Response | undefined;
    try {
      response = await request();
    } catch (error) {
      lastError = error;
    }

    if (response?.ok) {
      return;
    }
    if (response && response.status < 500 && response.status !== 429) {
      throw new Error(`${operation} rejected with status ${response.status}`);
    }
    if (response) {
      lastError = new Error(
        `${operation} failed transiently with status ${response.status}`
      );
    }

    if (attempt < delays.length) {
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${operation} failed after retries`);
}
