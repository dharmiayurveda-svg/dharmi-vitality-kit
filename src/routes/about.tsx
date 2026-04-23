import { createFileRoute } from "@tanstack/react-router";
import AboutSection from "@/components/AboutSection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About – Dharmi Ayurveda Magical Weight Loss Kit" },
      { name: "description", content: "Learn about Dharmi Ayurveda's 100% natural, chemical-free Ayurvedic weight loss approach. Safe for daily use." },
      { property: "og:title", content: "About Dharmi Ayurveda – Natural Weight Loss" },
      { property: "og:description", content: "100% Ayurvedic, no chemicals, safe for daily use. Discover our natural approach to weight loss." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return <AboutSection />;
}
