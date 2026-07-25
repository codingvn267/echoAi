import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";
import { consumeRateLimit } from "../lib/rateLimit.js";

// Must match the session length used when a contact session is first created
// in public/contactSession.ts (30 days). Keeping these in sync prevents the
// auto-refresh from accidentally shortening a visitor's session.
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const AUTO_REFRESH_THRESHOLD_MS = 4 * 60 * 60 * 1000;

export const create = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    clientAddressHash: v.string(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        cookieEnabled: v.optional(v.boolean()),
        referrer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    if (name.length < 1 || name.length > 100) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Name must contain between 1 and 100 characters",
      });
    }
    if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid email address",
      });
    }
    if (
      args.clientAddressHash.length !== 64 ||
      JSON.stringify(args.metadata ?? {}).length > 10_000
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid session metadata",
      });
    }

    const settings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();
    if (!settings) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Organization widget is not configured",
      });
    }

    await consumeRateLimit(ctx, {
      key: `session:address:${args.organizationId}:${args.clientAddressHash}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    await consumeRateLimit(ctx, {
      key: `session:organization:${args.organizationId}`,
      limit: 100,
      windowMs: 60 * 60 * 1000,
    });

    return await ctx.db.insert("contactSessions", {
      name,
      email,
      organizationId: args.organizationId,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      metadata: args.metadata,
    });
  },
});

export const refresh = internalMutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Contact session not found",
      });
    }

    if (contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Contact session expired",
      });
    }

    const timeRemaining = contactSession.expiresAt - Date.now();

    if (timeRemaining < AUTO_REFRESH_THRESHOLD_MS) {
      const newExpiresAt = Date.now() + SESSION_DURATION_MS;

      await ctx.db.patch(args.contactSessionId, {
        expiresAt: newExpiresAt,
      });

      return { ...contactSession, expiresAt: newExpiresAt };
    }

    return contactSession;
  },
});

export const getOne = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});

export const removeExpired = internalMutation({
  args: {
    cutoff: v.number(),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("contactSessions")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", args.cutoff))
      .take(Math.min(args.batchSize, 500));

    await Promise.all(sessions.map((session) => ctx.db.delete(session._id)));
    return sessions.length;
  },
});
