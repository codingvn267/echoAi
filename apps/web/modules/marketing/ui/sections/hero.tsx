import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { MeshBackground } from "../components/mesh-background";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <MeshBackground />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            New · Voice + Chat support in one widget
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            An AI agent that handles your
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-pink-400 bg-clip-text text-transparent">
              chat and voice support
            </span>
            <span className="text-muted-foreground italic font-medium"> — while you sleep.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Drop the echoAi widget on your site. It chats with visitors, answers calls in your
            voice, and quietly hands off to your team only when it really matters.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full h-12 px-7 text-base shadow-lg shadow-primary/20">
              <Link href="/sign-up">
                <Sparkles className="h-4 w-4" />
                Start free
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full h-12 px-7 text-base">
              <Link href="#how">
                See how it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card · Embed in under 5 minutes · Chat + voice in one widget
          </p>
        </div>

        {/* Hero product card preview */}
        <div className="relative mt-16 sm:mt-24">
          <div className="absolute inset-x-0 -top-20 mx-auto h-72 max-w-3xl rounded-full bg-primary/20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/60 p-2 backdrop-blur-xl shadow-2xl shadow-primary/10">
            <div className="rounded-xl bg-background/80 overflow-hidden">
              {/* fake browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-green-400/70" />
                <span className="ml-3 text-xs text-muted-foreground">app.echoai.app/conversations</span>
              </div>

              <div className="grid sm:grid-cols-[260px_1fr] min-h-[380px]">
                {/* Conversations list */}
                <div className="border-r border-border/60 p-3 space-y-1.5">
                  {[
                    { name: "Maria K.", msg: "Where's my order?", status: "AI", time: "2m" },
                    { name: "John D.", msg: "Refund question", status: "AI", time: "8m" },
                    { name: "Acme Corp.", msg: "Need to talk to a human", status: "ESC", time: "12m", active: true },
                    { name: "Lily B.", msg: "Pricing for teams", status: "AI", time: "1h" },
                    { name: "Sam P.", msg: "Demo scheduled", status: "✓", time: "3h" },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`rounded-lg px-3 py-2.5 text-sm ${c.active ? "bg-primary/15 ring-1 ring-primary/30" : "hover:bg-accent/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate pr-2">{c.msg}</span>
                        <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                          c.status === "ESC" ? "bg-amber-500/20 text-amber-500" :
                          c.status === "✓" ? "bg-green-500/20 text-green-500" :
                          "bg-primary/20 text-primary"
                        }`}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live conversation */}
                <div className="p-5 space-y-3 bg-gradient-to-br from-background/50 to-primary/5">
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm max-w-md">
                      Hey, I want to upgrade my plan but the checkout keeps failing.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-md">
                      I see your last attempt at 14:32. Looks like a 3DS challenge timed out — want me to send a new secure link to your email?
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
