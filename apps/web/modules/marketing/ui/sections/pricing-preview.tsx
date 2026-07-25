import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { HELORA_PLANS } from "@/modules/billing/constants";

export function PricingPreview() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Simple pricing,{" "}
            <span className="text-gradient-aurora">
              built to scale with you
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {HELORA_PLANS.map((tier) => (
            <div
              data-plan={tier.name.toLowerCase()}
              key={tier.name}
              className={`relative rounded-2xl border p-8 backdrop-blur ${
                tier.highlighted
                  ? "border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10 md:scale-105"
                  : "border-border/60 bg-card/40"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-5xl font-bold tracking-tight">
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className="text-sm text-muted-foreground">
                    /{tier.period}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {tier.description}
              </p>

              <Button asChild className="mt-6 w-full" size="lg" variant="neo">
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need to compare plans in detail?{" "}
          <Link
            href="/pricing"
            className="text-foreground font-medium hover:text-primary underline-offset-4 hover:underline"
          >
            See full pricing →
          </Link>
        </p>
      </div>
    </section>
  );
}
