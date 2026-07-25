import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    status: v.string(),
    providerUpdatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();

    if (
      existingSubscription?.providerUpdatedAt !== undefined &&
      existingSubscription.providerUpdatedAt > args.providerUpdatedAt
    ) {
      return { applied: false };
    }

    const entitlement = args.status === "active" ? "paid" : "free";
    const updatedAt = Date.now();

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        status: args.status,
        entitlement,
        providerUpdatedAt: args.providerUpdatedAt,
        updatedAt,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        organizationId: args.organizationId,
        status: args.status,
        entitlement,
        providerUpdatedAt: args.providerUpdatedAt,
        updatedAt,
      });
    }

    return { applied: true };
  },
});

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();
  },
});
