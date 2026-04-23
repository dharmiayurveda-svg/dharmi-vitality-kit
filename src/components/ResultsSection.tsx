import { Star } from "lucide-react";
import transformationImg from "@/assets/transformation.png";

const testimonials = [
  { name: "Priya S.", location: "Mumbai", stars: 5, text: "Lost 12 kg in 2 months! The diet plan and daily support made all the difference. Highly recommend!" },
  { name: "Rajesh K.", location: "Delhi", stars: 5, text: "I tried many products before, but Dharmi Ayurveda actually works. No side effects and I feel so much more energetic." },
  { name: "Anita M.", location: "Ahmedabad", stars: 5, text: "The best investment I made for my health. Lost 8 kg and my digestion has improved tremendously." },
];

export default function ResultsSection() {
  return (
    <section id="results" className="py-20 sm:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">Real Results</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Transformation <span className="text-gradient-gold">Stories</span>
          </h2>
        </div>

        <div className="mb-16 max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-nature">
            <img
              src={transformationImg}
              alt="Before and after weight loss transformation"
              width={1024}
              height={600}
              loading="lazy"
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
              <p className="text-primary-foreground font-heading text-xl font-bold">Real transformations. Real people.</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-surface border border-border">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
