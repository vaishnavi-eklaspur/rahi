import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const key = `allow-${Math.random()}`;
    let allowed = 0;
    let blocked = 0;
    for (let i = 0; i < 35; i++) {
      if (rateLimit(key, 30, 60_000)) allowed++;
      else blocked++;
    }
    expect(allowed).toBe(30);
    expect(blocked).toBe(5);
  });

  it("resets after the window elapses", async () => {
    const key = `reset-${Math.random()}`;
    const windowMs = 50;
    expect(rateLimit(key, 1, windowMs)).toBe(true);
    expect(rateLimit(key, 1, windowMs)).toBe(false); // same window, over limit
    await new Promise((r) => setTimeout(r, windowMs + 30)); // let the window lapse
    expect(rateLimit(key, 1, windowMs)).toBe(true);
  });

  it("keeps separate counters per key", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, 1, 60_000)).toBe(true);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for hop", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe("9.9.9.9");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
