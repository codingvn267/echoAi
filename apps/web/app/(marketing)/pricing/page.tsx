import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Faq } from "@/modules/marketing/ui/sections/faq";
import { FinalCta } from "@/modules/marketing/ui/sections/final-cta";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for echoAi — start free, upgrade when you need voice, more conversations, or more seats.",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try echoAi on a small project or staging site.",
    features: [
      "100 AI conversations / month",
      "Chat widget on 1 site",
      "Knowledge base — 10 documents",
      "1 organization · 1 seat",
      "Community support",
    ],
    cta: "Start free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For teams shipping AI customer support to production.",
    features: [
      "1,000 AI conversations / month",
      "Chat + voice widget on 1 site",
      "Knowledge base — 50 documents",
      "1 organization · 5 seats",
      "Vapi voice integration",
      "Email support",
      "Sentry error monitoring",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "talk to us",
    description: "Multi-brand teams, agencies, and high-volume workloads.",
    features: [
      "Unlimited AI conversations",
      "Multiple sites + brands",
      "Unlimited knowledge base",
      "Multi-organization · unlimited seats",
      "SSO + audit logs",
      "Priority support + 99.9% SLA",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "mailto:hello@echoai.app?subject=Scale%20plan",
    highlighted: false,
  },
];

const COMPARE: { row: string; values: (string | boolean)[] }[] = [
  { row: "AI chat conversations", values: ["100/mo", "1,000/mo", "Unlimited"] },
  { row: "Voice calls (Vapi)", values: [false, true, true] },
  { row: "Knowledge base", values: ["10 docs", "50 docs", "Unlimited"] },
  { row: "Sites / brands", values: ["1", "1", "Multiple"] },
  { row: "Team seats", values: ["1", "5", "Unlimited"] },
  { row: "Multi-organization", values: [false, false, true] },
  { row: "SSO + audit logs", values: [false, false, true] },
  { row: "Support", values: ["Community", "Email", "Priority + SLA"] },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative pt-32 pb-12 sm:pt-40">
        <div className="mx-auto max-w-3xl text-center px-4">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Pay as you{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              grow
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {TIERS.map((tier) => (
              <div
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
                  <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/{tier.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
                <Button
                  asChild
                  className={`mt-6 w-full ${tier.highlighted ? "" : "bg-foreground text-background hover:bg-foreground/90"}`}
                  size="lg"
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            Compare plans
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/40 backdrop-blur">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left p-4 font-medium text-muted-foreground"></th>
                  {TIERS.map((t) => (
                    <th key={t.name} className="text-left p-4 font-semibold">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-b-0">
                    <td className="p-4 text-muted-foreground">{row.row}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="p-4 font-medium">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Faq />
      <FinalCta />
    </>
  );
}
