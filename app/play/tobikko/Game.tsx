"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Phase = "idle" | "playing" | "over";

const GROUND_Y = 0.82;
const GRAVITY = 2600;
const JUMP_V = -980;
const START_SPEED = 260;
const MAX_SPEED = 560;
const SPEED_ACCEL = 14;

type Obstacle = { x: number; kind: "low" | "tall" | "pair" };
type Cloud = { x: number; y: number; s: number };

export default function TobikkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const stateRef = useRef({
    phase: "idle" as Phase,
    time: 0,
    distance: 0,
    speed: START_SPEED,
    playerY: GROUND_Y,
    playerVY: 0,
    jumps: 0,
    obs: [] as Obstacle[],
    clouds: [
      { x: 0.15, y: 0.22, s: 1 },
      { x: 0.55, y: 0.14, s: 1.3 },
      { x: 0.82, y: 0.28, s: 0.85 },
    ] as Cloud[],
    lastSpawn: 0,
    spawnIn: 1.2,
    groundPhase: 0,
  });

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("tobikko:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "playing") return;
    if (s.playerY >= GROUND_Y - 0.002) {
      s.playerVY = JUMP_V;
      s.jumps += 1;
      playJump();
    } else if (s.jumps < 2) {
      // double jump
      s.playerVY = JUMP_V * 0.85;
      s.jumps += 1;
      playJump();
    }
  }, []);

  const start = useCallback(() => {
    enterFs();
    const s = stateRef.current;
    s.phase = "playing";
    s.time = 0;
    s.distance = 0;
    s.speed = START_SPEED;
    s.playerY = GROUND_Y;
    s.playerVY = 0;
    s.jumps = 0;
    s.obs = [];
    s.lastSpawn = 0;
    s.spawnIn = 1.1;
    s.groundPhase = 0;
    setPhase("playing");
    setScore(0);
  }, []);

  const over = useCallback((finalScore: number) => {
    const s = stateRef.current;
    s.phase = "over";
    setPhase("over");
    setBest((old) => {
      const nb = Math.max(old, finalScore);
      try {
        localStorage.setItem("tobikko:best", String(nb));
      } catch {}
      return nb;
    });
    const u = getCurrentUser();
    if (u && finalScore > 0) {
      addScore({
        id: uid("sc"),
        userId: u.id,
        gameSlug: "tobikko",
        level: Math.floor(finalScore / 100),
        score: finalScore,
        playedAt: Date.now(),
      });
    }
    playCrash();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    const DPR = Math.max(1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * DPR);
      canvas.height = Math.floor(rect.height * DPR);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;

      if (s.phase === "playing") {
        s.time += dt;
        s.speed = Math.min(MAX_SPEED, s.speed + SPEED_ACCEL * dt);
        s.distance += s.speed * dt;
        s.playerVY += GRAVITY * dt;
        s.playerY += (s.playerVY / h) * dt;
        if (s.playerY >= GROUND_Y) {
          s.playerY = GROUND_Y;
          s.playerVY = 0;
          s.jumps = 0;
        }
        s.groundPhase = (s.groundPhase + (s.speed / w) * dt) % 1;

        s.lastSpawn += dt;
        if (s.lastSpawn >= s.spawnIn) {
          s.lastSpawn = 0;
          const r = Math.random();
          const kind: Obstacle["kind"] = r < 0.55 ? "low" : r < 0.85 ? "tall" : "pair";
          s.obs.push({ x: 1.12, kind });
          const progress = Math.min(1, s.time / 40);
          s.spawnIn = 0.85 + Math.random() * (0.9 - 0.55 * progress);
        }

        for (const o of s.obs) {
          o.x -= (s.speed / w) * dt;
        }
        s.obs = s.obs.filter((o) => o.x > -0.1);

        // Collisions
        for (const o of s.obs) {
          const hit = collide(o, s.playerY, w, h);
          if (hit) {
            over(Math.floor(s.distance));
            break;
          }
        }

        // Clouds
        for (const c of s.clouds) {
          c.x -= (s.speed / w) * 0.15 * dt;
          if (c.x < -0.1) c.x = 1.1;
        }
      }

      // Draw
      drawScene(ctx, w, h, s);

      if (s.phase === "playing") {
        setScore(Math.floor(s.distance));
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (stateRef.current.phase === "idle" || stateRef.current.phase === "over") {
          start();
        } else {
          jump();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [jump, start, over]);

  const onCanvasClick = () => {
    if (stateRef.current.phase === "idle" || stateRef.current.phase === "over") {
      start();
    } else {
      jump();
    }
  };

  return (
    <FullscreenHost label="全画面で走る">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="スコア" value={String(score)} />
            <Stat label="さいこう" value={String(best)} />
            <Stat
              label="いま"
              value={phase === "idle" ? "はじめよう" : phase === "over" ? "おつかれさま" : "タップ！"}
            />
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
          <canvas
            ref={canvasRef}
            onPointerDown={onCanvasClick}
            className="block aspect-[16/9] w-full cursor-pointer touch-none select-none md:max-h-[640px]"
          />
          {phase === "idle" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-ink/40 backdrop-blur-[1px]">
              <p className="pointer-events-auto rounded-3xl border-2 border-ink bg-bg/90 px-8 py-6 font-display text-[18px] font-bold md:text-[22px]">
                画面 または スペースキー で ジャンプ
              </p>
              <button
                onClick={start}
                className="btn-lift pointer-events-auto rounded-full border-2 border-ink bg-red px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:text-[20px]"
              >
                スタート
              </button>
            </div>
          )}
          {phase === "over" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-ink/60 backdrop-blur-[1px]">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-3xl border-2 border-ink bg-bg/90 px-8 py-6">
                <p className="font-display text-[22px] font-bold md:text-[28px]">
                  {score} m まで！
                </p>
                <p className="text-[13px] text-ink-soft md:text-[15px]">もう一度走る？</p>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-red px-6 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
                >
                  もう一度
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[13px] text-ink-soft md:text-[14px]">
          タップ / スペースキーでジャンプ。空中でもう一度押せば、ふたつめのジャンプ。
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

function collide(o: Obstacle, playerY: number, w: number, h: number): boolean {
  const playerX = 0.15;
  const px = playerX * w;
  const py = playerY * h;
  const pw = 46;
  const ph = 56;
  const pLeft = px - pw / 2;
  const pRight = px + pw / 2;
  const pTop = py - ph;
  const pBottom = py;

  const boxes = obstacleBoxes(o, w, h);
  for (const b of boxes) {
    if (pRight < b.left || pLeft > b.right) continue;
    if (pBottom < b.top || pTop > b.bottom) continue;
    return true;
  }
  return false;
}

function obstacleBoxes(o: Obstacle, w: number, h: number): { left: number; right: number; top: number; bottom: number }[] {
  const gy = GROUND_Y * h;
  const x = o.x * w;
  if (o.kind === "low") {
    const w0 = 36;
    const h0 = 42;
    return [{ left: x - w0 / 2, right: x + w0 / 2, top: gy - h0, bottom: gy }];
  }
  if (o.kind === "tall") {
    const w0 = 42;
    const h0 = 78;
    return [{ left: x - w0 / 2, right: x + w0 / 2, top: gy - h0, bottom: gy }];
  }
  // pair
  const w0 = 30;
  const h0 = 50;
  return [
    { left: x - 60 - w0 / 2, right: x - 60 + w0 / 2, top: gy - h0, bottom: gy },
    { left: x + 20 - w0 / 2, right: x + 20 + w0 / 2, top: gy - h0, bottom: gy },
  ];
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, s: {
  phase: Phase;
  playerY: number;
  playerVY: number;
  time: number;
  distance: number;
  speed: number;
  obs: Obstacle[];
  clouds: Cloud[];
  groundPhase: number;
}) {
  ctx.save();
  ctx.scale(Math.max(1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)), Math.max(1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)));

  // Sky gradient based on distance
  const cyc = (s.distance / 3500) % 1;
  const sky = skyAt(cyc);
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, sky.top);
  grd.addColorStop(0.6, sky.mid);
  grd.addColorStop(1, sky.bot);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Distant hills
  ctx.fillStyle = sky.hill;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.74);
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * w;
    const y = h * 0.68 + Math.sin(i * 1.3 + s.distance * 0.003) * 18;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Clouds
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (const c of s.clouds) {
    drawCloud(ctx, c.x * w, c.y * h, 38 * c.s);
  }

  // Ground band
  const gy = GROUND_Y * h;
  ctx.fillStyle = "#E9DFC2";
  ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = "#1B1A17";
  ctx.fillRect(0, gy, w, 3);

  // Ground dashes
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 2;
  const dashStep = 36;
  const offset = -((s.groundPhase * dashStep) % dashStep);
  for (let x = offset; x < w + dashStep; x += dashStep) {
    ctx.beginPath();
    ctx.moveTo(x, gy + 14);
    ctx.lineTo(x + 14, gy + 14);
    ctx.stroke();
  }

  // Obstacles
  for (const o of s.obs) {
    drawObstacle(ctx, o, w, h);
  }

  // Player
  drawPlayer(ctx, 0.15 * w, s.playerY * h, s.time, s.playerY >= GROUND_Y - 0.002);

  ctx.restore();
}

