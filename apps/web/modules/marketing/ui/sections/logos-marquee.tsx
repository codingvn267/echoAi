const ITEMS = [
  "Live chat",
  "AI voice calls",
  "Knowledge base",
  "Multi-organization",
  "Vapi voice AI",
  "Convex realtime",
  "Clerk auth",
];

export function LogosMarquee() {
  return (
    <section className="border-y border-border/60 bg-background/40 py-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Built on a modern, production-grade stack
        </p>

        <div className="relative">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
              <span
                key={i}
                className="text-base sm:text-lg font-medium text-muted-foreground/80 flex items-center gap-12"
              >
                {item}
                <span className="text-muted-foreground/40">·</span>
              </span>
            ))}
          </div>

          {/* edge fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
        </div>

        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-33.333%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee { animation: none; }
          }
        `}</style>
      </div>
    </section>
  );
}
