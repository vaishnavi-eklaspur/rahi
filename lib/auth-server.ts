import { auth } from "@/lib/auth";

/** The authenticated user's id from the session cookie, or null if not signed in. */
export async function userIdFromRequest(req: Request): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
