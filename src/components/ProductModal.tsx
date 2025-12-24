"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import ProductCarousel from "@/components/ProductCarousel";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

export default function ProductModal({
  product,
  onClose,
  onAddToCart
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-soft">
        <button
          type="button"
          aria-label="Fechar modal"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-cloud px-3 py-1 text-sm text-slate-600"
        >
          Fechar
        </button>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
              Fonte: Mercado Livre
            </span>
            <ProductCarousel images={product.pictures} alt={product.title} />
            <div className="rounded-xl border border-cloud bg-mist p-4 text-xs text-slate-500">
              Você finaliza sua compra no Mercado Livre. Este site apenas organiza sua busca.
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">{product.title}</h2>
              <p className="mt-2 text-2xl font-semibold text-brand-700">
                {formatPrice(product.price)}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <span className="text-brand-700">&#x2605;</span>
                <span>{product.rating.toFixed(1)}</span>
                <span>({product.reviews_count} avaliações)</span>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-cloud p-4 text-sm text-slate-600">
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
                onClick={onAddToCart}
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
                href={`/produto/${product.id}`}
                className="text-center text-xs text-slate-500 hover:text-brand-700"
              >
                Ver página interna
              </Link>
            </div>
            <div className="rounded-xl border border-cloud bg-brand-50 p-4 text-xs text-brand-700">
              Fonte: Mercado Livre. Pagamento e conclusão do pedido acontecem no Mercado Livre.
            </div>
          </div>
        </div>
        {product.pictures.length === 0 && (
          <div className="mt-6 rounded-xl bg-mist p-4 text-sm text-slate-500">
            Nenhuma imagem disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
}
