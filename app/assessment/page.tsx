"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QUESTIONS, SCALE, type Question } from "@/lib/riasec";
import { pickAptItem, nextDifficulty, type AptQuestion, type AptDomain, type Difficulty } from "@/lib/aptitude";
import { EQ_ITEMS, EQ_SCALE, type EqItem } from "@/lib/eq";
import { sampleByGroup } from "@/lib/sample";
import { encodeReport } from "@/lib/report-code";
import { deviceId } from "@/lib/device";
import Report from "@/components/Report";

const SECTIONS = [
  { label: "Interests", sub: "How much would you enjoy…" },
  { label: "Aptitude", sub: "Pick the best answer" },
  { label: "Emotional strengths", sub: "How accurately does this describe you?" },
];

const APT_ORDER: AptDomain[] = ["numerical", "verbal", "logical"];
const RIASEC_N = 24;      // 4 per RIASEC dimension
const APT_PER = 4;        // adaptive items per aptitude domain
const APT_N = APT_ORDER.length * APT_PER; // 12
const EQ_N = 12;          // 3 per EQ domain
const TOTAL = RIASEC_N + APT_N + EQ_N; // 48

type Step =
  | { kind: "riasec"; section: 0; q: Question }
  | { kind: "apt"; section: 1; q: AptQuestion }
  | { kind: "eq"; section: 2; q: EqItem };

type Answers = Record<number, number>;

const makeRiasec = () => sampleByGroup(QUESTIONS, (q) => q.dim, 4);
const makeEq = () => sampleByGroup(EQ_ITEMS, (it) => it.domain, 3);

// Persist an in-progress attempt so a refresh / accidental tab-close doesn't wipe it.
// The whole quiz runs client-side (questions sampled locally, answers held in state
// until the end), so this is about surviving a reload — not a network dependency.
const LS_KEY = "rahi_assessment_progress";

