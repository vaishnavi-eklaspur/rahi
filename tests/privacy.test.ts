import { describe, it, expect, vi, beforeEach } from "vitest";
import { encodeReport } from "@/lib/report-code";

// A real, valid share code so the report-mapping path runs for real (decode + scoring).
const VALID_CODE = encodeReport({ rz: { 3: 5 }, ap: { 5: 1 }, eqA: { 2: 4 } });

type SqlCall = { text: string; values: unknown[] };

// A fake `sql` tagged-template that records every call and returns the given rows.
function recordingSql(rows: unknown[] = []) {
  const calls: SqlCall[] = [];
  const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join(" ? "), values });
    return Promise.resolve(rows);
  };
  return { sql, calls };
}

beforeEach(() => vi.resetModules());

async function loadReportsGET(userId: string | null, sql: unknown) {
  vi.resetModules();
  vi.doMock("@/lib/db", () => ({ sql }));
  vi.doMock("@/lib/auth-server", () => ({ userIdFromRequest: async () => userId }));
  return (await import("@/app/api/reports/route")).GET;
}

describe("GET /api/reports — ownership & privacy boundaries", () => {
  it("returns nothing (and never queries) for an unauthenticated caller with no device", async () => {
    const { sql, calls } = recordingSql();
    const GET = await loadReportsGET(null, sql);
    const res = await GET(new Request("http://localhost/api/reports"));
    expect(await res.json()).toEqual({ reports: [] });
    expect(calls.length).toBe(0);
  });

  it("scopes a signed-in user's listing to their own user_id, ignoring an attacker's ?device", async () => {
    const { sql, calls } = recordingSql([
      { id: "slug1", code: VALID_CODE, created_at: new Date().toISOString() },
    ]);
    const GET = await loadReportsGET("userA", sql);
    const res = await GET(new Request("http://localhost/api/reports?device=deviceB"));
    const body = await res.json();
    expect(body.reports).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(calls[0].text).toContain("user_id =");
    expect(calls[0].values).toContain("userA");
    expect(calls[0].values).not.toContain("deviceB");
  });

  it("scopes an anonymous caller's listing to their own device", async () => {
    const { sql, calls } = recordingSql([]);
    const GET = await loadReportsGET(null, sql);
    await GET(new Request("http://localhost/api/reports?device=deviceA"));
    expect(calls[0].text).toContain("device =");
    expect(calls[0].values).toContain("deviceA");
  });
});

describe("POST /api/save — no ownership spoofing via the request body", () => {
  it("binds the session user_id on insert and ignores any user_id/is_admin in the body", async () => {
    const calls: SqlCall[] = [];
    const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
      const text = strings.join(" ? ");
      calls.push({ text, values });
      return Promise.resolve([]); // no existing row; insert resolves
    };
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({ sql }));
    vi.doMock("@/lib/auth-server", () => ({ userIdFromRequest: async () => null })); // anonymous
    const { POST } = await import("@/app/api/save/route");

    const res = await POST(new Request("http://localhost/api/save", {
      method: "POST",
      body: JSON.stringify({ code: VALID_CODE, device: "deviceA", user_id: "attacker", is_admin: true }),
    }));
    await res.json();

    const insert = calls.find((c) => /insert/i.test(c.text));
    expect(insert).toBeTruthy();
    expect(insert!.values).not.toContain("attacker"); // body-supplied user_id is ignored
    expect(insert!.values).toContain(null);            // session user_id (anonymous) is used
  });
});
