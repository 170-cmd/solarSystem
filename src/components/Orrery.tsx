import { useMemo } from "react";
import { BODIES, type Body } from "../data/bodies";

const C = 380; // центр viewBox
const TAU = Math.PI * 2;

interface OrreryProps {
  simDays: number;
  selectedId: string | null;
  hoveredId: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function angleOf(b: Body, simDays: number): number {
  return (b.startAngle * Math.PI) / 180 - (TAU * simDays) / b.periodDays;
}

function posOf(b: Body, simDays: number): { x: number; y: number } {
  const a = angleOf(b, simDays);
  return { x: C + b.orbitR * Math.cos(a), y: C + b.orbitR * Math.sin(a) };
}

interface Asteroid {
  r: number;
  a: number;
  s: number;
  o: number;
}

export default function Orrery({
  simDays,
  selectedId,
  hoveredId,
  showOrbits,
  showLabels,
  onSelect,
  onHover,
}: OrreryProps) {
  const asteroids = useMemo<Asteroid[]>(() => {
    const arr: Asteroid[] = [];
    for (let i = 0; i < 130; i++) {
      arr.push({
        r: 184 + Math.random() * 20,
        a: Math.random() * TAU,
        s: 0.5 + Math.random() * 1.1,
        o: 0.12 + Math.random() * 0.38,
      });
    }
    return arr;
  }, []);

  const planets = BODIES.filter((b) => b.id !== "sun");
  const sun = BODIES[0];
  const earth = BODIES.find((b) => b.id === "earth")!;
  const earthPos = posOf(earth, simDays);
  const moonAngle = -(TAU * simDays) / 27.32;
  const moonPos = {
    x: earthPos.x + 16.5 * Math.cos(moonAngle),
    y: earthPos.y + 16.5 * Math.sin(moonAngle),
  };

  const beltAngle = (simDays / 1700) * 360;

  return (
    <svg
      viewBox="0 0 760 760"
      className="orrery-in h-full w-full select-none"
      role="img"
      aria-label="Модель Солнечной системы с восемью планетами"
      onMouseLeave={() => onHover(null)}
    >
      <defs>
        {BODIES.map((b) => (
          <radialGradient key={b.id} id={`grad-${b.id}`} cx="35%" cy="30%" r="85%">
            <stop offset="0%" stopColor={b.hi} />
            <stop offset="100%" stopColor={b.color} />
          </radialGradient>
        ))}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,196,96,0.6)" />
          <stop offset="45%" stopColor="rgba(255,160,60,0.22)" />
          <stop offset="100%" stopColor="rgba(255,160,60,0)" />
        </radialGradient>
      </defs>

      {/* орбиты */}
      {planets.map((b) => {
        const active = b.id === selectedId || b.id === hoveredId;
        const visible = showOrbits || active;
        if (!visible) return null;
        return (
          <circle
            key={`orbit-${b.id}`}
            className="orbit-ring"
            cx={C}
            cy={C}
            r={b.orbitR}
            fill="none"
            stroke={active ? b.color : "#93a3bf"}
            strokeOpacity={active ? (b.id === selectedId ? 0.5 : 0.3) : 0.12}
            strokeWidth={b.id === selectedId ? 1.4 : 1}
          />
        );
      })}

      {/* пояс астероидов */}
      <g transform={`rotate(${beltAngle % 360} ${C} ${C})`}>
        {asteroids.map((ast, i) => (
          <circle
            key={i}
            cx={C + ast.r * Math.cos(ast.a)}
            cy={C + ast.r * Math.sin(ast.a)}
            r={ast.s}
            fill="#93a3bf"
            opacity={ast.o}
          />
        ))}
      </g>

      {/* Солнце */}
      <g
        className={`planet-g ${sun.id === selectedId || sun.id === hoveredId ? "is-active" : ""}`}
        style={{ cursor: "pointer" }}
        onClick={() => onSelect(sun.id)}
        onMouseEnter={() => onHover(sun.id)}
        onMouseLeave={() => onHover(null)}
      >
        <circle className="sun-corona" cx={C} cy={C} r={68} fill="url(#sunGlow)" />
        <circle
          className="sun-flare"
          cx={C}
          cy={C}
          r={42}
          fill="none"
          stroke="rgba(255,196,96,0.3)"
          strokeWidth={1.4}
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
        <circle cx={C} cy={C} r={44} fill="transparent" />
        <circle className="planet-vis" cx={C} cy={C} r={sun.size} fill={`url(#grad-${sun.id})`} />
        {sun.id === selectedId && (
          <circle
            className="select-ring"
            cx={C}
            cy={C}
            r={sun.size + 12}
            fill="none"
            stroke={sun.color}
            strokeOpacity={0.9}
            strokeWidth={1.2}
            strokeDasharray="3 8"
            strokeLinecap="round"
          />
        )}
        {showLabels && (
          <text className="orrery-label" x={C} y={C + sun.size + 26} textAnchor="middle">
            {sun.name}
          </text>
        )}
      </g>

      {/* Луна Земли */}
      <line
        x1={earthPos.x}
        y1={earthPos.y}
        x2={moonPos.x}
        y2={moonPos.y}
        stroke="#93a3bf"
        strokeOpacity={0.14}
        strokeWidth={0.7}
      />
      <circle cx={moonPos.x} cy={moonPos.y} r={2.4} fill="#c9cedb" />

      {/* планеты */}
      {planets.map((b) => {
        const { x, y } = posOf(b, simDays);
        const active = b.id === selectedId || b.id === hoveredId;
        const showLabel = showLabels || active;
        const hitR = Math.max(b.size + 8, 14);
        return (
          <g
            key={b.id}
            className={`planet-g ${active ? "is-active" : ""}`}
            transform={`translate(${x} ${y})`}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(b.id)}
            onMouseEnter={() => onHover(b.id)}
            onMouseLeave={() => onHover(null)}
          >
            {b.hasRing && (
              <ellipse
                rx={b.size * 2.15}
                ry={b.size * 0.6}
                transform="rotate(-18)"
                fill="none"
                stroke="#cdb27e"
                strokeOpacity={0.4}
                strokeWidth={5}
              />
            )}
            <circle r={hitR} fill="transparent" />
            <circle
              className="planet-vis"
              r={b.size}
              fill={`url(#grad-${b.id})`}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={0.8}
            />
            {b.hasRing && (
              <>
                <path
                  d={`M ${-b.size * 2.15} 0 A ${b.size * 2.15} ${b.size * 0.6} 0 0 0 ${b.size * 2.15} 0`}
                  transform="rotate(-18)"
                  fill="none"
                  stroke="#ecd7a4"
                  strokeOpacity={0.85}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${-b.size * 1.6} 0 A ${b.size * 1.6} ${b.size * 0.44} 0 0 0 ${b.size * 1.6} 0`}
                  transform="rotate(-18)"
                  fill="none"
                  stroke="#b39a63"
                  strokeOpacity={0.6}
                  strokeWidth={2}
                />
              </>
            )}
            {b.id === selectedId && (
              <circle
                className="select-ring"
                r={b.size + (b.hasRing ? 9 : 7)}
                fill="none"
                stroke={b.color}
                strokeOpacity={0.95}
                strokeWidth={1.2}
                strokeDasharray="3 7"
                strokeLinecap="round"
              />
            )}
            {showLabel && (
              <text className="orrery-label" y={-(b.size + (b.hasRing ? 16 : 12))} textAnchor="middle">
                {b.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
