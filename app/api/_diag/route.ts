// TEMP diagnostic — safe: reports only presence (boolean) of env vars + which model
// the deployed code uses. No secret values, no external calls. REMOVE after debugging.
export function GET() {
  return Response.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiModelEnv: process.env.GEMINI_MODEL ?? "(unset → code default)",
    codeDefaultModel: "gemini-flash-latest",
    hasDbUrl: !!process.env.DATABASE_URL,
    node: process.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "(unknown)",
  });
}
