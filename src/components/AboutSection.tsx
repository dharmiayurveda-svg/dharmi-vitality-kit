import { Shield, Leaf, Heart, Sparkles } from "lucide-react";

const highlights = [
  { icon: Leaf, title: "100% Ayurvedic", desc: "Made from ancient herbal wisdom" },
  { icon: Shield, title: "No Chemicals", desc: "Zero artificial ingredients" },
  { icon: Heart, title: "Safe for Daily Use", desc: "Gentle on your body" },
  { icon: Sparkles, title: "Natural Fat Reduction", desc: "Works with your body's rhythm" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">About the Product</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            The Power of <span className="text-gradient-gold">Ancient Ayurveda</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Dharmi Ayurveda Magical Weight Loss Kit is crafted using a time-tested blend of 48+ 
            Ayurvedic herbs that work synergistically to support healthy, sustainable weight loss 
            without any side effects.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-surface border border-border hover:shadow-nature transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
