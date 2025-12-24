"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { state, itemCount, subtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative rounded-full border border-cloud px-4 py-2 text-sm text-slate-600 hover:border-brand-500"
        aria-label="Abrir carrinho"
      >
        Carrinho
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
            {itemCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-sm bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">Seu carrinho</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-cloud px-3 py-1 text-sm text-slate-600"
              >
                Fechar
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {state.items.length === 0 ? (
                <p className="text-sm text-slate-500">Carrinho vazio por enquanto.</p>
              ) : (
                state.items.map((item) => (
                  <div key={item.product.id} className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-mist" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{item.product.title}</p>
                      <p className="text-xs text-slate-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-sm text-ink">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 space-y-3 border-t border-cloud pt-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal estimado</span>
                <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/carrinho"
                className="block rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
                onClick={() => setIsOpen(false)}
              >
                Ver carrinho
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
