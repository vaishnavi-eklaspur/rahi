// TEMP diagnostic on a fresh path (avoids a poisoned edge cache). Reports env-var
// presence (boolean) + makes ONE tiny server-side Gemini call, returning only its
// HTTP status + a redacted error summary. No secret values. REMOVE after debugging.
// ?model=<name> overrides the model for this probe only (to find an available one).
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

function redact(s: string): string {
  return s.replace(/key=[^&\s"]+/gi, "key=REDACTED").slice(0, 300);
}

async function probeGemini(model: string): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ran: false, reason: "GEMINI_API_KEY not set in this environment" };
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
  const q = new URL(req.url).searchParams.get("model");
  const model = q && /^[a-zA-Z0-9.\-]{1,60}$/.test(q) ? q : DEFAULT_MODEL;
  return Response.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiModelEnv: process.env.GEMINI_MODEL ?? "(unset -> code default)",
    modelUsed: model,
    hasDbUrl: !!process.env.DATABASE_URL,
    node: process.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "(unknown)",
    gemini: await probeGemini(model),
  });
}
