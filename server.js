import express from "express";
import cors from "cors";

const ALLOWED_ORIGINS = new Set([
  "https://zyra-drab.vercel.app",
  "https://pink-vulture-671333.hostingersite.com",
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

app.get("/search", async (req, res) => {
  const q = (req.query.q || "iphone").toString();
  console.log(`[search] q=${q}`);

  const url = new URL("https://api.mercadolibre.com/sites/MLB/search");
  url.searchParams.set("q", q);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "User-Agent": "Mozilla/5.0 (compatible; ZyraBot/1.0)"
      }
    });

    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ ok: false, status: response.status, data });
    }

    const items = normalizeItems(data);
    return res.json({ ok: true, q, items });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || "unknown_error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on PORT ${PORT}`);
});
