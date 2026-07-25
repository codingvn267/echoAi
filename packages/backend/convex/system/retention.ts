import { internalAction } from "../_generated/server.js";
import { internal } from "../_generated/api.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRED_SESSION_GRACE_DAYS = 7;
const WEBHOOK_RETENTION_DAYS = 30;
const RATE_LIMIT_RETENTION_DAYS = 2;

export const cleanup = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const [sessions, webhooks, rateLimits, reservations] = await Promise.all([
      ctx.runMutation(internal.system.contactSessions.removeExpired, {
        cutoff: now - EXPIRED_SESSION_GRACE_DAYS * DAY_MS,
        batchSize: 500,
      }),
      ctx.runMutation(internal.system.webhookEvents.removeOlderThan, {
        cutoff: now - WEBHOOK_RETENTION_DAYS * DAY_MS,
        batchSize: 500,
      }),
      ctx.runMutation(internal.system.rateLimits.removeOlderThan, {
        cutoff: now - RATE_LIMIT_RETENTION_DAYS * DAY_MS,
        batchSize: 500,
      }),
      ctx.runMutation(internal.system.usage.removeExpiredReservations, {
        cutoff: now,
        batchSize: 500,
      }),
    ]);

    console.info("Retention cleanup completed", {
      sessions,
      webhooks,
      rateLimits,
      reservations,
    });
  },
});
