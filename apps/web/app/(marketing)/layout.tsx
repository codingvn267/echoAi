import { MarketingHeader } from "@/modules/marketing/ui/components/marketing-header";
import { MarketingFooter } from "@/modules/marketing/ui/components/marketing-footer";
import { SmoothScrollProvider } from "@/modules/marketing/ui/components/smooth-scroll-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <div className="marketing-aurora min-h-screen bg-background text-foreground antialiased relative">
        <MarketingHeader />
        <main className="relative">{children}</main>
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
