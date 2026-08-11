// Career backbone + the fusion that ranks careers on all three assessments.
// Enrichment (courses, unis, salaries, companies) is still Phase 2.

import type { Dimension } from "./riasec";
import type { AptDomain, AptScores } from "./aptitude";

export interface Career {
  title: string;
  riasec: Dimension[]; // the occupation's Holland profile, strongest first
  aptitude: AptDomain[]; // aptitudes the role leans on ([] = not a differentiator)
  eq: "low" | "med" | "high"; // how people-/emotion-intensive the role is
  desc: string;
}

export const CAREERS: Career[] = [
  { title: "Software Engineer", riasec: ["I", "R", "C"], aptitude: ["logical", "numerical"], eq: "med", desc: "Design and build software systems." },
  { title: "Data Scientist", riasec: ["I", "C", "A"], aptitude: ["numerical", "logical"], eq: "low", desc: "Find patterns in data to drive decisions." },
  { title: "Data / Business Analyst", riasec: ["C", "I", "E"], aptitude: ["numerical", "logical"], eq: "med", desc: "Turn business data into reports and insight." },
  { title: "Mechanical Engineer", riasec: ["R", "I", "C"], aptitude: ["numerical", "logical"], eq: "med", desc: "Design and build machines and systems." },
  { title: "Civil Engineer", riasec: ["R", "I", "C"], aptitude: ["numerical", "logical"], eq: "med", desc: "Design infrastructure — roads, bridges, buildings." },
  { title: "Research Scientist", riasec: ["I", "A", "R"], aptitude: ["logical", "numerical"], eq: "low", desc: "Investigate open questions through experiments." },
  { title: "Doctor / Physician", riasec: ["I", "S", "R"], aptitude: ["verbal", "logical"], eq: "high", desc: "Diagnose and treat patients." },
  { title: "Psychologist / Counsellor", riasec: ["S", "I", "A"], aptitude: ["verbal", "logical"], eq: "high", desc: "Support people's mental and emotional health." },
  { title: "Teacher / Educator", riasec: ["S", "A", "E"], aptitude: ["verbal"], eq: "high", desc: "Teach and mentor students." },
  { title: "Nurse", riasec: ["S", "R", "I"], aptitude: ["verbal", "logical"], eq: "high", desc: "Care for patients' health day to day." },
  { title: "Social Worker", riasec: ["S", "E", "A"], aptitude: ["verbal"], eq: "high", desc: "Support people and communities in need." },
  { title: "Graphic / Visual Designer", riasec: ["A", "R", "E"], aptitude: [], eq: "med", desc: "Create visual designs and brand assets." },
  { title: "Writer / Content Creator", riasec: ["A", "S", "E"], aptitude: ["verbal"], eq: "med", desc: "Craft stories, articles, and copy." },
  { title: "UX Designer", riasec: ["A", "I", "S"], aptitude: ["logical", "verbal"], eq: "med", desc: "Design intuitive, human product experiences." },
  { title: "Architect", riasec: ["A", "I", "R"], aptitude: ["numerical", "logical"], eq: "med", desc: "Design buildings blending art and engineering." },
  { title: "Musician / Audio Producer", riasec: ["A", "E", "R"], aptitude: [], eq: "med", desc: "Create and produce music." },
  { title: "Entrepreneur / Founder", riasec: ["E", "I", "A"], aptitude: ["verbal", "numerical"], eq: "high", desc: "Start and grow your own venture." },
  { title: "Product Manager", riasec: ["E", "I", "S"], aptitude: ["verbal", "logical"], eq: "high", desc: "Lead product direction across teams." },
  { title: "Marketing Manager", riasec: ["E", "A", "S"], aptitude: ["verbal"], eq: "high", desc: "Drive brand growth and campaigns." },
  { title: "Sales / Business Development", riasec: ["E", "S", "C"], aptitude: ["verbal"], eq: "high", desc: "Win clients and grow revenue." },
  { title: "Management Consultant", riasec: ["E", "I", "C"], aptitude: ["numerical", "verbal", "logical"], eq: "high", desc: "Solve business problems for clients." },
  { title: "Lawyer", riasec: ["E", "S", "I"], aptitude: ["verbal", "logical"], eq: "high", desc: "Advise and advocate on legal matters." },
  { title: "Financial Analyst", riasec: ["C", "I", "E"], aptitude: ["numerical", "logical"], eq: "med", desc: "Analyse investments and company finances." },
  { title: "Chartered Accountant", riasec: ["C", "I", "E"], aptitude: ["numerical", "logical"], eq: "med", desc: "Audit, tax, and financial reporting." },
  { title: "Accountant / Auditor", riasec: ["C", "E", "I"], aptitude: ["numerical"], eq: "med", desc: "Manage and verify financial records." },
  { title: "Operations Manager", riasec: ["C", "E", "R"], aptitude: ["numerical", "logical"], eq: "high", desc: "Keep processes and logistics running." },
  { title: "AI / Machine Learning Engineer", riasec: ["I", "C", "R"], aptitude: ["logical", "numerical"], eq: "low", desc: "Build and deploy machine-learning and AI systems." },
  { title: "Cybersecurity Analyst", riasec: ["I", "R", "C"], aptitude: ["logical"], eq: "med", desc: "Protect systems and data from cyber threats." },
  { title: "Digital Marketing Specialist", riasec: ["E", "A", "C"], aptitude: ["verbal"], eq: "high", desc: "Grow brands online through content, ads, and analytics." },
  { title: "Pharmacist", riasec: ["I", "C", "S"], aptitude: ["numerical", "logical"], eq: "med", desc: "Dispense medicines and advise on their safe use." },
  { title: "Journalist / Reporter", riasec: ["A", "S", "E"], aptitude: ["verbal"], eq: "high", desc: "Research, write, and report news and stories." },
];

