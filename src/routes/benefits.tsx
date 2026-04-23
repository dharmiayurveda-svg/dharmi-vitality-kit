import { createFileRoute } from "@tanstack/react-router";
import BenefitsSection from "@/components/BenefitsSection";
import WhatsIncludedSection from "@/components/WhatsIncludedSection";

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Benefits – Dharmi Ayurveda Weight Loss Kit" },
      { name: "description", content: "Fast weight loss, improved digestion, boosted metabolism, belly fat reduction, detox, and more energy." },
      { property: "og:title", content: "Benefits – Dharmi Ayurveda Weight Loss Kit" },
      { property: "og:description", content: "Discover all the powerful benefits of our Ayurvedic weight loss formula." },
    ],
  }),
  component: BenefitsPage,
});

function BenefitsPage() {
  return (
    <>
      <BenefitsSection />
      <WhatsIncludedSection />
    </>
  );
}
