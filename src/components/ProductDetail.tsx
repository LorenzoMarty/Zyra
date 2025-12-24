"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/CartProvider";
import ProductCarousel from "@/components/ProductCarousel";
import { trackEvent } from "@/lib/analytics";

export default function ProductDetail({ product }: { product: Product }) {
  const { dispatch } = useCart();

  useEffect(() => {
    trackEvent("product_viewed", { productId: product.id });
  }, [product.id]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
          Fonte: Mercado Livre
        </span>
        <ProductCarousel images={product.pictures} alt={product.title} />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-ink">{product.title}</h1>
        <p className="text-3xl font-semibold text-brand-700">
          {formatPrice(product.price)}
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="text-brand-700">&#x2605;</span>
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviews_count} avaliações)</span>
        </div>
        <div className="rounded-xl border border-cloud p-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Vendedor</span>
            <span className="text-slate-800">{product.seller_name || "Mercado Livre"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Envio</span>
            <span className="text-slate-800">
              {product.shipping_free ? "Frete grátis" : "Consulte frete"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Condição</span>
            <span className="text-slate-800">
              {product.condition === "novo" ? "Novo" : "Usado"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "ADD_ITEM", payload: { product } });
              trackEvent("add_to_cart", { productId: product.id });
            }}
            className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Adicionar ao carrinho
          </button>
          <a
            href={product.affiliate_link}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("outbound_click", { productId: product.id })}
            className="rounded-xl border border-cloud px-4 py-3 text-center text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700"
          >
            Ver no Mercado Livre
          </a>
          <Link
            href="/carrinho"
            className="text-center text-xs text-slate-500 hover:text-brand-700"
          >
            Ir para o carrinho
          </Link>
        </div>
        <div className="rounded-xl border border-cloud bg-brand-50 p-4 text-xs text-brand-700">
          Você finaliza sua compra no Mercado Livre. Este site não realiza checkout.
        </div>
      </div>
    </div>
  );
}
