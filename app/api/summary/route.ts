// AI "profile in a nutshell" + a "next 90 days" plan. Uses Gemini in the cloud or
// local Ollama in dev (see lib/llm). Returns { nutshell: null, plan: null } when no
// model answers, so the client keeps its deterministic fallback (lib/summary).
import { complete } from "@/lib/llm";

const SYSTEM =
  "You are Rahi, a warm, honest career counsellor talking to a student as \"you\". " +
  "Reply with ONLY a JSON object with two keys:\n" +
  "\"nutshell\": 2 sentences summing up who this student is across their interests, aptitude, " +
  "and emotional strengths — grounded ONLY in the data given.\n" +
  "\"plan\": an array of exactly 4 short, concrete action steps for the next 90 days toward " +
  "their top career, using only the skills and free resources provided — never invent course " +
  "names, companies, or numbers.";

function parse(raw: string): { nutshell: string | null; plan: string[] | null } {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const j = JSON.parse(cleaned);
    const plan = Array.isArray(j.plan) ? j.plan.filter((s: unknown) => typeof s === "string" && s.trim()).slice(0, 4) : null;
    return { nutshell: typeof j.nutshell === "string" ? j.nutshell : null, plan: plan && plan.length ? plan : null };
  } catch {
    return { nutshell: null, plan: null };
  }
}

export async function POST(req: Request) {
  try {
    const { profile, top } = await req.json();

    const userText = [
      `Student profile:`,
      `- Interests (Holland): ${(profile.interests as string[]).join(", ")}`,
      `- Aptitude: numerical ${profile.apt.numerical}, verbal ${profile.apt.verbal}, logical ${profile.apt.logical} (0-1 scale)`,
      `- Emotional quotient (overall, 0-1): ${profile.eqOverall}`,
      ``,
      `Top career match: ${top.title} — ${top.desc}`,
      `- Skills it needs: ${(top.skills as string[]).join(", ")}`,
      `- Free resources available: ${(top.resources as string[]).join(", ")}`,
      top.weak?.length ? `- Aptitudes this student should strengthen for it: ${(top.weak as string[]).join(", ")}` : `- No major aptitude gaps for it.`,
    ].join("\n");

    const raw = await complete(
      [{ role: "system", content: SYSTEM }, { role: "user", content: userText }],
      { json: true, temperature: 0.6 },
    );
    return Response.json(raw ? parse(raw) : { nutshell: null, plan: null });
  } catch {
    return Response.json({ nutshell: null, plan: null });
  }
}
