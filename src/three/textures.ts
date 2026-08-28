/**
 * Процедурные текстуры планет, рисуемые на <canvas> —
 * без внешних изображений, каждый мир со своим характером.
 */
import * as THREE from "three";
import type { Body } from "../data/bodies";

const cache = new Map<string, THREE.CanvasTexture>();

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** shade("#a5683a", 0.3) — осветлить; shade(hex, -0.3) — затемнить */
function shade(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = f < 0 ? 0 : 255;
  const p = Math.abs(f);
  return `rgb(${Math.round(r + (t - r) * p)},${Math.round(g + (t - g) * p)},${Math.round(b + (t - b) * p)})`;
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function baseGradient(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, hi: string) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, shade(color, -0.22));
  g.addColorStop(0.45, shade(hi, -0.25));
  g.addColorStop(1, shade(color, -0.38));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, dark: number, light: number, maxR: number) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 0.6 + Math.random() * maxR;
    const isDark = Math.random() < 0.55;
    ctx.fillStyle = isDark ? `rgba(0,0,0,${dark * Math.random()})` : `rgba(255,255,255,${light * Math.random()})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** горизонтальные облачные полосы газовых гигантов */
function bands(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, amp: number, count: number, alpha: number) {
  for (let i = 0; i < count; i++) {
    const y0 = (i / count) * h;
    const bh = h / count + Math.random() * 4;
    const lift = Math.random() < 0.5;
    ctx.fillStyle = lift ? shade(base, amp * Math.random()) : shade(base, -amp * Math.random());
    ctx.globalAlpha = alpha * (0.5 + Math.random() * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, y0);
    for (let x = 0; x <= w; x += 24) ctx.lineTo(x, y0 + Math.sin(x * 0.02 + i * 1.9) * 3.2);
    ctx.lineTo(w, y0 + bh);
    for (let x = w; x >= 0; x -= 24) ctx.lineTo(x, y0 + bh + Math.sin(x * 0.02 + i * 1.3) * 3.2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function streaks(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, color: string, alpha: number) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = h * (0.2 + Math.random() * 0.6);
    ctx.fillStyle = rgba(color, alpha * (0.4 + Math.random() * 0.6));
    ctx.beginPath();
    ctx.ellipse(x, y, 14 + Math.random() * 42, 1.4 + Math.random() * 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function polarCaps(ctx: CanvasRenderingContext2D, w: number, h: number, top: number, bottom: number) {
  if (top > 0) {
    const g = ctx.createLinearGradient(0, 0, 0, top * 2);
    g.addColorStop(0, "rgba(255,255,255,0.92)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, top * 2);
  }
  if (bottom > 0) {
    const g = ctx.createLinearGradient(0, h, 0, h - bottom * 2);
    g.addColorStop(0, "rgba(255,255,255,0.92)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, h - bottom * 2, w, bottom * 2);
  }
}

function drawBody(b: Body): HTMLCanvasElement {
  const w = 512;
  const h = 256;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;

  switch (b.id) {
    case "sun": {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#ffd98f");
      g.addColorStop(0.5, "#ffbf5e");
      g.addColorStop(1, "#e08a24");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = Math.random() < 0.5 ? `rgba(255,244,200,${0.1 * Math.random()})` : `rgba(190,100,25,${0.12 * Math.random()})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.7 + Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 14; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 8 + Math.random() * 22;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(255,240,180,0.35)");
        rg.addColorStop(1, "rgba(255,240,180,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      break;
    }
    case "mercury": {
      baseGradient(ctx, w, h, b.color, b.hi);
      speckle(ctx, w, h, 1200, 0.2, 0.1, 2);
      for (let i = 0; i < 110; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1.5 + Math.random() * 5;
        ctx.fillStyle = `rgba(20,14,10,${0.12 + Math.random() * 0.16})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,240,220,${0.1 + Math.random() * 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x - 0.7, y - 0.7, r, Math.PI * 0.9, Math.PI * 1.9);
        ctx.stroke();
      }
      break;
    }
    case "venus": {
      baseGradient(ctx, w, h, b.color, b.hi);
      for (let i = 0; i < 26; i++) {
        const y = (i / 26) * h + Math.random() * 8;
        ctx.strokeStyle = `rgba(255,238,196,${0.08 + Math.random() * 0.14})`;
        ctx.lineWidth = 4 + Math.random() * 12;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.015 + i * 2.2) * 7);
        ctx.stroke();
      }
      speckle(ctx, w, h, 400, 0.05, 0.06, 1.6);
      break;
    }
    case "earth": {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#17497f");
      g.addColorStop(0.5, "#2a6cb0");
      g.addColorStop(1, "#123a66");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const land = ["#2e7d43", "#3f8a4a", "#8a7a4a", "#5d8a4e"];
      for (let cl = 0; cl < 7; cl++) {
        const cx = Math.random() * w;
        const cy = h * (0.22 + Math.random() * 0.56);
        const spread = 16 + Math.random() * 30;
        const n = 16 + Math.floor(Math.random() * 14);
        for (let i = 0; i < n; i++) {
          const bx = cx + (Math.random() + Math.random() - 1) * spread * 1.7;
          const by = cy + (Math.random() + Math.random() - 1) * spread * 0.9;
          ctx.fillStyle = rgba(land[Math.floor(Math.random() * land.length)], 0.85);
          ctx.beginPath();
          ctx.ellipse(bx, by, 4 + Math.random() * 13, 3 + Math.random() * 9, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      polarCaps(ctx, w, h, 12, 12);
      speckle(ctx, w, h, 300, 0.05, 0.05, 1.2);
      break;
    }
    case "mars": {
      baseGradient(ctx, w, h, b.color, b.hi);
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = `rgba(70,30,18,${0.1 + Math.random() * 0.16})`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, h * (0.15 + Math.random() * 0.7), 12 + Math.random() * 42, 6 + Math.random() * 18, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = `rgba(235,170,120,${0.08 + Math.random() * 0.12})`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 34, 4 + Math.random() * 12, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
      speckle(ctx, w, h, 700, 0.14, 0.07, 1.6);
      polarCaps(ctx, w, h, 8, 7);
      break;
    }
    case "jupiter": {
      baseGradient(ctx, w, h, b.color, b.hi);
      bands(ctx, w, h, b.color, 0.5, 26, 0.55);
      streaks(ctx, w, h, 46, b.hi, 0.16);
      streaks(ctx, w, h, 30, "#6b3a1c", 0.16);
      // Большое Красное Пятно
      ctx.fillStyle = "rgba(168,64,42,0.85)";
      ctx.beginPath();
      ctx.ellipse(w * 0.3, h * 0.63, 27, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(240,190,140,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w * 0.3, h * 0.63, 31, 17, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "saturn": {
      baseGradient(ctx, w, h, b.color, b.hi);
      bands(ctx, w, h, b.color, 0.26, 22, 0.4);
      streaks(ctx, w, h, 26, b.hi, 0.1);
      break;
    }
    case "uranus": {
      baseGradient(ctx, w, h, b.color, b.hi);
      bands(ctx, w, h, b.color, 0.08, 10, 0.3);
      streaks(ctx, w, h, 10, b.hi, 0.12);
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.3);
      g.addColorStop(0, "rgba(210,245,248,0.3)");
      g.addColorStop(1, "rgba(210,245,248,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.3);
      break;
    }
    case "neptune": {
      baseGradient(ctx, w, h, b.color, b.hi);
      bands(ctx, w, h, b.color, 0.2, 14, 0.42);
      ctx.fillStyle = "rgba(16,26,80,0.6)";
      ctx.beginPath();
      ctx.ellipse(w * 0.62, h * 0.42, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      streaks(ctx, w, h, 12, "#cdd8ff", 0.26);
      break;
    }
    default:
      baseGradient(ctx, w, h, b.color, b.hi);
  }

  return c;
}

function drawClouds(): HTMLCanvasElement {
  const w = 512;
  const h = 256;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 13;
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w;
    const y = h * (0.12 + Math.random() * 0.76);
    ctx.fillStyle = `rgba(255,255,255,${0.16 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 8 + Math.random() * 22, 3 + Math.random() * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function drawRing(): HTMLCanvasElement {
  const w = 512;
  const h = 16;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  for (let x = 0; x < w; x++) {
    const t = x / w;
    let a: number;
    if (t < 0.06) a = (t / 0.06) * 0.3;
    else if (t < 0.16) a = 0.42;
    else if (t < 0.2) a = 0.07;
    else if (t < 0.52) a = 0.72 + 0.2 * Math.sin(t * 90);
    else if (t < 0.61) a = 0.05; // щель Кассини
    else if (t < 0.86) a = 0.48 + 0.16 * Math.sin(t * 70);
    else a = ((1 - t) / 0.14) * 0.38;
    a *= 0.75 + Math.random() * 0.5;
    const alpha = Math.max(0, Math.min(1, a));
    ctx.fillStyle = `rgba(${232 - Math.round(60 * t)},${217 - Math.round(58 * t)},${176 - Math.round(52 * t)},${alpha})`;
    ctx.fillRect(x, 0, 1, h);
  }
  return c;
}

function drawGlow(): HTMLCanvasElement {
  const s = 256;
  const c = makeCanvas(s, s);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.22, "rgba(255,236,190,0.5)");
  g.addColorStop(0.55, "rgba(255,190,110,0.14)");
  g.addColorStop(1, "rgba(255,180,90,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return c;
}

export function getBodyTexture(b: Body): THREE.CanvasTexture {
  const key = `body-${b.id}`;
  if (!cache.has(key)) cache.set(key, toTexture(drawBody(b)));
  return cache.get(key)!;
}

export function getCloudTexture(): THREE.CanvasTexture {
  if (!cache.has("clouds")) cache.set("clouds", toTexture(drawClouds()));
  return cache.get("clouds")!;
}

export function getRingTexture(): THREE.CanvasTexture {
  if (!cache.has("ring")) cache.set("ring", toTexture(drawRing()));
  return cache.get("ring")!;
}

export function getGlowTexture(): THREE.CanvasTexture {
  if (!cache.has("glow")) cache.set("glow", toTexture(drawGlow()));
  return cache.get("glow")!;
}
