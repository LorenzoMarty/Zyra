"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { useCart } from "@/components/CartProvider";
import { trackEvent } from "@/lib/analytics";

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const { dispatch } = useCart();

  const handleAddToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: { product } });
    trackEvent("add_to_cart", { productId: product.id });
  };

  const items = useMemo(() => products, [products]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-cloud bg-white p-10 text-center text-sm text-slate-500">
        Nenhum produto encontrado. Ajuste os filtros e tente novamente.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product, index) => (
          <div key={product.id} style={{ animationDelay: `${index * 40}ms` }}>
            <div className="animate-fade-up">
              <ProductCard
                product={product}
                onQuickView={(item) => {
                  setSelected(item);
                  trackEvent("product_viewed", { productId: item.id });
                }}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAddToCart={() => handleAddToCart(selected)}
        />
      )}
    </>
  );
}
