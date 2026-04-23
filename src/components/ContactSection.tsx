import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, MapPin } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/916352663530?text=Hi%2C%20I%20want%20to%20order%20Dharmi%20Ayurveda%20Magical%20Weight%20Loss%20Kit";
const PHONE = "tel:+916352663530";
const MAPS_URL = "https://maps.app.goo.gl/hvYnFvZhSxmhQ8fZ9?g_st=ac";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">Get in Touch</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Ready to Start Your <span className="text-gradient-gold">Journey?</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Contact us today to order your kit or get a free consultation. Our team is here to support you every step of the way.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="whatsapp" size="xl" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href={PHONE}>
                <Phone className="h-5 w-5" />
                Call Now
              </a>
            </Button>
          </div>

          <p className="mt-6 text-sm font-semibold text-destructive animate-pulse">
            🔥 Limited stock available – Order today!
          </p>
        </div>

        {/* Location Card */}
        <div className="mt-16 max-w-xl mx-auto">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-nature">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-semibold text-foreground">Our Location</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dharmi Ayurveda, Rk Iconic B, 803, 150 Feet Ring Rd, Sheetal Park, Puneet Nagar, Bajrang Wadi, Rajkot, Gujarat 360006
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
