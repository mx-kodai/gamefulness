"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Phase = "idle" | "playing" | "done";
const TOTAL_CYCLES = 6;
const CYCLE_MS = 8000;
const PEAK_WINDOW_MS = 1400;

type RingFeedback = "perfect" | "good" | "miss" | null;

export default function TsukihiGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [feedback, setFeedback] = useState<RingFeedback>(null);
  const [isFs, setIsFs] = useState(false);
  const startTs = useRef(0);
  const raf = useRef<number | null>(null);
  const scoredCycles = useRef<Set<number>>(new Set());
  const latestPhase = useRef<Phase>("idle");
  const latestScore = useRef(0);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("tsukihi:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    latestPhase.current = phase;
  }, [phase]);

  useEffect(() => {
    latestScore.current = score;
  }, [score]);

  const finish = useCallback(
    (finalScore: number) => {
      setPhase("done");
      const nb = Math.max(best, finalScore);
      if (nb > best) {
        setBest(nb);
        try {
          localStorage.setItem("tsukihi:best", String(nb));
        } catch {}
      }
      const u = getCurrentUser();
      if (u && finalScore > 0) {
        addScore({
          id: uid("sc"),
          userId: u.id,
          gameSlug: "tsukihi",
          level: finalScore,
          score: finalScore * 10,
          playedAt: Date.now(),
        });
      }
    },
    [best],
  );

  const tick = useCallback(() => {
    if (latestPhase.current !== "playing") return;
    const t = performance.now() - startTs.current;
    const idx = Math.floor(t / CYCLE_MS);
    if (idx >= TOTAL_CYCLES) {
      finish(latestScore.current);
      return;
    }
    const within = (t % CYCLE_MS) / CYCLE_MS;
    setCycle(idx);
    setPhaseProgress(within);
    raf.current = requestAnimationFrame(tick);
  }, [finish]);

  const start = useCallback(() => {
    enterFs();
    scoredCycles.current = new Set();
    setScore(0);
    latestScore.current = 0;
    setCycle(0);
    setPhaseProgress(0);
    setFeedback(null);
    startTs.current = performance.now();
    setPhase("playing");
    latestPhase.current = "playing";
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const onTap = useCallback(() => {
    if (phase !== "playing") return;
    const t = performance.now() - startTs.current;
    const idx = Math.floor(t / CYCLE_MS);
    if (scoredCycles.current.has(idx)) return;
    const inCycleMs = t - idx * CYCLE_MS;
    const peakCenter = CYCLE_MS / 2;
    const diff = Math.abs(inCycleMs - peakCenter);
    if (diff <= PEAK_WINDOW_MS / 2) {
      scoredCycles.current.add(idx);
      const perfect = diff <= PEAK_WINDOW_MS / 4;
      setScore((s) => s + (perfect ? 2 : 1));
      setFeedback(perfect ? "perfect" : "good");
      playChime(perfect);
      setTimeout(() => setFeedback(null), 600);
    } else {
      setFeedback("miss");
      playMiss();
      setTimeout(() => setFeedback(null), 400);
    }
  }, [phase]);

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setPhase("idle");
    latestPhase.current = "idle";
    setScore(0);
    latestScore.current = 0;
    setCycle(0);
    setPhaseProgress(0);
    setFeedback(null);
  }, []);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // Phase progress: 0 = new moon (smallest), 0.5 = full moon (largest), 1.0 = new moon again
  const moonScale = 0.35 + Math.sin(phaseProgress * Math.PI) * 0.65;
  const moonGlow = Math.sin(phaseProgress * Math.PI);

  // Tap window: center at 0.5, width = PEAK_WINDOW_MS / CYCLE_MS
  const windowHalf = PEAK_WINDOW_MS / 2 / CYCLE_MS;
  const inWindow = Math.abs(phaseProgress - 0.5) <= windowHalf;

  const hint =
    phase !== "playing"
      ? ""
      : phaseProgress < 0.4
        ? "すーっと、吸って"
        : inWindow
          ? "いま！タップ！"
          : "ふーっと、吐いて";

  return (
    <FullscreenHost label="全画面で整える">
      <div
        className={`flex flex-col gap-4 ${
          isFs ? "mx-auto h-[100dvh] max-w-[1100px] justify-center overflow-hidden px-4 py-3" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 pr-28 ring-ink-sm md:px-5 md:py-4 md:pr-36">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="スコア" value={String(score)} />
            <Stat
              label="サイクル"
              value={`${Math.min(cycle + (phase === "playing" ? 1 : 0), TOTAL_CYCLES)} / ${TOTAL_CYCLES}`}
            />
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
          className={`relative overflow-hidden rounded-[28px] border-2 border-ink ring-ink-lg ${
            isFs ? "min-h-0 flex-1" : ""
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, #2b3b5e 0%, #1a2338 60%, #11172a 100%)",
          }}
        >
          <button
            type="button"
            onClick={onTap}
            disabled={phase !== "playing"}
            className="relative flex w-full items-center justify-center"
            style={{ aspectRatio: isFs ? undefined : "16 / 10", height: isFs ? "100%" : undefined }}
            aria-label="月をタップ"
          >
            <Stars />

            {/* Timing bar at bottom */}
            {phase === "playing" && (
              <div className="pointer-events-none absolute inset-x-8 bottom-6 md:inset-x-12">
                <div className="relative h-2 w-full rounded-full bg-bg/20">
                  <div
                    className="absolute top-1/2 h-6 -translate-y-1/2 rounded-full bg-yellow/30 ring-2 ring-yellow"
                    style={{
                      left: `${(0.5 - windowHalf) * 100}%`,
                      width: `${windowHalf * 2 * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg ring-2 ring-ink"
                    style={{ left: `${phaseProgress * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-bg/70">
                  <span>新月</span>
                  <span>満月</span>
                  <span>新月</span>
                </div>
              </div>
            )}

            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: "clamp(140px, 36vmin, 360px)",
                height: "clamp(140px, 36vmin, 360px)",
                transform: `scale(${moonScale})`,
                transition: "transform 120ms linear",
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 40% 35%, #fff6d8 0%, #f4e9b6 45%, #c9b97a 80%, #9c8d5b 100%)",
                  boxShadow: `0 0 ${40 + moonGlow * 120}px ${10 + moonGlow * 40}px rgba(255,235,180,${
                    0.12 + moonGlow * 0.35
                  })`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full mix-blend-multiply"
                style={{
                  background:
                    "radial-gradient(circle at 70% 75%, rgba(40,30,10,0.25) 0%, rgba(40,30,10,0) 55%)",
                }}
              />
              {inWindow && phase === "playing" && !feedback && (
                <div
                  className="pointer-events-none absolute -inset-8 rounded-full border-4"
                  style={{
                    borderColor: "#F4B533",
                    animation: "tsukipulse 0.7s ease-in-out infinite",
                  }}
                />
              )}
              {feedback === "perfect" && (
                <div
                  className="pointer-events-none absolute -inset-6 rounded-full border-4 border-yellow"
                  style={{ animation: "tsukiring 0.6s ease-out" }}
                />
              )}
              {feedback === "good" && (
                <div
                  className="pointer-events-none absolute -inset-6 rounded-full border-4 border-green"
                  style={{ animation: "tsukiring 0.6s ease-out" }}
                />
              )}
              {feedback === "miss" && (
                <div
                  className="pointer-events-none absolute -inset-6 rounded-full border-4 border-red/70"
                  style={{ animation: "tsukiring 0.4s ease-out" }}
                />
              )}
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-6 flex flex-col items-center gap-1 text-center">
              <div className="font-label text-[10px] font-semibold uppercase tracking-[0.3em] text-bg/70 md:text-[11px]">
                {phase === "playing" ? "月のリズム" : "BREATHE"}
              </div>
              <div
                className={`font-display text-[20px] font-black md:text-[28px] ${
                  inWindow && phase === "playing" ? "text-yellow" : "text-bg"
                }`}
              >
                {hint || "月のリズム"}
              </div>
            </div>

            {phase === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px]">
                <div className="max-w-sm rounded-2xl border-2 border-bg/40 bg-black/40 px-6 py-5 text-center">
                  <p className="font-display text-[18px] font-black text-bg md:text-[20px]">
                    月が一番ふくらんだ しゅんかん、
                  </p>
                  <p className="mt-1 font-display text-[18px] font-black text-yellow md:text-[20px]">
                    黄色い わくが 出たら タップ
                  </p>
                  <p className="mt-2 text-[12px] text-bg/80 md:text-[13px]">
                    ６サイクル。呼吸にあわせて、ゆっくり。
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    start();
                  }}
                  className="btn-lift rounded-full border-2 border-bg bg-blue px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:px-8 md:py-4 md:text-[20px]"
                >
                  はじめる
                </button>
              </div>
            )}

            {phase === "done" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px]">
                <p className="font-display text-[20px] font-bold text-bg md:text-[26px]">
                  {score}回、月と合いました
                </p>
                <p className="text-[13px] text-bg/80 md:text-[15px]">
                  {score >= 10 ? "最高のリズム" : score >= 6 ? "いいリズム" : "すこしずつ、で十分"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      start();
                    }}
                    className="btn-lift rounded-full border-2 border-bg bg-red px-6 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
                  >
                    もう一度
                  </button>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes tsukiring {
          0% { opacity: 0.95; transform: scale(0.85); }
          100% { opacity: 0; transform: scale(1.25); }
        }
        @keyframes tsukipulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
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

function Stars() {
  const stars = Array.from({ length: 40 }, (_, i) => {
    const r = (i * 9301 + 49297) % 233280;
    const x = (r / 233280) * 100;
    const y = ((i * 1664525 + 1013904223) % 100000) / 1000;
    const s = (i % 3) + 1;
    return { x, y, s };
  });
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-bg/80"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.s}px`,
            height: `${st.s}px`,
            opacity: 0.35 + (st.s - 1) * 0.2,
          }}
        />
      ))}
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

function playChime(perfect: boolean) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const base = perfect ? 880 : 660;
  [1, 2.01, 3.02].forEach((mul, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = base * mul;
    o.connect(g);
    g.connect(ctx.destination);
    const peak = i === 0 ? 0.14 : 0.05;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    o.start(now);
    o.stop(now + 1.9);
  });
}

function playMiss() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(300, now);
  o.frequency.exponentialRampToValueAtTime(150, now + 0.25);
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  o.start(now);
  o.stop(now + 0.32);
}
