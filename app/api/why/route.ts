// LLM "why this fits you" + a short "day in the life". Uses Gemini in the cloud
// or local Ollama in dev (see lib/llm). Returns { text: null, day: null } when no
// model answers, so the client keeps the deterministic why and hides the day.
import { complete } from "@/lib/llm";

const DIM: Record<string, string> = {
  R: "Realistic", I: "Investigative", A: "Artistic",
  S: "Social", E: "Enterprising", C: "Conventional",
};

const SYSTEM =
  "You are Rahi, a warm, honest career counsellor talking to a student as \"you\". " +
  "Reply with ONLY a JSON object with two string keys and nothing else (no code " +
  "fences, no preamble):\n" +
  "\"why\": 2-3 sentences on why this career does or doesn't strongly fit them, grounded " +
  "ONLY in the scores provided — never invent salaries, companies, or universities.\n" +
  "\"day\": 2 sentences painting a realistic, general day-in-the-life of this role — honest " +
  "about the routine, no invented employer names or numbers.";

const pct = (f: number) => `${Math.round(f * 100)}%`;

function parse(raw: string): { text: string | null; day: string | null } {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const j = JSON.parse(cleaned);
    return { text: j.why || null, day: j.day || null };
  } catch {
    return { text: raw.trim() || null, day: null }; // model ignored JSON — use it as the why
  }
}

export async function POST(req: Request) {
  try {
    const { career, profile } = await req.json();
    const interests = (profile.code as string[]).map((d) => DIM[d] ?? d).join(", ");
    const roleInterests = (career.riasec as string[]).map((d) => DIM[d] ?? d).join(", ");

    const userText = [
      `Student profile:`,
      `- Top interests (Holland): ${interests}`,
      `- Aptitude: numerical ${pct(profile.aptitude.numerical)}, verbal ${pct(profile.aptitude.verbal)}, logical ${pct(profile.aptitude.logical)}`,
      `- Emotional quotient (overall): ${pct(profile.eqOverall)}`,
      ``,
      `Career: ${career.title} — ${career.desc}`,
      `- Leans on interests: ${roleInterests}; aptitudes: ${career.aptitude.join(", ") || "none in particular"}; people/emotional demand: ${career.eq}`,
      `- Fit for this student: interest ${pct(career.parts.interest)}, aptitude ${pct(career.parts.aptitude)}, EQ ${pct(career.parts.eq)}`,
    ].join("\n");

    const raw = await complete(
      [{ role: "system", content: SYSTEM }, { role: "user", content: userText }],
      { json: true, temperature: 0.6 },
    );
    return Response.json(raw ? parse(raw) : { text: null, day: null });
  } catch {
    return Response.json({ text: null, day: null });
  }
}
