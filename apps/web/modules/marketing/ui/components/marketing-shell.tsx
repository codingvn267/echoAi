import Link from "next/link";

import { SALES_EMAIL } from "@/modules/marketing/constants";
import { StartFreeLink } from "@/modules/marketing/ui/components/start-free-link";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@workspace/ui/components/button";

// Lightweight header + footer wrapper for marketing sub-pages (guides, etc.)
// so they share the landing page's look without duplicating chrome.
export const MarketingShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-svh bg-[#0b0a12] font-sans text-zinc-100 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0a12]/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-4xl items-center gap-6 px-5">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="text-[15px] font-semibold tracking-tight">
              Helora
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-5 text-sm text-zinc-400">
            <Link href="/guides" className="hover:text-white">
              Guides
            </Link>
            <Link href="/#pricing" className="hover:text-white">
              Pricing
            </Link>
            <StartFreeLink
              className={buttonVariants({
                className: "rounded-full px-4",
                variant: "neo",
              })}
            />
          </div>
        </nav>
      </header>

      <main className="relative">{children}</main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="text-sm font-semibold tracking-tight">Helora</span>
          </div>
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Helora AI. The AI front desk for med
            spas.
          </p>
          <div className="flex items-center gap-5 text-sm text-zinc-500">
            <Link href="/guides" className="hover:text-white">
              Guides
            </Link>
            <Link href="/#pricing" className="hover:text-white">
              Pricing
            </Link>
            <a href={`mailto:${SALES_EMAIL}`} className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
