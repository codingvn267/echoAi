import {
  MessageCircle,
  Mic,
  BookOpen,
  Palette,
  Building2,
  Plug,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  className: string;
  gradient: string;
};

const FEATURES: Feature[] = [
  {
    title: "Live AI Chat",
    description:
      "Realtime conversations powered by Convex. Resolved, escalated or unresolved — at a glance for your operators.",
    icon: MessageCircle,
    className: "md:col-span-2 md:row-span-2",
    gradient: "from-primary/30 via-primary/5 to-transparent",
  },
  {
    title: "Voice Calls (Vapi)",
    description:
      "Same widget, one tap to call. Pick your assistant, language and voice in seconds.",
    icon: Mic,
    className: "",
    gradient: "from-violet-500/20 via-transparent to-transparent",
  },
  {
    title: "Knowledge Base",
    description: "Upload PDFs, docs and links. Helora cites your content when it answers.",
    icon: BookOpen,
    className: "",
    gradient: "from-pink-500/20 via-transparent to-transparent",
  },
  {
    title: "Widget Customization",
    description: "Greeting, suggestions, theme — branded to feel native to your site.",
    icon: Palette,
    className: "",
    gradient: "from-amber-500/20 via-transparent to-transparent",
  },
  {
    title: "Multi-Organization",
    description: "Run multiple brands or clients from one Clerk account, fully isolated.",
    icon: Building2,
    className: "",
    gradient: "from-emerald-500/20 via-transparent to-transparent",
  },
  {
    title: "Integrations",
    description:
      "Vapi for voice, Clerk for auth, Convex for realtime, Sentry for monitoring — wired and ready out of the box.",
    icon: Plug,
    className: "md:col-span-2",
    gradient: "from-cyan-500/20 via-transparent to-transparent",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Everything your support stack needs —{" "}
            <span className="text-gradient-aurora">
              in one widget
            </span>
            .
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[180px]">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-all hover:border-primary/40 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5 ${feature.className}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100 ${feature.gradient}`}
                />
                <div className="relative flex flex-col h-full">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