function skyAt(t: number): { top: string; mid: string; bot: string; hill: string } {
  const palettes = [
    { top: "#A7DBF5", mid: "#DCEEF9", bot: "#F6F1E4", hill: "#8BB07D" }, // 昼
    { top: "#F6A86D", mid: "#F9D3A2", bot: "#FFE7CF", hill: "#C37452" }, // 夕
    { top: "#27305A", mid: "#47528A", bot: "#7782AD", hill: "#2F3758" }, // 夜
  ];
  const n = palettes.length;
  const idx = Math.floor(t * n) % n;
  const nxt = (idx + 1) % n;
  const local = t * n - Math.floor(t * n);
  return {
    top: mix(palettes[idx].top, palettes[nxt].top, local),
    mid: mix(palettes[idx].mid, palettes[nxt].mid, local),
    bot: mix(palettes[idx].bot, palettes[nxt].bot, local),
    hill: mix(palettes[idx].hill, palettes[nxt].hill, local),
  };
}

function mix(a: string, b: string, t: number): string {
  const ca = hex(a);
  const cb = hex(b);
  return `rgb(${Math.round(ca.r + (cb.r - ca.r) * t)},${Math.round(ca.g + (cb.g - ca.g) * t)},${Math.round(ca.b + (cb.b - ca.b) * t)})`;
}

