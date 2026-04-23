import { createFileRoute } from "@tanstack/react-router";
import IngredientsSection from "@/components/IngredientsSection";

export const Route = createFileRoute("/ingredients")({
  head: () => ({
    meta: [
      { title: "Ingredients – Dharmi Ayurveda Weight Loss Kit" },
      { name: "description", content: "Discover 48+ pure Ayurvedic ingredients including Amla, Triphala, Turmeric, Aloe Vera, and Green Tea Extract." },
      { property: "og:title", content: "Natural Ingredients – Dharmi Ayurveda" },
      { property: "og:description", content: "48+ carefully selected Ayurvedic herbs for maximum weight loss effectiveness." },
    ],
  }),
  component: IngredientsPage,
});

function IngredientsPage() {
  return <IngredientsSection />;
}
