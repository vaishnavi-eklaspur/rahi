// Runnable self-check for scoring + fusion + sampling. No framework.
//   node lib/riasec.selfcheck.ts
// (excluded from tsconfig so the .ts import extensions don't fail `next build`.)
import assert from "node:assert";
import { QUESTIONS, scoreRiasec, hollandCode, type Dimension } from "./riasec.ts";
import { APT_QUESTIONS, scoreAptitude, nextDifficulty, pickAptItem } from "./aptitude.ts";
import { EQ_ITEMS, scoreEq, responseConfidence } from "./eq.ts";
import { sampleByGroup } from "./sample.ts";
import { CAREERS, rankCareers, WEIGHTS } from "./careers.ts";
import { ENRICHMENT } from "./enrichment.ts";
import { encodeReport, decodeReport } from "./report-code.ts";
import { roadmapFor } from "./resources.ts";
import { archetypeFor } from "./archetype.ts";
import { pathFor, EXAMS } from "./exams.ts";

// --- RIASEC scoring (over the full pool: 8 items/dim) ---
const rz: Record<number, number> = {};
for (const q of QUESTIONS) rz[q.id] = q.dim === "I" ? 5 : 1;
const scores = scoreRiasec(rz);
assert.equal(scores.I, 40, "8 Investigative items × 5 = 40");
assert.equal(hollandCode(scores)[0], "I", "Investigative ranks first");

// --- Sampling: balanced + fresh ---
const DIMS: Dimension[] = ["R", "I", "A", "S", "E", "C"];
const drawn = sampleByGroup(QUESTIONS, (q) => q.dim, 4);
assert.equal(drawn.length, 24, "6 dims × 4 items");
for (const d of DIMS) assert.equal(drawn.filter((q) => q.dim === d).length, 4, `balanced: 4 ${d} items`);
assert.equal(new Set(drawn.map((q) => q.id)).size, 24, "no duplicate items in a draw");
assert.equal(sampleByGroup(APT_QUESTIONS, (q) => q.domain, 4).length, 12, "3 domains × 4");
assert.equal(sampleByGroup(EQ_ITEMS, (it) => it.domain, 3).length, 12, "4 domains × 3");

// --- Aptitude scoring is fraction-correct over ANSWERED items only ---
const allRight: Record<number, number> = {};
for (const q of APT_QUESTIONS) allRight[q.id] = q.answer;
assert.deepEqual(scoreAptitude(allRight), { numerical: 1, verbal: 1, logical: 1 }, "all-correct → 1.0");
// only a subset answered, all correct → still 1.0 (not diluted by unanswered pool)
const subset = sampleByGroup(APT_QUESTIONS, (q) => q.domain, 4);
const subMap: Record<number, number> = {};
for (const q of subset) subMap[q.id] = q.answer;
assert.deepEqual(scoreAptitude(subMap), { numerical: 1, verbal: 1, logical: 1 }, "sparse all-correct → 1.0");

// --- Adaptive aptitude: difficulty steps + difficulty-weighted scoring ---
assert.equal(nextDifficulty("medium", true), "hard", "right answer → harder");
assert.equal(nextDifficulty("medium", false), "easy", "wrong answer → easier");
assert.equal(nextDifficulty("hard", true), "hard", "clamps at hard");
assert.equal(nextDifficulty("easy", false), "easy", "clamps at easy");
const picked = pickAptItem("numerical", "hard", new Set());
assert.equal(picked.domain, "numerical", "picks within the domain");
assert.equal(picked.difficulty, "hard", "hits target difficulty when available");
// id2 (hard, answer 0), id4 (easy, answer 1): getting the hard item right beats the easy one
assert.ok(scoreAptitude({ 2: 0, 4: 0 }).numerical > scoreAptitude({ 2: 1, 4: 1 }).numerical, "hard-correct outweighs easy-correct");

// --- EQ: reverse keys flip, and only answered items count ---
const eqSparse = scoreEq({ 7: 5, 9: 5 }); // SM: normal id7→5, reverse id9→1 ⇒ mean 3 ⇒ 0.5
assert.equal(Math.round(eqSparse.byDomain.SM * 100) / 100, 0.5, "reverse flips; unanswered ignored");

