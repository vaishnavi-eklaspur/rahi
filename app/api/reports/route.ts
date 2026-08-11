// List a device's saved reports, newest first, with a computed label.
import { sql } from "@/lib/db";
import { decodeReport } from "@/lib/report-code";
import { DIMENSIONS, scoreRiasec, hollandCode } from "@/lib/riasec";
import { scoreAptitude } from "@/lib/aptitude";
import { scoreEq } from "@/lib/eq";
import { rankCareers } from "@/lib/careers";
import { userIdFromRequest } from "@/lib/auth-server";

export async function GET(req: Request) {
  if (!sql) return Response.json({ reports: [] });
  const userId = await userIdFromRequest(req);
  const device = new URL(req.url).searchParams.get("device");
  if (!userId && !device) return Response.json({ reports: [] });

  // Signed in → the account's reports (cross-device); otherwise this device's.
  const rows = userId
    ? await sql`select id, code, created_at from reports where user_id = ${userId} order by created_at desc limit 50`
    : await sql`select id, code, created_at from reports where device = ${device} order by created_at desc limit 50`;
  const reports = rows.map((r) => {
    const a = decodeReport(r.code);
    let label = "Report";
    let metrics: { numerical: number; verbal: number; logical: number; eq: number } | null = null;
    if (a) {
      const code = hollandCode(scoreRiasec(a.rz));
      const apt = scoreAptitude(a.ap);
      const eqOverall = scoreEq(a.eqA).overall;
      const top = rankCareers(code, apt, eqOverall, 1)[0];
      label = `${code.map((d) => DIMENSIONS[d].name).join(" · ")} — ${top.title}`;
      metrics = { numerical: apt.numerical, verbal: apt.verbal, logical: apt.logical, eq: eqOverall };
    }
    return { slug: r.id, label, created_at: r.created_at, metrics };
  });
  return Response.json({ reports });
}
