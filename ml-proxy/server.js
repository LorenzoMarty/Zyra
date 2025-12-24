import express from "express";
import cors from "cors";

const app = express();

const envAllowed = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const ALLOWED_ORIGINS = [
  "https://zyra-drab.vercel.app",
  "https://zyra-lorenzomarty-9203s-projects.vercel.app",
  "http://localhost:3000",
  ...envAllowed
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);

const SEARCH_URL = "https://api.mercadolibre.com/sites/MLB/search";

function normalizeImageUrl(url) {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function pickItems(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.map((item) => ({
    id: String(item.id ?? ""),
    title: item.title ?? "",
    price: Number(item.price ?? 0),
    currency_id: item.currency_id ?? "BRL",
    thumbnail: normalizeImageUrl(item.thumbnail),
    permalink: item.permalink ?? ""
  }));
}

app.get("/search", async (req, res) => {
  const q = (req.query.q || "iphone").toString();

  try {
    const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(q)}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; ZyraBot/1.0)"
      },
      cache: "no-store"
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return res
        .status(response.status)
        .set("cache-control", "no-store")
        .send(payload);
    }

    return res
      .status(200)
      .set("cache-control", "no-store")
      .json({
        ok: true,
        q,
        items: pickItems(payload)
      });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Erro inesperado ao buscar produtos.",
      status: 500
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ML proxy listening on port ${PORT}`);
});
