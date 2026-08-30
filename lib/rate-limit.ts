// Best-effort in-memory rate limiter (fixed window) keyed by client IP, to stop a
// single source from draining the Gemini quota on the public AI endpoints.
//
// ponytail: per-instance memory — a warm serverless instance throttles a burst from
// one IP, which stops the realistic "script in a loop" abuse. It is NOT globally
// exact across instances/regions; swap for Upstash Redis if you need that.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Best-guess client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** True if this key is within `limit` requests per `windowMs`; false = over limit. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (b && now < b.resetAt) {
    if (b.count >= limit) return false;
    b.count++;
    return true;
  }
  // Fresh key or expired window. Sweep expired entries when the map grows, to bound memory.
  if (buckets.size > 1000) for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
  buckets.set(key, { count: 1, resetAt: now + windowMs });
  return true;
}
