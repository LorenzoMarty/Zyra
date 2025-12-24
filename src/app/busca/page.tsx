"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildMlSearchUrl } from "@/lib/mlRedirect";

export default function BuscaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [mlUrl, setMlUrl] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
    setMlUrl(buildMlSearchUrl(initialQuery));
  }, [initialQuery]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    const nextUrl = `/busca?q=${encodeURIComponent(value)}`;
    router.replace(nextUrl);

    const targetUrl = buildMlSearchUrl(value);
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const hasQuery = useMemo(() => !!(query && query.trim()), [query]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Buscar produtos</h1>
      <p className="mt-2 text-sm text-slate-500">
        Voce sera direcionado ao Mercado Livre para ver resultados e finalizar a compra.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por produto, marca ou categoria"
          className="flex-1 rounded-xl border border-cloud bg-white px-4 py-3 text-sm shadow-soft"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Buscar
        </button>
      </form>

      {hasQuery && mlUrl && (
        <div className="mt-6 space-y-3 rounded-2xl border border-cloud bg-white p-4 shadow-card">
          <p className="text-sm text-slate-600">
            Voce sera direcionado ao Mercado Livre para ver os resultados desta busca.
          </p>
          <a
            href={mlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-cloud px-4 py-2 text-sm text-brand-700 hover:border-brand-500 hover:text-brand-500"
          >
            Ver resultados no Mercado Livre
          </a>
        </div>
      )}
    </main>
  );
}
