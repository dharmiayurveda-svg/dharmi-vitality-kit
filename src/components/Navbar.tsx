import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Results", to: "/results" as const },
  { label: "About", to: "/about" as const },
  { label: "Ingredients", to: "/ingredients" as const },
  { label: "Contact", to: "/contact" as const },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [adminUnlocking, setAdminUnlocking] = useState(false);
  const [cartLocked, setCartLocked] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cartTapsRef = useRef<{ count: number; first: number }>({ count: 0, first: 0 });

  const handleCartSecretTap = (event: React.MouseEvent) => {
    if (cartLocked) {
      event.preventDefault();
      return;
    }

    const now = Date.now();
    if (now - cartTapsRef.current.first > 1500) {
      cartTapsRef.current = { count: 1, first: now };
      return;
    }

    cartTapsRef.current.count += 1;

    if (cartTapsRef.current.count >= 5) {
      event.preventDefault();
      cartTapsRef.current = { count: 0, first: 0 };
      setCartLocked(true);
      setAdminUnlocking(true);
      setOpen(false);

      window.setTimeout(() => {
        navigate({ to: "/admin" });
      }, 650);

      window.setTimeout(() => {
        setAdminUnlocking(false);
        setCartLocked(false);
      }, 2600);
    }
  };

  const cartLinkClass = `relative transition-all ${
    adminUnlocking ? "text-primary scale-110" : "text-foreground hover:text-primary"
  } ${cartLocked ? "pointer-events-none opacity-70" : ""}`;

  const cartIcon = adminUnlocking ? <Shield className="h-5 w-5 animate-bounce" /> : <ShoppingCart className="h-5 w-5" />;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Dharmi Ayurveda" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">
              Dharmi <span className="text-gradient-gold">Ayurveda</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                preload="viewport"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-sm font-medium text-primary transition-colors" }}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/cart" preload="viewport" onClick={handleCartSecretTap} className={cartLinkClass} aria-disabled={cartLocked}>
              {cartIcon}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/profile" preload="viewport" className="text-foreground hover:text-primary transition-colors">
              {user?.photoURL ? <img src={user.photoURL} alt="User profile" className="h-7 w-7 rounded-full" /> : <User className="h-5 w-5" />}
            </Link>
            <Button variant="cta" size="sm" asChild>
              <Link to="/shop" preload="viewport">Order Now</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link to="/cart" preload="viewport" onClick={handleCartSecretTap} className={cartLinkClass} aria-disabled={cartLocked}>
              {cartIcon}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/profile" preload="viewport" className="text-foreground hover:text-primary transition-colors">
              {user?.photoURL ? <img src={user.photoURL} alt="User profile" className="h-7 w-7 rounded-full" /> : <User className="h-5 w-5" />}
            </Link>
            <button className="text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                preload="viewport"
                className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                activeProps={{ className: "text-sm font-medium text-primary py-2" }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/profile" preload="viewport" className="text-sm font-medium text-muted-foreground hover:text-primary py-2" onClick={() => setOpen(false)}>
              My Profile
            </Link>
            <Button variant="cta" size="sm" asChild>
              <Link to="/shop" preload="viewport" onClick={() => setOpen(false)}>Order Now</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
