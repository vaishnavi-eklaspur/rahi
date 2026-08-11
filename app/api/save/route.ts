// Save a report to Neon and return a short slug. Falls back to { slug: null }
// (client then shares the full-code URL) when the DB isn't configured.
import { randomBytes } from "crypto";
import { sql } from "@/lib/db";
import { decodeReport } from "@/lib/report-code";
import { userIdFromRequest } from "@/lib/auth-server";

const ALPH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const slug = (n = 8) => {
  const b = randomBytes(n);
  let s = "";
  for (let i = 0; i < n; i++) s += ALPH[b[i] % 62];
  return s;
};

export async function POST(req: Request) {
  if (!sql) return Response.json({ slug: null });
  try {
    const { code, device } = await req.json();
    if (!decodeReport(String(code))) return Response.json({ slug: null });
    const dev = device ? String(device).slice(0, 64) : null;
    const userId = await userIdFromRequest(req);

    // Re-saving the same report reuses its slug (keyed by account if signed in, else device).
    if (userId) {
      const ex = await sql`select id from reports where user_id = ${userId} and code = ${code} limit 1`;
      if (ex.length) return Response.json({ slug: ex[0].id });
    } else if (dev) {
      const ex = await sql`select id from reports where device = ${dev} and code = ${code} limit 1`;
      if (ex.length) return Response.json({ slug: ex[0].id });
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      const id = slug();
      try {
        await sql`insert into reports (id, code, device, user_id) values (${id}, ${code}, ${dev}, ${userId})`;
        return Response.json({ slug: id });
      } catch (e) {
        if (attempt === 2) throw e; // give up after retrying slug collisions
      }
    }
    return Response.json({ slug: null });
  } catch {
    return Response.json({ slug: null });
  }
}
