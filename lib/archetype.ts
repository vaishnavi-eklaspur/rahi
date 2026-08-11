// Career archetype — a memorable, shareable identity derived from the Holland code.
// Curated mapping (never AI-invented): the top-2 interest dimensions name the type,
// and a tagline blends the primary's drive with the secondary's streak.
// 6 nouns × 6 leads × 6 streaks → 36 distinct identities. Runtime-import-free.

import type { Dimension } from "./riasec";

const NOUN: Record<Dimension, string> = {
  R: "Builder", I: "Investigator", A: "Creator", S: "Guide", E: "Driver", C: "Organizer",
};

const LEAD: Record<Dimension, string> = {
  R: "You trust your hands and solve real, tangible problems",
  I: "You dig for the why and love cracking a hard problem",
  A: "You see what could be, then make it real",
  S: "You bring out the best in the people around you",
  E: "You spot the opportunity and rally people to it",
  C: "You bring order to the chaos and make things run",
};

const STREAK: Record<Dimension, string> = {
  R: "hands-on", I: "analytical", A: "creative", S: "people-first", E: "bold", C: "meticulous",
};

export interface Archetype {
  title: string; // e.g. "The Investigator-Builder"
  tagline: string;
}

export function archetypeFor(code: Dimension[]): Archetype {
  const p = code[0];
  const s = code[1] ?? p;
  const title = p === s ? `The ${NOUN[p]}` : `The ${NOUN[p]}-${NOUN[s]}`;
  const tagline = `${LEAD[p]} — ${STREAK[s]} to the core.`;
  return { title, tagline };
}
