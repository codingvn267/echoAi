import { CheckCircle2, Clock, Layers, ShieldCheck } from "lucide-react";

// Reuses only facts already stated elsewhere on the page (hero tagline +
// meta description) — no new numbers or claims are introduced here.
const ITEMS = [
  { icon: CheckCircle2, label: "No credit card to start" },
  { icon: Clock, label: "Embed in under 5 minutes" },
  { icon: Layers, label: "Chat + voice in one widget" },
  { icon: ShieldCheck, label: "Escalates to a human when it matters" },
];

/** Compact "TL;DR" value strip shown just below the hero tagline. */
export function TldrStrip() {
  return (
    <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
      {ITEMS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-aurora-emerald" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
