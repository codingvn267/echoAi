import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of echoAi.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 24, 2026</p>

      <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance</h2>
          <p>
            By creating an echoAi account or embedding our widget, you agree to these terms. If
            you don't agree, please don't use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Account & data</h2>
          <p>
            You are responsible for keeping your credentials secure and for the data your
            organization uploads. You retain all rights to your content; we only use it to operate
            the service for you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Acceptable use</h2>
          <p>
            Don't use echoAi to send spam, abuse customers, generate illegal content, or violate
            third-party rights. We may suspend accounts that violate this section.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Billing</h2>
          <p>
            Paid plans are billed monthly. You can cancel any time and keep access until the end
            of your billing period. Refunds are available within 14 days of the first charge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Liability</h2>
          <p>
            echoAi is provided "as is" without warranties. To the maximum extent permitted by law,
            our liability is limited to the amount you paid us in the previous 12 months.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact</h2>
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
