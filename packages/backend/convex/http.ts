import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server.js";
import { internal } from "./_generated/api.js";
import { safeWebhookError, verifyVapiWebhook } from "./lib/webhookAuth.js";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    const svixId = request.headers.get("svix-id");
    if (!svixId) {
      return new Response("Missing event ID", { status: 400 });
    }

    await ctx.runMutation(internal.system.webhookEvents.receive, {
      source: "clerk",
      eventId: svixId,
    });
    const processing = await ctx.runMutation(
      internal.system.webhookEvents.startProcessing,
      { source: "clerk", eventId: svixId }
    );
    if (!processing.acquired) {
      return new Response(null, {
        status: processing.status === "processing" ? 409 : 200,
      });
    }

    try {
      const eventType = event.type as string;
      if (
        eventType === "subscription.created" ||
        eventType === "subscription.updated" ||
        eventType === "subscription.deleted"
      ) {
        const subscription = event.data as unknown as ClerkSubscriptionEvent;
        const organizationId = subscription.payer?.organization_id;
        if (!organizationId) {
          throw new Error("Missing Organization ID");
        }

        const status =
          eventType === "subscription.deleted" ? "ended" : subscription.status;
        if (!status) {
          throw new Error("Missing subscription status");
        }
        const plan = parseSubscriptionPlan(subscription);

        await clerkClient.organizations.updateOrganization(organizationId, {
          maxAllowedMemberships:
            status === "active" && plan === "growth" ? 5 : 1,
        });
        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId,
          status,
          ...(plan ? { plan } : {}),
          providerUpdatedAt: parseProviderTimestamp(subscription),
        });
      }

      await ctx.runMutation(internal.system.webhookEvents.succeed, {
        source: "clerk",
        eventId: svixId,
      });
      return new Response(null, { status: 200 });
    } catch (error) {
      await ctx.runMutation(internal.system.webhookEvents.fail, {
        source: "clerk",
        eventId: svixId,
        error: safeWebhookError(error),
      });
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

http.route({
  path: "/vapi-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const authenticated = await verifyVapiWebhook({
      payload,
      signature: request.headers.get("x-vapi-signature"),
      timestamp: request.headers.get("x-vapi-timestamp"),
      secret: process.env.VAPI_WEBHOOK_SECRET,
    });
    if (!authenticated) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: VapiWebhookBody;
    try {
      body = JSON.parse(payload) as VapiWebhookBody;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const message = body.message;
    if (!message || message.type !== "end-of-call-report") {
      // Acknowledge other event types without acting on them.
      return new Response(null, { status: 200 });
    }

    const callId = message.call?.id;
    if (!callId) {
      return new Response("Missing call ID", { status: 400 });
    }

    const assistantId = message.call?.assistantId ?? message.assistant?.id;
    if (!assistantId) {
      return new Response("Missing assistant ID", { status: 400 });
    }

    await ctx.runMutation(internal.system.webhookEvents.receive, {
      source: "vapi",
      eventId: callId,
    });
    const processing = await ctx.runMutation(
      internal.system.webhookEvents.startProcessing,
      { source: "vapi", eventId: callId }
    );
    if (!processing.acquired) {
      return new Response(null, {
        status: processing.status === "processing" ? 409 : 200,
      });
    }

    try {
      const organizationId = await ctx.runQuery(
        internal.system.widgetSettings.getOrganizationByVapiAssistantId,
        { assistantId }
      );
      if (!organizationId) {
        throw new Error("Vapi assistant is not mapped to an organization");
      }

      const summary = message.analysis?.summary ?? message.summary;
      const phone = message.call?.customer?.number ?? message.customer?.number;
      const name =
        message.analysis?.structuredData?.name ??
        (phone ? `Caller ${phone}` : "Phone caller");
      const leadId = await ctx.runMutation(
        internal.system.leads.createFromPhoneCall,
        {
          organizationId,
          providerEventId: callId,
          name,
          phone,
          summary,
          notes: message.endedReason
            ? `Call ended: ${message.endedReason}`
            : undefined,
        }
      );

      await ctx.runAction(internal.system.notifications.notifyStaff, {
        organizationId,
        subject: "Missed call captured",
        idempotencyKey: `vapi:${callId}`,
        message: `${name}${phone ? ` (${phone})` : ""}${
          summary ? `\n\n${summary}` : ""
        }`,
      });
      await ctx.runMutation(internal.system.webhookEvents.succeed, {
        source: "vapi",
        eventId: callId,
      });

      return new Response(JSON.stringify({ leadId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      await ctx.runMutation(internal.system.webhookEvents.fail, {
        source: "vapi",
        eventId: callId,
        error: safeWebhookError(error),
      });
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

type ClerkSubscriptionEvent = {
  status?: string;
  updated_at?: string | number;
  updatedAt?: string | number;
  created_at?: string | number;
  payer?: { organization_id?: string };
  items?: Array<{ plan?: { slug?: string } | null }>;
};

function parseSubscriptionPlan(
  subscription: ClerkSubscriptionEvent
): "starter" | "growth" | "scale" | undefined {
  const slug = subscription.items?.find((item) => item.plan?.slug)?.plan?.slug;
  return slug === "starter" || slug === "growth" || slug === "scale"
    ? slug
    : undefined;
}

type VapiWebhookBody = {
  message?: {
    type?: string;
    endedReason?: string;
    summary?: string;
    transcript?: string;
    analysis?: {
      summary?: string;
      structuredData?: { name?: string };
    };
    customer?: { number?: string };
    call?: {
      id?: string;
      assistantId?: string;
      customer?: { number?: string };
    };
    assistant?: { id?: string };
  };
};

function parseProviderTimestamp(subscription: ClerkSubscriptionEvent): number {
  const value =
    subscription.updated_at ??
    subscription.updatedAt ??
    subscription.created_at;
  if (typeof value === "number") {
    return value < 10_000_000_000 ? value * 1_000 : value;
  }
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return null;
  }

  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(secret);

  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error(`Error verifying webhook event`, error);
    return null;
  }
}

export default http;