function hex(h: string) {
  const s = h.replace("#", "");
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.8, cy + 4, r * 0.75, 0, Math.PI * 2);
  ctx.arc(cx - r * 0.8, cy + 6, r * 0.7, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.25, cy - r * 0.5, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(27,26,23,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, w: number, h: number) {
  const gy = GROUND_Y * h;
  const x = o.x * w;
  ctx.fillStyle = "#2F3028";
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3;
  if (o.kind === "low") {
    rockShape(ctx, x, gy, 36, 42);
  } else if (o.kind === "tall") {
    rockShape(ctx, x, gy, 42, 78);
  } else {
    rockShape(ctx, x - 60, gy, 30, 50);
    rockShape(ctx, x + 20, gy, 30, 50);
  }
}

function rockShape(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(baseX - w / 2, baseY);
  ctx.lineTo(baseX - w / 2 + 4, baseY - h * 0.55);
  ctx.lineTo(baseX - w / 4, baseY - h);
  ctx.lineTo(baseX + w / 4, baseY - h + 6);
  ctx.lineTo(baseX + w / 2 - 2, baseY - h * 0.5);
  ctx.lineTo(baseX + w / 2, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.moveTo(baseX - w / 2 + 6, baseY - h * 0.5);
  ctx.lineTo(baseX - w / 4 + 2, baseY - h + 4);
  ctx.lineTo(baseX - w / 4 + 8, baseY - h + 10);
  ctx.lineTo(baseX - w / 2 + 10, baseY - h * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2F3028";
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, grounded: boolean) {
  const bob = grounded ? Math.sin(t * 22) * 3 : 0;
  ctx.save();
  ctx.translate(x, y + bob);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = "#F4B533";
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -24, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Legs (animated)
  const legPhase = grounded ? Math.sin(t * 18) : 0.3;
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(-8 + legPhase * 6, 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(8 - legPhase * 6, 2);
  ctx.stroke();
  // Eye
  ctx.fillStyle = "#1B1A17";
  ctx.beginPath();
  ctx.arc(8, -30, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(10, -22, 4, 0, Math.PI);
  ctx.stroke();
  // Cheek
  ctx.fillStyle = "#E23D3D";
  ctx.beginPath();
  ctx.arc(12, -18, 3, 0, Math.PI * 2);
  ctx.fill();
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

function playJump() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(820, now + 0.12);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playCrash() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.65);
}
