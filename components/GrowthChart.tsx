// Progress over time: a sparkline per metric across a user's attempts (oldest →
// newest), with the change since the first attempt. Pure SVG, no chart library.

type Metrics = { numerical: number; verbal: number; logical: number; eq: number };

const ROWS: { key: keyof Metrics; label: string }[] = [
  { key: "numerical", label: "Numerical" },
  { key: "verbal", label: "Verbal" },
  { key: "logical", label: "Logical" },
  { key: "eq", label: "Emotional (EQ)" },
];

const pct = (f: number) => `${Math.round(f * 100)}%`;

function Sparkline({ values }: { values: number[] }) {
  const n = values.length;
  const pt = (v: number, i: number) => [n === 1 ? 50 : (i / (n - 1)) * 100, 28 - v * 26 - 1] as const;
  const points = values.map((v, i) => pt(v, i).join(",")).join(" ");
  const [lx, ly] = pt(values[n - 1], n - 1);
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full">
      {n > 1 && <polyline points={points} fill="none" stroke="#1f5fd0" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />}
      <circle cx={lx} cy={ly} r="2.6" fill="#ff6b4a" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function GrowthChart({ attempts }: { attempts: Metrics[] }) {
  // attempts oldest → newest
  return (
    <div className="rounded-2xl border border-hairline p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold">Your progress</h2>
        <span className="text-sm text-[var(--muted)]">{attempts.length} attempts</span>
      </div>
      <div className="space-y-3">
        {ROWS.map(({ key, label }) => {
          const series = attempts.map((a) => a[key]);
          const first = series[0];
          const last = series[series.length - 1];
          const delta = Math.round((last - first) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm">{label}</span>
              <div className="min-w-0 flex-1">
                <Sparkline values={series} />
              </div>
              <span className="w-11 shrink-0 text-right text-sm tabular-nums">{pct(last)}</span>
              <span
                className={`w-12 shrink-0 text-right text-xs tabular-nums ${
                  delta > 0 ? "text-green-600 dark:text-green-400" : delta < 0 ? "text-pop-700 dark:text-pop-400" : "text-[var(--muted)]"
                }`}
              >
                {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{Math.abs(delta)}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">Change shown is since your first saved attempt.</p>
    </div>
  );
}
