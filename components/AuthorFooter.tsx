// Personal-branding footer, themed to Rahi (cobalt/coral, Fraunces/Inter, dark-mode
// aware via the app's CSS tokens). Fixed identity below stays identical across projects;
// only the tagline (this project's stack) and product name change.

const AUTHOR = {
  name: "Vaishnavi Eklaspur",
  initials: "VE",
  portfolio: "https://vaishnavieklaspur-portfolio.vercel.app/",
  github: "https://github.com/vaishnavi-eklaspur",
  linkedin: "https://www.linkedin.com/in/vaishnavi-eklaspur/",
};

const SOCIALS = [
  {
    label: "Portfolio",
    href: AUTHOR.portfolio,
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: AUTHOR.github,
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: AUTHOR.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
];

const PRODUCT_NAME = "Rahi";
const TAGLINE = "Next.js · TypeScript · Neon Postgres · Better Auth";

export default function AuthorFooter() {
  return (
    <footer className="mt-auto border-t border-hairline bg-paper-2 print:hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-6">
        <a
          href={AUTHOR.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold tracking-wide text-white transition-colors group-hover:bg-brand-700">
            {AUTHOR.initials}
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-semibold text-foreground transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
              Built by {AUTHOR.name}
            </span>
            <span className="block text-[11px] text-[var(--muted)]">{TAGLINE}</span>
          </span>
        </a>

        <div className="flex items-center gap-1">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-brand-600 dark:hover:text-brand-400"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-5 pb-6 sm:px-6">
        <p className="border-t border-hairline pt-3 text-[11px] text-[var(--muted)]">
          © {new Date().getFullYear()} {PRODUCT_NAME} — a portfolio project by {AUTHOR.name}.
        </p>
      </div>
    </footer>
  );
}
