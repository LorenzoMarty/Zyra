"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildAffiliateUrl } from "@/lib/affiliate";

type SearchItem = {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  thumbnail: string;
  permalink: string;
};

type SearchResponse = {
  ok: boolean;
  q?: string;
  items?: SearchItem[];
  error?: string;
  status?: number;
};

function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL"
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function BuscaContent() {
  const params = useSearchParams();
  const initialQuery = params.get("q") || "iphone";

  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async (term: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ml/search?q=${encodeURIComponent(term)}`);
      const data = (await response.json()) as SearchResponse;

      if (!response.ok || !data.ok) {
        setError(
          data.error || "Não foi possível buscar produtos agora."
        );
        setItems([]);
        return;
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError("Não foi possível buscar produtos agora.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(initialQuery);
  }, [initialQuery]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Buscar produtos</h1>
      <p className="mt-2 text-sm text-slate-500">
        Resultados do Mercado Livre. Você finaliza a compra no Mercado Livre.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          fetchItems(query.trim() || "iphone");
        }}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por produto"
          className="flex-1 rounded-xl border border-cloud bg-white px-4 py-3 text-sm shadow-soft"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Buscar
        </button>
      </form>

      {loading && (
        <p className="mt-6 text-sm text-slate-500">Buscando produtos...</p>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-cloud bg-white p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">Nenhum resultado encontrado.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col rounded-2xl border border-cloud bg-white p-4 shadow-card"
          >
            <div className="h-40 overflow-hidden rounded-xl bg-mist">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Sem imagem
                </div>
              )}
            </div>
            <h2 className="mt-4 text-sm font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {formatPrice(item.price, item.currency_id)}
            </p>
            <a
              href={buildAffiliateUrl(item.permalink)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 rounded-xl border border-cloud px-4 py-2 text-center text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700"
            >
              Ver no Mercado Livre
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}


export default function BuscaPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-5xl px-4 py-12"><p className="text-sm text-slate-500">Carregando busca...</p></main>}>
      <BuscaContent />
    </Suspense>
  );
}
