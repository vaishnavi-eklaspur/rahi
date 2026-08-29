"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  DIMENSIONS, scoreRiasec, hollandCode, type Dimension,
} from "@/lib/riasec";
import { APT_DOMAINS, scoreAptitude, type AptDomain, type AptScores } from "@/lib/aptitude";
import { EQ_DOMAINS, scoreEq, responseConfidence, type EqDomain } from "@/lib/eq";
import { rankCareers, type RankedCareer } from "@/lib/careers";
import { ENRICHMENT, type Geo, type GeoData } from "@/lib/enrichment";
import { roadmapFor } from "@/lib/resources";
import { archetypeFor } from "@/lib/archetype";
import { pathFor } from "@/lib/exams";
import { nutshell, defaultPlan, strongestApt } from "@/lib/summary";
import { encodeReport, type Answers } from "@/lib/report-code";
import Chat from "@/components/Chat";
import PrintButton from "@/components/PrintButton";
import RiasecRadar from "@/components/RiasecRadar";
import PathTimeline from "@/components/PathTimeline";
import Simulator from "@/components/Simulator";
import PlanCheckin from "@/components/PlanCheckin";

type Profile = { code: Dimension[]; aptitude: AptScores; eqOverall: number };

const pct = (f: number) => `${Math.round(f * 100)}%`;

