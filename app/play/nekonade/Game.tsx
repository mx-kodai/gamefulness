"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Phase = "idle" | "playing" | "done";
const TIME_LIMIT_MS = 60000;
const GOAL = 100;

export default function NekonadeGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [gauge, setGauge] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [mood, setMood] = useState<"calm" | "happy" | "startled">("calm");
  const [eyesClosed, setEyesClosed] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const startTs = useRef(0);
  const raf = useRef<number | null>(null);
  const lastPoint = useRef<{ x: number; y: number; t: number } | null>(null);
  const purrStop = useRef<(() => void) | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("nekonade:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const finish = useCallback(
    (finalGauge: number) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      if (purrStop.current) {
        purrStop.current();
        purrStop.current = null;
      }
      setPhase("done");
      const pts = Math.round(finalGauge * 5);
      const nb = Math.max(best, pts);
      if (nb > best) {
        setBest(nb);
        try {
          localStorage.setItem("nekonade:best", String(nb));
        } catch {}
      }
      const u = getCurrentUser();
      if (u && pts > 0) {
        addScore({
          id: uid("sc"),
          userId: u.id,
          gameSlug: "nekonade",
          level: Math.max(1, Math.round(finalGauge / 20)),
          score: pts,
          playedAt: Date.now(),
        });
      }
    },
    [best],
  );

  const tick = useCallback(() => {
    const left = Math.max(0, TIME_LIMIT_MS - (performance.now() - startTs.current));
    setTimeLeft(left);
    if (left <= 0) {
      finish(gauge);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [finish, gauge]);

  const start = useCallback(() => {
    enterFs();
    setGauge(0);
    setMood("calm");
    setEyesClosed(false);
    setTimeLeft(TIME_LIMIT_MS);
    startTs.current = performance.now();
    lastPoint.current = null;
    setPhase("playing");
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    if (purrStop.current) {
      purrStop.current();
      purrStop.current = null;
    }
    setPhase("idle");
    setGauge(0);
    setMood("calm");
    setEyesClosed(false);
    setTimeLeft(TIME_LIMIT_MS);
    lastPoint.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (purrStop.current) purrStop.current();
      if (moodTimer.current) clearTimeout(moodTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "playing" && gauge >= 30 && !purrStop.current) {
      purrStop.current = startPurr();
    }
    if ((phase !== "playing" || gauge < 15) && purrStop.current) {
      purrStop.current();
      purrStop.current = null;
    }
  }, [phase, gauge]);

  const flashStartled = useCallback(() => {
    setMood("startled");
    setEyesClosed(false);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("calm"), 700);
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "playing") return;
      if (e.pressure === 0 && e.pointerType === "mouse" && e.buttons === 0) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      const prev = lastPoint.current;
      lastPoint.current = { x, y, t: now };
      if (!prev) return;
      const dt = Math.max(1, now - prev.t);
      const dx = x - prev.x;
      const dy = y - prev.y;
      const dist = Math.hypot(dx, dy);
      const speed = dist / dt; // px per ms
      if (speed > 1.4) {
        flashStartled();
        setGauge((g) => Math.max(0, g - 6));
        setEyesClosed(false);
        playMeow();
        return;
      }
      if (speed < 0.03) return;
      const inSweetSpot = speed >= 0.12 && speed <= 0.8;
      const gain = inSweetSpot ? dist * 0.08 : dist * 0.03;
      setGauge((g) => {
        const next = Math.min(GOAL, g + gain);
        if (next >= GOAL && g < GOAL) {
          playHappy();
          setTimeout(() => finish(next), 500);
        }
        return next;
      });
      setMood("happy");
      setEyesClosed(true);
    },
    [phase, finish, flashStartled],
  );

  const onDown = useCallback((e: React.PointerEvent) => {
    if (phase !== "playing") return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    lastPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: performance.now(),
    };
  }, [phase]);

  const onUp = useCallback(() => {
    lastPoint.current = null;
    setEyesClosed(false);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("calm"), 400);
  }, []);

  const gaugePct = gauge / GOAL;

  return (
    <FullscreenHost label="全画面でなでる">
      <div
        className={`flex flex-col gap-4 ${
          isFs ? "mx-auto h-[100dvh] max-w-[1100px] justify-center overflow-hidden px-4 py-3" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 pr-28 ring-ink-sm md:px-5 md:py-4 md:pr-36">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="ごろごろ" value={`${Math.round(gaugePct * 100)}%`} />
            <Stat label="のこり" value={`${Math.ceil(timeLeft / 1000)}s`} />
            <Stat label="さいこう" value={String(best)} />
            <Stat
              label="きもち"
              value={mood === "happy" ? "うっとり" : mood === "startled" ? "びっくり" : "しずか"}
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
            <button
              onClick={reset}
              className="btn-lift rounded-full border-2 border-ink bg-bg px-4 py-2 font-display text-[13px] font-black ring-ink-sm md:px-5 md:py-2.5 md:text-[14px]"
            >
              リセット
            </button>
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-[28px] border-2 border-ink bg-bg-ink ring-ink-lg ${
            isFs ? "min-h-0 flex-1" : ""
          }`}
        >
          <div className="h-2 w-full border-b-2 border-ink bg-bg">
            <div
              className="h-full bg-green transition-[width] duration-150"
              style={{ width: `${gaugePct * 100}%` }}
            />
          </div>
          <div
            className="relative flex w-full touch-none select-none items-center justify-center"
            style={{ aspectRatio: isFs ? undefined : "4 / 3", height: isFs ? "calc(100% - 10px)" : undefined }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <Cat mood={mood} eyesClosed={eyesClosed} gauge={gaugePct} />
            {phase === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-ink/70 backdrop-blur-[2px]">
                <p className="max-w-xs text-center font-display text-[18px] font-bold leading-snug md:text-[20px]">
                  ねこを ゆっくり なでよう。<br />
                  つよすぎると びっくりするよ。
                </p>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-green px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:px-8 md:py-4 md:text-[20px]"
                >
                  はじめる
                </button>
              </div>
            )}
            {phase === "done" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-ink/85 backdrop-blur-[2px]">
                <p className="font-display text-[22px] font-bold md:text-[28px]">
                  {gauge >= GOAL ? "ごろごろ、ごろごろ。" : "また 明日 なでよう"}
                </p>
                <p className="text-[13px] text-ink-soft md:text-[15px]">
                  ごろごろ：{Math.round(gauge)}% ／ スコア：{Math.round(gauge * 5)}
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

function Cat({
  mood,
  eyesClosed,
  gauge,
}: {
  mood: "calm" | "happy" | "startled";
  eyesClosed: boolean;
  gauge: number;
}) {
  const bodyColor = "#F4E4C9";
  const outline = "#1B1A17";
  const pink = "#E89BA6";
  const tilt = mood === "startled" ? -6 : mood === "happy" ? 2 : 0;
  const eyeCurve = eyesClosed
    ? "M 40 0 Q 0 -14 -40 0"
    : mood === "startled"
      ? ""
      : "";
  return (
    <svg
      viewBox="-260 -220 520 440"
      className="pointer-events-none h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="purr" cx="0" cy="120" r="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2FA66E" stopOpacity={gauge * 0.35} />
          <stop offset="100%" stopColor="#2FA66E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-260" y="-220" width="520" height="440" fill="url(#purr)" />
      <g transform={`translate(0,40) rotate(${tilt})`}>
        <ellipse cx="0" cy="90" rx="180" ry="70" fill={bodyColor} stroke={outline} strokeWidth="6" />
        <path d="M 140 80 Q 240 60 210 -20 Q 180 -40 150 20 Z" fill={bodyColor} stroke={outline} strokeWidth="6" strokeLinejoin="round" />
        <ellipse cx="0" cy="-30" rx="130" ry="110" fill={bodyColor} stroke={outline} strokeWidth="6" />
        <path d="M -110 -90 L -140 -170 L -60 -120 Z" fill={bodyColor} stroke={outline} strokeWidth="6" strokeLinejoin="round" />
        <path d="M 110 -90 L 140 -170 L 60 -120 Z" fill={bodyColor} stroke={outline} strokeWidth="6" strokeLinejoin="round" />
        <path d="M -100 -95 L -120 -145 L -80 -115 Z" fill={pink} />
        <path d="M 100 -95 L 120 -145 L 80 -115 Z" fill={pink} />
        {eyesClosed ? (
          <>
            <path d="M -70 -40 Q -40 -55 -10 -40" stroke={outline} strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M 10 -40 Q 40 -55 70 -40" stroke={outline} strokeWidth="8" strokeLinecap="round" fill="none" />
          </>
        ) : mood === "startled" ? (
          <>
            <circle cx="-40" cy="-40" r="16" fill={outline} />
            <circle cx="40" cy="-40" r="16" fill={outline} />
            <circle cx="-36" cy="-44" r="5" fill="#ffffff" />
            <circle cx="44" cy="-44" r="5" fill="#ffffff" />
          </>
        ) : (
          <>
            <ellipse cx="-40" cy="-40" rx="12" ry="16" fill={outline} />
            <ellipse cx="40" cy="-40" rx="12" ry="16" fill={outline} />
            <circle cx="-36" cy="-44" r="4" fill="#ffffff" />
            <circle cx="44" cy="-44" r="4" fill="#ffffff" />
          </>
        )}
        <path d="M -10 0 Q 0 10 10 0" stroke={outline} strokeWidth="5" strokeLinecap="round" fill={pink} />
        <path d="M 0 0 Q -8 18 -18 18" stroke={outline} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 0 0 Q 8 18 18 18" stroke={outline} strokeWidth="5" strokeLinecap="round" fill="none" />
        <g stroke={outline} strokeWidth="3" strokeLinecap="round">
          <line x1="-60" y1="-10" x2="-130" y2="-20" />
          <line x1="-60" y1="0" x2="-135" y2="0" />
          <line x1="-60" y1="10" x2="-130" y2="20" />
          <line x1="60" y1="-10" x2="130" y2="-20" />
          <line x1="60" y1="0" x2="135" y2="0" />
          <line x1="60" y1="10" x2="130" y2="20" />
        </g>
      </g>
      {mood === "happy" && gauge > 0.2 && (
        <g opacity={Math.min(1, gauge * 1.5)}>
          <text x="-140" y="-80" fontSize="34" fill={outline} fontFamily="sans-serif">
            ♪
          </text>
          <text x="130" y="-120" fontSize="28" fill={outline} fontFamily="sans-serif">
            ♪
          </text>
        </g>
      )}
    </svg>
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

function startPurr(): () => void {
  const ctx = getAudio();
  if (!ctx) return () => {};
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 38;
  lfo.type = "sine";
  lfo.frequency.value = 18;
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain);
  lfoGain.connect(g.gain);
  osc.connect(g);
  g.connect(ctx.destination);
  g.gain.value = 0.08;
  osc.start();
  lfo.start();
  return () => {
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc.stop(now + 0.5);
    lfo.stop(now + 0.5);
  };
}

function playMeow() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(520, now);
  o.frequency.exponentialRampToValueAtTime(340, now + 0.35);
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  o.start(now);
  o.stop(now + 0.45);
}

function playHappy() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, now + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.14, now + i * 0.1 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.8);
    o.start(now + i * 0.1);
    o.stop(now + i * 0.1 + 0.85);
  });
}
