import { jwtVerify, createRemoteJWKSet } from "jose";

// Verify Neon Auth JWTs against the hosted JWKS. null when unconfigured.
const JWKS = process.env.NEON_AUTH_JWKS_URL
  ? createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL))
  : null;

/** The authenticated user's id from a Bearer JWT, or null if absent/invalid. */
export async function userIdFromRequest(req: Request): Promise<string | null> {
  if (!JWKS) return null;
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
