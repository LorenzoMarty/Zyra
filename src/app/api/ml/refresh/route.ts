import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

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

function missingEnv(keys: string[]): string[] {
  return keys.filter((key) => !process.env[key]);
}

async function readJsonSafe(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { raw: text };
  }
}

export async function POST() {
  const missing = missingEnv([
    "MELI_CLIENT_ID",
    "MELI_CLIENT_SECRET",
    "ML_REFRESH_TOKEN"
  ]);

  if (missing.length) {
    return jsonError("missing_env", 500, { missing });
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.MELI_CLIENT_ID as string,
    client_secret: process.env.MELI_CLIENT_SECRET as string,
    refresh_token: process.env.ML_REFRESH_TOKEN as string
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

  const data = await readJsonSafe(response);

  if (!response.ok) {
    return jsonError("refresh_failed", response.status, { data });
  }

  const {
    access_token,
    refresh_token,
    expires_in,
    scope
  } = data as Record<string, unknown>;

  // DEV ONLY: in production, store tokens securely (DB/secret manager).
  return NextResponse.json(
    {
      access_token,
      refresh_token,
      expires_in,
      scope
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
