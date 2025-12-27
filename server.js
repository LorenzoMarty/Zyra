import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import cors from "cors";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
};

const ALLOWED_ORIGINS = new Set([
  "https://pink-vulture-671333.hostingersite.com",
  "http://localhost:3000"
]);

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.type("text/plain").send("API OK");
});

app.get("/health", (_req, res) => {
  console.log("[health]");
  res.json({ status: "ok" });
});

function normalizeImage(url = "") {
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function normalizeItems(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.map((item) => ({
    id: String(item.id ?? ""),
    title: item.title ?? "",
    price: Number(item.price ?? 0) || 0,
    currency_id: item.currency_id ?? "BRL",
    thumbnail: normalizeImage(item.thumbnail || item.secure_thumbnail || ""),
    permalink: item.permalink ?? ""
  }));
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

let cachedAccessToken = process.env.ML_ACCESS_TOKEN;
let cachedRefreshToken = process.env.ML_REFRESH_TOKEN;

function buildMlHeaders(token) {
  return {
    ...DEFAULT_HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function refreshAccessToken() {
  if (
    !cachedRefreshToken ||
    !process.env.MELI_CLIENT_ID ||
    !process.env.MELI_CLIENT_SECRET
  ) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    refresh_token: cachedRefreshToken
  });

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: body.toString(),
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || !data?.access_token) {
      console.warn("[ml-refresh] failed to refresh token", data);
      return null;
    }

    cachedAccessToken = data.access_token;
    cachedRefreshToken = data.refresh_token || cachedRefreshToken;
    console.log("[ml-refresh] token refreshed");
    return cachedAccessToken;
  } catch (error) {
    console.warn("[ml-refresh] unexpected error", error);
    return null;
  }
}

async function fetchMercadoLivre(url) {
  let token = cachedAccessToken;
  let response = await fetch(url, {
    headers: buildMlHeaders(token),
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = refreshed;
      response = await fetch(url, {
        headers: buildMlHeaders(token),
        cache: "no-store"
      });
    }
  }

  if ((response.status === 401 || response.status === 403) && token) {
    response = await fetch(url, {
      headers: buildMlHeaders(null),
      cache: "no-store"
    });
  }

  return response;
}

app.get("/search", async (req, res) => {
  const rawQ = req.query.q;
  if (!rawQ) {
    return res.status(400).json({ error: "query missing" });
  }
  const q = rawQ.toString();
  const offset = parsePositiveInt(req.query.offset, 0);
  const limit = parsePositiveInt(req.query.limit, 24);
  console.log(`[search] q=${q} offset=${offset} limit=${limit}`);

  const url = new URL("https://api.mercadolibre.com/sites/MLB/search");
  url.searchParams.set("q", q);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetchMercadoLivre(url.toString());

    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = raw;
    }

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, status: response.status, data });
    }

    const items = normalizeItems(data);
    const paging = {
      total: Number(data?.paging?.total ?? items.length) || 0,
      offset: Number(data?.paging?.offset ?? offset) || 0,
      limit: Number(data?.paging?.limit ?? limit) || limit
    };

    return res.json({ ok: true, q, paging, items });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || "unknown_error" });
  }
});

app.get("*", async (_req, res, next) => {
  const indexPath = path.join(process.cwd(), "public", "index.html");
  try {
    const html = await fs.readFile(indexPath, "utf8");
    res.type("html").send(html);
  } catch {
    next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on PORT ${PORT}`);
});
