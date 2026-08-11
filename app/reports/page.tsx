"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deviceId } from "@/lib/device";
import { authClient, authHeader } from "@/lib/auth-client";
import GrowthChart from "@/components/GrowthChart";

type Metrics = { numerical: number; verbal: number; logical: number; eq: number };
type Saved = { slug: string; label: string; created_at: string; metrics: Metrics | null };

export default function MyReports() {
  const { data: session } = authClient.useSession();
  const [reports, setReports] = useState<Saved[] | null>(null);
  const attempts = (reports ?? []).filter((r) => r.metrics).map((r) => r.metrics as Metrics).reverse();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/reports?device=${encodeURIComponent(deviceId())}`, {
          headers: await authHeader(),
        });
        const d = await r.json();
        setReports(d.reports ?? []);
      } catch {
        setReports([]);
      }
    })();
  }, [session?.user?.id]);

  return (
    <div className="flex flex-1 flex-col items-center">
      <main className="w-full max-w-2xl flex-1 px-6 py-14">
        <p className="rule-pop mb-3 inline-block text-xs font-bold tracking-[0.18em] text-pop-700 dark:text-pop-400 uppercase">
          {session?.user ? "Saved to your account" : "Saved on this device"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My reports</h1>

        {attempts.length >= 2 && (
          <div className="mt-6">
            <GrowthChart attempts={attempts} />
          </div>
        )}

        {reports === null && <p className="mt-6 text-sm text-[var(--muted)]">Loading…</p>}

        {reports && reports.length === 0 && (
          <p className="mt-6 text-[var(--muted)]">
            No saved reports yet. Take the test and hit <span className="font-medium text-foreground">Share this report</span> to save one here.
          </p>
        )}

        {reports && reports.length > 0 && (
          <ul className="mt-6 space-y-3">
            {reports.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/r/${r.slug}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-hairline p-5 transition-colors hover:border-brand-400"
                >
                  <span className="font-medium">{r.label}</span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/assessment"
            className="inline-flex h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Take the test
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-hairline px-6 text-sm font-medium text-foreground transition-colors hover:bg-paper-2"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
