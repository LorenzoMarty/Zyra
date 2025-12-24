export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/CategoryNav";
import ProductGrid from "@/components/ProductGrid";
import { getCategories, getTrendingProducts } from "@/lib/data-source";

export default async function HomePage() {
  const categories = await getCategories();
  const trending = await getTrendingProducts();

  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-cloud bg-white p-8 shadow-soft">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                Funil de busca Mercado Livre
              </p>
              <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
                Busque, filtre e organize sua compra com transparência.
              </h1>
              <p className="text-sm text-slate-500">
                Você encontra produtos do Mercado Livre aqui e finaliza o pagamento direto na plataforma oficial.
              </p>
              <Suspense fallback={<div className="h-14 rounded-2xl bg-mist" />}>
                <SearchBar size="lg" />
              </Suspense>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                  Fonte: Mercado Livre
                </span>
                <span className="rounded-full bg-mist px-3 py-1">
                  Checkout no Mercado Livre
                </span>
                <span className="rounded-full bg-mist px-3 py-1">
                  Links de afiliado
                </span>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl bg-brand-50 p-6">
              <h2 className="text-lg font-semibold text-ink">Atalhos rápidos</h2>
              <CategoryNav categories={categories} />
              <div className="rounded-xl border border-cloud bg-white p-4 text-xs text-slate-500">
                Este site pode receber comissão por links de afiliado sem custo extra para você.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink">Tendências no Mercado Livre</h2>
          <Link href="/busca" className="text-sm text-brand-700 hover:text-brand-500">
            Ver tudo
          </Link>
        </div>
        <ProductGrid products={trending} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "1. Pesquise",
              text: "Use filtros e categorias para encontrar o produto ideal."
            },
            {
              title: "2. Compare",
              text: "Veja detalhes, avaliações e fontes direto no nosso site."
            },
            {
              title: "3. Finalize",
              text: "Clique em finalizar compra e conclua com segurança no Mercado Livre."
            }
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-cloud bg-white p-6 shadow-card"
            >
              <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 text-sm text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
