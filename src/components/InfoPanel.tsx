import { BODIES, EARTH, MAX_AU, MAX_DIAMETER, MAX_PERIOD, type Body } from "../data/bodies";
import { formatKm, formatPeriod } from "../utils";

interface InfoPanelProps {
  body: Body;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function CompareBar({
  label,
  value,
  pct,
  body,
}: {
  label: string;
  value: string;
  pct: number;
  body: Body;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-mist-500">{label}</span>
        <span className="text-xs font-bold tabular-nums text-mist-100">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="bar-fill h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${body.color}, ${body.hi})`,
          }}
        />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.045] p-3 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.07]">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-mist-500">{label}</div>
      <div className="mt-1 text-sm font-bold leading-snug text-mist-100">{value}</div>
    </div>
  );
}

export default function InfoPanel({ body, onClose, onPrev, onNext }: InfoPanelProps) {
  const index = BODIES.findIndex((b) => b.id === body.id);

  const earthRatio = body.diameterKm / EARTH.diameterKm;
  const ratioText = earthRatio >= 10 ? Math.round(earthRatio).toString() : earthRatio.toFixed(earthRatio >= 1 ? 1 : 2);

  const sizePct = Math.min(100, Math.sqrt(earthRatio / (MAX_DIAMETER / EARTH.diameterKm)) * 100);
  const distPct = body.distanceAU === 0 ? 0 : Math.max(3.5, Math.sqrt(body.distanceAU / MAX_AU) * 100);
  const yearPct = body.periodDays === 0 ? 0 : Math.max(3.5, Math.sqrt(body.periodDays / MAX_PERIOD) * 100);

  return (
    <aside className="panel-in absolute inset-x-0 bottom-0 z-40 max-h-[62dvh] overflow-hidden rounded-t-2xl border-t border-white/10 bg-space-900/95 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl md:inset-x-auto md:bottom-0 md:right-0 md:top-0 md:h-full md:max-h-none md:w-[400px] md:rounded-none md:border-l md:border-t-0 md:shadow-[-24px_0_70px_rgba(0,0,0,0.45)]">
      <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15 md:hidden" />

      <div className="panel-scroll flex h-full flex-col overflow-y-auto">
        {/* шапка досье */}
        <div key={body.id} className="content-swap px-5 pb-4 pt-4 md:px-6 md:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-mist-500">{body.latin}</div>
              <h2 className="font-display mt-1 flex items-center gap-3 text-2xl font-bold leading-tight text-mist-100 md:text-[27px]">
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-full ring-2 ring-white/15"
                  style={{ background: `radial-gradient(circle at 35% 30%, ${body.hi}, ${body.color})` }}
                />
                {body.name}
              </h2>
              <span
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  color: body.hi,
                  background: `${body.color}1f`,
                  boxShadow: `inset 0 0 0 1px ${body.color}55`,
                }}
              >
                {body.kindLabel}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть панель"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mist-400 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-mist-100 hover:ring-white/25 active:scale-90"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ключевые параметры */}
        <div key={`stats-${body.id}`} className="content-swap grid grid-cols-2 gap-2 px-5 md:px-6" style={{ animationDelay: "0.04s" }}>
          <StatTile label="Диаметр" value={formatKm(body.diameterKm)} />
          <StatTile
            label="От Солнца"
            value={body.distanceMkm === 0 ? "центр системы" : `${body.distanceMkm.toLocaleString("ru-RU")} млн км`}
          />
          <StatTile
            label="Орбитальный период"
            value={body.periodDays === 0 ? "—" : formatPeriod(body.periodDays)}
          />
          <StatTile label="Сутки" value={body.rotationText} />
          <StatTile label="Спутники" value={body.id === "sun" ? "8 планет" : String(body.moons)} />
          <StatTile label="Температура" value={body.tempText} />
          <div className="col-span-2 mt-0.5 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] font-semibold tabular-nums text-mist-500 ring-1 ring-white/[0.05]">
            {body.distanceAU === 0
              ? "Свет идёт от Солнца до Земли ≈ 8 мин 20 с"
              : `Свет от Солнца доходит за ≈ ${(body.distanceAU * 8.317).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} мин`}
          </div>
        </div>

        {/* сравнение с Землёй — секция вне content-swap, полосы анимируются при смене планеты */}
        <div className="mt-5 px-5 md:px-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-solar-400">Сравнение с Землёй</span>
            <span className="h-px flex-1 bg-white/8" />
          </div>
          <div className="space-y-3.5">
            <CompareBar label="Размер" value={body.id === "sun" ? "×109" : `×${ratioText.replace(".", ",")}`} pct={body.id === "sun" ? 100 : sizePct} body={body} />
            <CompareBar
              label="Дистанция"
              value={body.distanceAU === 0 ? "—" : `${body.distanceAU.toLocaleString("ru-RU")} а.е.`}
              pct={distPct}
              body={body}
            />
            <CompareBar
              label="Длина года"
              value={body.periodDays === 0 ? "—" : formatPeriod(body.periodDays)}
              pct={yearPct}
              body={body}
            />
          </div>
        </div>

        {/* факт */}
        <div key={`fact-${body.id}`} className="content-swap px-5 pb-5 pt-5 md:px-6" style={{ animationDelay: "0.08s" }}>
          <div
            className="rounded-r-lg bg-white/[0.04] p-3.5"
            style={{ borderLeft: `3px solid ${body.color}` }}
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-mist-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill={body.hi}>
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
              </svg>
              Знаете ли вы?
            </div>
            <p className="text-[13px] font-medium leading-relaxed text-mist-300">{body.fact}</p>
          </div>
        </div>

        {/* навигация по телам */}
        <div className="mt-auto sticky bottom-0 flex items-center justify-between border-t border-white/[0.07] bg-space-900/95 px-5 py-3 backdrop-blur-xl md:px-6">
          <button
            onClick={onPrev}
            aria-label="Предыдущее тело"
            className="grid h-9 w-9 place-items-center rounded-full text-mist-400 ring-1 ring-white/12 transition-all hover:bg-white/10 hover:text-mist-100 hover:ring-white/30 active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-500 tabular-nums">
            {index + 1} / {BODIES.length}
          </span>
          <button
            onClick={onNext}
            aria-label="Следующее тело"
            className="grid h-9 w-9 place-items-center rounded-full text-mist-400 ring-1 ring-white/12 transition-all hover:bg-white/10 hover:text-mist-100 hover:ring-white/30 active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
