import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";

const DEFAULT_BUSINESS_HOURS = [
  { day: 0, open: "00:00", close: "00:00", closed: true },
  { day: 1, open: "09:00", close: "17:00" },
  { day: 2, open: "09:00", close: "17:00" },
  { day: 3, open: "09:00", close: "17:00" },
  { day: 4, open: "09:00", close: "17:00" },
  { day: 5, open: "09:00", close: "17:00" },
  { day: 6, open: "10:00", close: "15:00" },
];

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookingSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();
  },
});

export const ensureForOrganization = internalMutation({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookingSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("bookingSettings", {
      organizationId: args.organizationId,
      timezone: "America/Los_Angeles",
      businessHours: DEFAULT_BUSINESS_HOURS,
      services: [{ name: "Consultation", durationMinutes: 30 }],
      slotIntervalMinutes: 30,
      capacityPerSlot: 1,
    });
  },
});
