"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import RahiBot from "@/components/RahiBot";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res =
      mode === "in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
    setBusy(false);
    if (res.error) {
      setErr(res.error.message || "Something went wrong. Please try again.");
      return;
    }
    router.push("/reports");
  }

  const field =
    "h-12 w-full rounded-2xl border border-hairline bg-[var(--background)] px-4 outline-none focus:border-brand-500";

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <RahiBot size={84} mood="wave" className="text-brand-600 dark:text-brand-400" />
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {mode === "in" ? "Welcome back" : "Let's get started"}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {mode === "in" ? "Log in to see your saved reports." : "Create an account to save your career reports."}
          </p>
        </div>

        <div className="rounded-3xl border border-hairline bg-[var(--background)] p-6 shadow-sm">
          <button
            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/reports" })}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-hairline font-medium transition-colors hover:bg-paper-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "up" && (
              <input className={field} aria-label="Your name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input className={field} type="email" required aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={field} type="password" required minLength={8} aria-label="Password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
            {err && <p className="text-sm font-medium text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="h-12 rounded-2xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "in" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          {mode === "in" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); }}
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            {mode === "in" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
