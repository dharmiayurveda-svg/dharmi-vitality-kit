import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { getManagedProducts } from "@/lib/product-store";
import kitProduct from "@/assets/kit-product.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop – Dharmi Ayurveda Weight Loss Products" },
      { name: "description", content: "Buy Noni Wellness Drink, Beautilook Capsules, Detox Tablets and the Complete Weight Loss Kit. Order now!" },
      { property: "og:title", content: "Shop Dharmi Ayurveda Products" },
      { property: "og:description", content: "Individual Ayurvedic weight loss products. Add to cart and order via WhatsApp." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [catalog, setCatalog] = useState(products);

  useEffect(() => {
    let active = true;

    getManagedProducts()
      .then((managedProducts) => {
        if (active) setCatalog(managedProducts);
      })
      .catch(() => {
        if (active) setCatalog(products);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalog.map((product)=> (
            <ProductCard key={product.id} product={product} />
          ))}
        </div> {/* this is written by the jaysinh */}
      </div>
    </section>
  );
}
