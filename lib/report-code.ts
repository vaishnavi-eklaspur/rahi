// A report is fully determined by its answers, so we encode them into the share
// URL itself — no database needed. Because each attempt now samples a *different*
// subset of questions, the code stores the real question id with each answer
// (not just a position). Format: "~" + three id-runs joined by "-"; within a run
// each answer is base36(id) padded to 2 chars + base36(value). Legacy positional
// codes (no "~", digits only) still decode for old shared links.

export type Answers = Record<number, number>;
export interface ReportAnswers {
  rz: Answers; // interests
  ap: Answers; // aptitude
  eqA: Answers; // emotional quotient
}

const enc = (m: Answers): string =>
  Object.keys(m)
    .map(Number)
    .sort((a, b) => a - b)
    .map((id) => id.toString(36).padStart(2, "0") + m[id].toString(36))
    .join("");

export function encodeReport({ rz, ap, eqA }: ReportAnswers): string {
  return "~" + [enc(rz), enc(ap), enc(eqA)].join("-");
}

const decMap = (s: string): Answers | null => {
  if (s.length % 3 !== 0) return null;
  const m: Answers = {};
  for (let i = 0; i < s.length; i += 3) {
    const id = parseInt(s.slice(i, i + 2), 36);
    const v = parseInt(s[i + 2], 36);
    if (!Number.isFinite(id) || !Number.isFinite(v)) return null;
    m[id] = v;
  }
  return m;
};

/** Rebuild answer maps from a code. Returns null if malformed. */
export function decodeReport(code: string): ReportAnswers | null {
  if (code.startsWith("~")) {
    const parts = code.slice(1).split("-");
    if (parts.length !== 3) return null;
    const rz = decMap(parts[0]);
    const ap = decMap(parts[1]);
    const eqA = decMap(parts[2]);
    if (!rz || !ap || !eqA) return null;
    return { rz, ap, eqA };
  }
  // Legacy positional format: three digit-runs, ids assumed 1..N per section.
  const parts = code.split("-");
  if (parts.length !== 3 || parts.some((p) => !/^[0-5]+$/.test(p))) return null;
  const toMap = (digits: string): Answers => {
    const m: Answers = {};
    for (let i = 0; i < digits.length; i++) m[i + 1] = +digits[i];
    return m;
  };
  return { rz: toMap(parts[0]), ap: toMap(parts[1]), eqA: toMap(parts[2]) };
}
