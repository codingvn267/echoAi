import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

const FAQS = [
  {
    q: "How do I install the widget?",
    a: "Paste one script tag (or iframe) on your site. The widget auto-loads with your organization's branding and knowledge base.",
  },
  {
    q: "Do I need a Vapi account for voice?",
    a: "Yes. Helora connects to your Vapi account, so you keep full control of your voice assistant, phone numbers and per-minute costs.",
  },
  {
    q: "What happens when the AI can't answer?",
    a: "The conversation is marked escalated and routed to your team inbox in the dashboard, with full message history and contact details.",
  },
  {
    q: "Can I run multiple brands or clients?",
    a: "Yes. Each Clerk organization is fully isolated — its own widget settings, conversations, knowledge base and Vapi integration.",
  },
  {
    q: "Is Helora open source?",
    a: "The repo is on GitHub. Self-host or use the hosted version — your call.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing page, no questions asked. You keep access until the end of your billing period.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Questions before you embed Helora
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border/60 bg-card/40 px-5 backdrop-blur"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
