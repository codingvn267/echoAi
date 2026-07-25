"use client";

import { useAuth } from "@clerk/nextjs";
import { CheckoutButton, usePlans } from "@clerk/nextjs/experimental";
import { CheckIcon, CircleAlertIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { HELORA_PLANS, type HeloraPlan } from "@/modules/billing/constants";

const PlanCard = ({
  active,
  children,
  plan,
}: {
  active: boolean;
  children: React.ReactNode;
  plan: HeloraPlan;
}) => (
  <article
    data-plan={plan.name.toLowerCase()}
    className={`relative flex h-full flex-col rounded-lg border bg-background/85 p-6 shadow-sm backdrop-blur-sm ${
      plan.highlighted ? "border-primary/50 ring-1 ring-primary/20" : ""
    }`}
  >
    {plan.highlighted ? (
      <Badge
        className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1"
        variant="secondary"
      >
        <SparklesIcon className="size-3" />
        Most popular
      </Badge>
    ) : null}

    <div className="flex items-start justify-between gap-3">
      <h2 className="text-lg font-semibold">{plan.name}</h2>
      {active ? (
        <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
      ) : null}
    </div>
    <div className="mt-4 flex items-baseline gap-1.5">
      <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
      {plan.period ? (
        <span className="text-sm text-muted-foreground">/{plan.period}</span>
      ) : null}
    </div>
    <p className="mt-3 min-h-10 text-sm leading-5 text-muted-foreground">
      {plan.description}
    </p>

    <div className="mt-6">{children}</div>

    <ul className="mt-7 space-y-3">
      {plan.features.map((feature) => (
        <li className="flex items-start gap-2.5 text-sm" key={feature}>
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <span className="text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const PricingTable = () => {
  const { has } = useAuth();
  const { data: clerkPlans, isLoading } = usePlans({ for: "organization" });
  const findClerkPlan = (catalogPlan: HeloraPlan) =>
    catalogPlan.clerk
      ? clerkPlans.find(
          (clerkPlan) =>
            clerkPlan.name.toLowerCase() === catalogPlan.name.toLowerCase() &&
            clerkPlan.fee.amount === catalogPlan.clerk?.monthlyPriceCents &&
            clerkPlan.fee.currency.toUpperCase() === "USD"
        )
      : undefined;
  const missingClerkPlans = HELORA_PLANS.filter(
    (plan) => plan.clerk && !findClerkPlan(plan)
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {HELORA_PLANS.map((plan) => {
          const active = plan.clerk
            ? (has?.({ plan: plan.clerk.slug }) ?? false)
            : false;
          const clerkPlan = findClerkPlan(plan);

          return (
            <PlanCard active={active} key={plan.name} plan={plan}>
              {plan.clerk ? (
                isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : active ? (
                  <Button className="w-full" disabled size="lg" variant="neo">
                    Current plan
                  </Button>
                ) : clerkPlan ? (
                  <CheckoutButton
                    for="organization"
                    newSubscriptionRedirectUrl="/billing"
                    planId={clerkPlan.id}
                    planPeriod="month"
                  >
                    <Button className="w-full" size="lg" variant="neo">
                      {plan.cta}
                    </Button>
                  </CheckoutButton>
                ) : (
                  <Button className="w-full" disabled size="lg" variant="neo">
                    Configure {plan.name} in Clerk
                  </Button>
                )
              ) : null}

              {plan.name === "Scale" ? (
                <Button asChild className="w-full" size="lg" variant="neo">
                  <a href={plan.href}>{plan.cta}</a>
                </Button>
              ) : null}
            </PlanCard>
          );
        })}
      </div>

      {!isLoading && missingClerkPlans.length > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            Checkout is paused for plans that do not exactly match Clerk:{" "}
            <strong>
              {missingClerkPlans
                .map(
                  (plan) =>
                    `${plan.name} (${plan.price} USD monthly, slug ${plan.clerk?.slug})`
                )
                .join(" and ")}
            </strong>
            . Update the organization plans in Clerk Billing to enable checkout.
          </p>
        </div>
      ) : null}
    </div>
  );
};
