import { useEffect, useMemo, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import Orrery from "./components/Orrery";
import InfoPanel from "./components/InfoPanel";
import Controls from "./components/Controls";
import { BASE_DAYS_PER_SECOND, BODIES } from "./data/bodies";
import { formatElapsed, plural } from "./utils";

export default function App() {
  const [simDays, setSimDays] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  playingRef.current = playing;
  speedRef.current = speed;

  /* -------- цикл симуляции -------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (playingRef.current) {
        setSimDays((d) => d + dt * BASE_DAYS_PER_SECOND * speedRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* -------- горячие клавиши -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        setSelectedId((prev) => {
          const idx = prev ? BODIES.findIndex((b) => b.id === prev) : -1;
          return BODIES[(idx + dir + BODIES.length) % BODIES.length].id;
        });
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedBody = useMemo(
    () => BODIES.find((b) => b.id === selectedId) ?? null,
    [selectedId]
  );

  const stepSelection = (dir: 1 | -1) =>
    setSelectedId((prev) => {
      const idx = prev ? BODIES.findIndex((b) => b.id === prev) : 0;
      return BODIES[(idx + dir + BODIES.length) % BODIES.length].id;
    });

  const daysPerSecond = BASE_DAYS_PER_SECOND * speed;

  return (
    <div className="relative h-dvh w-full overflow-hidden font-body text-mist-100">
      <Starfield />

      {/* ---------- шапка ---------- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-5 pt-5 md:px-8 md:pt-6">
        <div className="fade-up">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.28em] text-solar-400 md:text-[11px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
              <ellipse cx="12" cy="12" rx="10" ry="4.6" />
            </svg>
            Интерактивная модель
          </div>
          <h1 className="font-display mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-mist-100 md:text-4xl">
            ОРРЕРИ
          </h1>
          <p className="mt-1.5 hidden text-[13px] font-semibold text-mist-400 sm:block">
            Солнечная система в движении — {BODIES.length - 1} {plural(BODIES.length - 1, ["планета", "планеты", "планет"])} и Солнце
          </p>
        </div>

        <div className="fade-up text-right" style={{ animationDelay: "0.12s" }}>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-mist-500">Прошло времени</div>
          <div className="font-display mt-1 text-sm font-bold tabular-nums leading-none text-mist-100 md:text-lg">
            {formatElapsed(simDays)}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-white/15 md:text-[11px]">
            {playing ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-solar-400" />
                <span className="text-solar-300">
                  ×{speed} · ≈{daysPerSecond.toLocaleString("ru-RU")} {plural(daysPerSecond, ["сутки", "суток", "суток"])}/с
                </span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-mist-500" />
                <span className="text-mist-400">Пауза</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------- навигация по телам ---------- */}
      <nav
        className="rail-scroll absolute z-20 flex items-center gap-1 max-md:inset-x-0 max-md:top-[86px] max-md:justify-start max-md:overflow-x-auto max-md:px-4 max-md:py-1 md:left-5 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-0.5"
        aria-label="Небесные тела"
      >
        {BODIES.map((b, i) => {
          const active = b.id === selectedId;
          const dot = Math.round(Math.min(18, Math.max(7, b.size * 0.75)));
          return (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              onMouseEnter={() => setHoveredId(b.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-pressed={active}
              className={`fade-up group relative flex shrink-0 items-center gap-2 rounded-full p-2 transition-all duration-200 active:scale-90 ${
                active ? "bg-white/10 ring-1 ring-white/25" : "hover:bg-white/[0.06]"
              }`}
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
            >
              <span
                className="rounded-full shadow-[0_0_8px_rgba(255,255,255,0.12)] transition-transform duration-200 group-hover:scale-110"
                style={{
                  width: dot,
                  height: dot,
                  background: `radial-gradient(circle at 35% 30%, ${b.hi}, ${b.color})`,
                }}
              />
              <span className="text-[11px] font-bold text-mist-400 transition-colors group-hover:text-mist-100 md:hidden">
                {b.name}
              </span>
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-space-800/95 px-2.5 py-1.5 text-xs font-bold text-mist-100 opacity-0 shadow-xl ring-1 ring-white/10 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 md:block">
                {b.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ---------- сцена ---------- */}
      <main
        className={`absolute inset-0 z-10 grid place-items-center transition-[padding] duration-500 ease-out ${
          selectedBody ? "max-md:pb-[36dvh] md:pr-[400px]" : ""
        }`}
      >
        <div className="relative aspect-square w-[min(96vw,max(300px,100dvh-260px))] md:w-[min(88vmin,max(400px,100dvh-170px))]">
          <Orrery
            simDays={simDays}
            selectedId={selectedId}
            hoveredId={hoveredId}
            showOrbits={showOrbits}
            showLabels={showLabels}
            onSelect={(id) => setSelectedId(id)}
            onHover={setHoveredId}
          />
        </div>
      </main>

      {/* ---------- пульт управления ---------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4 md:bottom-5">
        <Controls
          playing={playing}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
          onTogglePlay={() => setPlaying((p) => !p)}
          onSpeed={setSpeed}
          onReset={() => setSimDays(0)}
          onToggleOrbits={() => setShowOrbits((v) => !v)}
          onToggleLabels={() => setShowLabels((v) => !v)}
        />
      </div>

      {/* ---------- подсказка ---------- */}
      <div className="fade-up pointer-events-none absolute bottom-5 left-8 z-20 hidden max-w-[240px] text-[11px] font-semibold leading-relaxed text-mist-500 lg:block" style={{ animationDelay: "0.5s" }}>
        Нажмите на планету, чтобы открыть досье.
        <span className="mt-1 block text-mist-400/80">
          <kbd className="rounded bg-white/[0.07] px-1 py-0.5 font-sans text-[10px] ring-1 ring-white/10">Пробел</kbd> — пауза ·{" "}
          <kbd className="rounded bg-white/[0.07] px-1 py-0.5 font-sans text-[10px] ring-1 ring-white/10">← →</kbd> — планеты
        </span>
      </div>

      {/* ---------- досье ---------- */}
      {selectedBody && (
        <InfoPanel
          body={selectedBody}
          onClose={() => setSelectedId(null)}
          onPrev={() => stepSelection(-1)}
          onNext={() => stepSelection(1)}
        />
      )}
    </div>
  );
}
