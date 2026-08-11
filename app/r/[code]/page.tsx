import Link from "next/link";
import { notFound } from "next/navigation";
import Report from "@/components/Report";
import CopyLink from "@/components/CopyLink";
import { decodeReport } from "@/lib/report-code";
import { sql } from "@/lib/db";

export default async function SharedReport({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // Accept either a full answer code or a short slug looked up in Neon.
  let answers = decodeReport(code);
  if (!answers && sql) {
    const rows = await sql`select code from reports where id = ${code} limit 1`;
    if (rows.length) answers = decodeReport(rows[0].code);
  }
  if (!answers) notFound();

  return (
    <Report rz={answers.rz} ap={answers.ap} eqA={answers.eqA}>
      <CopyLink />
      <Link
        href="/assessment"
        className="inline-flex h-11 items-center rounded-full border border-hairline px-6 text-sm font-medium text-foreground transition-colors hover:bg-paper-2"
      >
        Take the test yourself →
      </Link>
    </Report>
  );
}
