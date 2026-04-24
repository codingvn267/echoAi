import { MarketingHeader } from "@/modules/marketing/ui/components/marketing-header";
import { MarketingFooter } from "@/modules/marketing/ui/components/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-background text-foreground antialiased relative">
      <MarketingHeader />
      <main className="relative">{children}</main>
      <MarketingFooter />
    </div>
  );
}
