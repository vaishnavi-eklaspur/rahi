// Emotional-quotient assessment — self-report Likert across Goleman's four EQ domains.
// A few items are reverse-keyed (validity check against straight-lining). Pool is
// 6/domain; the assessment page samples a balanced subset each attempt (via
// lib/sample). Kept runtime-import-free so the plain-Node self-check can load it.

export type EqDomain = "SA" | "SM" | "SoA" | "RM";

export const EQ_DOMAINS: Record<EqDomain, string> = {
  SA: "Self-awareness",
  SM: "Self-management",
  SoA: "Social awareness",
  RM: "Relationship management",
};

export interface EqItem {
  id: number;
  domain: EqDomain;
  text: string;
  reverse?: boolean; // high agreement = LOW EQ on this item
}

export const EQ_ITEMS: EqItem[] = [
  // Self-awareness
  { id: 1, domain: "SA", text: "I can usually name the emotion I'm feeling and what triggered it." },
  { id: 2, domain: "SA", text: "I'm aware of how my mood affects the people around me." },
  { id: 3, domain: "SA", text: "I often don't realise I'm stressed until someone points it out.", reverse: true },
  { id: 4, domain: "SA", text: "I know what kinds of situations tend to set me off." },
  { id: 5, domain: "SA", text: "I can tell the difference between being tired and being upset." },
  { id: 6, domain: "SA", text: "I rarely stop to reflect on why I reacted the way I did.", reverse: true },
  // Self-management
  { id: 7, domain: "SM", text: "I stay calm and think clearly under pressure." },
  { id: 8, domain: "SM", text: "When I'm frustrated, I can hold back a reaction I'd regret." },
  { id: 9, domain: "SM", text: "A small setback can ruin my whole day.", reverse: true },
  { id: 10, domain: "SM", text: "I can keep working toward a goal even when I lose motivation." },
  { id: 11, domain: "SM", text: "I adapt quickly when plans change at the last minute." },
  { id: 12, domain: "SM", text: "I tend to act on impulse and regret it later.", reverse: true },
  // Social awareness
  { id: 13, domain: "SoA", text: "I can read how someone feels from their tone or body language." },
  { id: 14, domain: "SoA", text: "I notice when someone in a group feels left out." },
  { id: 15, domain: "SoA", text: "I find it hard to tell when I've upset someone.", reverse: true },
  { id: 16, domain: "SoA", text: "I pick up on the mood of a room when I walk in." },
  { id: 17, domain: "SoA", text: "I can sense what someone needs even when they don't say it." },
  { id: 18, domain: "SoA", text: "I often misjudge how other people are feeling.", reverse: true },
  // Relationship management
  { id: 19, domain: "RM", text: "I can help calm a tense situation between people." },
  { id: 20, domain: "RM", text: "People come to me for support when they're struggling." },
  { id: 21, domain: "RM", text: "I can give difficult feedback without damaging the relationship." },
  { id: 22, domain: "RM", text: "I can win people over to work toward a shared goal." },
  { id: 23, domain: "RM", text: "I keep my composure during a disagreement." },
  { id: 24, domain: "RM", text: "I struggle to speak up when there's conflict.", reverse: true },
];

export const EQ_SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

export interface EqResult {
  overall: number; // 0..1
  byDomain: Record<EqDomain, number>; // 0..1 each
}

const norm = (mean: number) => (mean - 1) / 4; // map a 1..5 mean to 0..1

/** Reverse-keyed items are flipped (6 - v) before averaging. Only answered items count. */
export function scoreEq(answers: Record<number, number>): EqResult {
  const sum: Record<EqDomain, number> = { SA: 0, SM: 0, SoA: 0, RM: 0 };
  const n: Record<EqDomain, number> = { SA: 0, SM: 0, SoA: 0, RM: 0 };
  let total = 0;
  let count = 0;
  for (const it of EQ_ITEMS) {
    const raw = answers[it.id];
    if (raw === undefined) continue;
    const v = it.reverse ? 6 - raw : raw;
    sum[it.domain] += v;
    n[it.domain]++;
    total += v;
    count++;
  }
  const dom = (d: EqDomain) => norm(n[d] ? sum[d] / n[d] : 3);
  return {
    overall: norm(count ? total / count : 3),
    byDomain: { SA: dom("SA"), SM: dom("SM"), SoA: dom("SoA"), RM: dom("RM") },
  };
}

export interface Confidence {
  level: "high" | "moderate" | "low";
  score: number; // 0..1 response-consistency
  note: string;
}

/** How much to trust the result, from the reverse-worded validity checks: agreeing
 *  with a claim AND its opposite (or straight-lining) lowers confidence. */
export function responseConfidence(answers: Record<number, number>): Confidence {
  const byDomain: Record<EqDomain, { pos: number[]; rev: number[] }> = {
    SA: { pos: [], rev: [] }, SM: { pos: [], rev: [] }, SoA: { pos: [], rev: [] }, RM: { pos: [], rev: [] },
  };
  const raws: number[] = [];
  for (const it of EQ_ITEMS) {
    const r = answers[it.id];
    if (r === undefined) continue;
    raws.push(r);
    (it.reverse ? byDomain[it.domain].rev : byDomain[it.domain].pos).push(r);
  }

  // A positive item and a reverse item in the same domain should point opposite
  // ways around neutral (3). Same side = a contradiction (max when both extreme).
  const contradictions: number[] = [];
  for (const d of Object.keys(byDomain) as EqDomain[]) {
    for (const p of byDomain[d].pos) {
      for (const rv of byDomain[d].rev) {
        contradictions.push(Math.max(0, (p - 3) * (rv - 3)) / 4);
      }
    }
  }
  const straight = raws.length > 3 && new Set(raws).size === 1;

  if (contradictions.length === 0) {
    return straight
      ? { level: "moderate", score: 0.7, note: "You gave the same answer throughout — the result may be less precise." }
      : { level: "high", score: 1, note: "Your answers look consistent." };
  }
  const meanC = contradictions.reduce((a, b) => a + b, 0) / contradictions.length;
  const score = 1 - meanC;
  if (straight)
    return { level: "low", score: Math.min(score, 0.5), note: "You gave nearly the same answer throughout, which clashes with the reverse-worded checks. Retaking will sharpen your result." };
  if (score >= 0.85) return { level: "high", score, note: "Your answers held up across the reverse-worded consistency checks." };
  if (score >= 0.6) return { level: "moderate", score, note: "Mostly consistent — a couple of answers pulled in different directions." };
  return { level: "low", score, note: "Some answers contradicted each other. Retaking may give a sharper read." };
}
