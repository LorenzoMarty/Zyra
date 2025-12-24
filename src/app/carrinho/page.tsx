"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export default function CartPage() {
  const { state, subtotal, dispatch } = useCart();
  const router = useRouter();

  if (state.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Carrinho</h1>
      <p className="mt-4 text-sm text-slate-500">
          Seu carrinho está vazio. Continue buscando produtos.
      </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Voltar para a busca
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Carrinho</h1>
      <p className="mt-2 text-sm text-slate-500">
        Este carrinho é uma intenção de compra. Valores e disponibilidade podem variar no Mercado Livre.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {state.items.map((item) => (
            <div
              key={item.product.id}
              className="rounded-2xl border border-cloud bg-white p-4 shadow-card"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.product.title}</p>
                  <p className="text-xs text-slate-500">Fonte: Mercado Livre</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-500" htmlFor={`qty-${item.product.id}`}>
                    Qtd
                  </label>
                  <input
                    id={`qty-${item.product.id}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      dispatch({
                        type: "UPDATE_QTY",
                        payload: {
                          id: item.product.id,
                          quantity: Number(event.target.value)
                        }
                      })
                    }
                    className="w-16 rounded-xl border border-cloud px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: "REMOVE_ITEM", payload: { id: item.product.id } })
                    }
                    className="text-xs text-slate-500 hover:text-brand-700"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl border border-cloud bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-ink">Resumo</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal estimado</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Você finaliza a compra no Mercado Livre. Itens podem variar de preço e estoque.
          </p>
          <button
            type="button"
            onClick={() => {
              trackEvent("checkout_clicked", { items: state.items.length });
              router.push("/checkout-redirect");
            }}
            className="mt-6 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Finalizar compra no Mercado Livre
          </button>
        </aside>
      </div>
    </main>
  );
}
