import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server.js";

export async function consumeRateLimit(
  ctx: MutationCtx,
  options: {
    key: string;
    limit: number;
    windowMs: number;
    now?: number;
  }
): Promise<void> {
  const now = options.now ?? Date.now();
  const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key_and_window_start", (q) =>
      q.eq("key", options.key).eq("windowStart", windowStart)
    )
    .unique();

  if (existing && existing.count >= options.limit) {
    throw new ConvexError({
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
      retryAfterMs: windowStart + options.windowMs - now,
    });
  }

  if (existing) {
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("rateLimits", {
      key: options.key,
      windowStart,
      count: 1,
      updatedAt: now,
    });
  }
}
