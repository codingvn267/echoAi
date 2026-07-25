import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api.js";
import type { Doc } from "../../../_generated/dataModel.js";
import {
  formatSlot,
  generateSlots,
  getServiceDuration,
} from "../lib/availability.js";

export const checkAvailability = createTool({
  description:
    "Get real open appointment slots before proposing any times to the visitor. Always call this instead of inventing availability.",
  args: z.object({
    service: z
      .string()
      .optional()
      .describe("The service the visitor wants to book"),
    preferredDate: z
      .string()
      .optional()
      .describe("An ISO date (YYYY-MM-DD) the visitor prefers, if any"),
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

    const settings: Doc<"bookingSettings"> | null = await ctx.runQuery(
      internal.system.bookingSettings.getByOrganizationId,
      { organizationId: conversation.organizationId }
    );

    const duration = getServiceDuration(settings, args.service);

    let fromMs = Date.now();
    if (args.preferredDate) {
      const parsed = Date.parse(`${args.preferredDate}T00:00:00Z`);
      if (!Number.isNaN(parsed) && parsed > fromMs) {
        fromMs = parsed;
      }
    }

    const candidates = generateSlots(settings, fromMs, 12);
    const available: number[] = [];

    for (const slot of candidates) {
      const overlapping: number = await ctx.runQuery(
        internal.system.appointments.countOverlapping,
        {
          organizationId: conversation.organizationId,
          startTime: slot,
          durationMinutes: duration,
        }
      );
      const capacity = settings?.capacityPerSlot ?? 1;
      if (overlapping < capacity) {
        available.push(slot);
      }
      if (available.length >= 3) {
        break;
      }
    }

    if (available.length === 0) {
      return "No open slots were found in the next few weeks. Offer to capture their details for a callback.";
    }

    const tz = settings?.timezone;
    const list = available
      .map(
        (ms) =>
          `- ${formatSlot(ms, tz)} (startTime: ${new Date(ms).toISOString()})`
      )
      .join("\n");

    return `Open slots (offer these exact times; pass the ISO startTime to bookAppointment):\n${list}`;
  },
});
