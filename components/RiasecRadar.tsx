// RIASEC Holland hexagon — a radar of the six interest dimensions. Pure SVG,
// no chart library. Data is in canonical R-I-A-S-E-C order; `hi` marks the top-3
// (the Holland code) so they read as cobalt, the rest muted.

type Slice = { letter: string; name: string; frac: number; hi: boolean };

const COBALT = "#1f5fd0";
const CORAL = "#ff6b4a";

const CX = 120;
const CY = 112;
const R = 78;

const angle = (i: number) => ((-90 + i * 60) * Math.PI) / 180;
const point = (i: number, r: number): [number, number] => [
  CX + Math.cos(angle(i)) * r,
  CY + Math.sin(angle(i)) * r,
];
const poly = (rs: number[]) => rs.map((r, i) => point(i, r).join(",")).join(" ");

export default function RiasecRadar({ data }: { data: Slice[] }) {
  const rings = [0.34, 0.67, 1];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 224" width="240" height="224" role="img" aria-label="RIASEC interest radar">
        {/* grid rings */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={poly(data.map(() => R * ring))}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        ))}
        {/* spokes */}
        {data.map((_, i) => {
          const [x, y] = point(i, R);
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />;
        })}
        {/* data shape */}
        <polygon
          points={poly(data.map((d) => R * Math.max(0.04, d.frac)))}
          fill={COBALT}
          fillOpacity="0.16"
          stroke={COBALT}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* vertices */}
        {data.map((d, i) => {
          const [x, y] = point(i, R * Math.max(0.04, d.frac));
          return <circle key={i} cx={x} cy={y} r={d.hi ? 4 : 3} fill={d.hi ? CORAL : COBALT} />;
        })}
        {/* letters */}
        {data.map((d, i) => {
          const [x, y] = point(i, R + 16);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="700"
              fill={d.hi ? COBALT : "currentColor"}
              fillOpacity={d.hi ? 1 : 0.45}
            >
              {d.letter}
            </text>
          );
        })}
      </svg>
      {/* legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        {data.map((d) => (
          <span key={d.letter} className={d.hi ? "font-semibold text-brand-600 dark:text-brand-400" : "text-[var(--muted)]"}>
            {d.letter} · {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}
