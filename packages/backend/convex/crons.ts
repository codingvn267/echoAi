import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

const crons = cronJobs();

crons.daily(
  "delete expired operational records",
  { hourUTC: 3, minuteUTC: 15 },
  internal.system.retention.cleanup
);

crons.daily(
  "reconcile subscription entitlements with Clerk",
  { hourUTC: 4, minuteUTC: 0 },
  internal.system.reconciliation.reconcileSubscriptions
);

export default crons;
