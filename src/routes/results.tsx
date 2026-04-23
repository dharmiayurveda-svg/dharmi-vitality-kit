import { createFileRoute } from "@tanstack/react-router";
import ResultsSection from "@/components/ResultsSection";
import VideoSection from "@/components/VideoSection";
import ResultsCommentsSection from "@/components/ResultsCommentsSection";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results & Testimonials – Dharmi Ayurveda" },
      { name: "description", content: "See real before and after transformations, videos, and approved customer reviews." },
      { property: "og:title", content: "Real Results – Dharmi Ayurveda Weight Loss Kit" },
      { property: "og:description", content: "Watch real videos and read approved reviews from Dharmi Ayurveda customers." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  return (
    <>
      <ResultsSection />
      <VideoSection />
      <ResultsCommentsSection />
    </>
  );
}
