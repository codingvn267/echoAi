import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { EchoSignalHero } from "../components/echo-signal-hero";
import { MagneticWrapper } from "../components/magnetic-wrapper";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <EchoSignalHero />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[620px] items-center lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="max-w-2xl py-16 text-left">
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <span className="h-px w-8 bg-primary" />
              AI support for chat and voice
            </div>

            <h1 className="mt-7 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Resolve more conversations before they reach your team.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Helora handles routine questions across chat and voice, keeps the
              full context, and brings in a person when judgment is required.
            </p>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <MagneticWrapper>
                <Button
                  asChild
                  size="lg"
                  variant="neo"
                  className="h-11 rounded-md px-6 text-base"
                >
                  <Link href="/sign-up">Start free</Link>
                </Button>
              </MagneticWrapper>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-11 rounded-md px-5 text-base"
              >
                <Link href="#how">
                  See the workflow
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              No credit card required. Install on one site in minutes.
            </p>
          </div>
          <div aria-hidden="true" className="hidden lg:block" />
        </div>

        {/* Hero product card preview */}
        <div className="relative mt-4 sm:mt-10">
          <div className="relative mx-auto max-w-5xl rounded-xl border border-border/70 bg-card/80 p-2 shadow-xl shadow-foreground/5 backdrop-blur-xl">
            <div className="rounded-xl bg-background/80 overflow-hidden">
              {/* fake browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-green-400/70" />
                <span className="ml-3 text-xs text-muted-foreground">
                  app.helora.ai/conversations
                </span>
              </div>

              <div className="grid sm:grid-cols-[260px_1fr] min-h-[380px]">
                {/* Conversations list */}
                <div className="border-r border-border/60 p-3 space-y-1.5">
                  {[
                    {
                      name: "Maria K.",
                      msg: "Where's my order?",
                      status: "AI",
                      time: "2m",
                    },
                    {
                      name: "John D.",
                      msg: "Refund question",
                      status: "AI",
                      time: "8m",
                    },
                    {
                      name: "Acme Corp.",
                      msg: "Need to talk to a human",
                      status: "ESC",
                      time: "12m",
                      active: true,
                    },
                    {
                      name: "Lily B.",
                      msg: "Pricing for teams",
                      status: "AI",
                      time: "1h",
                    },
                    {
                      name: "Sam P.",
                      msg: "Demo scheduled",
                      status: "✓",
                      time: "3h",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`rounded-lg px-3 py-2.5 text-sm ${c.active ? "bg-primary/15 ring-1 ring-primary/30" : "hover:bg-accent/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {c.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate pr-2">
                          {c.msg}
                        </span>
                        <span
                          className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                            c.status === "ESC"
                              ? "bg-amber-500/20 text-amber-500"
                              : c.status === "✓"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-primary/20 text-primary"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live conversation */}
                <div className="p-5 space-y-3 bg-gradient-to-br from-background/50 to-primary/5">
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm max-w-md">
                      Hey, I want to upgrade my plan but the checkout keeps
                      failing.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-md">
                      I see your last attempt at 14:32. Looks like a 3DS
                      challenge timed out — want me to send a new secure link to
                      your email?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm max-w-md">
                      Yes please.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-md">
                      Done — sent to maria@acme.com. Anything else?
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      AI handled · 0 escalations needed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
