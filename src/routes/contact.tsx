import { createFileRoute } from "@tanstack/react-router";
import ContactSection from "@/components/ContactSection";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us – Dharmi Ayurveda | WhatsApp & Call" },
      { name: "description", content: "Order your Dharmi Ayurveda Weight Loss Kit via WhatsApp or call +91 6352663530. Limited stock available!" },
      { property: "og:title", content: "Contact Dharmi Ayurveda – Order Now" },
      { property: "og:description", content: "Reach us on WhatsApp or call directly. Free consultation available." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return <ContactSection />;
}
