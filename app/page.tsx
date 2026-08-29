import Link from "next/link";
import RahiBot from "@/components/RahiBot";

const PILLARS = [
  { n: "01", t: "Interests", d: "What you're actually drawn to — mapped with Holland's RIASEC model." },
  { n: "02", t: "Aptitude", d: "What comes easily — reasoning across numbers, words, and logic." },
  { n: "03", t: "Emotional strengths", d: "How you work with people — the shape of role that fits you." },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <main className="w-full max-w-4xl flex-1 px-6 py-16 sm:py-20">
        {/* hero — asymmetric: text left, guide right */}
        <section className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="rule-pop inline-block text-xs font-bold tracking-[0.2em] text-pop-700 dark:text-pop-400 uppercase">
              Rahi · your guide
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-semibold text-balance sm:text-6xl">
              Find work that fits{" "}
              <span className="marker">the real you</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Not a personality quiz that flatters you. Rahi measures three things that
              genuinely decide fit — your interests, aptitude, and emotional strengths —
              then points you to careers, courses, and colleges that actually make sense.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Begin the assessment →
              </Link>
              <span className="text-sm text-[var(--muted)]">~10 min · 3 short tests · free</span>
            </div>
          </div>
          <div className="hidden justify-self-center text-brand-600 sm:flex dark:text-brand-400">
            <RahiBot size={168} mood="wave" />
          </div>
        </section>

        {/* pillars — a course syllabus, numbered */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-hairline sm:mt-16">
          {PILLARS.map((p, i) => (
            <div
              key={p.n}
              className={`flex items-baseline gap-5 px-6 py-6 sm:gap-8 sm:px-8 ${i > 0 ? "border-t border-hairline" : ""}`}
            >
              <span className="font-display text-3xl font-semibold text-pop-500 sm:text-4xl">{p.n}</span>
              <div>
                <h3 className="font-display text-xl font-semibold">{p.t}</h3>
                <p className="mt-1 text-[var(--muted)]">{p.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* trust */}
        <p className="mt-10 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Grounded in real psychometrics — Holland Codes, aptitude reasoning, and
          Goleman's model of emotional intelligence. Every career comes with real
          course, college, and salary information, never invented numbers.
        </p>
      </main>
    </div>
  );
}
