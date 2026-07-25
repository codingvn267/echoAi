import {
  CalendarCheck,
  MessageSquareText,
  PhoneCall,
  BellRing,
  ShieldCheck,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

import { HELORA_PLANS } from "@/modules/billing/constants";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Install", href: "#install" },
  { label: "Use Helora", href: "#use" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export const STATS: { value: string; label: string }[] = [
  { value: "24/7", label: "Always answering" },
  { value: "<3s", label: "First reply time" },
  { value: "38%", label: "More booked leads" },
  { value: "100%", label: "Leads captured & logged" },
];

export const FEATURES: {
  icon: LucideIcon;
  title: string;
  body: string;
  span?: boolean;
}[] = [
  {
    icon: CalendarCheck,
    title: "Books appointments",
    body: "Helora checks your live availability, offers real open slots, and confirms the booking — right inside the chat, no back-and-forth.",
    span: true,
  },
  {
    icon: MessageSquareText,
    title: "Captures every lead",
    body: "Name, phone, service, and urgency are logged the moment a visitor shows interest — before they bounce.",
  },
  {
    icon: PhoneCall,
    title: "Voice & phone",
    body: "Answers calls with a natural voice agent and turns missed calls into callback-ready leads.",
  },
  {
    icon: BellRing,
    title: "Instant staff alerts",
    body: "Your team gets an SMS and email the second a new lead or booking lands.",
  },
  {
    icon: ShieldCheck,
    title: "Med-spa safe",
    body: "Never gives medical advice, dosing, or guarantees. Answers only from your approved content.",
    span: true,
  },
  {
    icon: LayoutDashboard,
    title: "One clean dashboard",
    body: "Every lead, appointment, and conversation in a single view your front desk actually enjoys.",
  },
];

export const STEPS: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Embed in one line",
    body: "Paste a single script tag on your site. Helora appears as a polished chat bubble in minutes — no developer required.",
  },
  {
    step: "02",
    title: "Teach it your business",
    body: "Add your services, hours, pricing and FAQs. Set booking rules and where alerts go. Helora grounds every answer in your content.",
  },
  {
    step: "03",
    title: "Watch leads roll in",
    body: "Visitors get instant answers and book themselves. You get qualified leads and confirmed appointments while you sleep.",
  },
];

export const SALES_EMAIL = "sales@helora.ai";

export const PRICING: {
  name: string;
  price: string;
  cadence: string;
  annualNote: string;
  blurb: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
}[] = HELORA_PLANS.map((plan) => ({
  name: plan.name,
  price: plan.price,
  cadence: plan.period === "per month" ? "/mo" : "",
  annualNote:
    plan.name === "Free"
      ? "Free forever"
      : plan.name === "Pro"
        ? "14-day free trial — cancel anytime"
        : "Volume pricing",
  blurb: plan.description,
  features: plan.features,
  cta: plan.cta,
  ctaHref: plan.href,
  featured: plan.highlighted,
}));

export const PRICING_NOTES: string[] = [
  "14-day free trial on Pro — cancel anytime.",
  "No setup fees. Cancel anytime.",
  'A "conversation" is one unique visitor thread in a billing month, across chat, voice, and phone.',
  "Voice usage may incur additional provider charges.",
  "Prices are per account in USD.",
];

// Step-by-step install instructions per website platform. Mirrors the
// dashboard Integrations view so customers see the same guidance everywhere.
export const INSTALL_PLATFORMS: { name: string; steps: string[] }[] = [
  {
    name: "WordPress",
    steps: [
      "Install the free \u201cInsert Headers and Footers\u201d plugin.",
      "Go to Settings \u2192 Insert Headers and Footers.",
      "Paste your snippet into the \u201cScripts in Footer\u201d box and save.",
    ],
  },
  {
    name: "Squarespace",
    steps: [
      "Open Settings \u2192 Advanced \u2192 Code Injection.",
      "Paste your snippet into the Footer field.",
      "Save — your chat bubble goes live instantly.",
    ],
  },
  {
    name: "Wix",
    steps: [
      "Open Settings \u2192 Custom Code \u2192 + Add Custom Code.",
      "Paste the snippet, choose \u201cBody — end\u201d, apply to all pages.",
      "Click Apply & Publish.",
    ],
  },
  {
    name: "Shopify",
    steps: [
      "Go to Online Store \u2192 Themes \u2192 Edit code.",
      "Open theme.liquid and find the closing </body> tag.",
      "Paste the snippet just before </body> and save.",
    ],
  },
  {
    name: "Webflow",
    steps: [
      "Open Project Settings \u2192 Custom Code.",
      "Paste the snippet into the Footer Code field.",
      "Publish your site.",
    ],
  },
];

// What to do after the script is live — the 3-step usage guide.
export const USAGE_STEPS: { title: string; body: string }[] = [
  {
    title: "Add your business details",
    body: "In your dashboard, add your services, hours, pricing and FAQs so Helora answers accurately and books against your real availability.",
  },
  {
    title: "Set where alerts go",
    body: "Add the email and phone number that should receive instant new-lead and booking notifications so your team never misses a hot lead.",
  },
  {
    title: "Go live & watch your inbox",
    body: "Visitors start chatting, booking, and calling. Every lead and appointment lands in your dashboard — review, confirm, and follow up in one place.",
  },
];

