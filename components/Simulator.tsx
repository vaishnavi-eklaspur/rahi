"use client";

// "Grow your options" — drag a skill up and watch the top-5 re-rank live, using
// the same rankCareers() as the real report. Makes the skill-gate visible: a
// career that needs a skill you're low in climbs (or appears) as you raise it.
import { useState } from "react";
import { rankCareers } from "@/lib/careers";
import type { Dimension } from "@/lib/riasec";
import { APT_DOMAINS, type AptDomain, type AptScores } from "@/lib/aptitude";

const APTS: AptDomain[] = ["numerical", "verbal", "logical"];
const pct = (f: number) => `${Math.round(f * 100)}%`;

export default function Simulator({
  code, baseApt, baseEq,
}: { code: Dimension[]; baseApt: AptScores; baseEq: number }) {
  const [apt, setApt] = useState<AptScores>({ ...baseApt });
  const [eq, setEq] = useState(baseEq);

  const base = rankCareers(code, baseApt, baseEq, 5);
  const sim = rankCareers(code, apt, eq, 5);
  const baseTitles = new Set(base.map((c) => c.title));
  const baseFit = new Map(base.map((c) => [c.title, c.fit] as const));

  const dirty = APTS.some((d) => apt[d] !== baseApt[d]) || eq !== baseEq;
  const reset = () => { setApt({ ...baseApt }); setEq(baseEq); };

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-semibold">
        Grow your <span className="marker">options</span>
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Drag a skill up to see how strengthening it would reshape your matches. Your real scores are the starting point.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-hairline bg-paper-2 p-5">
          {APTS.map((d) => (
            <Slider
              key={d}
              label={APT_DOMAINS[d]}
              value={apt[d]}
              base={baseApt[d]}
              onChange={(v) => setApt((a) => ({ ...a, [d]: v }))}
            />
          ))}
          <Slider label="Emotional (EQ)" value={eq} base={baseEq} onChange={setEq} />
          {dirty && (
            <button onClick={reset} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              ↺ Reset to my real scores
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-hairline p-5">
          <p className="mb-3 text-xs font-bold tracking-[0.1em] text-[var(--muted)] uppercase">
            {dirty ? "Your matches now" : "Your matches"}
          </p>
          <ol className="space-y-2.5">
            {sim.map((c, i) => {
              const isNew = !baseTitles.has(c.title);
              const climbed = !isNew && (baseFit.get(c.title) ?? 0) < c.fit - 0.001;
              return (
                <li key={c.title} className="flex items-center gap-2 text-sm">
                  <span className="w-4 shrink-0 text-[var(--muted)]">{i + 1}</span>
                  <span className="flex-1 truncate font-medium">{c.title}</span>
                  {isNew && (
                    <span className="rounded-full bg-pop-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                      New
                    </span>
                  )}
                  {climbed && <span className="font-bold text-pop-700 dark:text-pop-400">↑</span>}
                  <span className="w-10 shrink-0 text-right tabular-nums text-[var(--muted)]">{pct(c.fit)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label, value, base, onChange,
}: { label: string; value: number; base: number; onChange: (v: number) => void }) {
  const moved = Math.abs(value - base) > 0.001;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--muted)]">
          {Math.round(value * 100)}%
          {moved && <span className="text-pop-700 dark:text-pop-400"> (was {Math.round(base * 100)}%)</span>}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-[#1f5fd0]"
        aria-label={label}
      />
    </div>
  );
}
