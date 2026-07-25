import { v } from "convex/values";
import { internalMutation } from "../_generated/server.js";

export const removeOlderThan = internalMutation({
  args: { cutoff: v.number(), batchSize: v.number() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("rateLimits")
      .withIndex("by_updated_at", (q) => q.lt("updatedAt", args.cutoff))
      .take(Math.min(args.batchSize, 500));
    await Promise.all(records.map((record) => ctx.db.delete(record._id)));
    return records.length;
  },
});
