import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-violet-500/10 to-pink-500/10 p-10 sm:p-16 text-center backdrop-blur-xl">
          {/* glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
            Stop answering the same{" "}
            <span className="text-gradient-aurora">
              support tickets
            </span>{" "}
            <em className="text-muted-foreground font-medium">over and over.</em>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Embed Helora today. Let the AI handle the easy 90% so your team can focus on the 10% that matters.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" variant="neo" className="rounded-full h-12 px-8 text-base">
              <Link href="/sign-up">
                Start free — no card needed
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full h-12 px-8 text-base">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
