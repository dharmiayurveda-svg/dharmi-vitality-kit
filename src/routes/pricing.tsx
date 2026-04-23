import { createFileRoute } from "@tanstack/react-router";
import PricingSection from "@/components/PricingSection";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing – Dharmi Ayurveda Weight Loss Kit ₹15,600" },
      { name: "description", content: "Get the complete Dharmi Ayurveda Weight Loss Kit for ₹15,600. Free diet plan, free consultation, no courier charges." },
      { property: "og:title", content: "Pricing – Dharmi Ayurveda Weight Loss Kit" },
      { property: "og:description", content: "₹15,600 all-inclusive. Free diet plan, consultation, and lifetime support." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return <PricingSection />;
}
