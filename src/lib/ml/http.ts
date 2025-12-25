const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  "User-Agent": "Mozilla/5.0 (compatible; ZyraBot/1.0; +https://zyra-drab.vercel.app)"
};

type ParseMode = "json" | "text";

export type MlHttpSuccess<T> = {
  ok: true;
  status: number;
  data: T;
  rawText: string;
};

export type MlHttpError = {
  ok: false;
  status: number;
  error: string;
  rawText: string;
};

export type MlHttpResult<T> = MlHttpSuccess<T> | MlHttpError;

async function readBody<T>(response: Response, mode: ParseMode) {
  const rawText = await response.text();
  if (mode === "text") {
    return { rawText, data: rawText as unknown as T };
  }

  try {
    const parsed = rawText ? (JSON.parse(rawText) as T) : ({} as T);
    return { rawText, data: parsed };
  } catch {
    return { rawText, data: undefined };
  }
}

export async function mlFetch<T = unknown>(
  url: string,
  init?: RequestInit & { parse?: ParseMode }
): Promise<MlHttpResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const parseMode = init?.parse ?? "json";
  const { data, rawText } = await readBody<T>(response, parseMode);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: `HTTP ${response.status}`,
      rawText
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as T,
    rawText
  };
}
