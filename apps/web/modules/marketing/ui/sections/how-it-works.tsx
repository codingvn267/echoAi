import { Code, PhoneCall, Inbox } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Code,
    title: "Embed the widget",
    description:
      "Drop one script tag on your site. Customize colors, greeting and suggestions in the dashboard.",
    code: `<script src="https://widget.helora.ai/widget.js"
  data-org-id="org_abc123" defer></script>`,
  },
  {
    num: "02",
    icon: PhoneCall,
    title: "Connect Vapi for voice",
    description:
      "Plug in your Vapi assistant and phone number. Customers can chat or call from the same widget.",
    code: `vapi: {
  assistantId: "asst_xyz",
  phoneNumber: "+1 555 010 1010"
}`,
  },
  {
    num: "03",
    icon: Inbox,
    title: "Step in only when needed",
    description:
      "AI handles 80–90%. Anything escalated lands in your team inbox with full conversation context.",
    code: `// status flows
"unresolved" → AI replies
   ↳ "escalated" → human takes over
   ↳ "resolved"  ✓`,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-32 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            From{" "}
            <em className="text-muted-foreground font-medium">
              "can a human help?"
            </em>{" "}
            to <span className="text-gradient-aurora">instant answers</span> in
            3 steps
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur"
              >
                {/* connector line for desktop */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-3 h-px w-6 bg-gradient-to-r from-border to-transparent" />
                )}

                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest">
                    {step.num}
                  </span>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {step.description}
                </p>

                <pre className="rounded-lg bg-muted/40 ring-1 ring-border/60 p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                  <code>{step.code}</code>
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
