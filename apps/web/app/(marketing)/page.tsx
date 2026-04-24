import { Hero } from "@/modules/marketing/ui/sections/hero";
import { LogosMarquee } from "@/modules/marketing/ui/sections/logos-marquee";
import { Features } from "@/modules/marketing/ui/sections/features";
import { HowItWorks } from "@/modules/marketing/ui/sections/how-it-works";
import { PricingPreview } from "@/modules/marketing/ui/sections/pricing-preview";
import { Testimonials } from "@/modules/marketing/ui/sections/testimonials";
import { Faq } from "@/modules/marketing/ui/sections/faq";
import { FinalCta } from "@/modules/marketing/ui/sections/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogosMarquee />
      <Features />
      <HowItWorks />
      <PricingPreview />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