export default function Report({
  rz, ap, eqA, children,
}: { rz: Answers; ap: Answers; eqA: Answers; children?: React.ReactNode }) {
  const [geo, setGeo] = useState<Geo>("india");
  const scores = scoreRiasec(rz);
  const code = hollandCode(scores);
  const arch = archetypeFor(code);
  // RIASEC meters normalise against the max possible for this attempt: balanced
  // sampling gives equal items per dimension, each rated up to 5. Falls back to 25.
  const rMax = (Object.keys(rz).length / 6) * 5 || 25;
  const apt = scoreAptitude(ap);
  const eq = scoreEq(eqA);
  const conf = responseConfidence(eqA);
  const confMeta = {
    high: { label: "High", dot: "bg-green-500" },
    moderate: { label: "Moderate", dot: "bg-amber-500" },
    low: { label: "Low", dot: "bg-pop-500" },
  }[conf.level];
  const careers = rankCareers(code, apt, eq.overall, 5);
  const profile: Profile = { code, aptitude: apt, eqOverall: eq.overall };

  const riasecOrder: Dimension[] = ["R", "I", "A", "S", "E", "C"];
  const aptOrder: AptDomain[] = ["numerical", "verbal", "logical"];
  const eqOrder: EqDomain[] = ["SA", "SM", "SoA", "RM"];

  // "In a nutshell" + a 90-day plan: deterministic instantly, AI-upgraded when a
  // local model answers (app/api/summary).
  const top = careers[0];
  const weak = top ? top.aptitude.filter((d) => apt[d] < 0.5) : [];
  const topRoadmap = top ? roadmapFor(top.title, top.aptitude, apt) : [];
  const detNutshell = nutshell(code, apt, eq.overall);
  const detPlan = top ? defaultPlan(top.title, topRoadmap, weak) : [];

  const [ai, setAi] = useState<{ nutshell?: string | null; plan?: string[] | null }>({});
  const summaryTried = useRef(false);
  useEffect(() => {
    if (summaryTried.current || !top) return;
    summaryTried.current = true;
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: { interests: code.map((d) => DIMENSIONS[d].name), apt, eqOverall: eq.overall },
        top: {
          title: top.title,
          desc: top.desc,
          skills: ENRICHMENT[top.title]?.skills ?? [],
          resources: topRoadmap.map((r) => r.title),
          weak: weak.map((d) => APT_DOMAINS[d]),
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => setAi(d))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showNutshell = ai.nutshell ?? detNutshell;
  const showPlan = ai.plan ?? detPlan;
  const reportCode = encodeReport({ rz, ap, eqA });

  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)]">
      <main className="w-full max-w-2xl flex-1 px-6 py-14">
        <div className="mb-4 flex flex-wrap justify-end gap-2 print:hidden">
          <Link
            href={`/r/${reportCode}/parent`}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-brand-400 hover:text-foreground"
          >
            👪 For parents
          </Link>
          <PrintButton className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-brand-400 hover:text-foreground" />
        </div>
        <p className="rule-pop mb-3 inline-block text-xs font-bold tracking-[0.18em] text-pop-700 dark:text-pop-400 uppercase">
          Your career archetype
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          The <span className="marker">{arch.title.replace(/^The /, "")}</span>
        </h1>
        <p className="mt-3 text-base text-foreground/90 sm:text-lg">{arch.tagline}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Holland code <span className="font-semibold text-brand-600 dark:text-brand-400">{code.join("")}</span> ·{" "}
          {code.map((d) => DIMENSIONS[d].name).join(", ")} · overall EQ{" "}
          <span className="font-semibold text-brand-600 dark:text-brand-400">{pct(eq.overall)}</span> · strongest aptitude{" "}
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            {APT_DOMAINS[strongestApt(apt)]}
          </span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className={`inline-block h-2 w-2 rounded-full ${confMeta.dot}`} />
          <span className="font-medium">{confMeta.label} confidence</span>
          <span className="text-[var(--muted)]">· {conf.note}</span>
        </div>

        <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-950/40">
          <p className="rule-pop mb-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase dark:text-brand-300">
            In a nutshell
            {ai.nutshell && <span className="rounded bg-pop-500 px-1.5 py-0.5 text-[10px] tracking-normal text-white normal-case">AI</span>}
          </p>
          <p className="font-display text-base leading-7 text-brand-950 dark:text-brand-50 sm:text-lg">{showNutshell}</p>
        </div>

        <div className="mt-8 grid gap-4">
          <Card title="Interests (RIASEC)">
            <div className="text-foreground">
              <RiasecRadar
                data={riasecOrder.map((d) => ({
                  letter: d,
                  name: DIMENSIONS[d].name,
                  frac: scores[d] / rMax,
                  hi: code.includes(d),
                }))}
              />
            </div>
          </Card>
          <Card title="Aptitude">
            {aptOrder.map((d) => (
              <Meter key={d} label={APT_DOMAINS[d]} frac={apt[d]} right={pct(apt[d])} hi={apt[d] >= 0.5} />
            ))}
          </Card>
          <Card title="Emotional quotient">
            {eqOrder.map((d) => (
              <Meter key={d} label={EQ_DOMAINS[d]} frac={eq.byDomain[d]} right={pct(eq.byDomain[d])} hi={eq.byDomain[d] >= 0.6} />
            ))}
          </Card>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-3 sm:mt-14">
          <div>
            <h2 className="text-2xl font-semibold">
              Careers that fit <span className="marker">you</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Ranked on all three tests. Open a card for the full path.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-hairline bg-paper-2 p-1">
            {(["india", "global"] as Geo[]).map((g) => (
              <button
                key={g}
                onClick={() => setGeo(g)}
                aria-pressed={geo === g}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  geo === g ? "bg-brand-600 text-white" : "text-[var(--muted)] hover:text-foreground"
                }`}
              >
                {g === "india" ? "India" : "Global"}
              </button>
            ))}
          </div>
        </div>
        <ol className="mt-5 space-y-3">
          {careers.map((c, idx) => (
            <CareerRow key={c.title} c={c} idx={idx} geo={geo} profile={profile} />
          ))}
        </ol>

        <div className="print:hidden">
          <Simulator code={code} baseApt={apt} baseEq={eq.overall} />
        </div>

        {showPlan.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <h2 className="font-display text-2xl font-semibold">
              Your next <span className="marker">90 days</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {ai.plan ? "A starting plan, written for your profile." : "A starting plan from your strengths and gaps."}
            </p>
            <div className="mt-5">
              {/* key on plan content so switching deterministic→AI re-inits the checklist to the right length */}
              <PlanCheckin key={showPlan.join("|")} steps={showPlan} storageKey={`rahi_plan_${reportCode}`} />
            </div>
          </section>
        )}

        <Chat code={reportCode} />

        {children && <div className="mt-10 flex flex-wrap gap-4 print:hidden">{children}</div>}
      </main>
    </div>
  );
}

function Meter({ label, frac, right, hi }: { label: string; frac: number; right: string; hi?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-foreground/80">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-2">
        <div
          className={`h-full rounded-full ${hi ? "bg-brand-600" : "bg-brand-200 dark:bg-brand-900"}`}
          style={{ width: `${Math.round(frac * 100)}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs tabular-nums text-[var(--muted)]">{right}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-[var(--background)] p-6">
      <h3 className="mb-4 text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CareerRow({
  c, idx, geo, profile,
}: { c: RankedCareer; idx: number; geo: Geo; profile: Profile }) {
  const [open, setOpen] = useState(idx === 0); // top match expanded by default
  const [aiWhy, setAiWhy] = useState<string | null>(null);
  const [aiDay, setAiDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tried = useRef(false);
  const e = ENRICHMENT[c.title];
  const g: GeoData | undefined = e?.[geo];
  const roadmap = roadmapFor(c.title, c.aptitude, profile.aptitude);
  const path = pathFor(c.title);

  // Fetch the LLM narrative (why + a "day in the life") once, the first time this
  // card opens. No API key → the route returns nulls and we keep the deterministic why.
  useEffect(() => {
    if (!open || tried.current) return;
    tried.current = true;
    setLoading(true);
    fetch("/api/why", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        career: { title: c.title, desc: c.desc, riasec: c.riasec, aptitude: c.aptitude, eq: c.eq, parts: c.parts },
        profile,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.text) setAiWhy(d.text); if (d.day) setAiDay(d.day); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <li className={`overflow-hidden rounded-2xl border bg-[var(--background)] ${idx === 0 ? "border-brand-300 dark:border-brand-800" : "border-hairline"}`}>
      {idx === 0 && (
        <div className="bg-pop-500 px-5 py-1 text-[11px] font-bold tracking-[0.12em] text-white uppercase">
          ★ Your top match
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-4 p-5 text-left">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">
          {idx + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="font-display text-lg font-semibold">{c.title}</h3>
            <span className="ml-auto text-sm font-bold text-pop-700 dark:text-pop-400">{pct(c.fit)} match</span>
            <span className="text-[var(--muted)]">{open ? "▾" : "▸"}</span>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{c.desc}</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            {(["interest", "aptitude", "eq"] as const).map((k) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-[var(--muted)]">
                  <span className="capitalize">{k === "eq" ? "EQ" : k}</span>
                  <span className="tabular-nums">{pct(c.parts[k])}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: pct(c.parts[k]) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </button>

      {open && g && e && (
        <div className="border-t border-hairline px-5 pt-4 pb-5">
          <div className="rounded-xl bg-brand-50 p-3.5 text-sm leading-6 text-brand-900 dark:bg-brand-950/40 dark:text-brand-100">
            <span className="font-semibold">Why this fits you </span>
            {aiWhy && (
              <span className="rounded bg-pop-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                AI
              </span>
            )}
            <span className="font-semibold"> · </span>
            {aiWhy ?? c.why}
            {loading && !aiWhy && <span className="text-brand-500"> · personalising…</span>}
          </div>

          {aiDay && (
            <div className="mt-2 rounded-xl bg-pop-50 p-3.5 text-sm leading-6 text-pop-900 dark:bg-pop-950/30 dark:text-pop-100">
              <span className="font-semibold">A day in this life · </span>
              {aiDay}
            </div>
          )}

          <Detail title="Skills to build">
            <div className="flex flex-wrap gap-2">
              {e.skills.map((x) => (
                <span key={x} className="rounded-full bg-paper-2 px-2.5 py-1 text-xs text-foreground/80">
                  {x}
                </span>
              ))}
            </div>
          </Detail>

          <Detail title="Free learning roadmap">
            <ul className="space-y-1.5">
              {roadmap.map((r) => (
                <li key={r.url} className="text-sm">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                    {r.title}
                  </a>
                  <span className="text-[var(--muted)]"> · {r.provider}</span>
                  {r.note && <span className="text-pop-700 dark:text-pop-400"> — {r.note}</span>}
                </li>
              ))}
            </ul>
          </Detail>

          <Detail title="Your path from here (India)">
            <PathTimeline path={path} />
          </Detail>
          <Detail title="Courses"><Lines items={e.courses} /></Detail>
          <Detail title="How to get in"><p>{g.path}</p></Detail>
          <Detail title="Top universities"><Lines items={g.universities} /></Detail>
          <Detail title="Typical salary (indicative)"><p>{g.salary}</p></Detail>
          <Detail title="Where people work"><Lines items={g.companies} /></Detail>
        </div>
      )}
    </li>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="mb-1.5 text-xs font-bold tracking-[0.1em] text-[var(--muted)] uppercase">{title}</h4>
      <div className="text-sm text-foreground/80">{children}</div>
    </div>
  );
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-0.5">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}
