import { createTool, saveMessage } from "@convex-dev/agent";
import z from "zod";
import { components, internal } from "../../../_generated/api.js";
import type { Doc } from "../../../_generated/dataModel.js";

export const captureLead = createTool({
  description:
    "Save the visitor's contact details and interest so the team can follow up. Call this as soon as you have at least a name and phone number, even if they don't book.",
  args: z.object({
    name: z.string().describe("The visitor's full name"),
    phone: z.string().optional().describe("The visitor's phone number"),
    email: z.string().optional().describe("The visitor's email if provided"),
    service: z
      .string()
      .optional()
      .describe("The treatment or service they're interested in"),
    urgency: z
      .enum(["low", "medium", "high"])
      .optional()
      .describe("How soon they want to be seen"),
    notes: z
      .string()
      .optional()
      .describe("Any extra context worth passing to the team"),
  }),
  handler: async (ctx, args): Promise<string> => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation: Doc<"conversations"> | null = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId }
    );

    if (!conversation) {
      return "Conversation not found";
    }

    await ctx.runMutation(internal.system.leads.upsertFromConversation, {
      organizationId: conversation.organizationId,
      contactSessionId: conversation.contactSessionId,
      conversationId: conversation._id,
      name: args.name,
      phone: args.phone,
      email: args.email,
      service: args.service,
      urgency: args.urgency,
      notes: args.notes,
      source: "chat",
    });

    await ctx.scheduler.runAfter(0, internal.system.notifications.notifyStaff, {
      organizationId: conversation.organizationId,
      subject: "New lead captured",
      message: `${args.name}${args.phone ? ` (${args.phone})` : ""}${
        args.service ? ` — interested in ${args.service}` : ""
      }${args.urgency ? ` [${args.urgency} urgency]` : ""}`,
    });

    await saveMessage(ctx, components.agent, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: `Lead captured: ${args.name}.`,
      },
    });

    return "Lead saved. Continue helping the visitor and try to book them in.";
  },
});