export default function Assessment() {
  const router = useRouter();
  const [rSteps, setRSteps] = useState<Question[]>(makeRiasec);
  const [eSteps, setESteps] = useState<EqItem[]>(makeEq);
  const [history, setHistory] = useState<Step[]>(() => [{ kind: "riasec", section: 0, q: rSteps[0] }]);
  const [pos, setPos] = useState(0);
  const [rz, setRz] = useState<Answers>({});
  const [ap, setAp] = useState<Answers>({});
  const [eqA, setEqA] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const autoSaved = useRef(false);
  const [ready, setReady] = useState(false); // true once localStorage has been read

  // Rehydrate an in-progress attempt on mount (client-only). Restores the exact sampled
  // questions + adaptive path so the user lands back on the question they left off at.
  /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage hydration on mount is intentional and SSR-safe */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const s = raw ? JSON.parse(raw) : null;
      if (s && Array.isArray(s.history) && s.history.length) {
        setRSteps(s.rSteps);
        setESteps(s.eSteps);
        setHistory(s.history);
        setPos(s.pos ?? 0);
        setRz(s.rz ?? {});
        setAp(s.ap ?? {});
        setEqA(s.eqA ?? {});
      }
    } catch {}
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save progress on every change until the report is generated; clear it once done.
  // Gated on `ready` (state, not a ref) so the first commit's defaults never clobber
  // saved data before rehydration has applied.
  useEffect(() => {
    if (!ready) return;
    try {
      if (done) localStorage.removeItem(LS_KEY);
      else localStorage.setItem(LS_KEY, JSON.stringify({ rSteps, eSteps, history, pos, rz, ap, eqA }));
    } catch {}
  }, [ready, rSteps, eSteps, history, pos, rz, ap, eqA, done]);

  // Record every completed attempt to history (device / account) for progress tracking.
  useEffect(() => {
    if (!done || autoSaved.current) return;
    autoSaved.current = true;
    (async () => {
      try {
        await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: encodeReport({ rz, ap, eqA }), device: deviceId() }),
        });
      } catch {}
    })();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = () => {
    const r = makeRiasec();
    const e = makeEq();
    setRSteps(r);
    setESteps(e);
    setHistory([{ kind: "riasec", section: 0, q: r[0] }]);
    setPos(0);
    setRz({});
    setAp({});
    setEqA({});
    setDone(false);
    autoSaved.current = false;
  };

  // The next item: interests & EQ are pre-sampled by index; aptitude is ADAPTIVE —
  // the next item's difficulty follows whether the previous one was answered right.
  const genNext = (n: number, curValue: number): Step => {
    if (n < RIASEC_N) return { kind: "riasec", section: 0, q: rSteps[n] };
    if (n < RIASEC_N + APT_N) {
      const aptIndex = n - RIASEC_N;
      const within = aptIndex % APT_PER;
      const domain = APT_ORDER[Math.floor(aptIndex / APT_PER)];
      let target: Difficulty = "medium";
      if (within > 0) {
        const prev = history[n - 1].q as AptQuestion; // the apt item just answered
        target = nextDifficulty(prev.difficulty, curValue === prev.answer);
      }
      const asked = new Set(history.filter((s) => s.kind === "apt").map((s) => (s.q as AptQuestion).id));
      return { kind: "apt", section: 1, q: pickAptItem(domain, target, asked) };
    }
    return { kind: "eq", section: 2, q: eSteps[n - RIASEC_N - APT_N] };
  };

  const answer = (value: number) => {
    const cur = history[pos];
    const setMap = cur.kind === "riasec" ? setRz : cur.kind === "apt" ? setAp : setEqA;
    setMap((a) => ({ ...a, [cur.q.id]: value }));
    if (pos < history.length - 1) {
      setPos(pos + 1); // moving forward through already-seen items (after Back)
      return;
    }
    if (history.length >= TOTAL) {
      setDone(true);
      return;
    }
    setHistory((h) => [...h, genNext(h.length, value)]);
    setPos(pos + 1);
  };

  if (done) {
    const shareCode = encodeReport({ rz, ap, eqA });
    const btn = "inline-flex h-11 items-center rounded-full px-6 text-sm font-medium transition-colors";
    const outline = "border border-hairline text-foreground hover:bg-paper-2";
    const share = async () => {
      if (saving) return;
      setSaving(true);
      try {
        const r = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: shareCode, device: deviceId() }),
        });
        const d = await r.json();
        router.push(d.slug ? `/r/${d.slug}` : `/r/${shareCode}`);
      } catch {
        router.push(`/r/${shareCode}`);
      }
    };
    return (
      <Report rz={rz} ap={ap} eqA={eqA}>
        <button onClick={share} disabled={saving} className={`${btn} bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60`}>
          {saving ? "Saving…" : "Share this report"}
        </button>
        <button onClick={restart} className={`${btn} ${outline}`}>Retake test</button>
        <Link href="/reports" className={`${btn} ${outline}`}>My reports</Link>
        <Link href="/" className={`${btn} ${outline}`}>Home</Link>
      </Report>
    );
  }

  const step = history[pos];
  const map = step.kind === "riasec" ? rz : step.kind === "apt" ? ap : eqA;
  const choices =
    step.kind === "apt"
      ? step.q.options.map((label, value) => ({ value, label }))
      : step.kind === "riasec" ? SCALE : EQ_SCALE;

  const answered = Object.keys(rz).length + Object.keys(ap).length + Object.keys(eqA).length;
  const progress = Math.round((answered / TOTAL) * 100);
  const section = SECTIONS[step.section];

  return (
    <div className="flex flex-1 flex-col items-center">
      <main className="flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
        <div className="mb-10">
          <div className="mb-2 flex justify-between text-xs font-medium text-[var(--muted)]">
            <span>
              <span className="font-semibold text-pop-700 dark:text-pop-400">{section.label}</span>
              {" · "}question {pos + 1} of {TOTAL}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p className="mb-2 text-sm text-[var(--muted)]">{section.sub}</p>
        <h2 className="mb-8 font-display text-2xl font-semibold sm:text-3xl">{step.q.text}</h2>

        <div className="flex flex-col gap-2.5">
          {choices.map((c) => {
            const selected = map[step.q.id] === c.value;
            const badge = step.kind === "apt" ? String.fromCharCode(65 + c.value) : String(c.value);
            return (
              <button
                key={c.value}
                onClick={() => answer(c.value)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  selected
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                    : "border-hairline bg-[var(--background)] hover:border-brand-400 hover:bg-paper-2"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    selected ? "border-brand-600 bg-brand-600 text-white" : "border-hairline text-[var(--muted)]"
                  }`}
                >
                  {badge}
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPos(Math.max(0, pos - 1))}
          disabled={pos === 0}
          className="mt-8 self-start text-sm font-medium text-[var(--muted)] transition-colors hover:text-foreground disabled:opacity-40"
        >
          ← Back
        </button>
      </main>
    </div>
  );
}
