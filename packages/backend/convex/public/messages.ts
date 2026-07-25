import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server.js";
import { components, internal } from "../_generated/api.js";
import { supportAgent } from "../system/ai/agents/supportAgent.js";
import { paginationOptsValidator } from "convex/server";
import { escalateConversation } from "../system/ai/tools/escalateConversation.js";
import { resolveConversation } from "../system/ai/tools/resolveConversation.js";
import { saveMessage } from "@convex-dev/agent";
import { search } from "../system/ai/tools/search.js";
import { captureLead } from "../system/ai/tools/captureLead.js";
import { checkAvailability } from "../system/ai/tools/checkAvailability.js";
import { bookAppointment } from "../system/ai/tools/bookAppointment.js";

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const prompt = args.prompt.trim();
    const reservation = await ctx.runMutation(
      internal.system.usage.reserveMessage,
      {
        contactSessionId: args.contactSessionId,
        threadId: args.threadId,
        promptCharacters: prompt.length,
      }
    );

    try {
      await ctx.runMutation(internal.system.contactSessions.refresh, {
        contactSessionId: args.contactSessionId,
      });

      if (reservation.shouldTriggerAgent) {
        await supportAgent.generateText(
          ctx,
          {
            threadId: args.threadId,
            usageHandler: async (usageCtx, usageArgs) => {
              await usageCtx.runMutation(internal.system.usage.recordTokens, {
                organizationId: reservation.conversation.organizationId,
                inputTokens: usageArgs.usage.promptTokens,
                outputTokens: usageArgs.usage.completionTokens,
                model: usageArgs.model,
              });
            },
          },
          {
            prompt,
            maxTokens: 2_000,
            tools: {
              escalateConversation,
              resolveConversation,
              search,
              captureLead,
              checkAvailability,
              bookAppointment,
            },
          }
        );
      } else {
        await saveMessage(ctx, components.agent, {
          threadId: args.threadId,
          prompt,
        });
      }
    } finally {
      await ctx.runMutation(internal.system.usage.releaseMessage, {
        reservationId: reservation.reservationId,
      });
    }
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions"),
  },

  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId,
      }
    );

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    if (conversation.contactSessionId !== contactSession._id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Incorrect session",
      });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    return paginated;
  },
});
