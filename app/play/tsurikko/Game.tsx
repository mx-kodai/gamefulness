"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Phase = "idle" | "waiting" | "bite" | "reeling" | "done";
type FishKind = "小" | "中" | "大" | "長靴" | "宝箱";

type FishDef = {
  kind: FishKind;
  weight: number;
  points: number;
  color: string;
  len: number;
  biteWindow: number;
};

const FISH: FishDef[] = [
  { kind: "小", weight: 40, points: 1, color: "#86B8E4", len: 28, biteWindow: 0.9 },
  { kind: "中", weight: 30, points: 3, color: "#2F7FE0", len: 42, biteWindow: 0.75 },
  { kind: "大", weight: 15, points: 8, color: "#1B3E78", len: 60, biteWindow: 0.55 },
  { kind: "長靴", weight: 10, points: 0, color: "#5A473A", len: 30, biteWindow: 1.1 },
  { kind: "宝箱", weight: 5, points: 20, color: "#F4B533", len: 36, biteWindow: 0.45 },
];

const SESSION_MS = 60_000;

function pickFish(): FishDef {
  const total = FISH.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FISH) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return FISH[0];
}

export default function TsurikkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [best, setBest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [banner, setBanner] = useState<{ text: string; color: string } | null>(null);
  const stateRef = useRef({
    phase: "idle" as Phase,
    start: 0,
    score: 0,
    count: 0,
    waitUntil: 0,
    biteUntil: 0,
    current: null as FishDef | null,
    caughtAnim: 0,
    caughtFish: null as (FishDef & { px: number; py: number; vy: number; rot: number }) | null,
    missAnim: 0,
    ripple: 0,
    lineShake: 0,
    swimmers: [] as Array<{ x: number; y: number; vx: number; size: number; color: string; wave: number }>,
    splash: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number }>,
  });

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("tsurikko:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  const start = useCallback(() => {
    enterFs();
    const s = stateRef.current;
    s.phase = "waiting";
    s.start = performance.now();
    s.score = 0;
    s.count = 0;
    s.waitUntil = performance.now() + 1000 + Math.random() * 2000;
    s.biteUntil = 0;
    s.current = null;
    s.caughtAnim = 0;
    s.caughtFish = null;
    s.missAnim = 0;
    s.splash = [];
    s.swimmers = Array.from({ length: 7 }).map(() => {
      const colors = ["#86B8E4", "#2F7FE0", "#1B3E78", "#F4B533"];
      return {
        x: Math.random(),
        y: 0.55 + Math.random() * 0.38,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.04),
        size: 14 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        wave: Math.random() * Math.PI * 2,
      };
    });
    setPhase("waiting");
    setScore(0);
    setCount(0);
    setElapsed(0);
    setBanner(null);
  }, []);

  const finish = useCallback(() => {
    const s = stateRef.current;
    s.phase = "done";
    setPhase("done");
    setBest((old) => {
      const nb = Math.max(old, s.score);
      try {
        localStorage.setItem("tsurikko:best", String(nb));
      } catch {}
      return nb;
    });
    const u = getCurrentUser();
    if (u && s.score > 0) {
      addScore({
        id: uid("sc"),
        userId: u.id,
        gameSlug: "tsurikko",
        level: s.count,
        score: s.score,
        playedAt: Date.now(),
      });
    }
  }, []);

  const cast = useCallback(() => {
    const s = stateRef.current;
    const now = performance.now();
    if (s.phase === "waiting") {
      s.missAnim = 0.6;
      s.waitUntil = now + 1500 + Math.random() * 2000;
      playSplash(0.3);
      setBanner({ text: "早すぎた！", color: "bg-ink" });
      setTimeout(() => setBanner(null), 700);
      return;
    }
    if (s.phase === "bite") {
      const fish = s.current!;
      const remaining = (s.biteUntil - now) / 1000 / fish.biteWindow;
      const bonus = Math.round(fish.points * (0.5 + remaining * 0.7));
      s.score += bonus;
      s.count += 1;
      s.phase = "waiting";
      s.current = null;
      s.caughtAnim = 1.4;
      s.caughtFish = {
        ...fish,
        px: 0.5,
        py: 0.52,
        vy: -0.9,
        rot: 0,
      };
      s.splash = [];
      for (let i = 0; i < 16; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const sp = 0.3 + Math.random() * 0.6;
        s.splash.push({
          x: 0.5,
          y: 0.52,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
        });
      }
      s.waitUntil = now + 1100 + Math.random() * 1800;
      setPhase("waiting");
      setScore(s.score);
      setCount(s.count);
      playCatch(fish.points);
      setBanner({
        text: `${fish.kind} +${bonus}`,
        color: fish.points >= 8 ? "bg-yellow" : fish.points === 0 ? "bg-ink" : "bg-blue",
      });
      setTimeout(() => setBanner(null), 1400);
    }
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

      if (s.phase === "waiting" || s.phase === "bite") {
        const el = now - s.start;
        setElapsed(el);
        if (el >= SESSION_MS) {
          finish();
        }
      }
      if (s.phase === "waiting" && now >= s.waitUntil) {
        const f = pickFish();
        s.current = f;
        s.phase = "bite";
        s.biteUntil = now + f.biteWindow * 1000;
        s.ripple = 1;
        setPhase("bite");
        playBiteSignal();
      }
      if (s.phase === "bite" && now >= s.biteUntil) {
        s.phase = "waiting";
        s.current = null;
        s.waitUntil = now + 1200 + Math.random() * 1800;
        s.missAnim = 0.6;
        setPhase("waiting");
        setBanner({ text: "逃げられた…", color: "bg-ink" });
        setTimeout(() => setBanner(null), 700);
        playMiss();
      }
      s.ripple = Math.max(0, s.ripple - dt * 1.2);
      s.caughtAnim = Math.max(0, s.caughtAnim - dt);
      s.missAnim = Math.max(0, s.missAnim - dt);
      s.lineShake = s.phase === "bite" ? Math.sin(now * 0.02) * 4 : 0;

      // Swimmers drift
      for (const fs of s.swimmers) {
        fs.x += fs.vx * dt;
        fs.wave += dt * 3;
        if (fs.x < -0.06) fs.x = 1.06;
        if (fs.x > 1.06) fs.x = -0.06;
      }

      // Caught fish animation
      if (s.caughtFish) {
        const cf = s.caughtFish;
        cf.py += cf.vy * dt;
        cf.vy += 2.0 * dt;
        cf.rot += dt * 6;
        if (cf.py > 0.55 && cf.vy > 0) s.caughtFish = null;
      }

      // Splash particles
      for (const p of s.splash) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 1.8 * dt;
        p.life -= dt * 1.4;
      }
      s.splash = s.splash.filter((p) => p.life > 0);

      drawLake(ctx, w, h, now);
      drawSwimmers(ctx, w, h, s.swimmers);
      drawRod(ctx, w, h, s);
      drawCaughtFish(ctx, w, h, s.caughtFish);
      drawSplash(ctx, w, h, s.splash);
      if (s.phase === "bite" && s.current) drawBiteMark(ctx, w, h, now, s.biteUntil);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [finish]);

  const progress = Math.min(1, elapsed / SESSION_MS);
  const remainSec = Math.max(0, Math.ceil((SESSION_MS - elapsed) / 1000));

  return (
    <FullscreenHost label="全画面で釣る">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="スコア" value={String(score)} />
            <Stat label="つれた" value={`${count}匹`} />
            <Stat label="さいこう" value={String(best)} />
            <Stat label="のこり" value={`${remainSec}秒`} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={start}
              disabled={phase === "waiting" || phase === "bite"}
              className="btn-lift rounded-full border-2 border-ink bg-ink px-4 py-2 font-display text-[13px] font-black text-bg ring-ink-sm disabled:opacity-40 md:px-5 md:py-2.5 md:text-[14px]"
            >
              {phase === "idle" ? "スタート" : "もう一度"}
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border-2 border-ink ring-ink-lg">
          <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-ink/10">
            <div
              className="h-full bg-blue transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <canvas
            ref={canvasRef}
            onPointerDown={cast}
            className="block aspect-[16/10] w-full cursor-pointer touch-none select-none md:max-h-[640px]"
          />
          {banner && (
            <div className="pointer-events-none absolute left-1/2 top-8 z-20 -translate-x-1/2">
              <span className={`rounded-full border-2 border-ink ${banner.color} px-5 py-2 font-display text-[18px] font-black text-bg ring-ink md:text-[22px]`}>
                {banner.text}
              </span>
            </div>
          )}
          {phase === "bite" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
              <span className="animate-pulse rounded-full border-2 border-ink bg-yellow px-5 py-2 font-display text-[18px] font-black text-ink ring-ink md:text-[22px]">
                今だ！タップ！
              </span>
            </div>
          )}
          {phase === "idle" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-3xl border-2 border-ink bg-bg/85 px-8 py-6 backdrop-blur">
                <p className="font-display text-[18px] font-bold md:text-[22px]">
                  「！」が出たら、タップで釣りあげる。
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[12px] md:text-[13px]">
                  <Badge color="bg-blue" text="小 +1" />
                  <Badge color="bg-blue" text="中 +3" />
                  <Badge color="bg-red" text="大 +8" />
                  <Badge color="bg-yellow" text="宝箱 +20" />
                  <Badge color="bg-ink" text="長靴 0" />
                </div>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-blue px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:text-[20px]"
                >
                  糸を垂らす
                </button>
              </div>
            </div>
          )}
          {phase === "done" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-3xl border-2 border-ink bg-bg/90 px-8 py-6 backdrop-blur">
                <p className="font-display text-[22px] font-bold md:text-[28px]">{score} 点！</p>
                <p className="text-[13px] text-ink-soft md:text-[15px]">{count}匹 釣りました</p>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-blue px-6 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
                >
                  もう一度
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[13px] text-ink-soft md:text-[14px]">
          早まると逃げられる。大物は引きが一瞬。待つのがコツ。
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
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink ${color} px-2.5 py-1 font-display text-[11px] font-black text-bg md:text-[12px]`}>
      {text}
    </span>
  );
}

function drawLake(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  // Sky
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, "#C5E3F2");
  grd.addColorStop(0.45, "#E8F3F9");
  grd.addColorStop(0.45, "#2C6EA7");
  grd.addColorStop(1, "#123957");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Distant shore
  ctx.fillStyle = "#7BAE8F";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.42);
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * w;
    const y = h * 0.38 + Math.sin(i * 1.7) * 8;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h * 0.45);
  ctx.lineTo(0, h * 0.45);
  ctx.closePath();
  ctx.fill();

  // Waterline
  ctx.fillStyle = "#1B1A17";
  ctx.fillRect(0, h * 0.45, w, 2);

  // Water surface ripples
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const y = h * 0.48 + i * 18 + ((t * 0.02 + i * 19) % 16);
    ctx.beginPath();
    const xoff = ((t * 0.05 + i * 70) % w);
    ctx.moveTo(xoff - 30, y);
    ctx.quadraticCurveTo(xoff, y - 3, xoff + 30, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - xoff - 30, y + 8);
    ctx.quadraticCurveTo(w - xoff, y + 5, w - xoff + 30, y + 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRod(ctx: CanvasRenderingContext2D, w: number, h: number, s: { phase: Phase; lineShake: number; current: FishDef | null }) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  // Rod
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(w * 0.85, h * 0.1);
  ctx.quadraticCurveTo(w * 0.6, h * 0.2, w * 0.5, h * 0.35);
  ctx.stroke();
  // Line
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 1.2;
  const tipX = w * 0.5;
  const tipY = h * 0.35;
  const bobX = tipX + (s.current ? s.lineShake : 0);
  const bobY = h * 0.52;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(bobX, bobY);
  ctx.stroke();
  // Bobber
  ctx.fillStyle = "#E23D3D";
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bobX, bobY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(bobX, bobY, 3.5, Math.PI * 1.1, Math.PI * 1.9);
  ctx.fill();

  // Fish shadow (visible during bite)
  if (s.phase === "bite" && s.current) {
    ctx.fillStyle = s.current.color;
    ctx.globalAlpha = 0.55;
    const fx = bobX - 6;
    const fy = bobY + 12;
    ctx.beginPath();
    ctx.ellipse(fx, fy, s.current.len / 2, s.current.len / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx + s.current.len / 2, fy);
    ctx.lineTo(fx + s.current.len / 2 + 10, fy - 6);
    ctx.lineTo(fx + s.current.len / 2 + 10, fy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawSwimmers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  swimmers: Array<{ x: number; y: number; vx: number; size: number; color: string; wave: number }>,
) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  for (const f of swimmers) {
    const x = f.x * w;
    const y = f.y * h + Math.sin(f.wave) * 2;
    const dir = f.vx > 0 ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = f.color;
    ctx.strokeStyle = "rgba(27,26,23,0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, f.size, f.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-f.size, 0);
    ctx.lineTo(-f.size - 8, -5);
    ctx.lineTo(-f.size - 8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Eye
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#1B1A17";
    ctx.beginPath();
    ctx.arc(f.size * 0.55, -2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCaughtFish(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cf: (FishDef & { px: number; py: number; vy: number; rot: number }) | null,
) {
  if (!cf) return;
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  const x = cf.px * w;
  const y = cf.py * h;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(cf.rot);
  // Fish body
  ctx.fillStyle = cf.color;
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, cf.len / 1.8, cf.len / 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Tail
  ctx.beginPath();
  ctx.moveTo(-cf.len / 1.8, 0);
  ctx.lineTo(-cf.len / 1.2, -cf.len / 5);
  ctx.lineTo(-cf.len / 1.2, cf.len / 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Eye
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cf.len / 3, -cf.len / 14, cf.len / 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1B1A17";
  ctx.beginPath();
  ctx.arc(cf.len / 3, -cf.len / 14, cf.len / 26, 0, Math.PI * 2);
  ctx.fill();
  // Fin highlight
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, -cf.len / 10, cf.len / 3, cf.len / 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sparkle
  ctx.fillStyle = "#F4B533";
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 2;
  for (const offset of [-18, 14, -6]) {
    const px = x + offset;
    const py = y + offset / 2 - 28;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(cf.rot * 0.4);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 6 : 2.5;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawSplash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  splash: Array<{ x: number; y: number; vx: number; vy: number; life: number }>,
) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  for (const p of splash) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = "#A8D4EE";
    ctx.strokeStyle = "#1B1A17";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 5 * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBiteMark(ctx: CanvasRenderingContext2D, w: number, h: number, now: number, biteUntil: number) {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.save();
  ctx.scale(DPR, DPR);
  const x = w * 0.5;
  const y = h * 0.42;
  const pulse = 0.8 + Math.sin(now * 0.02) * 0.2;
  ctx.fillStyle = "#F4B533";
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 22 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1B1A17";
  ctx.font = "bold 28px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("！", x, y + 2);
  // ring
  const remain = Math.max(0, biteUntil - now) / 1000;
  ctx.strokeStyle = "#E23D3D";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 30 + (1 - remain) * 12, -Math.PI / 2, -Math.PI / 2 + remain * Math.PI * 2);
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

function playBiteSignal() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  [0, 0.08].forEach((delay) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, now + delay);
    g.gain.setValueAtTime(0.0001, now + delay);
    g.gain.exponentialRampToValueAtTime(0.15, now + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.12);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.14);
  });
}

function playCatch(points: number) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = points >= 20 ? [523, 659, 784, 1046] : points >= 8 ? [523, 659, 784] : points > 0 ? [523, 659] : [220];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.32);
  });
}

function playSplash(vol: number) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);
}

function playMiss() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.4);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.55);
}
