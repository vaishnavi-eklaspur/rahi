// TEMP diagnostic — safe: reports env-var presence (boolean) + makes ONE tiny
// server-side Gemini call and returns only its HTTP status + a redacted error
// summary. No secret values are ever returned. REMOVE after debugging.
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

// Strip anything that could echo the key, defensively (Google errors don't
// include it, but the request URL does — never surface that).
function redact(s: string): string {
  return s.replace(/key=[^&\s"]+/gi, "key=REDACTED").slice(0, 300);
}

async function probeGemini(): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ran: false, reason: "GEMINI_API_KEY not set in this environment" };
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const bodyText = await r.text();
    return {
      ran: true,
      httpStatus: r.status,
      ok: r.ok,
      // On failure, Google returns { error: { code, status, message } } — surface it (redacted).
      errorSummary: r.ok ? null : redact(bodyText),
    };
  } catch (e) {
    return { ran: true, ok: false, threw: redact(String(e)) };
  }
}

export async function GET() {
  return Response.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiModelEnv: process.env.GEMINI_MODEL ?? "(unset → code default)",
    modelUsed: MODEL,
    hasDbUrl: !!process.env.DATABASE_URL,
    node: process.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "(unknown)",
    gemini: await probeGemini(),
  });
}
