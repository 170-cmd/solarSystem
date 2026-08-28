import { useEffect, useMemo, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import Orrery from "./components/Orrery";
import InfoPanel from "./components/InfoPanel";
import Controls from "./components/Controls";
import { BASE_DAYS_PER_SECOND, BODIES } from "./data/bodies";
import { formatElapsed, plural } from "./utils";
import { downloadProjectZip } from "./projectExport";

export default function App() {
  const [simDays, setSimDays] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [zipHint, setZipHint] = useState(true);

  /* короткая пульсация кнопки «Проект ZIP», чтобы её было легко найти */
  useEffect(() => {
    const t = setTimeout(() => setZipHint(false), 7500);
    return () => clearTimeout(t);
  }, []);

  /** Упаковать весь проект в ZIP и скачать */
  const handleZip = async () => {
    if (zipping) return;
    try {
      setZipping(true);
      await downloadProjectZip();
    } finally {
      setZipping(false);
    }
  };

  /** Скачать автономную HTML-версию (public/standalone.html) одним кликом */
  const handleDownload = async () => {
    try {
      const res = await fetch("standalone.html");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const blob = new Blob([text], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orrery-standalone.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2600);
    } catch {
      // если файл недоступен — открываем его в новой вкладке, чтобы сохранить вручную
      window.open("standalone.html", "_blank");
    }
  };

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
          <button
            onClick={handleZip}
            disabled={zipping}
            title="Скачать весь проект (все исходники) одним ZIP-архивом"
            className={`pointer-events-auto mr-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 md:text-[11px] ${
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
          <button
            onClick={handleDownload}
            title="Скачать автономную версию одним HTML-файлом — работает без установки, просто откройте файл в браузере"
            className={`group pointer-events-auto mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 md:text-[11px] ${
              downloaded
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-solar-400/35 bg-solar-400/[0.08] text-solar-300 hover:border-solar-400/70 hover:bg-solar-400/15 hover:shadow-[0_0_22px_rgba(242,181,68,0.28)]"
            }`}
          >
            {downloaded ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5 9.5 18 20 6.5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-y-0.5">
                <path d="M12 3v11m0 0 4.2-4.2M12 14 7.8 9.8" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            )}
            <span>{downloaded ? "Сохранено" : "HTML-версия"}</span>
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
