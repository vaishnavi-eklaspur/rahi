"use client";

// Rahi checks in on your 90-day plan: tick steps off, a progress bar fills, and
// Rahi reacts. Progress persists per-report in localStorage (keyed by the code).
import { useEffect, useState } from "react";
import Link from "next/link";
import RahiBot from "@/components/RahiBot";

export default function PlanCheckin({ steps, storageKey }: { steps: string[]; storageKey: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setChecked(steps.map((_, i) => !!arr[i]));
      }
    } catch {}
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (i: number) =>
    setChecked((c) => {
      const next = c.map((v, j) => (j === i ? !v : v));
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });

  const done = checked.filter(Boolean).length;
  const total = steps.length;
  const allDone = total > 0 && done === total;
  const mood = allDone ? "cheer" : done > 0 ? "happy" : "wave";

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-hairline bg-paper-2 p-3">
        <span className="shrink-0 text-brand-600 dark:text-brand-400">
          <RahiBot size={40} mood={mood} />
        </span>
        <p className="text-sm font-medium">
          {allDone ? (
            <>
              All done — nice work.{" "}
              <Link href="/assessment" className="text-brand-600 underline dark:text-brand-400">Retake the quiz</Link>{" "}
              to watch your scores grow.
            </>
          ) : done > 0 ? (
            `${done} of ${total} done. Good momentum — keep going!`
          ) : (
            "Tick these off as you go — I'll keep track for you."
          )}
        </p>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <ul className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={i}>
            <button onClick={() => toggle(i)} className="flex w-full items-start gap-3 text-left">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors ${
                  checked[i] ? "border-brand-600 bg-brand-600 text-white" : "border-hairline text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={`text-sm leading-6 ${checked[i] ? "text-[var(--muted)] line-through" : "text-foreground/90"}`}>
                {s}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
