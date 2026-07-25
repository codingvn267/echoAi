import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";

export const upsertFromConversation = internalMutation({
  args: {
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    conversationId: v.optional(v.id("conversations")),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    service: v.optional(v.string()),
    urgency: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    notes: v.optional(v.string()),
    source: v.union(v.literal("chat"), v.literal("voice"), v.literal("phone")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_contact_session_id", (q) =>
        q.eq("contactSessionId", args.contactSessionId)
      )
      .order("desc")
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name,
        phone: args.phone ?? existing.phone,
        email: args.email ?? existing.email,
        service: args.service ?? existing.service,
        urgency: args.urgency ?? existing.urgency,
        notes: args.notes ?? existing.notes,
        conversationId: args.conversationId ?? existing.conversationId,
      });
      return existing._id;
    }

    return await ctx.db.insert("leads", {
      organizationId: args.organizationId,
      contactSessionId: args.contactSessionId,
      conversationId: args.conversationId,
      name: args.name,
      phone: args.phone,
      email: args.email,
      service: args.service,
      urgency: args.urgency,
      notes: args.notes,
      source: args.source,
      status: "new",
    });
  },
});

export const setStatus = internalMutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("booked"),
      v.literal("needs_callback"),
      v.literal("contacted"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, { status: args.status });
  },
});

export const createFromPhoneCall = internalMutation({
  args: {
    organizationId: v.string(),
    providerEventId: v.optional(v.string()),
    name: v.string(),
    phone: v.optional(v.string()),
    summary: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.providerEventId) {
      const existing = await ctx.db
        .query("leads")
        .withIndex("by_source_and_provider_event_id", (q) =>
          q.eq("source", "phone").eq("providerEventId", args.providerEventId)
        )
        .unique();
      if (existing) {
        return existing._id;
      }
    }

    return await ctx.db.insert("leads", {
      organizationId: args.organizationId,
      providerEventId: args.providerEventId,
      name: args.name,
      phone: args.phone,
      summary: args.summary,
      notes: args.notes,
      source: "phone",
      status: "needs_callback",
    });
  },
});

export const setSummary = internalMutation({
  args: {
    contactSessionId: v.id("contactSessions"),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_contact_session_id", (q) =>
        q.eq("contactSessionId", args.contactSessionId)
      )
      .order("desc")
      .first();

    if (lead) {
      await ctx.db.patch(lead._id, { summary: args.summary });
    }
  },
});

export const getByContactSession = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_contact_session_id", (q) =>
        q.eq("contactSessionId", args.contactSessionId)
      )
      .order("desc")
      .first();
  },
});
