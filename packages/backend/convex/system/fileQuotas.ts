import { ConvexError, v } from "convex/values";
import { internalMutation } from "../_generated/server.js";

const MAX_FILES = 200;
const FREE_STORAGE_BYTES = 100 * 1024 * 1024;
const PAID_STORAGE_BYTES = 1024 * 1024 * 1024;

export const reserve = internalMutation({
  args: {
    organizationId: v.string(),
    bytes: v.number(),
  },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.bytes) || args.bytes <= 0) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "File is empty" });
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();
    const maxBytes =
      subscription?.status === "active"
        ? PAID_STORAGE_BYTES
        : FREE_STORAGE_BYTES;
    const usage = await ctx.db
      .query("fileUsage")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();
    const bytes = (usage?.bytes ?? 0) + args.bytes;
    const fileCount = (usage?.fileCount ?? 0) + 1;

    if (bytes > maxBytes || fileCount > MAX_FILES) {
      throw new ConvexError({
        code: "QUOTA_EXCEEDED",
        message: "This organization has reached its file storage quota.",
      });
    }

    if (usage) {
      await ctx.db.patch(usage._id, {
        bytes,
        fileCount,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("fileUsage", {
        organizationId: args.organizationId,
        bytes,
        fileCount,
        updatedAt: Date.now(),
      });
    }
  },
});

export const release = internalMutation({
  args: {
    organizationId: v.string(),
    bytes: v.number(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("fileUsage")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();
    if (usage) {
      await ctx.db.patch(usage._id, {
        bytes: Math.max(0, usage.bytes - Math.max(0, args.bytes)),
        fileCount: Math.max(0, usage.fileCount - 1),
        updatedAt: Date.now(),
      });
    }
  },
});
