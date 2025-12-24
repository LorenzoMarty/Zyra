import { describe, expect, it, beforeEach } from "vitest";
import { buildAffiliateLink } from "@/lib/affiliate";

describe("buildAffiliateLink", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_AFFILIATE_ID = "test-id";
    process.env.NEXT_PUBLIC_AFFILIATE_SOURCE = "test-source";
  });

  it("adds affiliate params to permalink", () => {
    const url = buildAffiliateLink("https://www.mercadolivre.com.br/produto");
    expect(url).toContain("matt_tool=test-id");
    expect(url).toContain("matt_word=test-source");
  });

  it("keeps existing query params", () => {
    const url = buildAffiliateLink(
      "https://www.mercadolivre.com.br/produto?foo=bar"
    );
    expect(url).toContain("foo=bar");
    expect(url).toContain("matt_tool=test-id");
  });
});
