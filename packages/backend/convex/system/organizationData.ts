import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";
import { Id } from "../_generated/dataModel.js";

const BATCH = 100;

// There is no dedicated organizations table; the union of these small config
// and data tables covers every organization that has ever stored data.
export const listOrganizationIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const ids = new Set<string>();
    const [widgetSettings, bookingSettings, subscriptions, plugins] =
      await Promise.all([
        ctx.db.query("widgetSettings").take(1_000),
        ctx.db.query("bookingSettings").take(1_000),
        ctx.db.query("subscriptions").take(1_000),
        ctx.db.query("plugins").take(1_000),
      ]);

    for (const doc of [
      ...widgetSettings,
      ...bookingSettings,
      ...subscriptions,
      ...plugins,
    ]) {
      ids.add(doc.organizationId);
    }
    return [...ids];
  },
});

export const snapshot = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const [
      conversations,
      leads,
      appointments,
      contactSessions,
      widgetSettings,
      bookingSettings,
      subscription,
      usage,
    ] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(5_000),
      ctx.db
        .query("leads")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(5_000),
      ctx.db
        .query("appointments")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(5_000),
      ctx.db
        .query("contactSessions")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(5_000),
      ctx.db
        .query("widgetSettings")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("bookingSettings")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("organizationUsage")
        .withIndex("by_organization_id_and_period", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(120),
    ]);

    return {
      exportedAt: Date.now(),
      organizationId: args.organizationId,
      conversations,
      leads,
      appointments,
      contactSessions,
      widgetSettings,
      bookingSettings,
      subscription,
      usage,
    };
  },
});

export const takeConversationBatch = internalMutation({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .take(BATCH);

    await Promise.all(
      conversations.map((conversation) => ctx.db.delete(conversation._id))
    );
    return conversations.map((conversation) => conversation.threadId);
  },
});

export const deleteRowBatch = internalMutation({
  args: {
    organizationId: v.string(),
    table: v.union(
      v.literal("leads"),
      v.literal("appointments"),
      v.literal("contactSessions")
    ),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query(args.table)
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .take(BATCH);

    await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
    return rows.length;
  },
});

export const deleteConfiguration = internalMutation({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const [
      widgetSettings,
      bookingSettings,
      subscription,
      fileUsage,
      plugins,
      usageRows,
      reservations,
    ] = await Promise.all([
      ctx.db
        .query("widgetSettings")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("bookingSettings")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("fileUsage")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .unique(),
      ctx.db
        .query("plugins")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(50),
      ctx.db
        .query("organizationUsage")
        .withIndex("by_organization_id_and_period", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(240),
      ctx.db
        .query("aiReservations")
        .withIndex("by_organization_id_and_expires_at", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .take(240),
    ]);

    const singletons = [widgetSettings, bookingSettings, subscription, fileUsage];
    await Promise.all([
      ...singletons
        .filter((doc): doc is NonNullable<(typeof singletons)[number]> =>
          Boolean(doc)
        )
        .map((doc) => ctx.db.delete(doc._id)),
      ...plugins.map((plugin) => ctx.db.delete(plugin._id)),
      ...usageRows.map((row) => ctx.db.delete(row._id)),
      ...reservations.map((row) => ctx.db.delete(row._id)),
    ]);

    return { secretNames: plugins.map((plugin) => plugin.secretName) };
  },
});

export const setFileUsage = internalMutation({
  args: {
    organizationId: v.string(),
    entries: v.array(
      v.object({
        storageId: v.optional(v.string()),
        sizeBytes: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let bytes = 0;
    for (const entry of args.entries) {
      if (typeof entry.sizeBytes === "number" && entry.sizeBytes > 0) {
        bytes += entry.sizeBytes;
        continue;
      }
      if (entry.storageId) {
        const metadata = await ctx.db.system.get(
          entry.storageId as Id<"_storage">
        );
        bytes += metadata?.size ?? 0;
      }
    }

    const existing = await ctx.db
      .query("fileUsage")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bytes,
        fileCount: args.entries.length,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("fileUsage", {
        organizationId: args.organizationId,
        bytes,
        fileCount: args.entries.length,
        updatedAt: Date.now(),
      });
    }

    return { bytes, fileCount: args.entries.length };
  },
});
