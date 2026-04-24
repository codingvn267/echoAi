import type { Metadata } from "next";
import { FinalCta } from "@/modules/marketing/ui/sections/final-cta";

export const metadata: Metadata = {
  title: "About",
  description:
    "echoAi is an embeddable AI customer support agent — chat and voice in one widget — built so small teams can support customers 24/7.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative pt-32 pb-12 sm:pt-40">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            About
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Built for teams who{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              hate repeat questions
            </span>
          </h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 prose prose-invert prose-lg leading-relaxed">
          <p className="text-lg text-muted-foreground">
            echoAi started with a simple frustration: small teams spend half their day answering the
            same support questions over and over. We thought, what if an AI agent could read your
            knowledge base, talk to customers in chat <em>and</em> on the phone, and only escalate
            the cases that actually need a human?
          </p>
          <p className="mt-6 text-lg text-muted-foreground">
            That's echoAi. One embeddable widget powered by Vapi for voice, Convex for realtime
            data, and Clerk for auth and multi-organization support. We obsess over making the
            handoff between AI and human invisible — your customers feel like they're getting
            instant, expert help no matter who (or what) is on the other end.
          </p>
          <p className="mt-6 text-lg text-muted-foreground">
            We're a small team building in the open. The full product is on{" "}
            <a
              className="text-primary hover:underline"
              href="https://github.com/tbot6677028-beep/echoAi"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>{" "}
            — fork it, self-host it, or just use the hosted version and let us run the boring parts.
          </p>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
