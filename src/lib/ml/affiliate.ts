const AFFILIATE_ID = process.env.NEXT_PUBLIC_AFFILIATE_ID || "";
const AFFILIATE_SOURCE = process.env.NEXT_PUBLIC_AFFILIATE_SOURCE || "";

function normalizePermalink(permalink: string): string {
  if (!permalink) return "";
  return permalink.startsWith("http://") ? permalink.replace("http://", "https://") : permalink;
}

export function buildAffiliateUrl(permalink: string): string {
  const normalized = normalizePermalink(permalink);
  if (!normalized) return "";

  try {
    const url = new URL(normalized);

    if (AFFILIATE_ID) {
      url.searchParams.set("matt_tool", AFFILIATE_ID);
    }

    if (AFFILIATE_SOURCE) {
      url.searchParams.set("matt_word", AFFILIATE_SOURCE);
    }

    return url.toString();
  } catch {
    return normalized;
  }
}
