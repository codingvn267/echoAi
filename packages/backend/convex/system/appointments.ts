import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";

export const create = internalMutation({
  args: {
    organizationId: v.string(),
    leadId: v.optional(v.id("leads")),
    contactSessionId: v.optional(v.id("contactSessions")),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    service: v.string(),
    startTime: v.number(),
    durationMinutes: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      organizationId: args.organizationId,
      leadId: args.leadId,
      contactSessionId: args.contactSessionId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      service: args.service,
      startTime: args.startTime,
      durationMinutes: args.durationMinutes,
      status: "requested",
      notes: args.notes,
    });
  },
});

export const countOverlapping = internalQuery({
  args: {
    organizationId: v.string(),
    startTime: v.number(),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const endTime = args.startTime + args.durationMinutes * 60 * 1000;

    // Look at appointments in a window around the requested slot.
    const windowStart = args.startTime - 12 * 60 * 60 * 1000;
    const windowEnd = args.startTime + 12 * 60 * 60 * 1000;

    const nearby = await ctx.db
      .query("appointments")
      .withIndex("by_organization_id_and_start_time", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .gte("startTime", windowStart)
          .lte("startTime", windowEnd)
      )
      .collect();

    return nearby.filter((appt) => {
      if (appt.status === "cancelled" || appt.status === "no_show") {
        return false;
      }
      const apptEnd = appt.startTime + appt.durationMinutes * 60 * 1000;
      return appt.startTime < endTime && apptEnd > args.startTime;
    }).length;
  },
});
