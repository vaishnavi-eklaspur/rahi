// Entrance-exam + next-steps data for the career timeline (India-first).
// Dates fetched live (as of Aug 2026) — "confirmed" = officially notified,
// "expected" = NTA/body hasn't released the 2027 calendar yet, so treat as
// indicative and confirm on the official site. Runtime-import-free (self-check).
// ponytail: refresh windows each admissions cycle; the official URLs are the source of truth.

export interface Exam {
  name: string;
  full: string;
  window: string;
  status: "confirmed" | "expected";
  url: string;
}

export const EXAMS = {
  jee: { name: "JEE Main", full: "Joint Entrance Examination (Main) — for B.Tech / B.E.", window: "Session 1 ~ Jan 2027, Session 2 ~ Apr 2027 · apply from ~ Oct 2026", status: "expected", url: "https://jeemain.nta.nic.in" },
  neet: { name: "NEET UG", full: "National Eligibility cum Entrance Test — for MBBS / BDS / Nursing", window: "~ first Sunday of May 2027 · apply from ~ Feb 2027", status: "expected", url: "https://neet.nta.nic.in" },
  cuet: { name: "CUET UG", full: "Common University Entrance Test — for central-university degrees", window: "~ May–June 2027 · apply from ~ Jan 2027", status: "expected", url: "https://cuet.nta.nic.in" },
  clat: { name: "CLAT 2027", full: "Common Law Admission Test — 5-yr law at the NLUs", window: "Exam 6 Dec 2026 · registration open till 31 Oct 2026", status: "confirmed", url: "https://consortiumofnlus.ac.in" },
  gate: { name: "GATE 2027", full: "Graduate Aptitude Test in Engineering — M.Tech / PSU / research", window: "Exam 6–21 Feb 2027 · registration till 30 Sep 2026", status: "confirmed", url: "https://gate2027.iitm.ac.in" },
  cat: { name: "CAT 2026", full: "Common Admission Test — MBA at IIMs / top B-schools", window: "Exam 29 Nov 2026 · registration till 15 Sep 2026", status: "confirmed", url: "https://iimcat.ac.in" },
  ca: { name: "CA Foundation", full: "ICAI Chartered Accountancy entry exam", window: "Sittings Sep 2026 & Jan 2027 · forms open ~ 2 months prior", status: "confirmed", url: "https://www.icai.org" },
  nid: { name: "NID DAT 2027", full: "NID Design Aptitude Test — design degrees", window: "Prelims ~ Dec 2026 · apply from ~ Sep 2026", status: "expected", url: "https://admissions.nid.edu" },
  nift: { name: "NIFT 2027", full: "NIFT Entrance — fashion & design", window: "Exam ~ Feb 2027 · apply from ~ Dec 2026", status: "expected", url: "https://www.nift.ac.in" },
} as const satisfies Record<string, Exam>;

export type ExamKey = keyof typeof EXAMS;

export interface CareerPath {
  stream: string;
  exams: ExamKey[];
  steps: string[];
}

/** Curated "after 12th → exam → degree → role" path, routed by career field. */
export function pathFor(title: string): CareerPath {
  const t = title.toLowerCase();
  if (/(doctor|physician|nurse)/.test(t))
    return { stream: "Class 11–12 with Physics, Chemistry, Biology", exams: ["neet"], steps: ["Take Science (PCB) in Class 11–12", "Crack NEET UG → MBBS / BDS / B.Sc Nursing", "Finish the degree + internship & registration", "Practise, or specialise via NEET PG"] };
  if (/pharmac/.test(t))
    return { stream: "Class 11–12 with Physics, Chemistry, Biology or Maths", exams: ["neet", "cuet"], steps: ["Take Science (PCB / PCM) in Class 11–12", "B.Pharm via NEET / a state pharmacy CET / CUET", "Complete B.Pharm (4 yrs) + register with the Pharmacy Council", "Practise, or do M.Pharm via GPAT"] };
  if (/lawyer/.test(t))
    return { stream: "Class 11–12, any stream", exams: ["clat"], steps: ["Finish Class 12 (any stream)", "Crack CLAT → 5-year BA LLB at an NLU", "Internships + moot courts through college", "Enrol with the Bar Council → practise"] };
  if (/(financ|account|chartered)/.test(t))
    return { stream: "Class 11–12, Commerce preferred", exams: ["ca", "cuet"], steps: ["Take Commerce in Class 11–12", "CA Foundation after 12th, or CUET → B.Com", "CA Inter + articleship, or a finance degree", "Qualify as a CA / land a finance role"] };
  if (/(mechanical|civil) engineer/.test(t) || /architect/.test(t))
    return { stream: "Class 11–12 with Physics, Chemistry, Maths", exams: ["jee", "gate"], steps: ["Take Science (PCM) in Class 11–12", "JEE Main/Advanced → B.Tech (or JEE Paper 2 / NATA → B.Arch)", "Optional GATE → M.Tech / PSU jobs", "Entry engineering / design role"] };
  if (/(software|data|ux|research scientist|machine learning|cyber)/.test(t))
    return { stream: "Class 11–12 with Maths", exams: ["jee", "cuet", "gate"], steps: ["Take Maths in Class 11–12", "JEE → B.Tech CSE, or CUET → BCA / B.Sc (CS / Stats)", "Build projects + internships (GATE later for research / M.Tech)", "Entry analyst / engineer / research role"] };
  if (/(graphic|visual|design|musician|audio)/.test(t))
    return { stream: "Class 11–12, any stream", exams: ["nid", "nift", "cuet"], steps: ["Finish Class 12 (any stream)", "NID DAT / NIFT / UCEED → a design degree", "Build a strong portfolio", "Entry design / creative role"] };
  if (/(psycholog|counsel|social|teacher|educator|writer|content|journalis|reporter)/.test(t))
    return { stream: "Class 11–12, any stream", exams: ["cuet"], steps: ["Finish Class 12 (any stream)", "CUET UG → BA (Psychology / Education / English…)", "Specialise: MA, B.Ed, or a diploma", "Entry role in the field"] };
  // business / management / product / marketing / sales / entrepreneur / operations / consultant
  return { stream: "Class 11–12, any stream", exams: ["cuet", "cat"], steps: ["Finish Class 12 (any stream)", "CUET UG → BBA / B.Com / BMS", "Build internships & early work experience", "CAT → MBA at an IIM / top B-school"] };
}
