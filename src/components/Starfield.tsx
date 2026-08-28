import { useMemo } from "react";

interface Star {
  top: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
  peak: number;
}

export default function Starfield() {
  const stars = useMemo<Star[]>(() => {
    const arr: Star[] = [];
    for (let i = 0; i < 150; i++) {
      arr.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.85 ? 1 + Math.random() : 2 + Math.random() * 1.4,
        dur: 2.6 + Math.random() * 5.5,
        delay: Math.random() * 6,
        peak: 0.35 + Math.random() * 0.6,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* глубокие слои: тёплое свечение у центра и холодные туманности */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 46%, rgba(224, 154, 43, 0.07) 0%, rgba(224, 154, 43, 0) 42%)," +
            "radial-gradient(90% 90% at 50% 50%, rgba(13, 23, 41, 0.9) 0%, rgba(4, 7, 15, 1) 78%)",
        }}
      />
      <div
        className="nebula nebula-drift"
        style={{
          top: "-18%",
          right: "-12%",
          width: "55vmax",
          height: "42vmax",
          background: "radial-gradient(closest-side, rgba(43, 92, 176, 0.16), rgba(43, 92, 176, 0) 70%)",
        }}
      />
      <div
        className="nebula nebula-drift"
        style={{
          bottom: "-22%",
          left: "-14%",
          width: "50vmax",
          height: "40vmax",
          background: "radial-gradient(closest-side, rgba(47, 148, 158, 0.12), rgba(47, 148, 158, 0) 70%)",
          animationDelay: "-9s",
        }}
      />
      <div
        className="nebula nebula-drift"
        style={{
          top: "8%",
          left: "6%",
          width: "34vmax",
          height: "26vmax",
          background: "radial-gradient(closest-side, rgba(184, 116, 23, 0.08), rgba(184, 116, 23, 0) 70%)",
          animationDelay: "-16s",
        }}
      />

      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            boxShadow: s.size > 2 ? "0 0 6px rgba(255,255,255,0.55)" : undefined,
            ["--dur" as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
            ["--peak" as string]: s.peak,
          }}
        />
      ))}

      <span className="shooting-star" style={{ top: "12%", right: "-8%" }} />
      <span className="shooting-star" style={{ top: "38%", right: "-6%", animationDelay: "11s", animationDuration: "17s" }} />

      {/* виньетка */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(115% 115% at 50% 50%, rgba(4,7,15,0) 55%, rgba(4,7,15,0.75) 100%)" }}
      />
    </div>
  );
}
