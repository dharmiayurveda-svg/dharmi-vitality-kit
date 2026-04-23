import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/916352663530?text=Hi%2C%20I%20want%20to%20order%20Dharmi%20Ayurveda%20Magical%20Weight%20Loss%20Kit";

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-whatsapp text-whatsapp-foreground rounded-full px-5 py-3.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-semibold text-sm">WhatsApp</span>
    </a>
  );
}
