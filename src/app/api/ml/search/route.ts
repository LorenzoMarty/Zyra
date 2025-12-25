import { NextResponse } from "next/server";

import { MlSearchError, searchMl } from "@/lib/ml/search";
import type { MlSearchResponse } from "@/lib/ml/types";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const DEFAULT_LIMIT = 12;
const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  expiresAt: number;
  value: MlSearchResponse;
};

const memoryCache = new Map<string, CacheEntry>();

function parseNumberParam(value: string | null, fallback: number): number {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function cacheKey(q: string, offset: number, limit: number) {
  return `${q}::${offset}::${limit}`;
}

function getFromCache(key: string) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key: string, value: MlSearchResponse) {
  memoryCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const offset = parseNumberParam(searchParams.get("offset"), 0);
  const limit = parseNumberParam(searchParams.get("limit"), DEFAULT_LIMIT);

  if (!q) {
    return NextResponse.json(
      { ok: false, error: "missing_query", status: 400 },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const key = cacheKey(q, offset, limit);
  const cached = getFromCache(key);
  if (cached) {
    return NextResponse.json(
      { ok: true, items: cached.items, paging: cached.paging },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const result = await searchMl(q, offset, limit);
    setCache(key, result);

    return NextResponse.json(
      { ok: true, items: result.items, paging: result.paging },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof MlSearchError) {
      if (error.status === 403) {
        return NextResponse.json(
          { ok: false, error: "forbidden", status: 403 },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { ok: false, error: "upstream_error", status: error.status },
        { status: error.status || 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: false, error: "unexpected_error", status: 500 },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
