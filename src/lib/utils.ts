import type { SearchParams } from "@/lib/types";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  }).format(value);
}

export function normalizeSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): SearchParams {
  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const min = parseNumber(getValue("min"));
  const max = parseNumber(getValue("max"));
  const rating = parseNumber(getValue("rating"));
  const page = parseNumber(getValue("page"));
  const pageSize = parseNumber(getValue("pageSize"));

  return {
    q: getValue("q") || undefined,
    category: getValue("category") || undefined,
    min,
    max,
    condition: (getValue("condition") as SearchParams["condition"]) || undefined,
    freeShipping: toBool(getValue("free_shipping")),
    fastDelivery: toBool(getValue("fast_delivery")),
    rating: rating ? Math.max(0, rating) : undefined,
    sort: (getValue("sort") as SearchParams["sort"]) || "relevance",
    page: page && page > 0 ? page : 1,
    pageSize: pageSize && pageSize > 0 ? pageSize : 12
  };
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    urlParams.set(key, String(value));
  });
  const query = urlParams.toString();
  return query ? `?${query}` : "";
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toBool(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }
  return value === "1" || value === "true" || value === "on";
}
