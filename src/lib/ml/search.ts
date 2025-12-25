import { mlFetch } from "./http";
import type { MlItem, MlPaging, MlSearchOptions, MlSearchResponse } from "./types";

const SEARCH_URL = "https://api.mercadolibre.com/sites/MLB/search";

export class MlSearchError extends Error {
  status: number;
  rawText?: string;

  constructor(message: string, status: number, rawText?: string) {
    super(message);
    this.name = "MlSearchError";
    this.status = status;
    this.rawText = rawText;
  }
}

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

export async function searchMl(
  q: string,
  offset = 0,
  limit = 20,
  options?: MlSearchOptions
): Promise<MlSearchResponse> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));

  const result = await mlFetch<Record<string, unknown>>(url.toString(), {
    signal: options?.signal
  });

  if (!result.ok) {
    throw new MlSearchError("search_failed", result.status, result.rawText);
  }

  const data = result.data || {};
  const rawResults = Array.isArray((data as Record<string, unknown>).results)
    ? ((data as Record<string, unknown>).results as Record<string, unknown>[])
    : [];

  const items = rawResults.map(normalizeItem);
  const pagingData = (data as Record<string, unknown>).paging as Record<string, unknown> | undefined;

  const paging: MlPaging = {
    total: Number(pagingData?.total ?? items.length) || 0,
    offset: Number(pagingData?.offset ?? offset) || 0,
    limit: Number(pagingData?.limit ?? limit) || limit
  };

  return {
    items,
    paging
  };
}
