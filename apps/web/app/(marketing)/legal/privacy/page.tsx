import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How echoAi collects, uses, and protects your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 24, 2026</p>

      <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. What we collect</h2>
          <p>
            We collect the information you provide when you sign up (name, email), the data your
            organization uses inside echoAi (knowledge base content, conversation transcripts,
            widget settings), and standard product telemetry (page views, errors, performance).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. How we use it</h2>
          <p>
            Your data powers your echoAi instance — the AI uses your knowledge base to answer
            customers, and conversations are stored so your team can review and improve them. We
            do not train shared AI models on your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Sub-processors</h2>
          <p>
            echoAi runs on Convex (database + functions), Clerk (authentication), Vapi (voice AI),
            and Sentry (error monitoring). These providers process data on our behalf under data
            processing agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Your rights</h2>
          <p>
            You can export or delete your organization's data at any time from the dashboard. For
            requests under GDPR, CCPA, or similar laws, email{" "}
            <a className="text-primary hover:underline" href="mailto:privacy@echoai.app">
              privacy@echoai.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Contact</h2>
          <p>
            Questions? Email{" "}
            <a className="text-primary hover:underline" href="mailto:hello@echoai.app">
              hello@echoai.app
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
