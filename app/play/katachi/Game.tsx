"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Shape = "circle" | "triangle" | "square";
type Phase = "idle" | "playing" | "done";

const ORDER: Shape[] = ["circle", "triangle", "square"];
const WAYPOINT_TOTAL = 24;
const HIT_RADIUS = 48;
const NAME: Record<Shape, string> = {
  circle: "まる",
  triangle: "さんかく",
  square: "しかく",
};
const COLOR: Record<Shape, string> = {
  circle: "#E23D3D",
  triangle: "#F4B533",
  square: "#2F7FE0",
};

function makePath(shape: Shape, cx: number, cy: number, r: number): { x: number; y: number }[] {
  if (shape === "circle") {
    return Array.from({ length: WAYPOINT_TOTAL }, (_, i) => {
      const a = (i / WAYPOINT_TOTAL) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
  }
  if (shape === "triangle") {
    const verts = [
      { x: cx, y: cy - r },
      { x: cx + r * 0.866, y: cy + r * 0.5 },
      { x: cx - r * 0.866, y: cy + r * 0.5 },
    ];
    return segmented(verts, WAYPOINT_TOTAL, true);
  }
  const verts = [
    { x: cx - r, y: cy - r },
    { x: cx + r, y: cy - r },
    { x: cx + r, y: cy + r },
    { x: cx - r, y: cy + r },
  ];
  return segmented(verts, WAYPOINT_TOTAL, true);
}

function segmented(verts: { x: number; y: number }[], n: number, closed: boolean) {
  const pts: { x: number; y: number }[] = [];
  const loops = closed ? verts.length : verts.length - 1;
  const perSeg = Math.floor(n / loops);
  for (let i = 0; i < loops; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    for (let j = 0; j < perSeg; j++) {
      pts.push({
        x: a.x + (b.x - a.x) * (j / perSeg),
        y: a.y + (b.y - a.y) * (j / perSeg),
      });
    }
  }
  return pts;
}

export default function KatachiGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shapeIdx, setShapeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [best, setBest] = useState(0);
  const [clearedMs, setClearedMs] = useState<number[]>([]);
  const [isFs, setIsFs] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const waypoints = useRef<{ x: number; y: number }[]>([]);
  const reached = useRef<boolean[]>([]);
  const nextIdx = useRef(0);
  const drawing = useRef(false);
  const trail = useRef<{ x: number; y: number }[]>([]);
  const startTs = useRef(0);
  const shape = useRef<Shape>("circle");
  const size = useRef<{ w: number; h: number }>({ w: 800, h: 500 });

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("katachi:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const layoutShape = useCallback((s: Shape) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    size.current = { w: rect.width, h: rect.height };
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = Math.min(rect.width, rect.height) * 0.32;
    waypoints.current = makePath(s, cx, cy, r);
    reached.current = waypoints.current.map(() => false);
    nextIdx.current = 0;
    trail.current = [];
    shape.current = s;
    draw();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = size.current;
    ctx.clearRect(0, 0, w, h);

    // guide polygon
    if (waypoints.current.length) {
      ctx.lineWidth = 20;
      ctx.strokeStyle = "rgba(27,26,23,0.12)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      waypoints.current.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();

      // reached dots
      waypoints.current.forEach((p, i) => {
        const hit = reached.current[i];
        const isNext = i === nextIdx.current;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isNext ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = hit
          ? COLOR[shape.current]
          : isNext
            ? "#1B1A17"
            : "rgba(27,26,23,0.35)";
        ctx.fill();
      });
    }

    // trail
    if (trail.current.length > 1) {
      ctx.lineWidth = 8;
      ctx.strokeStyle = COLOR[shape.current];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      trail.current.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    layoutShape(ORDER[shapeIdx]);
    const onResize = () => layoutShape(ORDER[shapeIdx]);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase, shapeIdx, layoutShape]);

  const clientToCanvas = useCallback((cx: number, cy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: cx - rect.left, y: cy - rect.top };
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    if (phase !== "playing") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = clientToCanvas(e.clientX, e.clientY);
    drawing.current = true;
    trail.current = [p];
    draw();
  }, [phase, clientToCanvas, draw]);

  const advanceIfNear = useCallback((p: { x: number; y: number }) => {
    const idx = nextIdx.current;
    if (idx >= waypoints.current.length) return false;
    const target = waypoints.current[idx];
    const dx = p.x - target.x;
    const dy = p.y - target.y;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
      reached.current[idx] = true;
      nextIdx.current = idx + 1;
      setProgress(nextIdx.current / waypoints.current.length);
      playTick(nextIdx.current, waypoints.current.length);
      return true;
    }
    return false;
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drawing.current || phase !== "playing") return;
    const p = clientToCanvas(e.clientX, e.clientY);
    trail.current.push(p);
    if (trail.current.length > 200) trail.current.shift();
    let advanced = true;
    let guard = 0;
    while (advanced && guard < 4) {
      advanced = advanceIfNear(p);
      guard++;
    }
    draw();
    if (nextIdx.current >= waypoints.current.length) {
      completeShape();
    }
  }, [phase, clientToCanvas, advanceIfNear, draw]);

  const completeShape = useCallback(() => {
    drawing.current = false;
    const elapsed = performance.now() - startTs.current;
    playDing();
    setClearedMs((arr) => [...arr, elapsed]);
    setTimeout(() => {
      if (shapeIdx + 1 >= ORDER.length) {
        finishAll();
      } else {
        setShapeIdx((i) => i + 1);
        setProgress(0);
        startTs.current = performance.now();
      }
    }, 700);
  }, [shapeIdx]);

  const finishAll = useCallback(() => {
    const total = clearedMs.length > 0 ? clearedMs.reduce((s, v) => s + v, 0) + (performance.now() - startTs.current) : 0;
    const pts = Math.max(10, Math.round(18000 / (total || 18000) * 300));
    setPhase("done");
    const nb = Math.max(best, pts);
    if (nb > best) {
      setBest(nb);
      try {
        localStorage.setItem("katachi:best", String(nb));
      } catch {}
    }
    const u = getCurrentUser();
    if (u && pts > 0) {
      addScore({
        id: uid("sc"),
        userId: u.id,
        gameSlug: "katachi",
        level: ORDER.length,
        score: pts,
        playedAt: Date.now(),
      });
    }
  }, [best, clearedMs]);

  const onUp = useCallback(() => {
    if (phase !== "playing") return;
    drawing.current = false;
    trail.current = [];
    draw();
  }, [phase, draw]);

  const start = useCallback(() => {
    enterFs();
    setShapeIdx(0);
    setProgress(0);
    setClearedMs([]);
    setPhase("playing");
    startTs.current = performance.now();
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setShapeIdx(0);
    setProgress(0);
    setClearedMs([]);
    trail.current = [];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const score =
    phase === "done"
      ? Math.max(0, 300 - Math.round((clearedMs.reduce((s, v) => s + v, 0)) / 100))
      : 0;

  const currentName = NAME[ORDER[shapeIdx] ?? "circle"];

  return (
    <FullscreenHost label="全画面でなぞる">
      <div
        className={`flex flex-col gap-4 ${
          isFs ? "mx-auto h-[100dvh] max-w-[1100px] justify-center overflow-hidden px-4 py-3" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 pr-28 ring-ink-sm md:px-5 md:py-4 md:pr-36">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="いま" value={phase === "playing" ? currentName : phase === "done" ? "クリア" : "はじめよう"} />
            <Stat label="進み" value={`${Math.round(progress * 100)}%`} />
            <Stat label="かたち" value={`${Math.min(shapeIdx + (phase === "playing" ? 1 : 0), ORDER.length)} / ${ORDER.length}`} />
            <Stat label="さいこう" value={String(best)} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={start}
              disabled={phase === "playing"}
              className="btn-lift rounded-full border-2 border-ink bg-ink px-4 py-2 font-display text-[13px] font-black text-bg ring-ink-sm disabled:opacity-40 md:px-5 md:py-2.5 md:text-[14px]"
            >
              {phase === "idle" ? "スタート" : "もう一度"}
            </button>
            <button
              onClick={reset}
              className="btn-lift rounded-full border-2 border-ink bg-bg px-4 py-2 font-display text-[13px] font-black ring-ink-sm md:px-5 md:py-2.5 md:text-[14px]"
            >
              リセット
            </button>
          </div>
        </div>

        <div
          ref={wrapRef}
          className={`relative overflow-hidden rounded-[28px] border-2 border-ink bg-bg ring-ink-lg ${
            isFs ? "min-h-0 flex-1" : "aspect-[4/3] max-h-[620px]"
          }`}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full touch-none select-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
          {phase === "playing" && (
            <div className="pointer-events-none absolute inset-x-0 top-4 text-center">
              <div className="font-display text-[22px] font-black md:text-[28px]">
                {currentName}
              </div>
              <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
                指でなぞってください
              </div>
            </div>
          )}
          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-ink/70 backdrop-blur-[2px]">
              <p className="max-w-xs text-center font-display text-[18px] font-bold leading-snug md:text-[20px]">
                まる、さんかく、しかく。<br />ひと筆で、ゆっくりなぞる。
              </p>
              <button
                onClick={start}
                className="btn-lift rounded-full border-2 border-ink bg-red px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:px-8 md:py-4 md:text-[20px]"
              >
                はじめる
              </button>
            </div>
          )}
          {phase === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-ink/85 backdrop-blur-[2px]">
              <p className="font-display text-[22px] font-bold md:text-[28px]">
                3つのかたち、なぞれました
              </p>
              <p className="text-[13px] text-ink-soft md:text-[15px]">
                スコア: {score}
              </p>
              <div className="flex gap-2">
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

let _audio: AudioContext | null = null;
function getAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_audio) return _audio;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  _audio = new AC();
  return _audio;
}

function playTick(i: number, total: number) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = 520 + (i / total) * 480;
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  o.start(now);
  o.stop(now + 0.25);
}

function playDing() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  [880, 1320, 1760].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(g);
    g.connect(ctx.destination);
    const peak = i === 0 ? 0.14 : 0.05;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    o.start(now);
    o.stop(now + 1);
  });
}
