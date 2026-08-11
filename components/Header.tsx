"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import RahiBot from "@/components/RahiBot";

export default function Header() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <RahiBot size={30} />
          <span className="font-display text-xl font-semibold tracking-tight">Rahi</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/reports"
            className="rounded-full px-3 py-2 font-medium text-[var(--muted)] transition-colors hover:text-foreground"
          >
            My reports
          </Link>
          {isPending ? (
            <span className="h-9 w-20 rounded-full bg-paper-2" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-[var(--muted)] sm:inline">
                {user.name?.split(" ")[0] || "there"}
              </span>
              <button
                onClick={() => authClient.signOut()}
                className="rounded-full border border-hairline px-3.5 py-2 font-medium text-foreground transition-colors hover:bg-paper-2"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand-600 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-700"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
