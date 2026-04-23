import { Button } from "@/components/ui/button";
import { Check, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/916352663530?text=Hi%2C%20I%20want%20to%20order%20Dharmi%20Ayurveda%20Magical%20Weight%20Loss%20Kit";

const perks = [
  "Free personalized diet plan",
  "Free consultation with experts",
  "No courier charges",
  "Lifetime support",
  "Daily follow-up included",
  "100% money-back guarantee",
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">Special Offer</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Invest in Your <span className="text-gradient-gold">Health</span>
          </h2>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative rounded-3xl bg-card border-2 border-gold/30 p-8 sm:p-10 shadow-gold">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground text-sm font-bold px-5 py-1.5 rounded-full">
              Most Popular
            </div>

            <div className="text-center mb-8">
              <h3 className="font-heading text-xl font-semibold text-foreground">Complete Weight Loss Kit</h3>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground font-heading">₹15,600</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">One-time purchase • All inclusive</p>
            </div>

            <ul className="space-y-3 mb-8">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>

            <Button variant="whatsapp" size="xl" className="w-full" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Order Now
              </a>
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔥 Limited stock available – Order today!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
