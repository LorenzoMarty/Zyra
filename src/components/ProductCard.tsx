import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart
}: ProductCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-cloud bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="rounded-full bg-brand-50 px-2 py-1 text-brand-700">
            Fonte: Mercado Livre
          </span>
          <span>{product.condition === "novo" ? "Novo" : "Usado"}</span>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-mist">
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={400}
            height={320}
            className="h-40 w-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-ink">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
            {product.shipping_free && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                Frete grátis
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-brand-700">&#x2605;</span>
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.reviews_count})</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="rounded-xl border border-cloud px-3 py-2 text-sm text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
        >
          Ver detalhes
        </button>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Adicionar ao carrinho
        </button>
        <a
          href={product.affiliate_link}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("outbound_click", { productId: product.id })}
          className="rounded-xl border border-cloud px-3 py-2 text-center text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700"
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
    </article>
  );
}
