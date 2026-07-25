import { createTool, saveMessage } from "@convex-dev/agent";
import z from "zod";
import { components, internal } from "../../../_generated/api.js";
import type { Doc } from "../../../_generated/dataModel.js";
import { formatSlot, getServiceDuration } from "../lib/availability.js";

export const bookAppointment = createTool({
  description:
    "Request a specific appointment slot for the visitor. Only call after checkAvailability returned the slot and the visitor confirmed their choice.",
  args: z.object({
    customerName: z.string().describe("The visitor's full name"),
    customerPhone: z
      .string()
      .optional()
      .describe("The visitor's phone number for confirmation"),
    service: z.string().describe("The service being booked"),
    startTime: z
      .string()
      .describe("The chosen slot as an ISO timestamp from checkAvailability"),
    notes: z.string().optional().describe("Any extra context for the team"),
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

    const startMs = Date.parse(args.startTime);
    if (Number.isNaN(startMs)) {
      return "Invalid start time. Call checkAvailability and use one of its ISO startTime values.";
    }

    const settings: Doc<"bookingSettings"> | null = await ctx.runQuery(
      internal.system.bookingSettings.getByOrganizationId,
      { organizationId: conversation.organizationId }
    );
    const duration = getServiceDuration(settings, args.service);

    const overlapping: number = await ctx.runQuery(
      internal.system.appointments.countOverlapping,
      {
        organizationId: conversation.organizationId,
        startTime: startMs,
        durationMinutes: duration,
      }
    );
    if (overlapping >= (settings?.capacityPerSlot ?? 1)) {
      return "That time just filled up. Call checkAvailability again and offer a different slot.";
    }

    const lead: Doc<"leads"> | null = await ctx.runQuery(
      internal.system.leads.getByContactSession,
      { contactSessionId: conversation.contactSessionId }
    );

    await ctx.runMutation(internal.system.appointments.create, {
      organizationId: conversation.organizationId,
      leadId: lead?._id,
      contactSessionId: conversation.contactSessionId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      service: args.service,
      startTime: startMs,
      durationMinutes: duration,
      notes: args.notes,
    });

    if (lead) {
      await ctx.runMutation(internal.system.leads.setStatus, {
        leadId: lead._id,
        status: "booked",
      });
    }

    const friendlyTime = formatSlot(startMs, settings?.timezone);

    await ctx.scheduler.runAfter(0, internal.system.notifications.notifyStaff, {
      organizationId: conversation.organizationId,
      subject: "New appointment request",
      message: `${args.customerName}${
        args.customerPhone ? ` (${args.customerPhone})` : ""
      } — ${args.service} on ${friendlyTime}`,
    });

    await saveMessage(ctx, components.agent, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: `Appointment requested: ${args.service} on ${friendlyTime}.`,
      },
    });

    return `Appointment requested for ${friendlyTime}. Tell the visitor they're booked and the team will text to confirm.`;
  },
});
