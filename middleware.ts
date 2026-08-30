import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Login is compulsory to take the assessment. No session cookie → bounce to /login,
// remembering where they were headed so login can send them back. This is an
// optimistic cookie-presence check (fast, Edge-safe); the API routes that actually
// save an attempt still validate the session server-side.
export function middleware(req: NextRequest) {
  if (getSessionCookie(req)) return NextResponse.next();
  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/assessment"] };
