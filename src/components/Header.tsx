import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import CartDrawer from "@/components/CartDrawer";

export default function Header() {
  return (
    <header className="relative z-30">
      <div className="sticky top-0 z-40 bg-brand-50 text-brand-700 text-sm py-2 text-center">
        Produtos encontrados no Mercado Livre. Ao finalizar, você será direcionado ao Mercado Livre para pagamento e conclusão do pedido.
      </div>
      <div className="border-b border-cloud bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:grid md:grid-cols-[auto,1fr,auto] md:items-center md:gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="brand-logo" aria-label="ZYRA">
              <span className="brand-icon" aria-hidden="true" />
              <span className="brand-wordmark" aria-hidden="true" />
              <span className="sr-only">ZYRA</span>
            </Link>
            <span className="hidden text-sm text-slate-500 md:inline">
              Busca inteligente com transparência
            </span>
          </div>
          <div className="hidden w-full max-w-xl md:block md:justify-self-center">
            <Suspense fallback={<div className="h-11 rounded-xl bg-mist" />}>
              <SearchBar size="sm" />
            </Suspense>
          </div>
          <div className="flex items-center gap-3 md:gap-4 md:justify-self-end">
            <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
              <Link href="/como-funciona" className="hover:text-brand-700">
                Como funciona
              </Link>
              <Link href="/privacidade" className="hover:text-brand-700">
                Privacidade
              </Link>
              <Link href="/termos" className="hover:text-brand-700">
                Termos
              </Link>
              <Link href="/carrinho" className="hover:text-brand-700">
                Carrinho
              </Link>
            </nav>
            <CartDrawer />
          </div>
        </div>
        <div className="px-4 pb-4 md:hidden">
          <Suspense fallback={<div className="h-11 rounded-xl bg-mist" />}>
            <SearchBar size="sm" />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
