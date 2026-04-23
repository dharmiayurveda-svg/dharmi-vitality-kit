import { useReveal } from "@/hooks/useReveal";

const ingredients = [
  { name: "Amla", emoji: "🫐" },
  { name: "Triphala", emoji: "🌿" },
  { name: "Ginger", emoji: "🫚" },
  { name: "Garlic", emoji: "🧄" },
  { name: "Turmeric", emoji: "🟡" },
  { name: "Aloe Vera", emoji: "🌱" },
  { name: "Guggul", emoji: "🪵" },
  { name: "Cinnamon", emoji: "🫘" },
  { name: "Black Pepper", emoji: "⚫" },
  { name: "Honey", emoji: "🍯" },
  { name: "Lemon Extract", emoji: "🍋" },
  { name: "Green Tea Extract", emoji: "🍵" },
  { name: "Vidanga", emoji: "🌿" },
  { name: "Pippali", emoji: "🌶️" },
  { name: "Chitrak", emoji: "🪵" },
  { name: "Gokhru", emoji: "🌱" },
  { name: "Ajwain", emoji: "🌿" },
  { name: "Punarnava", emoji: "🌿" },
  { name: "Mulethi", emoji: "🪵" },
  { name: "Fenugreek", emoji: "🫘" },
  { name: "Fennel Seed", emoji: "🌿" },
  { name: "Cardamom", emoji: "🫘" },
  { name: "Brahmi", emoji: "🧠" },
  { name: "Shatavari", emoji: "🌱" },
  { name: "Ashwagandha", emoji: "🌿" },
  { name: "Giloy", emoji: "🌿" },
  { name: "Tulsi", emoji: "🍃" },
  { name: "Neem", emoji: "🌿" },
  { name: "Vijaysar", emoji: "🪵" },
  { name: "Nagarmotha", emoji: "🌿" },
  { name: "Kutki", emoji: "🪵" },
  { name: "Herbal Mix (48+ herbs)", emoji: "🌺" },
];

export default function IngredientsSection() {
  const headerRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="ingredients" className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll animate-fade-in-up">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest">Natural Ingredients</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Pure <span className="text-gradient-gold">Ayurvedic</span> Ingredients
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Each ingredient is carefully selected from ancient Ayurvedic texts for maximum effectiveness.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
          {ingredients.map(({ name, emoji }) => (
            <div
              key={name}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-nature transition-all duration-300 hover-lift"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="font-medium text-foreground text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