export const CUSTOMER_PLAYBOOK_STEPS: {
  title: string;
  body: string;
  checklist: string[];
  done: string;
}[] = [
  {
    title: "Create your Helora workspace",
    body: "Sign up, create your clinic organization, and open the dashboard. This is where your team will manage conversations, leads, appointments, files, widget settings, and integrations.",
    checklist: [
      "Create or select your organization after signing in.",
      "Invite the teammates who should see leads and conversations.",
      "Open the dashboard and confirm the sidebar pages load correctly.",
    ],
    done: "You are ready when your team can open the dashboard for the right organization.",
  },
  {
    title: "Teach Helora what your business knows",
    body: "Add the information your front desk usually answers: services, pricing ranges, hours, policies, booking rules, FAQs, and anything Helora should avoid saying.",
    checklist: [
      "Upload your service menu, FAQ, policies, and approved website copy in Files.",
      "Add hours, appointment rules, and available services in Booking.",
      "Keep medical guidance out of the content; Helora should not provide medical advice.",
    ],
    done: "You are ready when Helora can answer basic service, pricing, hours, and booking questions from your approved content.",
  },
  {
    title: "Customize the visitor experience",
    body: "Make the widget sound and feel like your clinic. Set the greeting, starter questions, tone, brand details, and where new lead or booking alerts should go.",
    checklist: [
      "Set a friendly greeting in Customization.",
      "Add starter suggestions visitors can tap, like pricing, services, and booking.",
      "Choose the staff email and phone number that should receive lead alerts.",
    ],
    done: "You are ready when the widget opens with your greeting and your team knows where alerts will land.",
  },
  {
    title: "Install Helora on your website",
    body: "Copy the snippet from Integrations and paste it into your website footer or custom code area. Helora will load as a chat bubble without rebuilding your site.",
    checklist: [
      "Open Integrations and copy the snippet with your real organization ID.",
      "Paste it into WordPress, Squarespace, Wix, Shopify, Webflow, or custom HTML.",
      "Open your live site and confirm the Helora bubble appears on desktop and mobile.",
    ],
    done: "You are ready when visitors can open the widget from your real website.",
  },
  {
    title: "Run a test conversation",
    body: "Pretend you are a new visitor. Ask common questions, request a booking, and make sure the conversation appears in your dashboard exactly as your team expects.",
    checklist: [
      "Ask about a service, price range, business hours, and availability.",
      "Submit a test name, email, and phone number when Helora asks.",
      "Confirm the conversation, lead, or appointment appears in the dashboard.",
    ],
    done: "You are ready when a test visitor can become a lead or booking without staff stepping in.",
  },
  {
    title: "Work the inbox every day",
    body: "Use Helora as your front-desk command center. Review new leads, follow up with hot prospects, resolve conversations, and keep your content updated as your offers change.",
    checklist: [
      "Check Conversations for new visitor threads and escalations.",
      "Review Leads and Appointments at the start and end of each day.",
      "Update files, hours, services, and pricing whenever your clinic changes them.",
    ],
    done: "You are ready when Helora is part of your daily lead follow-up routine.",
  },
];

// Social proof pull-quotes for the landing page testimonial section.
export const TESTIMONIALS: {
  quote: string;
  name: string;
  role: string;
}[] = [
  {
    quote:
      "We stopped losing the 9 PM browsers. Helora answers while we sleep, and my front desk walks in to a calendar that filled itself.",
    name: "Danielle R.",
    role: "Owner, aesthetics clinic — Austin, TX",
  },
  {
    quote:
      "The first weekend it booked four consultations we would have missed. It paid for the year in two days.",
    name: "Marcus T.",
    role: "Practice manager, med spa — Miami, FL",
  },
  {
    quote:
      "It answers exactly from our menu and policies — never improvises, never over-promises. That's what sold our clinical director.",
    name: "Priya S.",
    role: "Director, dermatology group — Seattle, WA",
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does setup take?",
    a: "Most med spas are live the same day. Paste one script tag, add your services and hours, and Helora starts answering. No engineering team needed.",
  },
  {
    q: "Will it give medical advice?",
    a: "No. Helora is built for medical-adjacent businesses with strict guardrails: it never provides medical advice, dosing, or outcome guarantees, and answers only from the content you approve.",
  },
  {
    q: "Does it work with my booking system?",
    a: "Helora books against its own availability engine out of the box, and integrates with popular scheduling tools on the Growth and Scale plans. Talk to us about your stack.",
  },
  {
    q: "Where do my leads go?",
    a: "Every lead and appointment is logged in your Helora dashboard, and your team is notified instantly by SMS and email. Export anytime.",
  },
  {
    q: "Can I match my brand?",
    a: "Yes. Customize the greeting, colors, and tone so Helora feels like a natural extension of your front desk.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — start with a 14-day free trial and cancel anytime. You only pay once Helora is booking appointments for you.",
  },
];
