import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server.js";

const requireOrg = async (ctx: {
  auth: { getUserIdentity: () => Promise<unknown> };
}) => {
  const identity = (await ctx.auth.getUserIdentity()) as {
    orgId?: string;
  } | null;

  if (identity === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Identity not found",
    });
  }

  const orgId = identity.orgId;
  if (!orgId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found",
    });
  }

  return orgId;
};

const businessHoursValidator = v.array(
  v.object({
    day: v.number(),
    open: v.string(),
    close: v.string(),
    closed: v.optional(v.boolean()),
  })
);

const servicesValidator = v.array(
  v.object({
    name: v.string(),
    durationMinutes: v.number(),
    description: v.optional(v.string()),
  })
);

export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrg(ctx);

    return await ctx.db
      .query("bookingSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    timezone: v.string(),
    businessHours: businessHoursValidator,
    services: servicesValidator,
    slotIntervalMinutes: v.number(),
    capacityPerSlot: v.number(),
    notifyEmail: v.optional(v.string()),
    notifyPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrg(ctx);

    const existing = await ctx.db
      .query("bookingSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        timezone: args.timezone,
        businessHours: args.businessHours,
        services: args.services,
        slotIntervalMinutes: args.slotIntervalMinutes,
        capacityPerSlot: args.capacityPerSlot,
        notifyEmail: args.notifyEmail,
        notifyPhone: args.notifyPhone,
      });
      return existing._id;
    }

    return await ctx.db.insert("bookingSettings", {
      organizationId: orgId,
      timezone: args.timezone,
      businessHours: args.businessHours,
      services: args.services,
      slotIntervalMinutes: args.slotIntervalMinutes,
      capacityPerSlot: args.capacityPerSlot,
      notifyEmail: args.notifyEmail,
      notifyPhone: args.notifyPhone,
    });
  },
});
