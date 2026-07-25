import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server.js";
import { paginationOptsValidator } from "convex/server";

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

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("requested"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("completed"),
        v.literal("no_show")
      )
    ),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrg(ctx);

    if (args.status) {
      return await ctx.db
        .query("appointments")
        .withIndex("by_status_and_organization_id", (q) =>
          q.eq("status", args.status!).eq("organizationId", orgId)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("appointments")
      .withIndex("by_organization_id_and_start_time", (q) =>
        q.eq("organizationId", orgId)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("requested"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrg(ctx);

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Appointment not found",
      });
    }
    if (appointment.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      });
    }

    await ctx.db.patch(args.appointmentId, { status: args.status });
  },
});
