import express from "express";
import cors from "cors";

const ALLOWED_ORIGINS = new Set([
  "https://zyra-drab.vercel.app",
  "http://localhost:3000"
]);

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

app.get("/", (_req, res) => {
  res.type("text/plain").send("API OK");
});

app.get("/health", (_req, res) => {
  console.log("[health]");
  res.json({ ok: true });
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

app.get("/search", async (req, res) => {
  const q = (req.query.q || "iphone").toString();
  const offset = parsePositiveInt(req.query.offset, 0);
  const limit = parsePositiveInt(req.query.limit, 24);
  console.log(`[search] q=${q} offset=${offset} limit=${limit}`);

  const url = new URL("https://api.mercadolibre.com/sites/MLB/search");
  url.searchParams.set("q", q);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; ZyraProxy/1.0)"
      }
    });

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on PORT ${PORT}`);
});
