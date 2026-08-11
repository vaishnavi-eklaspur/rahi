"use client";

import { createAuthClient } from "better-auth/react";

// Points at Neon's hosted Better Auth service (email + Google).
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_NEON_AUTH_URL,
});

/** JWT for the current session, used to authenticate our own API routes. */
export async function getToken(): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_NEON_AUTH_URL}/token`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d.token ?? null;
  } catch {
    return null;
  }
}

/** Authorization header for our API calls when signed in ({} when not). */
export async function authHeader(): Promise<Record<string, string>> {
  const t = await getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
