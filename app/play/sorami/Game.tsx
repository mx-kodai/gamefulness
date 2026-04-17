"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Phase = "idle" | "playing" | "done";
type FloaterKind = "bird" | "balloon-red" | "balloon-yellow" | "balloon-blue" | "star" | "cloud";

type Floater = {
  id: number;
  kind: FloaterKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  wing: number;
  born: number;
  popped: boolean;
  popT: number;
};

const SESSION_MS = 40_000;

const POINTS: Record<FloaterKind, number> = {
  bird: 3,
  "balloon-red": 2,
  "balloon-yellow": 2,
  "balloon-blue": 2,
  star: 5,
  cloud: 0,
};

export default function SoramiGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [best, setBest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stateRef = useRef({
    phase: "idle" as Phase,
    start: 0,
    time: 0,
    score: 0,
    caught: 0,
    floaters: [] as Floater[],
    nextId: 1,
    lastSpawn: 0,
    spawnIn: 0.8,
  });

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("sorami:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  const start = useCallback(() => {
    enterFs();
    const s = stateRef.current;
    s.phase = "playing";
    s.start = performance.now();
    s.time = 0;
    s.score = 0;
    s.caught = 0;
    s.floaters = [];
    s.nextId = 1;
    s.lastSpawn = 0;
    s.spawnIn = 0.6;
    setPhase("playing");
    setScore(0);
    setCaught(0);
    setElapsed(0);
  }, []);

  const finish = useCallback(() => {
    const s = stateRef.current;
    s.phase = "done";
    setPhase("done");
    const fs = s.score;
    setBest((old) => {
      const nb = Math.max(old, fs);
      try {
        localStorage.setItem("sorami:best", String(nb));
      } catch {}
      return nb;
    });
    const u = getCurrentUser();
    if (u && fs > 0) {
      addScore({
        id: uid("sc"),
        userId: u.id,
        gameSlug: "sorami",
        level: s.caught,
        score: fs,
        playedAt: Date.now(),
      });
    }
  }, []);

  const spawn = useCallback(() => {
    const s = stateRef.current;
    const r = Math.random();
    let kind: FloaterKind;
    if (r < 0.38) kind = "bird";
    else if (r < 0.55) kind = "balloon-red";
    else if (r < 0.7) kind = "balloon-yellow";
    else if (r < 0.82) kind = "balloon-blue";
    else if (r < 0.9) kind = "star";
    else kind = "cloud";

    const fromRight = Math.random() > 0.5;
    const y = 0.15 + Math.random() * 0.55;
    const speed = kind === "star" ? 0.22 : kind === "cloud" ? 0.06 : 0.14 + Math.random() * 0.08;
    const isBalloon = kind.startsWith("balloon");
    s.floaters.push({
      id: s.nextId++,
      kind,
      x: fromRight ? 1.08 : -0.08,
      y,
      vx: fromRight ? -speed : speed,
      vy: isBalloon ? -0.015 : 0,
      wing: 0,
      born: performance.now(),
      popped: false,
      popT: 0,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * DPR);
      canvas.height = Math.floor(rect.height * DPR);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;

      if (s.phase === "playing") {
        s.time = (now - s.start) / 1000;
        if (s.time * 1000 >= SESSION_MS) {
          finish();
        }
        s.lastSpawn += dt;
        const progress = Math.min(1, s.time / 40);
        s.spawnIn = 0.7 - 0.35 * progress;
        if (s.lastSpawn >= s.spawnIn) {
          s.lastSpawn = 0;
          spawn();
        }
        for (const f of s.floaters) {
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.wing = (f.wing + dt * 14) % (Math.PI * 2);
          if (f.popped) f.popT += dt;
        }
        s.floaters = s.floaters.filter((f) => {
          if (f.popped && f.popT > 0.4) return false;
          if (f.x < -0.15 || f.x > 1.15) return false;
          if (f.y < -0.15) return false;
          return true;
        });
        setElapsed(s.time * 1000);
        setScore(s.score);
        setCaught(s.caught);
      }

      drawSky(ctx, w, h, s.time, s.phase);
      for (const f of s.floaters) drawFloater(ctx, f, w, h);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [spawn, finish]);

  const onTap = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    let hit: Floater | null = null;
    for (let i = s.floaters.length - 1; i >= 0; i--) {
      const f = s.floaters[i];
      if (f.popped) continue;
      const dx = f.x - px;
      const dy = f.y - py;
      const r = radiusOf(f.kind);
      if (dx * dx + dy * dy < r * r) {
        hit = f;
        break;
      }
    }
    if (hit) {
      hit.popped = true;
      s.score += POINTS[hit.kind];
      if (POINTS[hit.kind] > 0) s.caught += 1;
      playPop(hit.kind);
    }
  }, []);

  const progress = Math.min(1, elapsed / SESSION_MS);

  return (
    <FullscreenHost label="全画面で空へ">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="スコア" value={String(score)} />
            <Stat label="つかまえた" value={String(caught)} />
            <Stat label="さいこう" value={String(best)} />
            <Stat label="のこり" value={`${Math.max(0, Math.ceil((SESSION_MS - elapsed) / 1000))}秒`} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={start}
              disabled={phase === "playing"}
              className="btn-lift rounded-full border-2 border-ink bg-ink px-4 py-2 font-display text-[13px] font-black text-bg ring-ink-sm disabled:opacity-40 md:px-5 md:py-2.5 md:text-[14px]"
            >
              {phase === "idle" ? "スタート" : "もう一度"}
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border-2 border-ink ring-ink-lg">
          <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-ink/10">
            <div
              className="h-full bg-green transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <canvas
            ref={canvasRef}
            onPointerDown={onTap}
            className="block aspect-[16/10] w-full cursor-crosshair touch-none select-none md:max-h-[640px]"
          />
          {phase === "idle" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-3xl border-2 border-ink bg-bg/85 px-8 py-6 backdrop-blur">
                <p className="font-display text-[18px] font-bold md:text-[20px]">
                  空をよぎるものを、タップ。
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] md:text-[14px]">
                  <Badge color="bg-red" text="とり +3" />
                  <Badge color="bg-yellow" text="ふうせん +2" />
                  <Badge color="bg-blue" text="ほしぞら +5" />
                </div>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-green px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:text-[20px]"
                >
                  はじめる
                </button>
              </div>
            </div>
          )}
          {phase === "done" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-3xl border-2 border-ink bg-bg/90 px-8 py-6 backdrop-blur">
                <p className="font-display text-[22px] font-bold md:text-[28px]">{score} 点！</p>
                <p className="text-[13px] text-ink-soft md:text-[15px]">{caught} 個つかまえました</p>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-green px-6 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
                >
                  もう一度
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[13px] text-ink-soft md:text-[14px]">
          40秒。朝から夕方まで、空を流れるものをタップしましょう。
        </p>
      </div>
    </FullscreenHost>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-label text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </div>
      <div className="font-display text-[18px] font-black leading-tight md:text-[22px]">
        {value}
      </div>
    </div>
  );
}