// Interest is the primary driver (most-measured, most-reliable signal); aptitude
// and EQ modulate it via a 0.5–1.0 factor, and a required-skill gap (skillGate)
// pulls the match down. base + aptitude + eq = 1 → a perfect match scores 1.0.
// ponytail: fixed heuristic knobs; tune here.
export const WEIGHTS = { base: 0.5, aptitude: 0.3, eq: 0.2 };

const EQ_DEMAND = { low: 0.34, med: 0.67, high: 1 } as const;

/** Interest overlap with the user's Holland code, 0..1 (max when career's
 *  top-3 dims equal the user's top-3, in order). */
function interestFit(c: Career, code: Dimension[]): number {
  const w: Partial<Record<Dimension, number>> = {};
  code.forEach((d, i) => (w[d] = 3 - i)); // 3, 2, 1
  const raw = c.riasec.reduce((s, d) => s + (w[d] ?? 0), 0); // max 6
  return Math.min(raw / 6, 1);
}

/** Average of the user's scores in the aptitudes this role leans on.
 *  Roles where aptitude isn't the differentiator get a neutral 0.6. */
function aptitudeFit(c: Career, apt: AptScores): number {
  if (c.aptitude.length === 0) return 0.6;
  return c.aptitude.reduce((s, d) => s + apt[d], 0) / c.aptitude.length;
}

/** A real gap in an aptitude the role *requires* should pull the match down —
 *  a verbal-heavy career can't be a strong fit if your verbal score is near zero.
 *  Weakest required aptitude: 0 → 0.4× the score, 0.5+ → no penalty. */
function skillGate(c: Career, apt: AptScores): number {
  if (c.aptitude.length === 0) return 1;
  const weakest = Math.min(...c.aptitude.map((d) => apt[d]));
  return Math.min(1, 0.4 + weakest * 1.2);
}

/** Meeting the role's EQ demand. Falling short hurts; exceeding it doesn't. */
function eqFit(c: Career, eq: number): number {
  return 1 - Math.max(0, EQ_DEMAND[c.eq] - eq);
}

export interface RankedCareer extends Career {
  fit: number; // 0..1 combined
  parts: { interest: number; aptitude: number; eq: number }; // 0..1 each, for the "why"
  why: string; // personalised explanation (deterministic; LLM can enrich later)
}

type Parts = RankedCareer["parts"];

// Fixed Holland dimension names (kept local so this file stays runtime-import-free
// for the plain-Node self-check). ponytail: RIASEC names never drift.
const DIM_NAME: Record<Dimension, string> = {
  R: "Realistic", I: "Investigative", A: "Artistic",
  S: "Social", E: "Enterprising", C: "Conventional",
};

/** A plain-language "why this fits you" from the user's actual strengths.
 *  ponytail: template-generated and honest; an LLM narrative can replace this
 *  when a key is configured — see app/api/why (to be added). */
function whyFits(c: Career, code: Dimension[], apt: AptScores, eqOverall: number, parts: Parts): string {
  const bits: string[] = [];
  if (parts.interest >= 0.66) {
    const shared = c.riasec.filter((d) => code.includes(d)).map((d) => DIM_NAME[d]);
    if (shared.length) bits.push(`fits your ${shared.slice(0, 2).join(" & ")} interests`);
  }
  if (c.aptitude.length > 0 && parts.aptitude >= 0.6) {
    const strong = c.aptitude.filter((d) => apt[d] >= 0.5); // AptDomain keys are already the words
    if (strong.length) bits.push(`plays to your ${strong.join(" & ")} reasoning`);
  }
  const weakReq = c.aptitude.filter((d) => apt[d] < 0.3);
  if (weakReq.length) bits.push(`though it leans on ${weakReq.join(" & ")} skills you'd want to strengthen first`);
  if (c.eq === "high" && eqOverall >= 0.6) bits.push("suits its people-focused nature with your emotional strengths");
  if (bits.length === 0) return "A balanced fit across your interests, aptitude, and emotional profile.";
  const s = bits.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

/** Rank careers: interest is the base, aptitude & EQ modulate it (0.5–1.0),
 *  and a gap in a required skill gates it down. */
export function rankCareers(
  code: Dimension[],
  apt: AptScores,
  eq: number,
  limit = 5,
): RankedCareer[] {
  return CAREERS.map((c) => {
    const parts = {
      interest: interestFit(c, code),
      aptitude: aptitudeFit(c, apt),
      eq: eqFit(c, eq),
    };
    const modifier = WEIGHTS.base + WEIGHTS.aptitude * parts.aptitude + WEIGHTS.eq * parts.eq;
    const fit = parts.interest * skillGate(c, apt) * modifier;
    return { ...c, fit, parts, why: whyFits(c, code, apt, eq, parts) };
  })
    .sort((a, b) => b.fit - a.fit)
    .slice(0, limit);
}
