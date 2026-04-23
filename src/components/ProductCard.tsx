import { useEffect, useState } from "react";
import { ShoppingCart, Check, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type Product } from "@/contexts/CartContext";
import kitProduct from "@/assets/kit-product.jpg";
import { calculateDiscountPercentage, formatCurrency } from "@/lib/order-utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const imgSrc = product.id === "complete-weight-loss-kit" ? kitProduct : product.image;
  const [imageFailed, setImageFailed] = useState(!imgSrc);
  const inCart = items.some((item) => item.product.id === product.id);
  const discountPercentage = calculateDiscountPercentage(product.price, product.originalPrice);

  useEffect(() => {
    setImageFailed(!imgSrc);
  }, [imgSrc]);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover-lift flex flex-col">
      <div className="aspect-square bg-surface flex items-center justify-center p-4 overflow-hidden">
        {imageFailed ? (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/70 px-4 text-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">Image will appear once added from admin.</p>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{product.category}</span>
        <h3 className="font-heading text-lg font-semibold text-foreground mt-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-2 flex-1">{product.description}</p>

        <div className="mt-4 flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-foreground font-heading">{formatCurrency(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
          {discountPercentage > 0 ? (
            <span className="text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
              {discountPercentage}% OFF
            </span>
          ) : null}
        </div>

        <Button variant={added || inCart ? "default" : "cta"} size="lg" className="w-full mt-4" onClick={handleAdd}>
          {added ? (
            <>
              <Check className="h-5 w-5" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
