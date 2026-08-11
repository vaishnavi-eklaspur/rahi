// Feature: a shareable result card. Next auto-wires this as the og:image for a
// shared report, so links preview nicely on WhatsApp / LinkedIn / X.
import { ImageResponse } from "next/og";
import { decodeReport } from "@/lib/report-code";
import { scoreRiasec, hollandCode, DIMENSIONS } from "@/lib/riasec";
import { scoreAptitude } from "@/lib/aptitude";
import { scoreEq } from "@/lib/eq";
import { rankCareers } from "@/lib/careers";
import { archetypeFor } from "@/lib/archetype";
import { sql } from "@/lib/db";

export const alt = "Rahi — your career report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COBALT = "#1f5fd0";
const CORAL = "#ff6b4a";
const INK = "#141821";
const MUTED = "#5a6473";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let answers = decodeReport(decodeURIComponent(code));
  if (!answers && sql) {
    try {
      const rows = await sql`select code from reports where id = ${code} limit 1`;
      if (rows.length) answers = decodeReport(rows[0].code);
    } catch {}
  }

  let label = "Career report";
  let headline = "Find the career that fits you";
  let tagline = "Interests, aptitude, and emotional strengths — measured, then matched.";
  let top = "";
  let match = "";
  if (answers) {
    const dims = hollandCode(scoreRiasec(answers.rz));
    label = "Your career archetype";
    headline = archetypeFor(dims).title;
    tagline = dims.map((d) => DIMENSIONS[d].name).join(" · ");
    const careers = rankCareers(dims, scoreAptitude(answers.ap), scoreEq(answers.eqA).overall, 1);
    if (careers[0]) {
      top = careers[0].title;
      match = `${Math.round(careers[0].fit * 100)}% match`;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: CORAL, display: "flex" }} />
          <div style={{ fontSize: 34, fontWeight: 700, color: INK }}>Rahi</div>
          <div style={{ fontSize: 24, color: MUTED, marginLeft: 6 }}>· career report</div>
        </div>

        {/* profile */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: CORAL, textTransform: "uppercase", display: "flex" }}>
            {label}
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: INK, marginTop: 10, lineHeight: 1.05, display: "flex" }}>
            {headline}
          </div>
          <div style={{ fontSize: 28, color: MUTED, marginTop: 14, display: "flex" }}>
            {tagline}
          </div>
          {top ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
              <div style={{ fontSize: 30, color: INK, display: "flex" }}>Top match: <span style={{ fontWeight: 700, marginLeft: 10 }}>{top}</span></div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", background: CORAL, padding: "6px 16px", borderRadius: 999, display: "flex" }}>
                {match}
              </div>
            </div>
          ) : null}
        </div>

        {/* footer bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, color: MUTED, display: "flex" }}>Grounded in Holland Codes · aptitude · Goleman EQ</div>
          <div style={{ height: 10, width: 180, background: COBALT, borderRadius: 999, display: "flex" }} />
        </div>
      </div>
    ),
    size,
  );
}