function Badge({ color, text }: { color: string; text: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink ${color} px-3 py-1 font-display text-[12px] font-black text-bg`}>
      {text}
    </span>
  );
}

function radiusOf(kind: FloaterKind): number {
  if (kind === "star") return 0.045;
  if (kind === "cloud") return 0.075;
  if (kind === "bird") return 0.055;
  return 0.055;
}

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, phase: Phase) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  const tSec = phase === "playing" ? t : 0;
  const cyc = Math.min(1, tSec / 40);
  const palettes = [
    { top: "#E8F1FB", mid: "#FAE7C9", bot: "#F6F1E4" }, // 朝
    { top: "#7EC6F3", mid: "#E5F2FB", bot: "#FFF7E3" }, // 昼
    { top: "#F19056", mid: "#F6CFA1", bot: "#FFE7CF" }, // 夕
  ];
  const n = palettes.length - 1;
  const idx = Math.min(n, Math.floor(cyc * n));
  const nxt = Math.min(n, idx + 1);
  const local = cyc * n - idx;
  const top = mix(palettes[idx].top, palettes[nxt].top, local);
  const mid = mix(palettes[idx].mid, palettes[nxt].mid, local);
  const bot = mix(palettes[idx].bot, palettes[nxt].bot, local);
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, top);
  grd.addColorStop(0.55, mid);
  grd.addColorStop(1, bot);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Ground silhouette
  ctx.fillStyle = "#1B1A17";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.85);
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * w;
    const y = h * 0.85 + Math.sin(i * 1.3) * 10;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function mix(a: string, b: string, t: number): string {
  const ca = hex(a);
  const cb = hex(b);
  return `rgb(${Math.round(ca.r + (cb.r - ca.r) * t)},${Math.round(ca.g + (cb.g - ca.g) * t)},${Math.round(ca.b + (cb.b - ca.b) * t)})`;
}
function hex(h: string) {
  const s = h.replace("#", "");
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16) };
}

function drawFloater(ctx: CanvasRenderingContext2D, f: Floater, w: number, h: number) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  const x = f.x * w;
  const y = f.y * h;
  if (f.popped) {
    const r = 18 + f.popT * 80;
    ctx.strokeStyle = colorOf(f.kind);
    ctx.lineWidth = 3 * (1 - f.popT * 2);
    if (ctx.lineWidth > 0) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#1B1A17";
    ctx.font = "bold 16px system-ui";
    ctx.globalAlpha = Math.max(0, 1 - f.popT * 2.5);
    ctx.fillText(`+${POINTS[f.kind]}`, x + 10, y - 18 - f.popT * 30);
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }
  if (f.kind === "bird") {
    drawBird(ctx, x, y, f.wing, f.vx < 0);
  } else if (f.kind.startsWith("balloon")) {
    drawBalloon(ctx, x, y, colorOf(f.kind));
  } else if (f.kind === "star") {
    drawStar(ctx, x, y, performance.now() / 1000);
  } else if (f.kind === "cloud") {
    drawCloud(ctx, x, y);
  }
  ctx.restore();
}

function colorOf(kind: FloaterKind): string {
  if (kind === "balloon-red") return "#E23D3D";
  if (kind === "balloon-yellow") return "#F4B533";
  if (kind === "balloon-blue") return "#2F7FE0";
  if (kind === "bird") return "#1B1A17";
  if (kind === "star") return "#F4B533";
  return "#FFFFFF";
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, wing: number, faceLeft: boolean) {
  ctx.save();
  ctx.translate(x, y);
  if (faceLeft) ctx.scale(-1, 1);
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const flap = Math.sin(wing) * 12;
  // Body
  ctx.fillStyle = "#1B1A17";
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings
  ctx.beginPath();
  ctx.moveTo(-4, -2);
  ctx.quadraticCurveTo(0, -14 - flap, 14, -4 - flap * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -2);
  ctx.quadraticCurveTo(-12, -10 - flap, -22, -6 - flap * 0.3);
  ctx.stroke();
  // Beak
  ctx.fillStyle = "#F4B533";
  ctx.beginPath();
  ctx.moveTo(10, -1);
  ctx.lineTo(16, 1);
  ctx.lineTo(10, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBalloon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  // String
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.quadraticCurveTo(4, 34, 0, 46);
  ctx.stroke();
  // Balloon
  ctx.fillStyle = color;
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Tie
  ctx.fillStyle = "#1B1A17";
  ctx.beginPath();
  ctx.moveTo(-4, 22);
  ctx.lineTo(0, 30);
  ctx.lineTo(4, 22);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(-7, -8, 5, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.7);
  const r1 = 14;
  const r2 = 6;
  ctx.fillStyle = "#F4B533";
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.strokeStyle = "rgba(27,26,23,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.arc(14, 2, 14, 0, Math.PI * 2);
  ctx.arc(-14, 3, 13, 0, Math.PI * 2);
  ctx.arc(6, -8, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

let _ctx: AudioContext | null = null;
function getAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

function playPop(kind: FloaterKind) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const base = kind === "star" ? 900 : kind === "bird" ? 620 : 480;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.exponentialRampToValueAtTime(base * 1.6, now + 0.12);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.28);
}
