import { Zap, Flame, Droplets, Battery, Scale, Salad } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const benefits = [
  { icon: Scale, title: "Fast Weight Loss Support", desc: "Accelerate your journey to a healthier body" },
  { icon: Salad, title: "Improves Digestion", desc: "Better nutrient absorption and gut health" },
  { icon: Flame, title: "Boosts Metabolism", desc: "Burn calories more efficiently all day" },
  { icon: Droplets, title: "Reduces Belly Fat", desc: "Target stubborn fat areas naturally" },
  { icon: Zap, title: "Detoxifies Body", desc: "Flush out toxins for a cleaner system" },
  { icon: Battery, title: "Increases Energy", desc: "Feel more active and vibrant daily" },
];

export default function BenefitsSection() {
  const headerRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll animate-fade-in-up">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Powerful <span className="text-gradient-gold">Benefits</span>
          </h2>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-2xl bg-surface border border-border hover:shadow-nature transition-all duration-300 hover-lift">
              <div className="h-12 w-12 rounded-xl gradient-green flex-shrink-0 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
