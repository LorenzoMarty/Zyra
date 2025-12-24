import { NextResponse } from "next/server";

const SEARCH_URL = "https://api.mercadolibre.com/sites/MLB/search";

type MlItem = {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  thumbnail: string;
  permalink: string;
};

function normalizeImageUrl(url?: string): string {
  if (!url) {
    return "";
  }
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function pickItems(data: Record<string, any>): MlItem[] {
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((item: Record<string, any>) => ({
    id: String(item.id),
    title: item.title || "",
    price: Number(item.price) || 0,
    currency_id: item.currency_id || "BRL",
    thumbnail: normalizeImageUrl(item.thumbnail),
    permalink: item.permalink || ""
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "iphone";

  try {
    const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(q)}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ZyraAffiliateSearch/1.0"
      },
      cache: "no-store"
    });

    if (response.status === 403) {
      return NextResponse.json(
        {
          ok: false,
          error: "Busca temporariamente indisponível nesta rede. Tente novamente mais tarde.",
          status: 403
        },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Não foi possível buscar produtos agora.",
          status: response.status
        },
        {
          status: response.status,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    const data = (await response.json()) as Record<string, any>;
    const items = pickItems(data);

    return NextResponse.json(
      {
        ok: true,
        q,
        items
      },
      {
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Erro inesperado ao buscar produtos.",
        status: 500
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
}
