import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "We replaced our $400/mo support tool with Helora in a weekend. The voice + chat in one widget is exactly what we needed.",
    author: "Priya N.",
    role: "Founder, Linewise",
  },
  {
    quote:
      "Our AI now resolves 89% of tickets without a human. My team finally focuses on building the product, not answering emails.",
    author: "Marcus L.",
    role: "Head of Support, Polarbits",
  },
  {
    quote:
      "Multi-org was the killer feature for us. We run Helora for 7 different client brands from one dashboard.",
    author: "Sofia A.",
    role: "Agency owner, Brightline",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Loved by support teams
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Teams ship faster with{" "}
            <span className="text-gradient-aurora">
              Helora answering first
            </span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground/90 mb-6">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-violet-400/30 flex items-center justify-center text-sm font-semibold">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
