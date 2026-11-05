import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Msg } from "@/lib/llm";

// lib/llm reads provider env at module load, so each test stubs env + fetch,
// then dynamic-imports a fresh copy. These tests prove the provider ladder
// degrades to null (callers then use their deterministic fallback) and never throws.

const msgs: Msg[] = [{ role: "user", content: "hi" }];

function resp(body: unknown, status = 200): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
}

beforeEach(() => vi.resetModules());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("lib/llm provider ladder & fallback", () => {
  it("returns null when no provider answers (no key + Ollama unreachable)", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    const { complete } = await import("@/lib/llm");
    expect(await complete(msgs)).toBeNull();
  });

  it("returns the model text on a successful Gemini response", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      resp({ candidates: [{ content: { parts: [{ text: "hello there" }] } }] }),
    ));
    const { complete } = await import("@/lib/llm");
    expect(await complete(msgs)).toBe("hello there");
  });

  it("retries once on a 503 overload, then returns null", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue(resp("overloaded", 503));
    vi.stubGlobal("fetch", fetchMock);
    const { complete } = await import("@/lib/llm");
    expect(await complete(msgs)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns null on invalid credentials (HTTP 400) without throwing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "bad-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resp("invalid", 400)));
    const { complete } = await import("@/lib/llm");
    expect(await complete(msgs)).toBeNull();
  });

  it("returns null on a malformed / empty response body", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resp({ candidates: [] })));
    const { complete } = await import("@/lib/llm");
    expect(await complete(msgs)).toBeNull();
  });

  it("returns null on a provider timeout / abort without crashing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")));
    const { complete } = await import("@/lib/llm");
    expect(await complete(msgs)).toBeNull();
  });
});
