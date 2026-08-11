// Parent report — a plain-language, print-friendly summary for parents/guardians.
// No jargon (no "RIASEC"/"Holland code"); reuses the same grounded data as the
// full report. Reachable at /r/<code|slug>/parent.
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeReport } from "@/lib/report-code";
import { sql } from "@/lib/db";
import { DIMENSIONS, scoreRiasec, hollandCode } from "@/lib/riasec";
import { scoreAptitude, type AptDomain } from "@/lib/aptitude";
import { scoreEq, responseConfidence } from "@/lib/eq";
import { rankCareers } from "@/lib/careers";
import { ENRICHMENT } from "@/lib/enrichment";
import { archetypeFor } from "@/lib/archetype";
import { nutshell } from "@/lib/summary";
import { pathFor, EXAMS } from "@/lib/exams";
import PrintButton from "@/components/PrintButton";

const pct = (f: number) => `${Math.round(f * 100)}%`;
const APT_PLAIN: Record<AptDomain, string> = {
  numerical: "working with numbers",
  verbal: "language & communication",
  logical: "logic & problem-solving",
};

export default async function ParentReport({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let answers = decodeReport(code);
  if (!answers && sql) {
    const rows = await sql`select code from reports where id = ${code} limit 1`;
    if (rows.length) answers = decodeReport(rows[0].code);
  }
  if (!answers) notFound();

  const { rz, ap, eqA } = answers;
  const hCode = hollandCode(scoreRiasec(rz));
  const apt = scoreAptitude(ap);
  const eq = scoreEq(eqA);
  const arch = archetypeFor(hCode);
  const careers = rankCareers(hCode, apt, eq.overall, 3);
  const conf = responseConfidence(eqA);
  const top = careers[0];
  const path = pathFor(top.title);

  const aptOrder: AptDomain[] = ["numerical", "verbal", "logical"];
  const strengths = aptOrder.filter((d) => apt[d] >= 0.6).map((d) => APT_PLAIN[d]);
  const eqBand = eq.overall >= 0.66 ? "strong" : eq.overall >= 0.4 ? "steady" : "still developing";

  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)]">
      <main className="w-full max-w-2xl flex-1 px-6 py-12">
        <div className="mb-4 flex flex-wrap justify-end gap-2 print:hidden">
          <PrintButton className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-brand-400 hover:text-foreground" />
          <Link href={`/r/${code}`} className="inline-flex items-center rounded-full border border-hairline px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-brand-400 hover:text-foreground">
            Full report →
          </Link>
        </div>

        <p className="rule-pop mb-3 inline-block text-xs font-bold tracking-[0.18em] text-pop-700 uppercase dark:text-pop-400">
          For parents & guardians
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{arch.title}</h1>
        <p className="mt-3 text-lg leading-7 text-foreground/90">{nutshell(hCode, apt, eq.overall)}</p>

        <Section title="What they enjoy">
          They're naturally drawn to work that is{" "}
          <strong className="font-semibold">{DIMENSIONS[hCode[0]].blurb}</strong>
          {hCode[1] && <> and <strong className="font-semibold">{DIMENSIONS[hCode[1]].blurb}</strong></>}.
        </Section>

        <Section title="Where they're strong">
          {strengths.length > 0 ? (
            <>They show real strength in <strong className="font-semibold">{strengths.join(", ")}</strong>, and their emotional skills (staying calm, reading people, working with others) are <strong className="font-semibold">{eqBand}</strong>.</>
          ) : (
            <>Their reasoning skills are still developing, and their emotional skills (staying calm, reading people, working with others) are <strong className="font-semibold">{eqBand}</strong>. A short course or two would build confidence fast.</>
          )}
        </Section>

        <Section title="Careers that fit">
          <ul className="space-y-3">
            {careers.map((c) => {
              const salary = ENRICHMENT[c.title]?.india.salary;
              return (
                <li key={c.title} className="rounded-xl border border-hairline p-4">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-lg font-semibold">{c.title}</span>
                    <span className="ml-auto text-sm font-bold text-pop-700 dark:text-pop-400">{pct(c.fit)} fit</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{c.desc}</p>
                  {salary && <p className="mt-1 text-sm">Typical pay in India: <strong className="font-semibold">{salary}</strong> <span className="text-[var(--muted)]">(indicative)</span></p>}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="What to do next">
          <p>Recommended stream in Class 11–12: <strong className="font-semibold">{path.stream}</strong>.</p>
          <p className="mt-2">Key entrance exam{path.exams.length > 1 ? "s" : ""} for their top match ({top.title}):</p>
          <ul className="mt-2 space-y-2">
            {path.exams.map((k) => {
              const e = EXAMS[k];
              return (
                <li key={k} className="rounded-xl border border-hairline p-3">
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 dark:text-brand-300">{e.name}</a>
                  <span className="text-[var(--muted)]"> — {e.full}</span>
                  <p className="mt-0.5 text-sm">{e.window}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-[var(--muted)]">Exam dates are current as of Aug 2026 — please confirm on the official sites.</p>
        </Section>

        <Section title="How this was worked out">
          Rahi measured three things psychologists actually use to gauge career fit — <strong className="font-semibold">interests</strong>, <strong className="font-semibold">aptitude</strong>, and <strong className="font-semibold">emotional skills</strong> — not a fun personality quiz. The careers, salary ranges, colleges, and exams shown are real, curated information, not made-up numbers. On this attempt, the answers were <strong className="font-semibold">{conf.level === "high" ? "consistent and reliable" : conf.level === "moderate" ? "mostly consistent" : "a little inconsistent — a retake would sharpen the result"}</strong>.
        </Section>

        <div className="mt-10 flex flex-wrap gap-4 print:hidden">
          <Link href={`/r/${code}`} className="inline-flex h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700">
            See the full report
          </Link>
          <Link href="/assessment" className="inline-flex h-11 items-center rounded-full border border-hairline px-6 text-sm font-medium text-foreground transition-colors hover:bg-paper-2">
            Take the test
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
      <div className="text-[15px] leading-7 text-foreground/90">{children}</div>
    </section>
  );
}
