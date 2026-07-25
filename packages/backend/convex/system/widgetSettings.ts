import { v } from "convex/values";
import { internalQuery } from "../_generated/server.js";

export const getOrganizationByVapiAssistantId = internalQuery({
  args: {
    assistantId: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_vapi_assistant_id", (q) =>
        q.eq("vapiSettings.assistantId", args.assistantId)
      )
      .unique();

    return settings?.organizationId ?? null;
  },
});
