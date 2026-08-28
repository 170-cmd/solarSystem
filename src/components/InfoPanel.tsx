import { useEffect, useState } from "react";
import { EARTH, MAX_AU, MAX_DIAMETER, MAX_PERIOD, type Body } from "../data/bodies";
import { formatKm, formatPeriod, plural } from "../utils";

interface InfoPanelProps {
  body: Body;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
}

function Fact({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 transition-colors duration-200 hover:border-solar-400/25 hover:bg-white/[0.05]">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-solar-400/12 text-solar-300">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-mist-500">{label}</div>
        <div className="text-sm font-bold leading-snug text-mist-100">{value}</div>
        {sub && <div className="mt-0.5 text-[11px] font-semibold text-mist-400">{sub}</div>}
      </div>
    </div>
  );
}

function CompareBar({ label, valueText, pct, delay }: { label: string; valueText: string; pct: number; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 120 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-mist-500">{label}</span>
        <span className="text-[11px] font-bold tabular-nums text-mist-300">{valueText}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="bar-fill h-full rounded-full"
          style={{ width: `${w}%`, background: "linear-gradient(90deg, #b87417, #f2b544 70%, #ffd37e)" }}
        />
      </div>
    </div>
  );
}

const iconSize = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4v16M4 12h16" opacity="0.5" />
  </svg>
);
const iconDist = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="2.4" />
    <path d="M7.5 12h9m0 0-2.2-2.2M16.5 12l-2.2 2.2" />
  </svg>
);
const iconPeriod = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
const iconDay = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
  </svg>
);
const iconMoon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5z" />
  </svg>
);
const iconTemp = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4.5 4.5 0 1 1-4 0z" />
    <circle cx="12" cy="17.5" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

export default function InfoPanel({ body, onClose, onPrev, onNext, index, total }: InfoPanelProps) {
  const isStar = body.kind === "star";
  const lightMinutes = body.distanceMkm > 0 ? (body.distanceMkm / 17.99).toFixed(1).replace(".", ",") : null;

  return (
    <aside className="pointer-events-auto absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-white/10 bg-space-900/90 backdrop-blur-2xl max-md:inset-x-0 max-md:inset-y-auto max-md:bottom-0 max-md:max-h-[62dvh] max-md:max-w-none max-md:rounded-t-3xl max-md:border-t max-md:border-l-0">
      <div className="panel-in panel-scroll flex-1 overflow-y-auto max-md:sheet-in">
        {/* заголовок */}
        <div className="relative overflow-hidden px-6 pb-5 pt-6">
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full opacity-25 blur-2xl"
            style={{ background: body.color }}
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-solar-400">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: body.color, boxShadow: `0 0 10px ${body.color}` }} />
                {body.kindLabel}
              </div>
              <h2 className="font-display mt-2 text-3xl font-bold leading-none text-mist-100">{body.name}</h2>
              <div className="mt-1.5 text-xs font-semibold italic tracking-wide text-mist-500">{body.latin}</div>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-mist-400 transition-all hover:rotate-90 hover:bg-white/10 hover:text-mist-100 active:scale-90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div key={body.id} className="content-swap space-y-5 px-6 pb-8">
          {/* факты */}
          <div className="space-y-2.5">
            <Fact icon={iconSize} label="Диаметр" value={formatKm(body.diameterKm)} sub={`в ${(body.diameterKm / EARTH.diameterKm).toFixed(1).replace(".", ",")} раз ${body.diameterKm >= EARTH.diameterKm ? "больше" : "меньше"} Земли`} />
            {!isStar && (
              <Fact
                icon={iconDist}
                label="Расстояние от Солнца"
                value={`${body.distanceMkm.toLocaleString("ru-RU")} млн км`}
                sub={`${body.distanceAU.toLocaleString("ru-RU")} а.е.${lightMinutes ? ` · свет идёт ${lightMinutes} мин` : ""}`}
              />
            )}
            {!isStar && <Fact icon={iconPeriod} label="Орбитальный период (год)" value={formatPeriod(body.periodDays)} sub={`${body.periodDays.toLocaleString("ru-RU")} земных суток`} />}
            <Fact icon={iconDay} label="Длина суток" value={body.rotationText} />
            {!isStar && (
              <Fact
                icon={iconMoon}
                label="Спутники"
                value={`${body.moons} ${plural(body.moons, ["спутник", "спутника", "спутников"])}`}
                sub={body.moons === 0 ? "естественных спутников нет" : undefined}
              />
            )}
            <Fact icon={iconTemp} label="Температура" value={body.tempText} />
          </div>

          {/* сравнение с Землёй */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-mist-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 17l5-10 4 6 3-4 4 8" />
              </svg>
              Сравнение с Землёй
            </div>
            <div className="space-y-3.5">
              <CompareBar
                label="Размер"
                valueText={isStar ? "в 109 раз больше Земли" : `${(body.diameterKm / EARTH.diameterKm).toFixed(2).replace(".", ",")} × Земли`}
                pct={isStar ? 100 : Math.max(4, Math.sqrt(body.diameterKm / MAX_DIAMETER) * 100)}
                delay={0}
              />
              {!isStar && (
                <CompareBar
                  label="Дистанция"
                  valueText={`${body.distanceAU.toLocaleString("ru-RU")} а.е.`}
                  pct={Math.max(3, Math.sqrt(body.distanceAU / MAX_AU) * 100)}
                  delay={120}
                />
              )}
              {!isStar && (
                <CompareBar
                  label="Длина года"
                  valueText={formatPeriod(body.periodDays)}
                  pct={Math.max(3, Math.sqrt(body.periodDays / MAX_PERIOD) * 100)}
                  delay={240}
                />
              )}
            </div>
          </div>

          {/* факт */}
          <div className="relative overflow-hidden rounded-xl border border-solar-400/20 bg-gradient-to-br from-solar-400/[0.1] to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-solar-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 1 3.6 10.8c-.7.6-1.1 1.2-1.1 2.2h-5c0-1-.4-1.6-1.1-2.2A6 6 0 0 1 12 3z" />
                <path d="M10 19h4M10.8 21.5h2.4" />
              </svg>
              Знаете ли вы?
            </div>
            <p className="text-[13px] font-semibold leading-relaxed text-mist-300">{body.fact}</p>
          </div>
        </div>
      </div>

      {/* нижняя навигация */}
      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-space-900/95 px-6 py-3.5 max-md:pb-5">
        <button
          onClick={onPrev}
          className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 py-2 text-xs font-extrabold text-mist-300 transition-all hover:bg-white/10 hover:text-mist-100 active:scale-95"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Пред.
        </button>
        <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-mist-500">
          {index + 1} / {total}
          <div className="mt-0.5 text-[9px] font-bold tracking-wider text-mist-500/70">← → листать · Esc закрыть</div>
        </div>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 rounded-full bg-solar-400/15 px-3.5 py-2 text-xs font-extrabold text-solar-300 transition-all hover:bg-solar-400/25 active:scale-95"
        >
          След.
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
