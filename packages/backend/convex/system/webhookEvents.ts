import { v } from "convex/values";
import { internalMutation } from "../_generated/server.js";

const PROCESSING_LEASE_MS = 10 * 60 * 1000;

export const receive = internalMutation({
  args: {
    source: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_source_and_event_id", (q) =>
        q.eq("source", args.source).eq("eventId", args.eventId)
      )
      .unique();

    if (existing) {
      return {
        status:
          existing.status ?? (existing.processedAt ? "succeeded" : "failed"),
      };
    }

    await ctx.db.insert("webhookEvents", {
      source: args.source,
      eventId: args.eventId,
      status: "received",
      attempts: 0,
      receivedAt: Date.now(),
    });

    return { status: "received" as const };
  },
});

export const startProcessing = internalMutation({
  args: {
    source: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_source_and_event_id", (q) =>
        q.eq("source", args.source).eq("eventId", args.eventId)
      )
      .unique();

    if (!event) {
      return { acquired: false, status: "missing" as const };
    }

    const status = event.status ?? (event.processedAt ? "succeeded" : "failed");
    if (status === "succeeded") {
      return { acquired: false, status };
    }

    const leaseIsActive =
      status === "processing" &&
      event.processingStartedAt !== undefined &&
      event.processingStartedAt > Date.now() - PROCESSING_LEASE_MS;
    if (leaseIsActive) {
      return { acquired: false, status };
    }

    await ctx.db.patch(event._id, {
      status: "processing",
      attempts: (event.attempts ?? 0) + 1,
      processingStartedAt: Date.now(),
      failedAt: undefined,
      lastError: undefined,
    });

    return { acquired: true, status: "processing" as const };
  },
});

export const succeed = internalMutation({
  args: {
    source: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_source_and_event_id", (q) =>
        q.eq("source", args.source).eq("eventId", args.eventId)
      )
      .unique();

    if (event) {
      await ctx.db.patch(event._id, {
        status: "succeeded",
        processedAt: Date.now(),
        failedAt: undefined,
        lastError: undefined,
      });
    }
  },
});

export const fail = internalMutation({
  args: {
    source: v.string(),
    eventId: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_source_and_event_id", (q) =>
        q.eq("source", args.source).eq("eventId", args.eventId)
      )
      .unique();

    if (event) {
      await ctx.db.patch(event._id, {
        status: "failed",
        failedAt: Date.now(),
        lastError: args.error.slice(0, 1_000),
      });
    }
  },
});

export const removeOlderThan = internalMutation({
  args: {
    cutoff: v.number(),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("webhookEvents")
      .withIndex("by_processed_at", (q) => q.lt("processedAt", args.cutoff))
      .take(Math.min(args.batchSize, 500));

    await Promise.all(events.map((event) => ctx.db.delete(event._id)));
    return events.length;
  },
});
