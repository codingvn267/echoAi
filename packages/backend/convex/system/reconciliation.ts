import { createClerkClient } from "@clerk/backend";
import { internalAction, internalQuery } from "../_generated/server.js";
import { internal } from "../_generated/api.js";

export const listSubscriptions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db.query("subscriptions").take(1_000);
    return subscriptions.map((subscription) => ({
      organizationId: subscription.organizationId,
      status: subscription.status,
      plan: subscription.plan,
    }));
  },
});

// Daily safety net for the failure mode where a Clerk webhook succeeded in
// Convex but the follow-up Clerk organization update failed (or events were
// dropped entirely): re-derive each organization's membership cap from the
// subscription record we hold and push corrections back to Clerk.
export const reconcileSubscriptions = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{ checked: number; corrected: number; failed: number }> => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error(
        "Subscription reconciliation skipped: CLERK_SECRET_KEY not set"
      );
      return { checked: 0, corrected: 0, failed: 0 };
    }

    const clerkClient = createClerkClient({ secretKey });
    const subscriptions: {
      organizationId: string;
      status: string;
      plan?: "starter" | "growth" | "scale";
    }[] = await ctx.runQuery(
      internal.system.reconciliation.listSubscriptions,
      {}
    );

    let corrected = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      const expectedMax =
        subscription.status === "active" && subscription.plan !== "starter"
          ? 5
          : 1;
      try {
        const organization = await clerkClient.organizations.getOrganization({
          organizationId: subscription.organizationId,
        });
        if (organization.maxAllowedMemberships !== expectedMax) {
          await clerkClient.organizations.updateOrganization(
            subscription.organizationId,
            { maxAllowedMemberships: expectedMax }
          );
          corrected += 1;
          console.warn("Corrected drifted organization entitlement", {
            organizationId: subscription.organizationId,
            status: subscription.status,
            previousMax: organization.maxAllowedMemberships,
            expectedMax,
          });
        }
      } catch (error) {
        failed += 1;
        console.error("Subscription reconciliation failed for organization", {
          organizationId: subscription.organizationId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary = { checked: subscriptions.length, corrected, failed };
    console.info("Subscription reconciliation completed", summary);
    return summary;
  },
});
