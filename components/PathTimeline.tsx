// Visual "after 12th → exam → degree → role" timeline for a career, with the
// relevant entrance exams + their current windows (from lib/exams).
import { EXAMS, type CareerPath } from "@/lib/exams";

export default function PathTimeline({ path }: { path: CareerPath }) {
  return (
    <div>
      <p className="mb-3 text-xs text-[var(--muted)]">
        Best-fit stream: <span className="font-medium text-foreground/90">{path.stream}</span>
      </p>

      <ol className="ml-1 space-y-3 border-l-2 border-hairline pl-5">
        {path.steps.map((s, i) => (
          <li key={i} className="relative">
            <span className="absolute top-1 -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-500 bg-[var(--background)]" />
            <p className="text-sm leading-6 text-foreground/90">{s}</p>
          </li>
        ))}
      </ol>

      <p className="mt-5 mb-2 text-xs font-bold tracking-[0.1em] text-[var(--muted)] uppercase">Key exams</p>
      <div className="space-y-2">
        {path.exams.map((k) => {
          const e = EXAMS[k];
          return (
            <a
              key={k}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-hairline p-3 transition-colors hover:border-brand-400"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-brand-700 dark:text-brand-300">{e.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                    e.status === "confirmed"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-pop-100 text-pop-700 dark:bg-pop-950 dark:text-pop-200"
                  }`}
                >
                  {e.status === "confirmed" ? "Dates out" : "Expected"}
                </span>
                <span className="ml-auto text-xs text-brand-600 dark:text-brand-400">official site →</span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{e.full}</p>
              <p className="mt-1 text-sm text-foreground/90">{e.window}</p>
            </a>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        Dates current as of Aug 2026 — always confirm on the official site before you plan around them.
      </p>
    </div>
  );
}
