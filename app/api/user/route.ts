import { NextRequest, NextResponse } from "next/server";
import type { ApiUserResponse, JsonValue } from "@/types/instagram";

// This route runs entirely on the server (Node.js runtime). The RapidAPI
// key/host are read from process.env here and are NEVER sent to the client.
export const runtime = "nodejs";
// Always fetch fresh data — user profile info changes frequently and we
// don't want to serve stale cached responses for a "lookup" tool.
export const dynamic = "force-dynamic";

const RAPIDAPI_BASE_URL = "https://flashapi1.p.rapidapi.com/ig/info_username/";

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const { searchParams } = new URL(request.url);
  const usernameRaw = searchParams.get("username") ?? searchParams.get("user") ?? "";
  const username = usernameRaw.trim().replace(/^@/, "");

  if (!username) {
    return NextResponse.json<ApiUserResponse>(
      {
        success: false,
        data: null,
        meta: buildEmptyMeta(startedAt, 400),
        error: "Missing required query parameter: username",
      },
      { status: 400 }
    );
  }

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json<ApiUserResponse>(
      {
        success: false,
        data: null,
        meta: buildEmptyMeta(startedAt, 400),
        error:
          "Invalid username format. Instagram usernames may only contain letters, numbers, periods and underscores.",
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || "flashapi1.p.rapidapi.com";

  if (!apiKey) {
    return NextResponse.json<ApiUserResponse>(
      {
        success: false,
        data: null,
        meta: buildEmptyMeta(startedAt, 500),
        error:
          "Server misconfiguration: RAPIDAPI_KEY environment variable is not set. Add it in your Vercel Project Settings or .env.local file.",
      },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL(RAPIDAPI_BASE_URL);
  upstreamUrl.searchParams.set("user", username);
  upstreamUrl.searchParams.set("nocors", "false");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startedAt;
    const rawText = await upstreamResponse.text();
    const sizeBytes = new TextEncoder().encode(rawText).length;

    let parsed: JsonValue | null = null;
    let parseError: string | null = null;
    try {
      parsed = rawText ? (JSON.parse(rawText) as JsonValue) : null;
    } catch {
      parseError = "Upstream API returned a non-JSON response.";
    }

    const requestUrlForClient = `/api/user?username=${encodeURIComponent(username)}`;

    if (!upstreamResponse.ok) {
      return NextResponse.json<ApiUserResponse>(
        {
          success: false,
          data: parsed,
          meta: {
            requestUrl: requestUrlForClient,
            responseTimeMs,
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            sizeBytes,
            timestamp: new Date().toISOString(),
            cached: false,
          },
          error:
            parseError ??
            extractErrorMessage(parsed) ??
            `Upstream API responded with status ${upstreamResponse.status}.`,
        },
        { status: upstreamResponse.status }
      );
    }

    if (parseError) {
      return NextResponse.json<ApiUserResponse>(
        {
          success: false,
          data: null,
          meta: {
            requestUrl: requestUrlForClient,
            responseTimeMs,
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            sizeBytes,
            timestamp: new Date().toISOString(),
            cached: false,
          },
          error: parseError,
        },
        { status: 502 }
      );
    }

    return NextResponse.json<ApiUserResponse>(
      {
        success: true,
        data: parsed,
        meta: {
          requestUrl: requestUrlForClient,
          responseTimeMs,
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText || "OK",
          sizeBytes,
          timestamp: new Date().toISOString(),
          cached: false,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: unknown) {
    const responseTimeMs = Date.now() - startedAt;
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json<ApiUserResponse>(
      {
        success: false,
        data: null,
        meta: {
          requestUrl: `/api/user?username=${encodeURIComponent(username)}`,
          responseTimeMs,
          status: isAbort ? 504 : 500,
          statusText: isAbort ? "Gateway Timeout" : "Internal Server Error",
          sizeBytes: 0,
          timestamp: new Date().toISOString(),
          cached: false,
        },
        error: isAbort
          ? "The request to the upstream API timed out. Please try again."
          : `Failed to reach the upstream API: ${
              err instanceof Error ? err.message : "Unknown error"
            }`,
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}

function buildEmptyMeta(startedAt: number, status: number) {
  return {
    requestUrl: "",
    responseTimeMs: Date.now() - startedAt,
    status,
    statusText: status === 400 ? "Bad Request" : "Error",
    sizeBytes: 0,
    timestamp: new Date().toISOString(),
    cached: false,
  };
}

function extractErrorMessage(data: JsonValue | null): string | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, JsonValue>;
    for (const key of ["message", "error", "detail", "msg"]) {
      const value = obj[key];
      if (typeof value === "string") return value;
    }
  }
  return null;
}
