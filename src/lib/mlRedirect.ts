const AFFILIATE_ID = process.env.NEXT_PUBLIC_AFFILIATE_ID || "";
const AFFILIATE_SOURCE = process.env.NEXT_PUBLIC_AFFILIATE_SOURCE || "";

function slugify(query: string): string {
  return query
    .toLowerCase()
    .trim()
    // replace non-letters/numbers with hyphen
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function appendAffiliateParams(url: URL) {
  if (AFFILIATE_ID) {
    url.searchParams.set("matt_tool", AFFILIATE_ID);
  }
  if (AFFILIATE_SOURCE) {
    url.searchParams.set("matt_word", AFFILIATE_SOURCE);
  }
}

export function buildMlSearchUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "";
  }

  const base = "https://lista.mercadolivre.com.br";
  const slug = slugify(trimmed);

  let url: URL;
  if (slug) {
    url = new URL(`${base}/${slug}`);
  } else {
    url = new URL(base);
    url.searchParams.set("q", trimmed);
  }

  appendAffiliateParams(url);
  return url.toString();
}
