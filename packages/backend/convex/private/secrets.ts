import { ConvexError, v } from "convex/values";
import { action } from "../_generated/server.js";
import { internal } from "../_generated/api.js";

const MAX_API_KEY_LENGTH = 512;

export const upsert = action({
  args: {
    service: v.union(v.literal("vapi")),
    value: v.object({
      publicApiKey: v.string(),
      privateApiKey: v.string(),
    }),
  },
  handler: async (ctx, args): Promise<{ status: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    if (identity.orgRole !== "org:admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only organization admins can manage integrations",
      });
    }

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      { organizationId: orgId }
    );
    if (subscription?.status !== "active") {
      throw new ConvexError({
        code: "SUBSCRIPTION_REQUIRED",
        message: "An active Pro subscription is required",
      });
    }

    const publicApiKey = args.value.publicApiKey.trim();
    const privateApiKey = args.value.privateApiKey.trim();
    if (
      publicApiKey.length < 8 ||
      privateApiKey.length < 8 ||
      publicApiKey.length > MAX_API_KEY_LENGTH ||
      privateApiKey.length > MAX_API_KEY_LENGTH
    ) {
      throw new ConvexError({
        code: "INVALID_CREDENTIALS",
        message: "Vapi API keys must be between 8 and 512 characters",
      });
    }

    return await ctx.runAction(internal.system.secrets.upsert, {
      service: args.service,
      organizationId: orgId,
      value: { publicApiKey, privateApiKey },
    });
  },
});
