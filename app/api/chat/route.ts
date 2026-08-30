// "Chat with your results" — grounded Q&A, streamed. Uses Gemini in the cloud or
// local Ollama in dev (see lib/llm). The server decodes the report code and rebuilds
// the full profile + top-5 + enrichment as grounding, so facts stay curated.
import { stream } from "@/lib/llm";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { decodeReport } from "@/lib/report-code";
import { DIMENSIONS, scoreRiasec, hollandCode, type Dimension } from "@/lib/riasec";
import { scoreAptitude } from "@/lib/aptitude";
import { EQ_DOMAINS, scoreEq } from "@/lib/eq";
import { rankCareers } from "@/lib/careers";
import { ENRICHMENT, type Geo } from "@/lib/enrichment";
import type { ReportAnswers } from "@/lib/report-code";

const pct = (f: number) => `${Math.round(f * 100)}%`;
const RIASEC_ORDER: Dimension[] = ["R", "I", "A", "S", "E", "C"];

const NO_AI = "The AI assistant isn't reachable right now. In the deployed app this needs GEMINI_API_KEY set; locally, make sure Ollama is running. Then reload.";
const ERR = "Something went wrong — please try again.";
const RATE_LIMITED = "You're sending messages a little too fast — give it a few seconds and try again.";

const textStream = (body: BodyInit) =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

function buildSystem(a: ReportAnswers): string {
  const scores = scoreRiasec(a.rz);
  const code = hollandCode(scores);
  const apt = scoreAptitude(a.ap);
  const eq = scoreEq(a.eqA);
  const careers = rankCareers(code, apt, eq.overall, 5);

  const riasec = RIASEC_ORDER.map((d) => `${DIMENSIONS[d].name} ${scores[d]}`).join(", ");
  const eqLine = (["SA", "SM", "SoA", "RM"] as const).map((d) => `${EQ_DOMAINS[d]} ${pct(eq.byDomain[d])}`).join(", ");

  const geoLine = (title: string, g: Geo) => {
    const d = ENRICHMENT[title]?.[g];
    return d ? `   ${g === "india" ? "India" : "Global"} — universities: ${d.universities.join(", ")}; typical salary (indicative): ${d.salary}; employers: ${d.companies.join(", ")}; entry: ${d.path}` : "";
  };
  const careerBlocks = careers.map((c, i) => {
    const e = ENRICHMENT[c.title];
    return [
      `${i + 1}. ${c.title} — ${pct(c.fit)} match (interest ${pct(c.parts.interest)}, aptitude ${pct(c.parts.aptitude)}, EQ ${pct(c.parts.eq)}). ${c.desc}`,
      e ? `   Skills: ${e.skills.join(", ")}. Courses: ${e.courses.join(", ")}.` : "",
      geoLine(c.title, "india"),
      geoLine(c.title, "global"),
    ].filter(Boolean).join("\n");
  }).join("\n");

  return `You are Rahi, a warm, practical career counsellor chatting with a student about their career-assessment results. Ground every answer in the student's profile and the career data below.

Rules:
- For facts (salaries, universities, companies, courses), use ONLY the data below — never invent specific numbers or names. Salary figures are indicative ranges; say so.
- You may discuss careers beyond the listed five in general terms, but say clearly when you're going beyond their assessed data.
- Keep replies conversational and concise: a short paragraph, or a few bullets when comparing options. Be encouraging and honest, including about weaker fits.
- Do not include any internal or system tags in your reply.

STUDENT PROFILE
- Interests (Holland code ${code.join("")}): ${code.map((d) => DIMENSIONS[d].name).join(", ")}
- RIASEC scores (higher = stronger interest): ${riasec}
- Aptitude: numerical ${pct(apt.numerical)}, verbal ${pct(apt.verbal)}, logical ${pct(apt.logical)}
- Emotional quotient: overall ${pct(eq.overall)} (${eqLine})

TOP 5 CAREERS (ranked, with fit breakdown and reference data)
${careerBlocks}`;
}

export async function POST(req: Request) {
  // Public endpoint — cap per-IP so nobody can drain the Gemini quota via the chat.
  if (!rateLimit(`chat:${clientIp(req)}`, 30, 60_000)) return textStream(RATE_LIMITED);
  let answers: ReportAnswers | null = null;
  let turns: { role: "user" | "assistant"; content: string }[] = [];
  try {
    const { code, messages } = await req.json();
    answers = decodeReport(code);
    if (!answers || !Array.isArray(messages) || messages.length === 0) return textStream(ERR);
    turns = messages.slice(-16).map((m: { role: string; content: unknown }) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content).slice(0, 2000),
    }));
  } catch {
    return textStream(ERR);
  }
  if (!answers) return textStream(ERR);

  const rs = await stream([{ role: "system", content: buildSystem(answers) }, ...turns], { temperature: 0.7 });
  return rs ? textStream(rs) : textStream(NO_AI);
}
