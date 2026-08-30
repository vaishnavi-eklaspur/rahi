// TEMP diagnostic on a fresh path (avoids a poisoned edge cache). Reports env-var
// presence (boolean) + probes Gemini server-side, returning only status/redacted
// errors. No secret values. REMOVE after debugging.
// ?model=<name> overrides the model for the probe. ?list=1 returns the models this
// key can actually use (name + whether it supports generateContent).
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

function redact(s: string): string {
  return s.replace(/key=[^&\s"]+/gi, "key=REDACTED").slice(0, 300);
}

async function listModels(key: string) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=100`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return { ok: false, httpStatus: r.status, error: redact(await r.text()) };
    const data = await r.json();
    const models = (data?.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: { name?: string }) => m.name?.replace(/^models\//, ""));
    return { ok: true, generateContentModels: models };
  } catch (e) {
    return { ok: false, threw: redact(String(e)) };
  }
}

async function probeGemini(model: string, key: string) {
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const bodyText = await r.text();
    return { model, ran: true, httpStatus: r.status, ok: r.ok, errorSummary: r.ok ? null : redact(bodyText) };
  } catch (e) {
    return { model, ran: true, ok: false, threw: redact(String(e)) };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ hasGeminiKey: false, reason: "GEMINI_API_KEY not set" });

  if (url.searchParams.get("list") === "1") {
    return Response.json({ commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "?", ...(await listModels(key)) });
  }

  const q = url.searchParams.get("model");
  const model = q && /^[a-zA-Z0-9.\-]{1,60}$/.test(q) ? q : DEFAULT_MODEL;
  return Response.json({
    hasGeminiKey: true,
    modelUsed: model,
    hasDbUrl: !!process.env.DATABASE_URL,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "?",
    gemini: await probeGemini(model, key),
  });
}
