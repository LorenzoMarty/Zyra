"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildAffiliateUrl } from "@/lib/ml/affiliate";
import type { MlItem, MlPaging } from "@/lib/ml/types";

type FetchMode = "auto" | "server" | "client";

type SearchResult = {
  items: MlItem[];
  paging: MlPaging;
  source: "server" | "client";
};

type SearchError = Error & { status?: number };

const LIMIT = 12;
const ENV_FETCH_MODE = (process.env.NEXT_PUBLIC_ML_FETCH_MODE as FetchMode) || "auto";

function normalizeImageUrl(url?: string): string {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function normalizeItem(item: Record<string, unknown>): MlItem {
  return {
    id: String(item.id ?? ""),
    title: (item.title as string) || "",
    price: Number(item.price ?? 0) || 0,
    currency_id: (item.currency_id as string) || "BRL",
    thumbnail: normalizeImageUrl(
      (item.thumbnail as string) ||
        (item.secure_thumbnail as string) ||
        (item.secure_url as string) ||
        ""
    ),
    permalink: (item.permalink as string) || ""
  };
}

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function createSearchError(message: string, status?: number): SearchError {
  const error = new Error(message) as SearchError;
  error.status = status;
  return error;
}

function parseOffset(value: string | null) {
  const parsed = Number(value ?? 0);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

function resolveMode(mode: FetchMode): FetchMode {
  if (mode === "server" || mode === "client") return mode;
  return "auto";
}

function shouldFallback(error: SearchError) {
  if (!error) return false;
  if (error.status === 403) return true;
  if (typeof error.status === "number" && error.status >= 500) return true;
  if (error.message === "network_error") return true;
  return false;
}

async function fetchServerSearch(
  q: string,
  offset: number,
  limit: number,
  signal: AbortSignal
): Promise<SearchResult> {
  let response: Response;

  try {
    response = await fetch(
      `/api/ml/search?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
      { signal, cache: "no-store" }
    );
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }
    throw createSearchError("network_error");
  }

  let payload: Record<string, any> = {};
  try {
    payload = (await response.json()) as Record<string, any>;
  } catch {
    // ignore parse errors to avoid blocking fallback
  }

  const status = payload?.status ?? response.status;

  if (!response.ok || !payload?.ok) {
    throw createSearchError(payload?.error || "server_error", status);
  }

  return {
    items: Array.isArray(payload.items) ? (payload.items as MlItem[]) : [],
    paging: (payload.paging as MlPaging) || { total: 0, offset, limit },
    source: "server"
  };
}

async function fetchClientSearch(
  q: string,
  offset: number,
  limit: number,
  signal: AbortSignal
): Promise<SearchResult> {
  const url = new URL("https://api.mercadolibre.com/sites/MLB/search");
  url.searchParams.set("q", q);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal, cache: "no-store" });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }
    throw createSearchError("network_error");
  }

  const rawText = await response.text();
  let data: Record<string, any> = {};
  try {
    data = rawText ? (JSON.parse(rawText) as Record<string, any>) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw createSearchError(data?.message || "client_http_error", response.status);
  }

  const items = Array.isArray(data.results)
    ? (data.results as Record<string, unknown>[]).map(normalizeItem)
    : [];

  const pagingData = (data.paging as Record<string, any>) || {};
  const paging: MlPaging = {
    total: Number(pagingData.total ?? items.length) || 0,
    offset: Number(pagingData.offset ?? offset) || offset,
    limit: Number(pagingData.limit ?? limit) || limit
  };

  return { items, paging, source: "client" };
}

function errorMessage(error: SearchError | null, mode: FetchMode) {
  if (!error) return "";
  if (error.status === 403) {
    return mode === "client"
      ? "Busca bloqueada nesta rede (CORS). Tente outra rede ou dispositivo."
      : "Busca bloqueada no servidor (403). Tentando via navegador...";
  }

  if (error.message === "network_error") {
    return "Conexao instavel. Verifique sua rede e tente novamente.";
  }

  if (typeof error.status === "number" && error.status >= 500) {
    return "Servico do Mercado Livre instavel no momento. Tente novamente em instantes.";
  }

  return "Nao foi possivel carregar os produtos agora.";
}

export default function BuscaPage() {
  const router = useRouter();
  const params = useSearchParams();

  const searchTerm = params.get("q")?.trim() || "";
  const offsetParam = parseOffset(params.get("offset"));

  const [query, setQuery] = useState(searchTerm);
  const [items, setItems] = useState<MlItem[]>([]);
  const [paging, setPaging] = useState<MlPaging | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [source, setSource] = useState<"server" | "client" | null>(null);

  const mode = useMemo(() => resolveMode(ENV_FETCH_MODE), []);

  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm) {
      setItems([]);
      setPaging(null);
      setError(null);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);
      setSource(null);

      try {
        let result: SearchResult;

        if (mode === "server") {
          result = await fetchServerSearch(searchTerm, offsetParam, LIMIT, controller.signal);
        } else if (mode === "client") {
          result = await fetchClientSearch(searchTerm, offsetParam, LIMIT, controller.signal);
        } else {
          try {
            result = await fetchServerSearch(searchTerm, offsetParam, LIMIT, controller.signal);
          } catch (serverError) {
            if (controller.signal.aborted) return;
            if (shouldFallback(serverError as SearchError)) {
              result = await fetchClientSearch(searchTerm, offsetParam, LIMIT, controller.signal);
            } else {
              throw serverError;
            }
          }
        }

        if (!active || controller.signal.aborted) return;
        setItems(result.items);
        setPaging(result.paging);
        setSource(result.source);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setItems([]);
        setPaging(null);
        setError(err as SearchError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [searchTerm, offsetParam, mode]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    const nextParams = new URLSearchParams(params.toString());
    nextParams.set("q", value);
    nextParams.set("offset", "0");
    router.replace(`/busca?${nextParams.toString()}`);
  };

  const handlePageChange = (nextOffset: number) => {
    const nextParams = new URLSearchParams(params.toString());
    nextParams.set("q", searchTerm);
    nextParams.set("offset", String(Math.max(0, nextOffset)));
    router.replace(`/busca?${nextParams.toString()}`);
  };

  const hasQuery = useMemo(() => !!(query && query.trim()), [query]);
  const hasResults = items.length > 0;
  const total = paging?.total ?? 0;
  const currentOffset = paging?.offset ?? offsetParam;

  const canPrev = currentOffset > 0;
  const canNext = paging ? currentOffset + paging.limit < total : false;

  const resolvedErrorMessage = errorMessage(error, mode);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-ink">Buscar produtos</h1>
        <p className="text-sm text-slate-500">
          Pesquise produtos do Mercado Livre. Tentamos pelo servidor e, se preciso, pelo seu
          navegador.
        </p>
      </div>

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

      {hasQuery && (
        <div className="mt-6 rounded-2xl border border-cloud bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Modo: {mode}
            </span>
            {source && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                Resultado via {source === "server" ? "servidor" : "navegador"}
              </span>
            )}
            {loading && <span className="text-slate-500">Carregando...</span>}
          </div>

          {resolvedErrorMessage && (
            <p className="mt-2 text-sm text-amber-700">{resolvedErrorMessage}</p>
          )}
        </div>
      )}

      {hasQuery && !loading && !hasResults && !resolvedErrorMessage && (
        <p className="mt-8 text-sm text-slate-500">Nenhum produto encontrado.</p>
      )}

      {hasResults && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-cloud bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="aspect-square w-full bg-slate-50">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="line-clamp-2 text-sm font-semibold text-ink">{item.title}</h2>
                <p className="text-lg font-bold text-brand-700">
                  {formatPrice(item.price, item.currency_id)}
                </p>
                <a
                  href={buildAffiliateUrl(item.permalink)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Ver no Mercado Livre
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {hasResults && paging && (
        <div className="mt-8 flex items-center justify-between rounded-xl border border-cloud bg-white p-4 shadow-card">
          <div className="text-sm text-slate-600">
            Mostrando {paging.offset + 1} -{" "}
            {Math.min(paging.offset + paging.limit, paging.total)} de {paging.total}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handlePageChange(currentOffset - paging.limit)}
              disabled={!canPrev || loading}
              className="rounded-lg border border-cloud px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentOffset + paging.limit)}
              disabled={!canNext || loading}
              className="rounded-lg border border-cloud px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proximo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
