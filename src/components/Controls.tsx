import type { ReactNode } from "react";
import { BASE_DAYS_PER_SECOND, SPEED_OPTIONS } from "../data/bodies";

export type ViewMode = "map" | "3d";

interface ControlsProps {
  playing: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  viewMode: ViewMode;
  onTogglePlay: () => void;
  onSpeed: (s: number) => void;
  onReset: () => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onMode: (m: ViewMode) => void;
}

function ToggleChip({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all active:scale-95 ${
        active
          ? "bg-white/10 text-mist-100 ring-1 ring-white/20"
          : "text-mist-500 ring-1 ring-transparent hover:bg-white/5 hover:text-mist-300"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function Controls({
  playing,
  speed,
  showOrbits,
  showLabels,
  viewMode,
  onTogglePlay,
  onSpeed,
  onReset,
  onToggleOrbits,
  onToggleLabels,
  onMode,
}: ControlsProps) {
  return (
    <div
      className="fade-up pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-white/10 bg-space-900/85 px-2.5 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl md:gap-2.5 md:px-4"
      style={{ animationDelay: "0.25s" }}
    >
      {/* режим просмотра */}
      <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.05] p-1">
        <button
          onClick={() => onMode("map")}
          aria-pressed={viewMode === "map"}
          title="Плоская схема (карта)"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition-all active:scale-90 ${
            viewMode === "map" ? "bg-white/12 text-mist-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]" : "text-mist-500 hover:text-mist-300"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          </svg>
          Карта
        </button>
        <button
          onClick={() => onMode("3d")}
          aria-pressed={viewMode === "3d"}
          title="Трёхмерный полёт"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition-all active:scale-90 ${
            viewMode === "3d" ? "bg-solar-400/20 text-solar-300 shadow-[inset_0_0_0_1px_rgba(242,181,68,0.45)]" : "text-mist-500 hover:text-mist-300"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5z" />
            <path d="M3 7l9 4.5L21 7M12 11.5V21.5" opacity="0.6" />
          </svg>
          3D
        </button>
      </div>

      <span className="hidden h-6 w-px bg-white/10 sm:block" />

      {/* play / pause */}
      <button
        onClick={onTogglePlay}
        aria-label={playing ? "Пауза" : "Воспроизвести"}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-200 active:scale-90 ${
          playing
            ? "bg-solar-400 text-space-950 shadow-[0_0_24px_rgba(242,181,68,0.35)] hover:bg-solar-300"
            : "bg-white/10 text-mist-100 ring-1 ring-white/20 hover:bg-white/20"
        }`}
      >
        {playing ? (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2.5" y="2" width="4" height="12" rx="1.2" />
            <rect x="9.5" y="2" width="4" height="12" rx="1.2" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.5 2.6a1 1 0 0 1 1.53-.85l8.2 5.4a1 1 0 0 1 0 1.7l-8.2 5.4a1 1 0 0 1-1.53-.85V2.6z" />
          </svg>
        )}
      </button>

      {/* скорость */}
      <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.05] p-1">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            aria-pressed={speed === s}
            className={`rounded-lg px-2 py-1.5 text-xs font-extrabold tabular-nums transition-all active:scale-90 ${
              speed === s
                ? "bg-solar-400/20 text-solar-300 shadow-[inset_0_0_0_1px_rgba(242,181,68,0.45)]"
                : "text-mist-400 hover:bg-white/[0.06] hover:text-mist-100"
            }`}
          >
            ×{s}
          </button>
        ))}
      </div>

      {/* сброс времени */}
      <button
        onClick={onReset}
        title="Сбросить время симуляции"
        aria-label="Сбросить время"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mist-400 transition-all hover:bg-white/[0.07] hover:text-mist-100 active:scale-90"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </button>

      <span className="hidden h-6 w-px bg-white/10 sm:block" />

      {/* переключатели */}
      <div className="hidden items-center gap-1 sm:flex">
        <ToggleChip active={showOrbits} label="Орбиты" onClick={onToggleOrbits}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            <ellipse cx="12" cy="12" rx="10" ry="4.5" />
          </svg>
        </ToggleChip>
        <ToggleChip active={showLabels} label="Имена" onClick={onToggleLabels}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7V5h16v2M9 20h6M12 5v15" />
          </svg>
        </ToggleChip>
      </div>

      {/* индикатор темпа */}
      <div className="hidden flex-col items-end pl-1 leading-tight lg:flex">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-mist-500">темп</span>
        <span className="text-xs font-extrabold tabular-nums text-solar-300">
          {(BASE_DAYS_PER_SECOND * speed).toLocaleString("ru-RU")} сут/с
        </span>
      </div>
    </div>
  );
}
