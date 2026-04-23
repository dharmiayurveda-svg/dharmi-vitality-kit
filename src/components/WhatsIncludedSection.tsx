import { Package, ClipboardList, HeadphonesIcon, BarChart3 } from "lucide-react";

const items = [
  { icon: Package, title: "Weight Loss Kit Products", desc: "Complete kit with premium Ayurvedic formulations" },
  { icon: ClipboardList, title: "Personalized Diet Plan", desc: "Customized meal plans for your body type" },
  { icon: HeadphonesIcon, title: "Daily Follow-up Support", desc: "Our experts guide you every single day" },
  { icon: BarChart3, title: "Weekly Progress Check", desc: "Track results with regular assessments" },
];

export default function WhatsIncludedSection() {
  return (
    <section className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">Complete Package</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            What's <span className="text-gradient-gold">Included</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
              <div className="mx-auto h-16 w-16 rounded-2xl gradient-gold flex items-center justify-center mb-5">
                <Icon className="h-8 w-8 text-gold-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{desc}</p>
              <div className="mt-4 text-xs font-bold text-gold">Step {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
