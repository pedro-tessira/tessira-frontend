import { LandingNav } from "../components/LandingNav";
import { HeroSection } from "../components/HeroSection";
import { ModulesSection } from "../components/ModulesSection";
import { WhySection } from "../components/WhySection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { SocialProofSection } from "../components/SocialProofSection";
import { CTASection } from "../components/CTASection";
import { LandingFooter } from "../components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <ModulesSection />
      <WhySection />
      <HowItWorksSection />
      <SocialProofSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
