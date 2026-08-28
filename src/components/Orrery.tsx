import { BODIES, type Body } from "../data/bodies";

interface OrreryProps {
  simDays: number;
  selectedId: string | null;
  hoveredId: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const BELT_SEEDS: { r: number; a: number }[] = (() => {
  const arr: { r: number; a: number }[] = [];
  let s = 97;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 240; i++) {
    arr.push({ r: 184 + rnd() * 24, a: rnd() * Math.PI * 2 });
  }
  return arr;
})();

const angleFor = (b: Body, days: number) =>
  b.periodDays === 0 ? 0 : ((b.startAngle + (days / b.periodDays) * 360) * Math.PI) / 180;

export default function Orrery({
  simDays,
  selectedId,
  hoveredId,
  showOrbits,
  showLabels,
  onSelect,
  onHover,
}: OrreryProps) {
  const sun = BODIES[0];
  const planets = BODIES.slice(1);

  return (
    <svg
      viewBox="0 0 1000 760"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Схема Солнечной системы"
    >
      <defs>
        <radialGradient id="sunGrad" cx="42%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="38%" stopColor="#ffd37e" />
          <stop offset="75%" stopColor="#f2963c" />
          <stop offset="100%" stopColor="#c96a1c" />
        </radialGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,190,90,0.5)" />
          <stop offset="55%" stopColor="rgba(255,150,60,0.16)" />
          <stop offset="100%" stopColor="rgba(255,140,50,0)" />
        </radialGradient>
        {planets.map((p) => (
          <radialGradient key={p.id} id={`grad-${p.id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={p.hi} />
            <stop offset="55%" stopColor={p.color} />
            <stop offset="100%" stopColor="#0a0f1c" />
          </radialGradient>
        ))}
      </defs>

      {/* Пояс астероидов */}
      <g opacity={0.5}>
        {BELT_SEEDS.map((s, i) => (
          <circle
            key={i}
            cx={500 + Math.cos(s.a) * s.r}
            cy={380 + Math.sin(s.a) * s.r}
            r={i % 7 === 0 ? 1.1 : 0.7}
            fill="#8b93a5"
          />
        ))}
      </g>

      {/* Орбиты */}
      {planets.map((p) => {
        const active = selectedId === p.id || hoveredId === p.id;
        return (
          <circle
            key={`orbit-${p.id}`}
            cx={500}
            cy={380}
            r={p.orbitR}
            fill="none"
            className="orbit-ring"
            stroke={active ? "#f2b544" : "#9db4d8"}
            strokeOpacity={active ? 0.55 : showOrbits ? 0.16 : 0}
            strokeWidth={active ? 1.3 : 1}
            strokeDasharray={showOrbits || active ? undefined : "0 100000"}
          />
        );
      })}

      {/* Солнце */}
      <g
        className="planet-g cursor-pointer"
        onClick={() => onSelect(sun.id)}
        onMouseEnter={() => onHover(sun.id)}
        onMouseLeave={() => onHover(null)}
      >
        <circle cx={500} cy={380} r={120} fill="url(#sunGlow)" className="sun-corona" />
        <circle
          cx={500}
          cy={380}
          r={58}
          fill="none"
          stroke="rgba(255,211,126,0.35)"
          strokeWidth={1}
          strokeDasharray="3 9"
          className="sun-flare"
        />
        <circle cx={500} cy={380} r={sun.size} fill="url(#sunGrad)" className="planet-vis" />
        {selectedId === sun.id && (
          <circle
            cx={500}
            cy={380}
            r={sun.size + 8}
            fill="none"
            stroke="#f2b544"
            strokeWidth={1.4}
            strokeDasharray="4 7"
            className="select-ring"
          />
        )}
        {showLabels && (
          <text x={500} y={380 + sun.size + 24} textAnchor="middle" className="orrery-label">
            Солнце
          </text>
        )}
      </g>

      {/* Планеты */}
      {planets.map((p) => {
        const ang = angleFor(p, simDays);
        const x = 500 + Math.cos(ang) * p.orbitR;
        const y = 380 + Math.sin(ang) * p.orbitR;
        const active = selectedId === p.id;
        const hit = Math.max(p.size + 7, 14);
        return (
          <g
            key={p.id}
            className={`planet-g cursor-pointer ${active ? "is-active" : ""}`}
            onClick={() => onSelect(p.id)}
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
          >
            {active && (
              <circle
                cx={x}
                cy={y}
                r={p.size + 8}
                fill="none"
                stroke="#f2b544"
                strokeWidth={1.3}
                strokeDasharray="3.5 6.5"
                className="select-ring"
              />
            )}

            {/* Сатурн: задняя половина кольца */}
            {p.hasRing && (
              <ellipse
                cx={x}
                cy={y}
                rx={p.size * 2.15}
                ry={p.size * 0.72}
                fill="none"
                stroke="rgba(232,209,160,0.55)"
                strokeWidth={p.size * 0.34}
                transform={`rotate(-18 ${x} ${y})`}
              />
            )}

            <g className="planet-vis">
              <circle cx={x} cy={y} r={p.size} fill={`url(#grad-${p.id})`} />
              {p.id === "earth" && <circle cx={x - p.size * 0.3} cy={y - p.size * 0.28} r={p.size * 0.22} fill="rgba(255,255,255,0.35)" />}
              {p.id === "jupiter" && (
                <ellipse cx={x + p.size * 0.32} cy={y + p.size * 0.42} rx={p.size * 0.3} ry={p.size * 0.18} fill="rgba(168,64,42,0.7)" />
              )}
              {p.id === "neptune" && (
                <ellipse cx={x - p.size * 0.2} cy={y + p.size * 0.15} rx={p.size * 0.34} ry={p.size * 0.16} fill="rgba(10,20,70,0.5)" />
              )}
            </g>

            {/* Сатурн: передняя половина кольца */}
            {p.hasRing && (
              <path
                d={`M ${x - p.size * 2.15} ${y} A ${p.size * 2.15} ${p.size * 0.72} 0 0 0 ${x + p.size * 2.15} ${y}`}
                fill="none"
                stroke="rgba(240,220,174,0.8)"
                strokeWidth={p.size * 0.34}
                transform={`rotate(-18 ${x} ${y})`}
              />
            )}

            {/* Луна у Земли */}
            {p.id === "earth" && (() => {
              const ma = simDays / 27.32 * Math.PI * 2;
              return (
                <circle cx={x + Math.cos(ma) * (p.size + 7)} cy={y + Math.sin(ma) * (p.size + 7)} r={2} fill="#c9c5bd" />
              );
            })()}

            {showLabels && (
              <text x={x} y={y + p.size + 16} textAnchor="middle" className="orrery-label">
                {p.name}
              </text>
            )}

            <circle cx={x} cy={y} r={hit} fill="transparent" />
          </g>
        );
      })}
    </svg>
  );
}
