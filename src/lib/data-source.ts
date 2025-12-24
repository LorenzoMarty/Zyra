import { categories } from "@/data/mock/categories";
import { mockProducts } from "@/data/mock/products";
import { trendingProducts } from "@/data/mock/trends";
import { buildAffiliateLink } from "@/lib/affiliate";
import type { Category, Product, SearchParams, SearchResponse } from "@/lib/types";
import { headers } from "next/headers";

const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE || "real";

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getTrendingProducts(): Promise<Product[]> {
  if (DATA_MODE === "real") {
    try {
      const response = await searchProductsReal({
        q: "mais vendidos",
        sort: "sold_desc",
        page: 1,
        pageSize: 6
      });
      return response.items;
    } catch {
      return trendingProducts;
    }
  }
  return trendingProducts;
}

export async function searchProducts(
  params: SearchParams
): Promise<SearchResponse> {
  if (DATA_MODE === "real") {
    try {
      return await searchProductsReal(params);
    } catch {
      return searchProductsMock(params);
    }
  }
  return searchProductsMock(params);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (DATA_MODE === "real") {
    try {
      return await fetchProductReal(id);
    } catch {
      return mockProducts.find((product) => product.id === id) || null;
    }
  }
  return mockProducts.find((product) => product.id === id) || null;
}

async function searchProductsMock(params: SearchParams): Promise<SearchResponse> {
  const filtered = applyFilters(mockProducts, params);
  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize
  };
}

