import { ConvexError, v } from "convex/values";
import { internalMutation } from "../_generated/server.js";
import { consumeRateLimit } from "../lib/rateLimit.js";

const MAX_PROMPT_CHARACTERS = 4_000;
const AI_RESERVATION_MS = 10 * 60 * 1000;

const ENTITLEMENTS = {
  free: {
    monthlyMessages: 100,
    monthlyPromptCharacters: 500_000,
    monthlyTokens: 250_000,
    concurrentAiRequests: 1,
  },
  paid: {
    monthlyMessages: 5_000,
    monthlyPromptCharacters: 25_000_000,
    monthlyTokens: 10_000_000,
    concurrentAiRequests: 5,
  },
  starter: {
    monthlyMessages: 500,
    monthlyPromptCharacters: 25_000_000,
    monthlyTokens: 10_000_000,
    concurrentAiRequests: 5,
  },
  growth: {
    monthlyMessages: 2_500,
    monthlyPromptCharacters: 25_000_000,
    monthlyTokens: 10_000_000,
    concurrentAiRequests: 5,
  },
  scale: {
    monthlyMessages: 5_000,
    monthlyPromptCharacters: 25_000_000,
    monthlyTokens: 10_000_000,
    concurrentAiRequests: 5,
  },
} as const;

type SubscriptionTier = keyof typeof ENTITLEMENTS;

function getSubscriptionTier(
  subscription?: {
    status: string;
    plan?: "starter" | "growth" | "scale";
  } | null
): SubscriptionTier {
  if (subscription?.status !== "active") {
    return "free";
  }
  return subscription.plan ?? "paid";
}

function utcMonth(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 7);
}

export const reserveMessage = internalMutation({
  args: {
    contactSessionId: v.id("contactSessions"),
    threadId: v.string(),
    promptCharacters: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (
      !Number.isInteger(args.promptCharacters) ||
      args.promptCharacters < 1 ||
      args.promptCharacters > MAX_PROMPT_CHARACTERS
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Messages must contain between 1 and ${MAX_PROMPT_CHARACTERS} characters.`,
      });
    }

    const session = await ctx.db.get(args.contactSessionId);
    if (!session || session.expiresAt < now) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    if (conversation.contactSessionId !== session._id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Incorrect session",
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    await consumeRateLimit(ctx, {
      key: `message:session:${session._id}`,
      limit: 10,
      windowMs: 60_000,
      now,
    });
    await consumeRateLimit(ctx, {
      key: `message:organization:${conversation.organizationId}`,
      limit: 30,
      windowMs: 60_000,
      now,
    });

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", conversation.organizationId)
      )
      .unique();
    const entitlement = getSubscriptionTier(subscription);
    const limits = ENTITLEMENTS[entitlement];
    const period = utcMonth(now);
    const usage = await ctx.db
      .query("organizationUsage")
      .withIndex("by_organization_id_and_period", (q) =>
        q.eq("organizationId", conversation.organizationId).eq("period", period)
      )
      .unique();
    const messageCount = (usage?.messageCount ?? 0) + 1;
    const promptCharacters =
      (usage?.promptCharacters ?? 0) + args.promptCharacters;
    const estimatedTokens = Math.ceil(args.promptCharacters / 4);
    const consumedTokens =
      (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);

    if (
      messageCount > limits.monthlyMessages ||
      promptCharacters > limits.monthlyPromptCharacters ||
      consumedTokens + estimatedTokens > limits.monthlyTokens
    ) {
      throw new ConvexError({
        code: "QUOTA_EXCEEDED",
        message: "This organization has reached its monthly AI usage limit.",
      });
    }

    if (usage) {
      await ctx.db.patch(usage._id, {
        messageCount,
        promptCharacters,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("organizationUsage", {
        organizationId: conversation.organizationId,
        period,
        messageCount,
        promptCharacters,
        inputTokens: 0,
        outputTokens: 0,
        activeAiRequests: 0,
        updatedAt: now,
      });
    }

    if (messageCount >= Math.floor(limits.monthlyMessages * 0.8)) {
      console.warn("Organization AI usage is near its monthly limit", {
        organizationId: conversation.organizationId,
        entitlement,
        messageCount,
        monthlyLimit: limits.monthlyMessages,
      });
    }

    let reservationId;
    if (conversation.status === "unresolved") {
      const activeReservations = await ctx.db
        .query("aiReservations")
        .withIndex("by_organization_id_and_expires_at", (q) =>
          q
            .eq("organizationId", conversation.organizationId)
            .gt("expiresAt", now)
        )
        .take(limits.concurrentAiRequests);
      if (activeReservations.length >= limits.concurrentAiRequests) {
        throw new ConvexError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Too many AI requests are already in progress. Please retry shortly.",
        });
      }

      reservationId = await ctx.db.insert("aiReservations", {
        organizationId: conversation.organizationId,
        expiresAt: now + AI_RESERVATION_MS,
      });
    }

    return {
      conversation,
      entitlement,
      shouldTriggerAgent: conversation.status === "unresolved",
      reservationId,
    };
  },
});

export const releaseMessage = internalMutation({
  args: {
    reservationId: v.optional(v.id("aiReservations")),
  },
  handler: async (ctx, args) => {
    if (args.reservationId && (await ctx.db.get(args.reservationId))) {
      await ctx.db.delete(args.reservationId);
    }
  },
});

export const recordTokens = internalMutation({
  args: {
    organizationId: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const inputTokens = Math.max(0, Math.floor(args.inputTokens));
    const outputTokens = Math.max(0, Math.floor(args.outputTokens));
    const period = utcMonth(Date.now());
    const usage = await ctx.db
      .query("organizationUsage")
      .withIndex("by_organization_id_and_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("period", period)
      )
      .unique();

    if (usage) {
      const totalInputTokens = (usage.inputTokens ?? 0) + inputTokens;
      const totalOutputTokens = (usage.outputTokens ?? 0) + outputTokens;
      await ctx.db.patch(usage._id, {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        updatedAt: Date.now(),
      });

      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique();
      const entitlement = getSubscriptionTier(subscription);
      if (
        totalInputTokens + totalOutputTokens >=
        ENTITLEMENTS[entitlement].monthlyTokens * 0.8
      ) {
        console.warn("Organization token usage is near its monthly limit", {
          organizationId: args.organizationId,
          entitlement,
          tokens: totalInputTokens + totalOutputTokens,
          monthlyLimit: ENTITLEMENTS[entitlement].monthlyTokens,
        });
      }
    }

    if (inputTokens + outputTokens > 50_000) {
      console.warn("Unusually large AI token usage detected", {
        organizationId: args.organizationId,
        model: args.model,
        inputTokens,
        outputTokens,
      });
    }
  },
});

export const removeExpiredReservations = internalMutation({
  args: { cutoff: v.number(), batchSize: v.number() },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("aiReservations")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", args.cutoff))
      .take(Math.min(args.batchSize, 500));
    await Promise.all(
      reservations.map((reservation) => ctx.db.delete(reservation._id))
    );
    return reservations.length;
  },
});
