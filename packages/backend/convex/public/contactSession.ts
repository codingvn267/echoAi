import { ConvexError, v } from "convex/values";
import { action, mutation } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import {
  contactSessionSignaturePayload,
  verifyProxySignature,
} from "../lib/proxyAuth.js";
import type { Id } from "../_generated/dataModel.js";

export const create = action({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    clientAddressHash: v.string(),
    timestamp: v.number(),
    signature: v.string(),
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
  handler: async (ctx, args): Promise<Id<"contactSessions">> => {
    const timestampAge = Math.abs(Date.now() - args.timestamp);
    const signatureValid = await verifyProxySignature({
      payload: contactSessionSignaturePayload(args),
      signature: args.signature,
      secret: process.env.WIDGET_PROXY_SECRET,
    });
    if (!signatureValid || timestampAge > 60_000) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid widget server authorization",
      });
    }

    return await ctx.runMutation(internal.system.contactSessions.create, {
      name: args.name,
      email: args.email,
      organizationId: args.organizationId,
      clientAddressHash: args.clientAddressHash,
      metadata: args.metadata,
    });
  },
});

export const validate = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },

  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession) {
      return { valid: false, reason: "Contact session not found!" };
    }

    if (contactSession.expiresAt < Date.now()) {
      return { valid: false, reason: "Contact session expired!" };
    }

    return { valid: true, contactSession };
  },
});