// --- Fusion / ranking ---
assert.equal(WEIGHTS.base + WEIGHTS.aptitude + WEIGHTS.eq, 1, "weights sum to 1");
const ranked = rankCareers(["I", "C", "A"], { numerical: 1, verbal: 1, logical: 1 }, 0.5);
assert.ok(ranked.map((c) => c.title).includes("Data Scientist"), "Data Scientist in top 5");
const fits = ranked.map((c) => c.fit);
assert.deepEqual(fits, [...fits].sort((a, b) => b - a), "ranked by fit desc");

// --- Skill gate: a gap in a required aptitude lowers that career's match ---
const es: Dimension[] = ["E", "S", "C"];
const salesV = rankCareers(es, { numerical: 0.5, verbal: 1, logical: 0.5 }, 0.7, 26)
  .find((c) => c.title === "Sales / Business Development")!.fit;
const salesNoV = rankCareers(es, { numerical: 0.5, verbal: 0, logical: 0.5 }, 0.7, 26)
  .find((c) => c.title === "Sales / Business Development")!.fit;
assert.ok(salesNoV < salesV, "0 verbal must lower a verbal-dependent career's match");

// --- Enrichment coverage: every career must have data (catches title mismatches) ---
for (const c of CAREERS) {
  const e = ENRICHMENT[c.title];
  assert.ok(e, `missing enrichment for "${c.title}"`);
  assert.ok(e.india.universities.length && e.global.universities.length, `${c.title}: needs uni data`);
}

// --- Report share code: non-contiguous sampled ids must round-trip ---
const report = { rz: { 3: 5, 17: 2, 48: 4 }, ap: { 5: 1, 21: 3 }, eqA: { 2: 4, 24: 1 } };
assert.deepEqual(decodeReport(encodeReport(report)), report, "sampled ids round-trip");
assert.ok(decodeReport("15-01-13"), "legacy positional code still decodes");
assert.equal(decodeReport("not-a-code"), null, "malformed code → null");
assert.equal(decodeReport("12-34"), null, "wrong part count → null");

// --- Learning roadmap: 3-5 free resources, gaps first, no dupes ---
const rm = roadmapFor("Data / Business Analyst", ["numerical", "logical"], { numerical: 0.2, verbal: 1, logical: 1 });
assert.ok(rm.length >= 3 && rm.length <= 5, "roadmap returns 3-5 items");
assert.ok(rm.some((r) => r.note), "a weak required aptitude adds a gap resource");
assert.equal(new Set(rm.map((r) => r.url)).size, rm.length, "no duplicate resources");

// --- Career archetype from the Holland code ---
const arch = archetypeFor(["I", "R", "C"]);
assert.equal(arch.title, "The Investigator-Builder", "archetype names the top-2 dimensions");
assert.ok(arch.tagline.includes("hands-on"), "tagline reflects the secondary (R) streak");
assert.equal(archetypeFor(["A", "A", "A"]).title, "The Creator", "single-dimension archetype collapses");

// --- Career path + entrance exams ---
assert.deepEqual(pathFor("Lawyer").exams, ["clat"], "lawyer routes to CLAT");
assert.deepEqual(pathFor("Doctor / Physician").exams, ["neet"], "doctor routes to NEET");
assert.ok(pathFor("Marketing Manager").steps.length >= 3, "path has ordered steps");
for (const c of CAREERS) {
  for (const k of pathFor(c.title).exams) {
    assert.ok(EXAMS[k]?.url.startsWith("https://"), `${c.title}: exam ${k} has an official URL`);
  }
}

// --- Response confidence (reverse-worded validity checks) ---
// SM domain: 7,8 positive; 9,12 reverse. Opposite answers = consistent.
assert.equal(responseConfidence({ 7: 5, 8: 4, 9: 1, 12: 2 }).level, "high", "opposite answers on reverse items → high");
assert.equal(responseConfidence({ 7: 5, 8: 5, 9: 5, 12: 5 }).level, "low", "agreeing with a claim and its reverse → low");

console.log("ok — all self-checks passed");
