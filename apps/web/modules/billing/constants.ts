export interface HeloraPlan {
  name: "Starter" | "Growth" | "Scale";
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  clerk?: {
    monthlyPriceCents: number;
    slug: "starter" | "growth";
  };
}

export const HELORA_PLANS: HeloraPlan[] = [
  {
    name: "Starter",
    price: "$79",
    period: "month",
    description: "For a single location getting started with an AI front desk.",
    features: [
      "Website chat widget",
      "Lead capture & logging",
      "Appointment booking",
      "Email staff alerts",
      "Up to 500 AI messages / month",
      "1 location",
    ],
    cta: "Start free trial",
    href: "/sign-up",
    highlighted: false,
    clerk: {
      monthlyPriceCents: 7_900,
      slug: "starter",
    },
  },
  {
    name: "Growth",
    price: "$199",
    period: "month",
    description: "For busy teams that need voice, messaging, and more volume.",
    features: [
      "Website chat widget",
      "Lead capture & logging",
      "Appointment booking",
      "Voice & phone agent",
      "SMS + email staff alerts",
      "Custom branding & greeting",
      "Up to 2,500 AI messages / month",
      "Up to 3 locations",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/sign-up",
    highlighted: true,
    clerk: {
      monthlyPriceCents: 19_900,
      slug: "growth",
    },
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For multi-location groups and high-volume operations.",
    features: [
      "Everything in Growth",
      "Unlimited locations",
      "Up to 5,000 AI messages / month",
      "Dedicated onboarding & training",
      "SLA & account manager",
      "Custom integrations",
    ],
    cta: "Talk to sales",
    href: "mailto:hello@helora.ai?subject=Scale%20plan",
    highlighted: false,
  },
];
