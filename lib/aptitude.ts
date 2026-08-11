// Aptitude assessment — an ability test (right/wrong), unlike the self-report ones.
// Three reasoning domains. Items are difficulty-tagged so the assessment can run
// ADAPTIVELY (get one right → next is harder; wrong → easier) and scoring is
// difficulty-weighted. Kept runtime-import-free for the self-check.

export type AptDomain = "numerical" | "verbal" | "logical";
export type Difficulty = "easy" | "medium" | "hard";

export const APT_DOMAINS: Record<AptDomain, string> = {
  numerical: "Numerical",
  verbal: "Verbal",
  logical: "Logical",
};

export interface AptQuestion {
  id: number;
  domain: AptDomain;
  difficulty: Difficulty;
  text: string;
  options: string[];
  answer: number; // index into options
}

export const APT_QUESTIONS: AptQuestion[] = [
  // Numerical
  { id: 1, domain: "numerical", difficulty: "medium", text: "A shirt costs ₹800 after a 20% discount. What was the original price?",
    options: ["₹960", "₹1000", "₹1024", "₹640"], answer: 1 },
  { id: 2, domain: "numerical", difficulty: "hard", text: "If 5 machines make 5 widgets in 5 minutes, how long do 100 machines take to make 100 widgets?",
    options: ["5 minutes", "100 minutes", "20 minutes", "1 minute"], answer: 0 },
  { id: 3, domain: "numerical", difficulty: "medium", text: "What comes next: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "36", "44"], answer: 1 },
  { id: 4, domain: "numerical", difficulty: "easy", text: "A car covers 150 km in 2.5 hours. Its average speed is?",
    options: ["50 km/h", "60 km/h", "75 km/h", "45 km/h"], answer: 1 },
  { id: 5, domain: "numerical", difficulty: "easy", text: "What is 15% of 240?",
    options: ["36", "30", "32", "40"], answer: 0 },
  { id: 6, domain: "numerical", difficulty: "medium", text: "A price rises from ₹200 to ₹250. What is the percentage increase?",
    options: ["20%", "25%", "50%", "30%"], answer: 1 },
  { id: 7, domain: "numerical", difficulty: "easy", text: "If 3 pens cost ₹45, what do 7 pens cost at the same rate?",
    options: ["₹90", "₹105", "₹95", "₹115"], answer: 1 },
  // Verbal
  { id: 8, domain: "verbal", difficulty: "easy", text: "Choose the word closest in meaning to 'Meticulous':",
    options: ["Careless", "Thorough", "Hasty", "Vague"], answer: 1 },
  { id: 9, domain: "verbal", difficulty: "hard", text: "'Ephemeral' most nearly means:",
    options: ["Lasting", "Fleeting", "Solid", "Ancient"], answer: 1 },
  { id: 10, domain: "verbal", difficulty: "easy", text: "Book is to Reading as Fork is to:",
    options: ["Kitchen", "Eating", "Metal", "Cooking"], answer: 1 },
  { id: 11, domain: "verbal", difficulty: "medium", text: "Which word is the odd one out?",
    options: ["Rose", "Tulip", "Oak", "Lily"], answer: 2 },
  { id: 12, domain: "verbal", difficulty: "easy", text: "Choose the word most opposite in meaning to 'Abundant':",
    options: ["Plentiful", "Scarce", "Rich", "Ample"], answer: 1 },
  { id: 13, domain: "verbal", difficulty: "medium", text: "'Candid' most nearly means:",
    options: ["Secretive", "Frank", "Rude", "Shy"], answer: 1 },
  { id: 14, domain: "verbal", difficulty: "easy", text: "Doctor is to Hospital as Teacher is to:",
    options: ["Student", "School", "Book", "Lesson"], answer: 1 },
  // Logical
  { id: 15, domain: "logical", difficulty: "medium", text: "All Bloops are Razzies. All Razzies are Lazzies. Therefore:",
    options: ["All Bloops are Lazzies", "All Lazzies are Bloops", "No Bloops are Lazzies", "Some Razzies aren't Bloops"], answer: 0 },
  { id: 16, domain: "logical", difficulty: "hard", text: "If it rains, the match is cancelled. The match was NOT cancelled. It follows that:",
    options: ["It rained", "It did not rain", "The match was played in rain", "Cannot be determined"], answer: 1 },
  { id: 17, domain: "logical", difficulty: "medium", text: "Find the next letter: A, C, F, J, ?",
    options: ["N", "O", "P", "M"], answer: 1 },
  { id: 18, domain: "logical", difficulty: "medium", text: "In a photo, a man says 'She is the daughter of my grandfather's only son.' She is his:",
    options: ["Sister", "Daughter", "Cousin", "Niece"], answer: 0 },
  { id: 19, domain: "logical", difficulty: "easy", text: "What comes next: 1, 4, 9, 16, 25, ?",
    options: ["30", "36", "49", "20"], answer: 1 },
  { id: 20, domain: "logical", difficulty: "medium", text: "Some cats are pets. All pets are fed daily. Which must be true?",
    options: ["All cats are fed daily", "Some cats are fed daily", "No cats are pets", "All fed animals are cats"], answer: 1 },
  { id: 21, domain: "logical", difficulty: "easy", text: "Pointing to a woman, Rohan says, 'She is my mother's only daughter.' The woman is Rohan's:",
    options: ["Mother", "Sister", "Aunt", "Daughter"], answer: 1 },
];

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];
const WEIGHT: Record<Difficulty, number> = { easy: 0.6, medium: 1, hard: 1.5 };

/** Next difficulty after a right (harder) or wrong (easier) answer, clamped. */
export function nextDifficulty(cur: Difficulty, correct: boolean): Difficulty {
  return LEVELS[Math.max(0, Math.min(2, LEVELS.indexOf(cur) + (correct ? 1 : -1)))];
}

/** Pick an unused item in a domain at (or nearest to) the target difficulty. */
export function pickAptItem(domain: AptDomain, target: Difficulty, asked: Set<number>): AptQuestion {
  const pool = APT_QUESTIONS.filter((q) => q.domain === domain && !asked.has(q.id));
  const order =
    target === "hard" ? (["hard", "medium", "easy"] as Difficulty[])
    : target === "easy" ? (["easy", "medium", "hard"] as Difficulty[])
    : (["medium", "hard", "easy"] as Difficulty[]);
  for (const d of order) {
    const cands = pool.filter((q) => q.difficulty === d);
    if (cands.length) return cands[Math.floor(Math.random() * cands.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export type AptScores = Record<AptDomain, number>; // 0..1 per domain, difficulty-weighted

/** Difficulty-weighted proportion correct per domain (hard items count for more),
 *  over the items actually answered. Stays 0..1 so the rest of the app is unchanged. */
export function scoreAptitude(answers: Record<number, number>): AptScores {
  const earned: AptScores = { numerical: 0, verbal: 0, logical: 0 };
  const possible: AptScores = { numerical: 0, verbal: 0, logical: 0 };
  for (const q of APT_QUESTIONS) {
    if (answers[q.id] === undefined) continue;
    possible[q.domain] += WEIGHT[q.difficulty];
    if (answers[q.id] === q.answer) earned[q.domain] += WEIGHT[q.difficulty];
  }
  const s = (d: AptDomain) => (possible[d] ? earned[d] / possible[d] : 0);
  return { numerical: s("numerical"), verbal: s("verbal"), logical: s("logical") };
}
