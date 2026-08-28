import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import Orrery from "./components/Orrery";
import InfoPanel from "./components/InfoPanel";
import Controls, { type ViewMode } from "./components/Controls";
import type { FlyPhase } from "./components/SolarSystem3D";

/* Three.js подгружается отдельным чанком — только при входе в 3D-режим */
const SolarSystem3D = lazy(() => import("./components/SolarSystem3D"));
import { BASE_DAYS_PER_SECOND, BODIES } from "./data/bodies";
import { formatElapsed, plural } from "./utils";
import { simStore } from "./simStore";
import { downloadProjectZip } from "./projectExport";

export default function App() {
  const [simDays, setSimDays] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [flyPhase, setFlyPhase] = useState<FlyPhase>("free");
  const [zipping, setZipping] = useState(false);
  const [zipHint, setZipHint] = useState(true);

  /* короткая пульсация кнопки «Проект ZIP», чтобы её было легко найти */
  useEffect(() => {
    const t = setTimeout(() => setZipHint(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleZip = async () => {
    if (zipping) return;
    try {
      setZipping(true);
      await downloadProjectZip();
    } finally {
      setZipping(false);
    }
  };

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const selectedRef = useRef(selectedId);
  playingRef.current = playing;
  speedRef.current = speed;
  selectedRef.current = selectedId;

  /* -------- цикл симуляции: simStore (для 3D без перерисовок) + состояние (для шапки и 2D) -------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (playingRef.current) {
        const days = simStore.days + dt * BASE_DAYS_PER_SECOND * speedRef.current;
        simStore.days = days;
        setSimDays(days);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* -------- выбор тела: клик = досье + подлёт камеры в 3D -------- */
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setViewMode("3d");
  };

  const stepSelection = (dir: 1 | -1) =>
    setSelectedId((prev) => {
      const idx = prev ? BODIES.findIndex((b) => b.id === prev) : 0;
      return BODIES[(idx + dir + BODIES.length) % BODIES.length].id;
    });

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
        setViewMode("3d");
      } else if (e.key === "Escape") {
        if (selectedRef.current) setSelectedId(null); // первое Esc — закрыть досье
        else setViewMode("map"); // второе — вернуться к карте
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedBody = useMemo(() => BODIES.find((b) => b.id === selectedId) ?? null, [selectedId]);
  const selectedIndex = selectedBody ? BODIES.indexOf(selectedBody) : -1;
  const daysPerSecond = BASE_DAYS_PER_SECOND * speed;

  const hint =
    viewMode === "3d"
      ? flyPhase === "fly" && selectedBody
        ? `Подлёт к телу «${selectedBody.name}»…`
        : flyPhase === "free"
          ? "Кликните по планете, чтобы подлететь"
          : "ЛКМ — вращение · колесо — масштаб · ПКМ — перемещение"
      : "Кликните по планете — откроется досье и камера подлетит к ней в 3D";

  return (
    <div className="relative h-dvh w-full overflow-hidden font-body text-mist-100">
      <Starfield />

      {/* ---------- сцена: 2D-карта или 3D-полёт ---------- */}
      <div className="absolute inset-0">
        {viewMode === "map" ? (
          <div key="map" className="view-in absolute inset-0">
            <Orrery
              simDays={simDays}
              selectedId={selectedId}
              hoveredId={hoveredId}
              showOrbits={showOrbits}
              showLabels={showLabels}
              onSelect={handleSelect}
              onHover={setHoveredId}
            />
          </div>
        ) : (
          <div
            key="3d"
            className={`view-in absolute inset-0 transition-transform duration-700 ease-out ${selectedBody ? "lg:-translate-x-[7vw]" : ""}`}
          >
            <Suspense fallback={null}>
              <SolarSystem3D selectedId={selectedId} onSelect={handleSelect} showOrbits={showOrbits} onPhase={setFlyPhase} />
            </Suspense>
          </div>
        )}
      </div>

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
          <button
            onClick={handleZip}
            disabled={zipping}
            title="Скачать весь проект (все исходники) одним ZIP-архивом"
            className={`pointer-events-auto mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 md:text-[11px] ${
              zipHint && !zipping ? "zip-hint" : ""
            } ${
              zipping
                ? "border-mist-500/40 bg-white/5 text-mist-400"
                : "border-white/15 bg-white/[0.06] text-mist-100 hover:border-solar-400/60 hover:bg-solar-400/10 hover:text-solar-300 hover:shadow-[0_0_22px_rgba(242,181,68,0.2)]"
            }`}
          >
            {zipping ? (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.2-8.56" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                <path d="M12 11v5m0 0 2-2m-2 2-2-2" />
              </svg>
            )}
            <span>{zipping ? "Упаковка…" : "Проект ZIP"}</span>
          </button>
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

      {/* ---------- кнопка возврата к карте (в 3D) ---------- */}
      {viewMode === "3d" && (
        <button
          onClick={() => setViewMode("map")}
          className="fade-up pointer-events-auto absolute left-5 z-20 flex items-center gap-2 rounded-full border border-white/12 bg-space-900/80 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wider text-mist-300 backdrop-blur-xl transition-all duration-200 hover:border-solar-400/50 hover:text-solar-300 hover:shadow-[0_0_18px_rgba(242,181,68,0.18)] active:scale-95 max-md:left-4 max-md:top-[118px] md:top-28"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          К карте
        </button>
      )}

      {/* ---------- подсказка 3D-управления ---------- */}
      {hint && (
        <div
          key={hint}
          className="content-swap pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4 md:bottom-[104px]"
        >
          <span className="rounded-full border border-white/10 bg-space-900/80 px-4 py-2 text-center text-[11px] font-bold tracking-wide text-mist-300 backdrop-blur-xl">
            {hint}
          </span>
        </div>
      )}

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
              onClick={() => handleSelect(b.id)}
              onMouseEnter={() => setHoveredId(b.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-pressed={active}
              title={b.name}
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
              <span
                className={`pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-space-800/95 px-2 py-1 text-[11px] font-bold text-mist-100 opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-150 group-hover:opacity-100 max-md:hidden ${
                  active ? "" : "group-hover:translate-x-0 -translate-x-1"
                }`}
              >
                {b.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ---------- досье ---------- */}
      {selectedBody && (
        <InfoPanel
          body={selectedBody}
          onClose={() => setSelectedId(null)}
          onPrev={() => stepSelection(-1)}
          onNext={() => stepSelection(1)}
          index={selectedIndex}
          total={BODIES.length}
        />
      )}

      {/* ---------- пульт ---------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 md:bottom-6">
        <Controls
          playing={playing}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
          viewMode={viewMode}
          onTogglePlay={() => setPlaying((p) => !p)}
          onSpeed={setSpeed}
          onReset={() => {
            simStore.days = 0;
            setSimDays(0);
          }}
          onToggleOrbits={() => setShowOrbits((v) => !v)}
          onToggleLabels={() => setShowLabels((v) => !v)}
          onMode={setViewMode}
        />
      </div>
    </div>
  );
}
