import { ShieldCheck, Leaf, Users } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const badges = [
  { icon: Leaf, label: "100% Natural" },
  { icon: ShieldCheck, label: "No Side Effects" },
  { icon: Users, label: "Trusted by 10,000+ Customers" },
];

export default function TrustBadges() {
  const ref = useReveal();

  return (
    <div className="bg-primary py-6">
      <div ref={ref} className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 stagger-children">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-primary-foreground">
            <Icon className="h-5 w-5" />
            <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
