"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Check, Sparkles, Star, Menu, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { cn } from "@workspace/ui/lib/utils";

import {
  CUSTOMER_PLAYBOOK_STEPS,
  FAQS,
  FEATURES,
  INSTALL_PLATFORMS,
  NAV_LINKS,
  PRICING,
  PRICING_NOTES,
  SALES_EMAIL,
  STATS,
  STEPS,
  TESTIMONIALS,
  USAGE_STEPS,
} from "@/modules/marketing/constants";
import { Reveal } from "@/modules/marketing/ui/components/reveal";
import { TiltCard } from "@/modules/marketing/ui/components/tilt-card";
import { WidgetMock } from "@/modules/marketing/ui/components/widget-mock";
import { DashboardMock } from "@/modules/marketing/ui/components/dashboard-mock";
import { AiPattern } from "@/modules/marketing/ui/components/ai-pattern";
import { ScrollProgress } from "@/modules/marketing/ui/components/scroll-progress";
import { SpotlightCard } from "@/modules/marketing/ui/components/spotlight-card";
import { CountUp } from "@/modules/marketing/ui/components/count-up";
import { BrandMark } from "@/components/brand-mark";

const DASHBOARD_URL = "/conversations";

const WIDGET_SCRIPT_URL =
  process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ??
  "https://widget.helora.ai/widget.js";
const WIDGET_URL =
  process.env.NEXT_PUBLIC_WIDGET_URL ?? "https://widget.helora.ai";

const EMBED_SNIPPET = `<script
  src="${WIDGET_SCRIPT_URL}"
  data-org-id="your-org-id"
  data-widget-url="${WIDGET_URL}"
  defer
></script>`;

// One tint per feature card — a full color system instead of a single accent.
const FEATURE_TINTS = [
  "border-violet-400/20 bg-violet-500/10 text-violet-300",
  "border-rose-400/20 bg-rose-500/10 text-rose-300",
  "border-sky-400/20 bg-sky-500/10 text-sky-300",
  "border-amber-400/20 bg-amber-500/10 text-amber-300",
  "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300",
];

