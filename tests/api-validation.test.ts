import { describe, it, expect, vi, beforeEach } from "vitest";
import { encodeReport } from "@/lib/report-code";

const VALID_CODE = encodeReport({ rz: { 3: 5 }, ap: { 5: 1 }, eqA: { 2: 4 } });

beforeEach(() => vi.resetModules());

// ---------------------------------------------------------------------------
// POST /api/save — input validation + error handling
// ---------------------------------------------------------------------------
describe("POST /api/save", () => {
  async function loadSave(sql: unknown, userId: string | null = null) {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({ sql }));
    vi.doMock("@/lib/auth-server", () => ({ userIdFromRequest: async () => userId }));
    return (await import("@/app/api/save/route")).POST;
  }
  const req = (body: unknown) =>
    new Request("http://localhost/api/save", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  it("returns { slug: null } when the database is not configured", async () => {
    const POST = await loadSave(null);
    const res = await POST(req({ code: VALID_CODE }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ slug: null });
  });

  it("rejects a malformed/invalid report code without touching the DB", async () => {
    const sql = vi.fn().mockResolvedValue([]);
    const POST = await loadSave(sql);
    expect(await (await POST(req({ code: "not-a-valid-code" }))).json()).toEqual({ slug: null });
    expect(sql).not.toHaveBeenCalled();
  });

  it("handles a non-JSON request body without throwing", async () => {
    const sql = vi.fn().mockResolvedValue([]);
    const POST = await loadSave(sql);
    expect(await (await POST(req("not json {{{"))).json()).toEqual({ slug: null });
  });

  it("returns { slug: null } when the DB insert fails", async () => {
    const sql = (strings: TemplateStringsArray) =>
      /insert/i.test(strings.join(" ")) ? Promise.reject(new Error("db down")) : Promise.resolve([]);
    const POST = await loadSave(sql);
    expect(await (await POST(req({ code: VALID_CODE, device: "d1" }))).json()).toEqual({ slug: null });
  });

  it("returns an 8-char slug on a successful save", async () => {
    const sql = () => Promise.resolve([]);
    const POST = await loadSave(sql);
    const body = await (await POST(req({ code: VALID_CODE, device: "d1" }))).json();
    expect(typeof body.slug).toBe("string");
    expect(body.slug).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// POST /api/chat — validation + AI fallback
// ---------------------------------------------------------------------------
describe("POST /api/chat", () => {
  async function loadChat(stream: () => Promise<ReadableStream | null>) {
    vi.resetModules();
    vi.doMock("@/lib/llm", () => ({ stream }));
    return (await import("@/app/api/chat/route")).POST;
  }
  const req = (body: unknown) =>
    new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify(body) });

  it("returns an error message for an invalid report code", async () => {
    const POST = await loadChat(async () => null);
    const res = await POST(req({ code: "bad", messages: [{ role: "user", content: "hi" }] }));
    expect(await res.text()).toMatch(/went wrong/i);
  });

  it("returns an error message when messages is empty", async () => {
    const POST = await loadChat(async () => null);
    const res = await POST(req({ code: VALID_CODE, messages: [] }));
    expect(await res.text()).toMatch(/went wrong/i);
  });

  it("streams AI text when a provider answers", async () => {
    const enc = new TextEncoder();
    const POST = await loadChat(async () =>
      new ReadableStream({
        start(c) {
          c.enqueue(enc.encode("hi from AI"));
          c.close();
        },
      }),
    );
    const res = await POST(req({ code: VALID_CODE, messages: [{ role: "user", content: "hello" }] }));
    expect(await res.text()).toBe("hi from AI");
  });

  it("returns the no-AI fallback message when no provider is available", async () => {
    const POST = await loadChat(async () => null);
    const res = await POST(req({ code: VALID_CODE, messages: [{ role: "user", content: "hello" }] }));
    expect(await res.text()).toMatch(/isn't reachable/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/summary & /api/why — AI fallback shapes
// ---------------------------------------------------------------------------
describe("AI endpoints fall back to null shapes when no model answers", () => {
  const summaryBody = {
    profile: { interests: ["Investigative"], apt: { numerical: 1, verbal: 1, logical: 1 }, eqOverall: 0.5 },
    top: { title: "Software Engineer", desc: "d", skills: [], resources: [], weak: [] },
  };

  it("/api/summary returns null nutshell/plan when complete() returns null", async () => {
    vi.resetModules();
    vi.doMock("@/lib/llm", () => ({ complete: async () => null }));
    const { POST } = await import("@/app/api/summary/route");
    const res = await POST(new Request("http://localhost/api/summary", { method: "POST", body: JSON.stringify(summaryBody) }));
    expect(await res.json()).toEqual({ nutshell: null, plan: null });
  });

  it("/api/summary parses valid JSON returned by the model", async () => {
    vi.resetModules();
    vi.doMock("@/lib/llm", () => ({
      complete: async () => JSON.stringify({ nutshell: "You are curious.", plan: ["a", "b", "c", "d"] }),
    }));
    const { POST } = await import("@/app/api/summary/route");
    const res = await POST(new Request("http://localhost/api/summary", { method: "POST", body: JSON.stringify(summaryBody) }));
    const j = await res.json();
    expect(j.nutshell).toMatch(/curious/);
    expect(j.plan).toHaveLength(4);
  });

  it("/api/why returns null text/day when complete() returns null", async () => {
    vi.resetModules();
    vi.doMock("@/lib/llm", () => ({ complete: async () => null }));
    const { POST } = await import("@/app/api/why/route");
    const body = {
      career: { title: "X", desc: "d", riasec: ["I"], aptitude: [], eq: "low", parts: { interest: 0.5, aptitude: 0.5, eq: 0.5 } },
      profile: { code: ["I"], aptitude: { numerical: 1, verbal: 1, logical: 1 }, eqOverall: 0.5 },
    };
    const res = await POST(new Request("http://localhost/api/why", { method: "POST", body: JSON.stringify(body) }));
    expect(await res.json()).toEqual({ text: null, day: null });
  });
});
