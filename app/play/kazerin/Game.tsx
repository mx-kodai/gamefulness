"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Bell = "red" | "yellow" | "blue" | "green";
const BELLS: Bell[] = ["red", "yellow", "blue", "green"];
const HEX: Record<Bell, string> = {
  red: "#E23D3D",
  yellow: "#F4B533",
  blue: "#2F7FE0",
  green: "#2FA66E",
};
const JP: Record<Bell, string> = {
  red: "あか", yellow: "きいろ", blue: "あお", green: "みどり",
};

type Phase = "idle" | "playing" | "done";

export default function KazerinGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [target, setTarget] = useState<Bell | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [miss, setMiss] = useState(0);
  const [flash, setFlash] = useState<Bell | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [targetCount, setTargetCount] = useState(0);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("kazerin:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const pickNext = useCallback(() => {
    const pick = BELLS[Math.floor(Math.random() * BELLS.length)];
    setTarget(pick);
    setTargetCount((c) => c + 1);
  }, []);

  const start = useCallback(() => {
    enterFs();
    setPhase("playing");
    setScore(0);
    setMiss(0);
    setTargetCount(0);
    pickNext();
  }, [pickNext]);

  const finish = useCallback((finalScore: number) => {
    setPhase("done");
    setTarget(null);
    const nb = Math.max(best, finalScore);
    if (nb > best) {
      setBest(nb);
      try {
        localStorage.setItem("kazerin:best", String(nb));
      } catch {}
    }
    const u = getCurrentUser();
    if (u && finalScore > 0) {
      addScore({
        id: uid("sc"),
        userId: u.id,
        gameSlug: "kazerin",
        level: finalScore,
        score: finalScore * 10,
        playedAt: Date.now(),
      });
    }
  }, [best]);

  const onTap = useCallback(
    (b: Bell) => {
      if (phase !== "playing" || !target) return;
      setFlash(b);
      playBellSound(b);
      setTimeout(() => setFlash((f) => (f === b ? null : f)), 240);
      if (b === target) {
        const ns = score + 1;
        setScore(ns);
        if (ns >= 12) {
          finish(ns);
          return;
        }
        setTarget(null);
        timerRef.current = setTimeout(pickNext, 500);
      } else {
        const nm = miss + 1;
        setMiss(nm);
        if (nm >= 3) {
          finish(score);
          return;
        }
      }
    },
    [phase, target, score, miss, pickNext, finish],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setTarget(null);
    setScore(0);
    setMiss(0);
    setTargetCount(0);
  }, []);

  return (
    <FullscreenHost label="全画面で鳴らす">
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
        <div className="flex items-center gap-5 md:gap-7">
          <Stat label="スコア" value={String(score)} />
          <Stat label="ミス" value={`${miss} / 3`} />
          <Stat label="さいこう" value={String(best)} />
          <Stat
            label="いま"
            value={
              phase === "idle" ? "はじめよう" : phase === "done" ? "おつかれさま" : "タップ！"
            }
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

      {phase === "playing" && target && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <span className="font-label text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft md:text-[12px]">
            つぎ
          </span>
          <span
            className="inline-block h-8 w-8 rounded-full border-2 border-ink ring-ink md:h-10 md:w-10"
            style={{ background: HEX[target] }}
          />
          <span className="font-display text-[22px] font-black md:text-[28px]">
            {JP[target]}
          </span>
          <span className="text-[13px] text-ink-soft md:text-[14px]">をタップ</span>
        </div>
      )}

      <div className="relative overflow-hidden rounded-[28px] border-2 border-ink bg-bg-ink ring-ink-lg">
        <div className="relative aspect-[4/3] w-full max-h-[580px]">
          <Canvas camera={{ position: [0, 2.5, 5.5], fov: 42 }} dpr={[1, 2]}>
            <color attach="background" args={["#EDE4CF"]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 6, 3]} intensity={0.9} />
            <directionalLight position={[-3, 2, -2]} intensity={0.35} />
            {BELLS.map((b, i) => (
              <FurinBell
                key={b}
                bell={b}
                idx={i}
                highlight={target === b || flash === b}
                onTap={() => onTap(b)}
              />
            ))}
          </Canvas>

          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-ink/70 backdrop-blur-[2px]">
              <p className="max-w-xs text-center font-display text-[18px] font-bold leading-snug md:text-[20px]">
                光った風鈴を、<br />タップしてください。
              </p>
              <button
                onClick={start}
                className="btn-lift rounded-full border-2 border-ink bg-blue px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:px-8 md:py-4 md:text-[20px]"
              >
                はじめる
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-ink/85 backdrop-blur-[2px]">
              <p className="font-display text-[20px] font-bold md:text-[26px]">
                {score}個の風鈴を鳴らしました
              </p>
              <p className="text-[13px] text-ink-soft md:text-[15px]">
                {score >= 12 ? "お見事！" : "ゆっくりで大丈夫"}
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

function FurinBell({
  bell,
  idx,
  highlight,
  onTap,
}: {
  bell: Bell;
  idx: number;
  highlight: boolean;
  onTap: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const tongue = useRef<THREE.Mesh>(null);
  const targetY = highlight ? 0.08 : 0;
  const targetE = highlight ? 1.6 : 0;
  const x = (idx - 1.5) * 1.5;

  useFrame((state, dt) => {
    if (!group.current || !mat.current) return;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 8, dt);
    mat.current.emissiveIntensity = THREE.MathUtils.damp(
      mat.current.emissiveIntensity,
      targetE,
      10,
      dt,
    );
    const sway = highlight ? Math.sin(state.clock.elapsedTime * 5) * 0.25 : Math.sin(state.clock.elapsedTime * 1.5 + idx) * 0.08;
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, sway, 4, dt);
    if (tongue.current) {
      tongue.current.rotation.z = sway * 1.5;
    }
  });

  return (
    <group ref={group} position={[x, 1.2, 0]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial color="#1B1A17" />
      </mesh>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          onTap();
        }}
      >
        <sphereGeometry args={[0.52, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          ref={mat}
          color={HEX[bell]}
          emissive={HEX[bell]}
          emissiveIntensity={0}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.1, 0]} scale={[1.03, 0.08, 1.03]}>
        <torusGeometry args={[0.52, 0.05, 8, 24]} />
        <meshStandardMaterial color="#1B1A17" />
      </mesh>
      <mesh ref={tongue} position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1B1A17" />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.01]} />
        <meshStandardMaterial color={HEX[bell]} />
      </mesh>
    </group>
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

function playBellSound(b: Bell) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const base =
    b === "red" ? 523 : b === "yellow" ? 659 : b === "blue" ? 784 : 988;
  // 2倍音のベル風合成
  [1, 2.01].forEach((mul, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = base * mul;
    osc.connect(g);
    g.connect(ctx.destination);
    const peak = i === 0 ? 0.16 : 0.06;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    osc.start(now);
    osc.stop(now + 1.5);
  });
}
