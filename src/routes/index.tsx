import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import BenefitsSection from "@/components/BenefitsSection";
import ShopSection from "@/components/ShopSection";
import VideoSection from "@/components/VideoSection";
import ResultsCommentsSection from "@/components/ResultsCommentsSection";
import WhatsIncludedSection from "@/components/WhatsIncludedSection";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <ShopSection />
      <BenefitsSection />
      <WhatsIncludedSection />
      <VideoSection />
      <ResultsCommentsSection />
    </>
  );
}
