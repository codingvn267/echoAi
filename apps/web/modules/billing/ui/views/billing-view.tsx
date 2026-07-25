"use client";

import { PricingTable } from "../components/pricing-table";

export const BillingView = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Plans & Billing
          </h1>
          <p className="text-muted-foreground">
            One clear price everywhere. Upgrade, manage, or compare your Helora
            plan.
          </p>
        </div>

        <div className="mt-8">
          <PricingTable />
        </div>
      </div>
    </div>
  );
};
