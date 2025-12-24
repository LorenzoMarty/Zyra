"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export default function CheckoutRedirectPage() {
  const { state } = useCart();

  if (state.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Checkout</h1>
      <p className="mt-4 text-sm text-slate-500">
          Seu carrinho está vazio. Volte para a busca.
      </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ir para a home
        </Link>
      </main>
    );
  }

  const handleOpenAll = () => {
    state.items.forEach((item) => {
      window.open(item.product.affiliate_link, "_blank", "noopener,noreferrer");
    });
    trackEvent("outbound_click", { bulk: true, count: state.items.length });
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Checkout</h1>
      <p className="mt-3 text-sm text-slate-600">
        Você será direcionado ao Mercado Livre para concluir o pagamento com segurança.
      </p>
      <div className="mt-6 rounded-2xl border border-cloud bg-brand-50 p-5 text-sm text-brand-700">
        Não existe carrinho unificado no Mercado Livre. Abra cada item em nova aba ou finalize individualmente.
      </div>
      <div className="mt-6 space-y-4">
        {state.items.map((item) => (
          <div
            key={item.product.id}
            className="flex flex-col gap-3 rounded-2xl border border-cloud bg-white p-4 shadow-card md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{item.product.title}</p>
              <p className="text-xs text-slate-500">Qtd: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink">
                {formatPrice(item.product.price * item.quantity)}
              </span>
              <a
                href={item.product.affiliate_link}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("outbound_click", { productId: item.product.id })}
                className="rounded-xl border border-cloud px-4 py-2 text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700"
              >
                Comprar no Mercado Livre
              </a>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleOpenAll}
        className="mt-6 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Abrir todos os itens em novas abas
      </button>
      <p className="mt-4 text-xs text-slate-500">
        Ao clicar, seu navegador pode bloquear pop-ups. Caso isso aconteça, use os botões individuais.
      </p>
    </main>
  );
}
