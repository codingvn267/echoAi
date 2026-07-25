export interface HeloraPlan {
  name: "Free" | "Pro" | "Scale";
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
}

export const HELORA_PLANS: HeloraPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try Helora on a small project or staging site.",
    features: [
      "100 AI conversations / month",
      "Chat widget on 1 site",
      "Knowledge base - 10 documents",
      "1 organization - 1 seat",
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
      "Knowledge base - 50 documents",
      "1 organization - 5 seats",
      "Vapi voice integration",
      "Email support",
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
      "Multi-organization - unlimited seats",
      "SSO + audit logs",
      "Priority support + SLA",
    ],
    cta: "Contact sales",
    href: "mailto:hello@helora.ai?subject=Scale%20plan",
    highlighted: false,
  },
];
