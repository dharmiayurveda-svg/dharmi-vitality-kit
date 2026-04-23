import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag } from "lucide-react";
import posterImg from "@/assets/weight-loss-poster.jpg";

const WHATSAPP_URL = "https://wa.me/916352663530?text=Hi%2C%20I%20want%20to%20order%20Dharmi%20Ayurveda%20Magical%20Weight%20Loss%20Kit";

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center gradient-hero overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              🌿 100% Natural Ayurvedic Formula
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl text-foreground leading-tight"
              style={{ fontFamily: "var(--font-cursive)", fontWeight: 400 }}
            >
              Lose Weight Naturally with{" "}
              <span className="text-gradient-gold">Ayurveda</span>
              <br />
              <span className="text-primary">– No Side Effects!</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Get visible results in just a few weeks with Dharmi Ayurveda Magical Kit. 
              Trusted by thousands across India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="whatsapp" size="xl" asChild className="hover-lift">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Order Now on WhatsApp
                </a>
              </Button>
              <Button variant="gold" size="xl" asChild className="hover-lift">
                <Link to="/shop">
                  <ShoppingBag className="h-5 w-5" />
                  Shop Products
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-2">
              {["100% Natural", "No Side Effects", "Trusted Brand"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in hidden lg:block">
            <div className="absolute -inset-4 bg-gold/20 rounded-2xl blur-2xl -z-10" />
            <img 
              src={posterImg} 
              alt="Premium Weight Loss Course" 
              className="rounded-2xl shadow-2xl border-4 border-white/50 w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
