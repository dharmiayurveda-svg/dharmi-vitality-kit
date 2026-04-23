import { Link } from "@tanstack/react-router";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.jpg";

const WHATSAPP_URL = "https://wa.me/916352663530?text=Hi%2C%20I%20want%20to%20order%20Dharmi%20Ayurveda%20Magical%20Weight%20Loss%20Kit";
const MAPS_URL = "https://maps.app.goo.gl/hvYnFvZhSxmhQ8fZ9?g_st=ac";

export default function Footer() {
  return (
    <footer className="bg-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Dharmi Ayurveda" className="h-12 w-12 rounded-full object-cover" />
              <span className="font-heading text-xl font-bold text-primary-foreground">Dharmi Ayurveda</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Helping India lose weight naturally with the power of Ayurveda. 100% natural, zero side effects.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", to: "/" as const },
                { label: "Shop", to: "/shop" as const },
                { label: "Results", to: "/results" as const },
                { label: "About", to: "/about" as const },
                { label: "Ingredients", to: "/ingredients" as const },
                { label: "Contact", to: "/contact" as const },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Contact & Location</h4>
            <div className="space-y-3">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Dharmi Ayurveda, Rk Iconic B, 803, 150 Feet Ring Rd, Sheetal Park, Puneet Nagar, Bajrang Wadi, Rajkot, Gujarat 360006</span>
              </a>
              <a href="tel:+916352663530" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 6352663530</span>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl overflow-hidden border border-primary-foreground/10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.169!2d70.774855!3d22.286837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959c9004c00b5ad%3A0xd2a92353cb7348e5!2sDharmi%20Ayurveda!5e0!3m2!1sen!2sin!4v1700000000000"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Dharmi Ayurveda Location - Rajkot, Gujarat"
          />
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center space-y-2">
          <p className="text-primary-foreground/40 text-xs">© {new Date().getFullYear()} Dharmi Ayurveda. All rights reserved.</p>
          <p className="text-primary-foreground/40 text-xs">
            Created by{" "}
            <a 
              href="https://bhumitnasit.vercel.app/portfolio-site/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-foreground transition-colors"
            >
              BHUMIT NASIT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
