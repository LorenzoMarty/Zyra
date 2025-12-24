import { NextResponse } from "next/server";

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

function missingEnv(keys: string[]): string[] {
  return keys.filter((key) => !process.env[key]);
}

function jsonError(message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json(
    { error: message, ...details },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function GET(request: Request) {
  const missing = missingEnv([
    "MELI_CLIENT_ID",
    "MELI_CLIENT_SECRET",
    "MELI_REDIRECT_URI"
  ]);

  if (missing.length) {
    return jsonError("missing_env", 500, { missing });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return jsonError("missing_code", 400);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.MELI_CLIENT_ID as string,
    client_secret: process.env.MELI_CLIENT_SECRET as string,
    code,
    redirect_uri: process.env.MELI_REDIRECT_URI as string
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: body.toString(),
    cache: "no-store"
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};

  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    return jsonError("token_exchange_failed", response.status, { data });
  }

  // DEV ONLY: return tokens as JSON. In production, store tokens securely.
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