export const LandingView = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-svh bg-[#0b0a12] font-sans text-zinc-100 antialiased">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[140px] animate-helora-aurora" />
        <div className="absolute top-1/3 -right-40 size-[420px] rounded-full bg-rose-500/15 blur-[120px] animate-helora-aurora [animation-delay:-6s]" />
        <div className="absolute -bottom-32 -left-32 size-[480px] rounded-full bg-sky-500/10 blur-[130px] animate-helora-aurora [animation-delay:-12s]" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0a12]/70 backdrop-blur-xl">
        <ScrollProgress />
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="text-[15px] font-semibold tracking-tight">
              Helora
            </span>
          </Link>
          <div className="ml-auto hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <SignedOut>
              <Button
                asChild
                variant="ghost"
                className="hidden text-zinc-300 hover:bg-white/5 hover:text-white sm:inline-flex"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full" variant="neo">
                <Link href="/sign-up">
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild className="rounded-full" variant="neo">
                <Link href={DASHBOARD_URL}>
                  Open dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
            </SignedIn>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex size-9 items-center justify-center rounded-full text-zinc-400 hover:text-white md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </nav>

        {/* mobile nav panel */}
        {mobileOpen && (
          <div className="border-t border-white/5 bg-zinc-950/95 px-5 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <SignedOut>
                <a
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Sign in
                </a>
              </SignedOut>
            </div>
          </div>
        )}
      </header>

      <main className="relative">
        {/* hero */}
        <section className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200">
                  <Sparkles className="size-3.5 text-violet-300" />
                  The AI front desk for med spas
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                  Never miss another{" "}
                  <span className="font-display italic font-normal text-shimmer">
                    booking
                  </span>
                  .
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400">
                  Helora answers every question, captures every lead, and books
                  appointments around the clock — so your front desk never
                  sleeps and your calendar stays full.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <SignedOut>
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-6"
                      variant="neo"
                    >
                      <Link href="/sign-up">
                        Start free <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-6"
                      variant="neo"
                    >
                      <Link href={DASHBOARD_URL}>
                        Open dashboard <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </SignedIn>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/15 bg-transparent px-6 text-white hover:bg-white/5 hover:text-white"
                  >
                    <a href="#how">See how it works</a>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={320}>
                <div className="mt-8 flex items-center gap-4 text-sm text-zinc-500">
                  <div className="flex -space-x-2">
                    {[
                      "bg-zinc-700",
                      "bg-zinc-600",
                      "bg-zinc-500",
                      "bg-zinc-400",
                    ].map((c, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-7 rounded-full border-2 border-zinc-950",
                          c
                        )}
                      />
                    ))}
                  </div>
                  <span className="flex items-center gap-1">
                    <span className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-3.5 fill-zinc-300 text-zinc-300"
                        />
                      ))}
                    </span>
                    Trusted by modern med spas
                  </span>
                </div>
              </Reveal>
            </div>

            {/* hero mock */}
            <Reveal delay={200} className="flex justify-center lg:justify-end">
              <TiltCard className="relative">
                <div className="absolute -inset-10 rounded-full bg-zinc-400/10 blur-3xl" />
                <div className="relative animate-helora-float">
                  <WidgetMock />
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* trust marquee */}
        <section className="border-y border-white/5 py-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
            Built for the businesses that live and die by their calendar
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
            <div className="flex w-max animate-helora-marquee gap-12 pr-12 text-lg font-medium text-zinc-600">
              {[
                "Med Spas",
                "Aesthetics Clinics",
                "Dental",
                "Dermatology",
                "Wellness Studios",
                "IV Therapy",
                "Hair & Skin",
                "Cosmetic Surgery",
              ]
                .concat([
                  "Med Spas",
                  "Aesthetics Clinics",
                  "Dental",
                  "Dermatology",
                  "Wellness Studios",
                  "IV Therapy",
                  "Hair & Skin",
                  "Cosmetic Surgery",
                ])
                .map((name, i) => (
                  <span key={i} className="whitespace-nowrap">
                    {name}
                  </span>
                ))}
            </div>
          </div>
        </section>

        {/* stats */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 80}
                className="bg-zinc-950/40 p-8 text-center"
              >
                <div className="font-display text-5xl tracking-tight [font-variant-numeric:tabular-nums]">
                  <span className="bg-gradient-to-r from-violet-200 via-white to-rose-200 bg-clip-text text-transparent">
                    <CountUp value={stat.value} />
                  </span>
                </div>
                <div className="mt-2 text-sm text-zinc-500">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* product preview */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
                The dashboard
              </span>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Every lead and booking,{" "}
                <span className="font-display italic font-normal text-violet-300">
                  in one place
                </span>
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-zinc-400">
                Watch conversations, appointments, and revenue update in real
                time. Your whole team sees what Helora booked overnight the
                moment they log in.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Live conversation feed with captured contact details",
                  "Bookings and no-show risk at a glance",
                  "Weekly trends that prove the ROI",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={140} className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-full bg-zinc-400/10 blur-3xl" />
              <div className="relative">
                <DashboardMock />
              </div>
            </Reveal>
          </div>
        </section>

        {/* features bento */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20"
        >
          <Reveal className="mx-auto max-w-2xl text-center">
            <AiPattern className="mx-auto mb-8 h-16 w-auto opacity-70 [mask-image:linear-gradient(to_right,transparent,#000_25%,#000_75%,transparent)]" />
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              A receptionist that{" "}
              <span className="font-display italic font-normal text-violet-300">
                never clocks out
              </span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-zinc-400">
              Everything your front desk does on its best day — running every
              hour of every day.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal
                key={feature.title}
                delay={(i % 3) * 90}
                className={cn(feature.span && "sm:col-span-2 lg:col-span-2")}
              >
                <SpotlightCard>
                  <div className="h-full p-7">
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl border",
                        FEATURE_TINTS[i % FEATURE_TINTS.length]
                      )}
                    >
                      <feature.icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 max-w-md text-pretty leading-relaxed text-zinc-400">
                      {feature.body}
                    </p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
              How it works
            </span>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Live in an afternoon
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.step} delay={i * 100}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                  <span className="font-display text-5xl text-zinc-700">
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-pretty leading-relaxed text-zinc-400">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* testimonials */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
              From the front desk
            </span>
            <blockquote className="mt-6 text-balance font-display text-3xl italic leading-snug text-zinc-200 sm:text-4xl">
              “{TESTIMONIALS[0]!.quote}”
            </blockquote>
            <p className="mt-5 text-sm text-zinc-500">
              <span className="font-medium text-zinc-300">
                {TESTIMONIALS[0]!.name}
              </span>{" "}
              · {TESTIMONIALS[0]!.role}
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.slice(1).map((testimonial, i) => (
              <Reveal key={testimonial.name} delay={i * 100}>
                <figure className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                  <blockquote className="text-pretty leading-relaxed text-zinc-300">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-300">
                      {testimonial.name}
                    </span>{" "}
                    · {testimonial.role}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* integration */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid items-center gap-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 lg:grid-cols-2">
            <Reveal>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
                One line to go live
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Drop it on any website
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-zinc-400">
                No plugins, no rebuild. Paste a single script tag and Helora
                appears as a polished chat bubble. Works with Squarespace, Wix,
                WordPress, Webflow, Shopify, and custom sites.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Loads async — zero impact on page speed",
                  "Fully responsive on mobile and desktop",
                  "Matches your brand colors and greeting",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
                <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
                  <span className="size-3 rounded-full bg-zinc-700" />
                  <span className="size-3 rounded-full bg-zinc-700" />
                  <span className="size-3 rounded-full bg-zinc-700" />
                  <span className="ml-3 text-xs text-zinc-500">index.html</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-zinc-300">
                  <code>{EMBED_SNIPPET}</code>
                </pre>
              </div>
            </Reveal>
          </div>
        </section>

        {/* install instructions */}
        <section
          id="install"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20"
        >
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
              Install & setup
            </span>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Up and running in{" "}
              <span className="font-display italic font-normal text-violet-300">
                three steps
              </span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-zinc-400">
              No developer, no rebuild. Here&apos;s exactly what you do after
              you sign up.
            </p>
          </Reveal>

          {/* usage steps */}
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {USAGE_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-lg text-zinc-200">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-pretty leading-relaxed text-zinc-400">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* per-platform embed guide */}
          <Reveal delay={120} className="mt-12">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Paste the snippet on your website
              </h3>
              <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400">
                Copy your one-line snippet from the dashboard (your org ID is
                filled in automatically), then follow the steps for your
                platform. Pick yours below.
              </p>
              <Accordion type="single" collapsible className="mt-6 w-full">
                {INSTALL_PLATFORMS.map((platform, i) => (
                  <AccordionItem
                    key={platform.name}
                    value={`platform-${i}`}
                    className="border-white/10"
                  >
                    <AccordionTrigger className="text-left text-base font-medium text-white hover:no-underline">
                      {platform.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3">
                        {platform.steps.map((step, j) => (
                          <li
                            key={j}
                            className="flex gap-3 text-sm leading-relaxed text-zinc-400"
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold tabular-nums text-zinc-200">
                              {j + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <p className="mt-6 text-xs text-zinc-500">
                Using something else? The snippet works anywhere you can paste
                HTML. Need a hand? Email{" "}
                <a
                  href={`mailto:${SALES_EMAIL}`}
                  className="text-zinc-300 underline underline-offset-4 hover:text-white"
                >
                  {SALES_EMAIL}
                </a>{" "}
                and we&apos;ll install it for you.
              </p>
            </div>
          </Reveal>
        </section>

        {/* customer playbook */}
        <section id="use" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <Reveal className="lg:sticky lg:top-24">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
                Customer guide
              </span>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                How to use Helora after you sign up
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-zinc-400">
                Keep this checklist open during setup. It walks you from a new
                account to a live website widget, then shows your team how to
                manage leads every day.
              </p>
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm font-medium text-white">
                  Quick launch path
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    ["15 min", "Create workspace and invite your team"],
                    ["30 min", "Add services, FAQs, hours, and booking rules"],
                    ["45 min", "Customize the greeting and alert settings"],
                    ["60 min", "Install the snippet and run a test chat"],
                  ].map(([time, task]) => (
                    <div key={time} className="flex gap-4">
                      <span className="w-14 shrink-0 font-mono text-xs text-zinc-500">
                        {time}
                      </span>
                      <span className="text-sm leading-relaxed text-zinc-300">
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <Accordion
                type="single"
                defaultValue="customer-step-0"
                collapsible
                className="space-y-3"
              >
                {CUSTOMER_PLAYBOOK_STEPS.map((step, i) => (
                  <AccordionItem
                    key={step.title}
                    value={`customer-step-${i}`}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 data-[state=open]:bg-white/[0.05]"
                  >
                    <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-950 font-display text-base text-zinc-200">
                        {i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-semibold tracking-tight text-white">
                          {step.title}
                        </span>
                        <span className="mt-1 block text-sm font-normal leading-relaxed text-zinc-500">
                          {step.done}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pl-0 sm:pl-[52px]">
                      <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400">
                        {step.body}
                      </p>
                      <ul className="mt-5 space-y-3">
                        {step.checklist.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-sm leading-relaxed text-zinc-300"
                          >
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                              <Check className="size-3 text-zinc-200" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* pricing */}
        <section
          id="pricing"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20"
        >
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Simple pricing that{" "}
              <span className="font-display italic font-normal text-violet-300">
                pays for itself
              </span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-zinc-400">
              One booked appointment usually covers the month. Start free.
            </p>
            <SignedIn>
              <p className="mt-3 text-sm text-zinc-500">
                Already on Helora?{" "}
                <Link
                  href="/billing"
                  className="font-medium text-zinc-200 underline-offset-4 hover:underline"
                >
                  Manage your subscription →
                </Link>
              </p>
            </SignedIn>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {PRICING.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 90}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl border p-8",
                    plan.featured
                      ? "border-violet-400/40 bg-gradient-to-b from-violet-500/[0.12] to-transparent shadow-2xl shadow-violet-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  {plan.featured && (
                    <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="font-display text-5xl tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="mb-1.5 text-sm text-zinc-500">
                      {plan.cadence}
                    </span>
                  </div>
                  {plan.annualNote && (
                    <p className="mt-1.5 text-xs font-medium text-zinc-500">
                      {plan.annualNote}
                    </p>
                  )}
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-400">
                    {plan.blurb}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-zinc-300"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                          <Check className="size-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.ctaHref.startsWith("mailto:") ? (
                    <Button
                      asChild
                      size="lg"
                      className="mt-8 w-full rounded-full"
                      variant="neo"
                    >
                      <a href={plan.ctaHref}>{plan.cta}</a>
                    </Button>
                  ) : (
                    <>
                      <SignedOut>
                        <Button
                          asChild
                          size="lg"
                          className="mt-8 w-full rounded-full"
                          variant="neo"
                        >
                          <Link href={plan.ctaHref}>{plan.cta}</Link>
                        </Button>
                      </SignedOut>
                      <SignedIn>
                        <Button
                          asChild
                          size="lg"
                          className="mt-8 w-full rounded-full"
                          variant="neo"
                        >
                          <Link href="/billing">
                            {plan.featured
                              ? `Upgrade to ${plan.name}`
                              : `Choose ${plan.name}`}
                          </Link>
                        </Button>
                      </SignedIn>
                    </>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10">
            <ul className="mx-auto flex max-w-3xl flex-col gap-2 text-center text-xs leading-relaxed text-zinc-500">
              {PRICING_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* faq */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
          <Reveal className="text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Questions, answered
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-left text-base font-medium text-white hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-pretty leading-relaxed text-zinc-400">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>

        {/* cta band */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-violet-400/20 bg-gradient-to-b from-violet-500/[0.1] to-transparent px-6 py-16 text-center sm:px-12">
              <div className="pointer-events-none absolute -top-24 left-1/2 size-[460px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]" />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                  Turn your website into your{" "}
                  <span className="font-display italic font-normal text-violet-200">
                    best employee
                  </span>
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-zinc-400">
                  Set up Helora in minutes and start booking appointments
                  tonight. 14-day free trial — cancel anytime.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <SignedOut>
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-7"
                      variant="neo"
                    >
                      <Link href="/sign-up">
                        Start free <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-7"
                      variant="neo"
                    >
                      <Link href={DASHBOARD_URL}>
                        Open dashboard <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </SignedIn>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/15 bg-transparent px-7 text-white hover:bg-white/5 hover:text-white"
                  >
                    <a href={`mailto:${SALES_EMAIL}`}>Talk to sales</a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="text-sm font-semibold tracking-tight">Helora</span>
          </div>
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Helora AI. The AI front desk for med
            spas.
          </p>
          <div className="flex items-center gap-5 text-sm text-zinc-500">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <Link href="/guides" className="hover:text-white">
              Guides
            </Link>
            <SignedOut>
              <Link href="/sign-in" className="hover:text-white">
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href={DASHBOARD_URL} className="hover:text-white">
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </footer>
    </div>
  );
};
