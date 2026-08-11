// Feature: a free learning roadmap per career. Curated (never LLM-invented) links
// to genuinely free resources, chosen by the career's field + the aptitudes the
// student is weakest in (ties into the skill-gate story). ponytail: coarse keyword
// routing on the title — good enough; a per-career map is the upgrade if it drifts.

import type { AptDomain, AptScores } from "./aptitude";

export interface Resource {
  title: string;
  provider: string;
  url: string;
}
export interface RoadmapItem extends Resource {
  note?: string; // why this one (e.g. a gap to shore up)
}

const GENERAL: Resource[] = [
  { title: "Free university courses (audit)", provider: "Coursera / edX", url: "https://www.coursera.org" },
  { title: "SWAYAM / NPTEL (India)", provider: "Govt. of India", url: "https://nptel.ac.in" },
];

// Field → 3 curated free resources.
const BY_FIELD: Record<string, Resource[]> = {
  coding: [
    { title: "Full-stack curriculum", provider: "freeCodeCamp", url: "https://www.freecodecamp.org" },
    { title: "CS50: Intro to Computer Science", provider: "Harvard (edX)", url: "https://cs50.harvard.edu/x/" },
    { title: "The Odin Project", provider: "The Odin Project", url: "https://www.theodinproject.com" },
  ],
  data: [
    { title: "Learn: Python, Pandas, ML", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    { title: "Statistics & probability", provider: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability" },
    { title: "Intro to Data Science", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/search/?q=data+science" },
  ],
  design: [
    { title: "Design & prototyping basics", provider: "Figma Learn", url: "https://www.figma.com/resource-library/" },
    { title: "Foundations of UX design", provider: "Google (Coursera, audit)", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
    { title: "Laws of UX", provider: "lawsofux.com", url: "https://lawsofux.com" },
  ],
  writing: [
    { title: "Writing & grammar guides", provider: "Purdue OWL", url: "https://owl.purdue.edu" },
    { title: "Writing for the web", provider: "Google Technical Writing", url: "https://developers.google.com/tech-writing" },
    { title: "Free open textbooks", provider: "OpenStax", url: "https://openstax.org/subjects/humanities" },
  ],
  engineering: [
    { title: "Engineering lectures", provider: "NPTEL", url: "https://nptel.ac.in" },
    { title: "Physics & math courses", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu" },
    { title: "Khan Academy: Physics", provider: "Khan Academy", url: "https://www.khanacademy.org/science/physics" },
  ],
  medicine: [
    { title: "Biology & health science", provider: "Khan Academy", url: "https://www.khanacademy.org/science/biology" },
    { title: "Free anatomy & physiology", provider: "OpenStax", url: "https://openstax.org/subjects/science" },
    { title: "Medical basics", provider: "Osmosis (YouTube)", url: "https://www.youtube.com/@osmosis" },
  ],
  psychology: [
    { title: "Intro to Psychology", provider: "Yale (Coursera, audit)", url: "https://www.coursera.org/learn/introduction-psychology" },
    { title: "Psychology textbook", provider: "OpenStax", url: "https://openstax.org/details/books/psychology-2e" },
    { title: "Emotional intelligence talks", provider: "TED", url: "https://www.ted.com/topics/emotions" },
  ],
  teaching: [
    { title: "The Science of Learning", provider: "Coursera (audit)", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { title: "Teaching resources", provider: "Khan Academy Teachers", url: "https://www.khanacademy.org/teacher" },
    { title: "Public speaking basics", provider: "Toastmasters", url: "https://www.toastmasters.org/find-a-club" },
  ],
  finance: [
    { title: "Investing & finance basics", provider: "Investopedia", url: "https://www.investopedia.com" },
    { title: "Finance & capital markets", provider: "Khan Academy", url: "https://www.khanacademy.org/economics-finance-domain" },
    { title: "Accounting fundamentals", provider: "NPTEL", url: "https://nptel.ac.in" },
  ],
  business: [
    { title: "Marketing, sales & CRM", provider: "HubSpot Academy", url: "https://academy.hubspot.com" },
    { title: "Entrepreneurship 101", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/search/?q=entrepreneurship" },
    { title: "Business & economics", provider: "Khan Academy", url: "https://www.khanacademy.org/economics-finance-domain" },
  ],
  law: [
    { title: "Intro to law lectures", provider: "NPTEL", url: "https://nptel.ac.in" },
    { title: "Constitutional law basics", provider: "Yale (open courses)", url: "https://oyc.yale.edu" },
    { title: "Legal reasoning & argument", provider: "Purdue OWL", url: "https://owl.purdue.edu" },
  ],
  research: [
    { title: "Research methods & writing", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu" },
    { title: "The maths behind it", provider: "3Blue1Brown (YouTube)", url: "https://www.youtube.com/@3blue1brown" },
    { title: "Open-access papers", provider: "arXiv", url: "https://arxiv.org" },
  ],
};

// Aptitude gaps → one targeted resource to shore up.
const GAP: Record<AptDomain, Resource> = {
  numerical: { title: "Strengthen: math & statistics", provider: "Khan Academy", url: "https://www.khanacademy.org/math" },
  verbal: { title: "Strengthen: reading & writing", provider: "Purdue OWL", url: "https://owl.purdue.edu" },
  logical: { title: "Strengthen: logic & problem-solving", provider: "CS50 (Harvard)", url: "https://cs50.harvard.edu/x/" },
};

/** Coarse field routing from the career title. */
function fieldOf(title: string): string {
  const t = title.toLowerCase();
  if (/(software|web|developer|machine learning|cyber)/.test(t)) return "coding";
  if (/(data|analyst|scientist)/.test(t) && !/research/.test(t)) return "data";
  if (/research/.test(t)) return "research";
  if (/(ux|graphic|visual|design|architect|musician|audio)/.test(t)) return "design";
  if (/(writer|content|journalis|reporter)/.test(t)) return "writing";
  if (/engineer/.test(t)) return "engineering";
  if (/(doctor|physician|nurse|pharmac)/.test(t)) return "medicine";
  if (/(psycholog|counsel|social worker|social)/.test(t)) return "psychology";
  if (/(teacher|educator)/.test(t)) return "teaching";
  if (/(financ|account|chartered)/.test(t)) return "finance";
  if (/lawyer/.test(t)) return "law";
  if (/(manager|product|consult|entrepreneur|founder|sales|business|marketing|operations)/.test(t)) return "business";
  return "";
}

/** A free learning roadmap: gaps to shore up first, then field resources. Max 5. */
export function roadmapFor(title: string, requiredApt: AptDomain[], apt: AptScores): RoadmapItem[] {
  const items: RoadmapItem[] = [];
  for (const d of requiredApt) {
    if (apt[d] < 0.5) items.push({ ...GAP[d], note: "close a gap this career leans on" });
  }
  const field = fieldOf(title);
  const base = field ? BY_FIELD[field] : [];
  for (const r of [...base, ...GENERAL]) {
    if (items.length >= 5) break;
    if (!items.some((x) => x.url === r.url)) items.push(r);
  }
  return items.slice(0, 5);
}
