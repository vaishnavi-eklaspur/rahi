// RIASEC (Holland Codes) interest assessment — the validated backbone.
// Original items across the six Holland dimensions. Pool is 8/dim; the assessment
// page samples a balanced subset each attempt (via lib/sample) so the quiz feels
// fresh. This file stays runtime-import-free so the plain-Node self-check can load it.

export type Dimension = "R" | "I" | "A" | "S" | "E" | "C";

export const DIMENSIONS: Record<
  Dimension,
  { name: string; blurb: string }
> = {
  R: { name: "Realistic", blurb: "hands-on, practical, building, machines, outdoors" },
  I: { name: "Investigative", blurb: "analytical, curious, research, problem-solving" },
  A: { name: "Artistic", blurb: "creative, expressive, original, unstructured" },
  S: { name: "Social", blurb: "helping, teaching, caring, people-focused" },
  E: { name: "Enterprising", blurb: "leading, persuading, selling, risk-taking" },
  C: { name: "Conventional", blurb: "organizing, detail, data, structure" },
};

export interface Question {
  id: number;
  text: string;
  dim: Dimension;
}

// "How much would you enjoy this activity?" — rated 1 (dislike) .. 5 (like).
export const QUESTIONS: Question[] = [
  // Realistic
  { id: 1, dim: "R", text: "Repair a leaking tap or assemble flat-pack furniture" },
  { id: 2, dim: "R", text: "Operate a machine like a drone, lathe, or 3D printer" },
  { id: 3, dim: "R", text: "Do physical or field work outdoors" },
  { id: 4, dim: "R", text: "Fix the wiring or plumbing in a house" },
  { id: 5, dim: "R", text: "Build or tinker with electronics or engines" },
  { id: 6, dim: "R", text: "Service a bike or car engine yourself" },
  { id: 7, dim: "R", text: "Set up and calibrate lab or workshop equipment" },
  { id: 8, dim: "R", text: "Grow and tend a garden or a small farm plot" },
  // Investigative
  { id: 9, dim: "I", text: "Investigate why an experiment gave unexpected results" },
  { id: 10, dim: "I", text: "Analyse a large dataset to uncover a hidden pattern" },
  { id: 11, dim: "I", text: "Read about how a disease spreads and model it" },
  { id: 12, dim: "I", text: "Solve a hard maths or logic puzzle for fun" },
  { id: 13, dim: "I", text: "Design an experiment to test a theory" },
  { id: 14, dim: "I", text: "Trace a stubborn software bug down to its root cause" },
  { id: 15, dim: "I", text: "Compare research papers to settle a debate" },
  { id: 16, dim: "I", text: "Work out how some natural process actually works" },
  // Artistic
  { id: 17, dim: "A", text: "Compose a piece of music or write a song" },
  { id: 18, dim: "A", text: "Sketch, paint, or design graphics" },
  { id: 19, dim: "A", text: "Write a short story, poem, or script" },
  { id: 20, dim: "A", text: "Come up with an original concept for a brand or ad" },
  { id: 21, dim: "A", text: "Perform on stage — act, dance, or play music" },
  { id: 22, dim: "A", text: "Design the layout of a book, poster, or app screen" },
  { id: 23, dim: "A", text: "Photograph or edit a short film" },
  { id: 24, dim: "A", text: "Improvise or invent something with no set rules" },
  // Social
  { id: 25, dim: "S", text: "Tutor a student struggling with a subject" },
  { id: 26, dim: "S", text: "Counsel a friend going through a hard time" },
  { id: 27, dim: "S", text: "Volunteer to care for the elderly or unwell" },
  { id: 28, dim: "S", text: "Lead a workshop teaching a skill to a group" },
  { id: 29, dim: "S", text: "Help two people resolve a conflict" },
  { id: 30, dim: "S", text: "Mentor someone who is just starting out" },
  { id: 31, dim: "S", text: "Explain a hard idea until it finally clicks for someone" },
  { id: 32, dim: "S", text: "Organise a community or charity event" },
  // Enterprising
  { id: 33, dim: "E", text: "Pitch a startup idea to potential investors" },
  { id: 34, dim: "E", text: "Lead a team toward an ambitious target" },
  { id: 35, dim: "E", text: "Negotiate a deal or a better price" },
  { id: 36, dim: "E", text: "Sell a product you believe in to new customers" },
  { id: 37, dim: "E", text: "Start and run your own business" },
  { id: 38, dim: "E", text: "Convince a room to back your plan" },
  { id: 39, dim: "E", text: "Take charge when a group has no direction" },
  { id: 40, dim: "E", text: "Spot a market gap and act on it before others" },
  // Conventional
  { id: 41, dim: "C", text: "Keep detailed accounts or a budget balanced to the rupee" },
  { id: 42, dim: "C", text: "Organise files or a database so nothing gets lost" },
  { id: 43, dim: "C", text: "Follow a precise procedure to get a task exactly right" },
  { id: 44, dim: "C", text: "Check a long document for errors and inconsistencies" },
  { id: 45, dim: "C", text: "Plan a schedule and track everyone's tasks" },
  { id: 46, dim: "C", text: "Build a clean spreadsheet to track numbers over time" },
  { id: 47, dim: "C", text: "Sort a messy process into clear, repeatable steps" },
  { id: 48, dim: "C", text: "Keep careful records that others can rely on" },
];

export const SCALE = [
  { value: 1, label: "Strongly dislike" },
  { value: 2, label: "Dislike" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Like" },
  { value: 5, label: "Strongly like" },
];

export type Scores = Record<Dimension, number>;

/** Sum the 1–5 ratings within each dimension (only answered items contribute). */
export function scoreRiasec(answers: Record<number, number>): Scores {
  const totals: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const q of QUESTIONS) {
    if (answers[q.id] !== undefined) totals[q.dim] += answers[q.id];
  }
  return totals;
}

/** Top-3 dimensions, highest first → the Holland code (e.g. ["I","R","C"]).
 *  Ties break by the canonical R-I-A-S-E-C order (stable sort). */
export function hollandCode(scores: Scores): Dimension[] {
  const order: Dimension[] = ["R", "I", "A", "S", "E", "C"];
  return [...order].sort((a, b) => scores[b] - scores[a]).slice(0, 3);
}
