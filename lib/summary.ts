// Deterministic fallbacks for the "profile in a nutshell" + "next 90 days" plan.
// These render instantly; the AI route (app/api/summary) replaces them with a
// richer version when a local model is available. Grounded in the scores only.

import { DIMENSIONS, type Dimension } from "./riasec";
import { APT_DOMAINS, type AptDomain, type AptScores } from "./aptitude";
import type { RoadmapItem } from "./resources";

export const strongestApt = (apt: AptScores): AptDomain =>
  (Object.keys(apt) as AptDomain[]).sort((a, b) => apt[b] - apt[a])[0];

export function nutshell(code: Dimension[], apt: AptScores, eqOverall: number): string {
  const interests = code.map((d) => DIMENSIONS[d].name).join(", ");
  const eqBand = eqOverall >= 0.66 ? "strong" : eqOverall >= 0.4 ? "steady" : "still-developing";
  return `Your interests point toward ${interests} work, you reason most naturally through ${APT_DOMAINS[strongestApt(apt)]} problems, and your emotional strengths are ${eqBand}.`;
}

export function defaultPlan(topTitle: string, roadmap: RoadmapItem[], weak: AptDomain[]): string[] {
  const steps: string[] = [];
  if (weak.length) steps.push(`Shore up your ${weak.join(" & ")} skills — it's the gap holding back your strongest matches.`);
  const course = roadmap.find((r) => !r.note) ?? roadmap[0];
  if (course) steps.push(`Start a free course: ${course.title} (${course.provider}).`);
  steps.push(`Build one small project that shows off ${topTitle} skills you can point to.`);
  steps.push(`Find one person working as a ${topTitle} and ask how they got in.`);
  return steps.slice(0, 4);
}
