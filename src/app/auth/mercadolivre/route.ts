import { NextResponse } from "next/server";

const AUTH_URL = "https://auth.mercadolivre.com.br/authorization";

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
  const missing = missingEnv(["MELI_CLIENT_ID", "MELI_REDIRECT_URI"]);
  if (missing.length) {
    return jsonError("missing_env", 500, { missing });
  }

  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.MELI_CLIENT_ID as string,
    redirect_uri: process.env.MELI_REDIRECT_URI as string
  });

  if (state) {
    params.set("state", state);
  }

  const redirectUrl = `${AUTH_URL}?${params.toString()}`;
  return NextResponse.redirect(redirectUrl);
}
