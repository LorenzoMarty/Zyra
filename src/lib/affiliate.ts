export function buildAffiliateUrl(permalink: string): string {
  const affiliateId = process.env.NEXT_PUBLIC_AFFILIATE_ID || "SEU_ID";
  const affiliateSource = process.env.NEXT_PUBLIC_AFFILIATE_SOURCE || "zyra";

  try {
    const url = new URL(permalink);
    url.searchParams.set("matt_tool", affiliateId);
    url.searchParams.set("matt_word", affiliateSource);
    return url.toString();
  } catch {
    const separator = permalink.includes("?") ? "&" : "?";
    return `${permalink}${separator}matt_tool=${encodeURIComponent(affiliateId)}&matt_word=${encodeURIComponent(affiliateSource)}`;
  }
}

export const buildAffiliateLink = buildAffiliateUrl;