function applyFilters(products: Product[], params: SearchParams): Product[] {
  let items = [...products];

  if (params.q) {
    const query = params.q.toLowerCase();
    items = items.filter((product) =>
      [product.title, product.category_name, ...product.tags]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  if (params.category) {
    items = items.filter(
      (product) => product.category_id === params.category
    );
  }

  if (typeof params.min === "number") {
    items = items.filter((product) => product.price >= params.min!);
  }

  if (typeof params.max === "number") {
    items = items.filter((product) => product.price <= params.max!);
  }

  if (params.condition) {
    items = items.filter((product) => product.condition === params.condition);
  }

  if (params.freeShipping) {
    items = items.filter((product) => product.shipping_free);
  }

  if (params.fastDelivery) {
    items = items.filter((product) => product.tags.includes("entrega_rapida"));
  }

  if (params.rating) {
    items = items.filter((product) => product.rating >= (params.rating || 0));
  }

  switch (params.sort) {
    case "price_asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "sold_desc":
      items.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      break;
    default:
      items.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      break;
  }

  return items;
}

const ML_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
};

let cachedAccessToken: string | undefined = process.env.ML_ACCESS_TOKEN;

function getMlHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { ...ML_HEADERS };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function getOriginFromHeaders(): string {
  const headerStore = headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = headerStore.get("host");
  const proto = forwardedProto || "http";
  const resolvedHost = forwardedHost || host || "localhost:3000";
  return `${proto}://${resolvedHost}`;
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshUrl = new URL("/api/ml/refresh", getOriginFromHeaders());
  const response = await fetch(refreshUrl, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Record<string, unknown>;
  const token = data.access_token as string | undefined;
  if (token) {
    cachedAccessToken = token;
    return token;
  }
  return null;
}

async function searchProductsReal(
  params: SearchParams
): Promise<SearchResponse> {
  const site = "MLB";
  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const offset = (page - 1) * pageSize;

  const url = new URL(`https://api.mercadolibre.com/sites/${site}/search`);

  const categoryName =
    params.category && !params.category.startsWith("MLB")
      ? categories.find((category) => category.id === params.category)?.name
      : undefined;

  const mergedQuery = [params.q, categoryName].filter(Boolean).join(" ");

  if (mergedQuery) {
    url.searchParams.set("q", mergedQuery);
  } else if (!params.category || !params.category.startsWith("MLB")) {
    url.searchParams.set("q", "ofertas");
  }

  if (params.category && params.category.startsWith("MLB")) {
    url.searchParams.set("category", params.category);
  }

  const sortMap: Record<NonNullable<SearchParams["sort"]>, string> = {
    relevance: "relevance",
    price_asc: "price_asc",
    price_desc: "price_desc",
    sold_desc: "sold_quantity_desc"
  };

  if (params.sort && params.sort !== "relevance") {
    url.searchParams.set("sort", sortMap[params.sort]);
  }

  if (params.condition) {
    url.searchParams.set("condition", params.condition === "novo" ? "new" : "used");
  }

  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(pageSize));

  let token = cachedAccessToken || process.env.ML_ACCESS_TOKEN;
  let response = await fetch(url.toString(), {
    headers: getMlHeaders(token),
    next: { revalidate: 120 }
  });

  if (response.status === 401 || response.status === 403) {
    const refreshedToken = await tryRefreshToken();
    if (refreshedToken) {
      token = refreshedToken;
      response = await fetch(url.toString(), {
        headers: getMlHeaders(token),
        next: { revalidate: 120 }
      });
    }
  }

  if ((response.status === 401 || response.status === 403) && token) {
    response = await fetch(url.toString(), {
      headers: getMlHeaders(),
      next: { revalidate: 120 }
    });
  }

  if (!response.ok) {
    throw new Error("Mercado Livre API error");
  }

  const data = await response.json();
  const results = (data.results || []) as Array<Record<string, any>>;

  let items: Product[] = results.map((item) => {
    const permalink = item.permalink as string;
    const condition = item.condition === "new" ? "novo" : "usado";
    const thumbnail = normalizeImageUrl(item.thumbnail);
    const resolvedCategoryName = categoryName || item.category_id || "";

    return {
      id: String(item.id),
      title: item.title || "",
      price: Number(item.price) || 0,
      thumbnail,
      pictures: thumbnail ? [thumbnail] : [],
      permalink,
      affiliate_link: buildAffiliateLink(permalink),
      category_id: item.category_id || "",
      category_name: resolvedCategoryName,
      rating: Number(item.rating_average) || 0,
      reviews_count: Number(item.reviews?.total) || 0,
      shipping_free: Boolean(item.shipping?.free_shipping),
      condition,
      seller_name: item.seller?.nickname,
      tags: Array.isArray(item.tags) ? item.tags : [],
      sold: Number(item.sold_quantity) || 0
    };
  });

  const effectiveParams = {
    ...params,
    category:
      params.category && params.category.startsWith("MLB")
        ? params.category
        : undefined
  };

  items = applyFilters(items, effectiveParams);

  return {
    items,
    total: Number(data.paging?.total) || items.length,
    page,
    pageSize
  };
}

async function fetchProductReal(id: string): Promise<Product | null> {
  let token = cachedAccessToken || process.env.ML_ACCESS_TOKEN;
  let response = await fetch(`https://api.mercadolibre.com/items/${id}`, {
    headers: getMlHeaders(token),
    next: { revalidate: 120 }
  });

  if (response.status === 401 || response.status === 403) {
    const refreshedToken = await tryRefreshToken();
    if (refreshedToken) {
      token = refreshedToken;
      response = await fetch(`https://api.mercadolibre.com/items/${id}`, {
        headers: getMlHeaders(token),
        next: { revalidate: 120 }
      });
    }
  }

  if ((response.status === 401 || response.status === 403) && token) {
    response = await fetch(`https://api.mercadolibre.com/items/${id}`, {
      headers: getMlHeaders(),
      next: { revalidate: 120 }
    });
  }

  if (!response.ok) {
    throw new Error("Mercado Livre API error");
  }

  const data = (await response.json()) as Record<string, any>;
  const permalink = data.permalink as string;
  const thumbnail = normalizeImageUrl(data.thumbnail);
  const pictures = Array.isArray(data.pictures)
    ? data.pictures
        .map((picture: Record<string, any>) => normalizeImageUrl(picture.url))
        .filter(Boolean)
    : [];

  return {
    id: String(data.id),
    title: data.title || "",
    price: Number(data.price) || 0,
    thumbnail,
    pictures: pictures.length ? pictures : thumbnail ? [thumbnail] : [],
    permalink,
    affiliate_link: buildAffiliateLink(permalink),
    category_id: data.category_id || "",
    category_name: data.category_id || "",
    rating: Number(data.rating_average) || 0,
    reviews_count: Number(data.sold_quantity) || 0,
    shipping_free: Boolean(data.shipping?.free_shipping),
    condition: data.condition === "new" ? "novo" : "usado",
    seller_name: data.seller_id ? `Vendedor ${data.seller_id}` : undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    sold: Number(data.sold_quantity) || 0
  };
}

function normalizeImageUrl(url?: string): string {
  if (!url) {
    return "";
  }
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}
