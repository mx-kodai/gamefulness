"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Color = "red" | "yellow" | "blue" | "green";

const COLORS: Color[] = ["red", "yellow", "blue", "green"];
const COLOR_HEX: Record<Color, string> = {
  red: "#E23D3D",
  yellow: "#F4B533",
  blue: "#2F7FE0",
  green: "#2FA66E",
};

const JAPANESE: Record<Color, string> = {
  red: "あか",
  yellow: "きいろ",
  blue: "あお",
  green: "みどり",
};

type Phase = "idle" | "showing" | "waiting" | "success" | "fail";

export default function ManekkoGame() {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [input, setInput] = useState<Color[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [highlight, setHighlight] = useState<Color | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("manekko:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  const level = sequence.length;

  const playSound = useCallback((color: Color | "success" | "fail") => {
    if (typeof window === "undefined") return;
    const ctx = audioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq =
      color === "red" ? 330 :
      color === "yellow" ? 392 :
      color === "blue" ? 494 :
      color === "green" ? 587 :
      color === "success" ? 784 : 180;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = color === "fail" ? "sawtooth" : "sine";
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.4);
  }, []);

  const showSequence = useCallback(
    async (seq: Color[]) => {
      setPhase("showing");
      const delay = Math.max(260, 620 - seq.length * 25);
      await sleep(500);
      for (const c of seq) {
        setHighlight(c);
        playSound(c);
        await sleep(delay);
        setHighlight(null);
        await sleep(150);
      }
      setPhase("waiting");
    },
    [playSound],
  );

  const start = useCallback(() => {
    enterFs();
    const first = [randomColor()];
    setSequence(first);
    setInput([]);
    showSequence(first);
  }, [showSequence]);

  const onTap = useCallback(
    (c: Color) => {
      if (phase !== "waiting") return;
      setHighlight(c);
      playSound(c);
      setTimeout(() => setHighlight(null), 220);
      const nextInput = [...input, c];
      const idx = nextInput.length - 1;
      if (nextInput[idx] !== sequence[idx]) {
        setPhase("fail");
        playSound("fail");
        const finalLevel = sequence.length - 1;
        const newBest = Math.max(best, finalLevel);
        if (newBest > best) {
          setBest(newBest);
          localStorage.setItem("manekko:best", String(newBest));
        }
        const u = getCurrentUser();
        if (u && finalLevel > 0) {
          addScore({
            id: uid("sc"),
            userId: u.id,
            gameSlug: "manekko",
            level: finalLevel,
            score: finalLevel * 10,
            playedAt: Date.now(),
          });
        }
        return;
      }
      if (nextInput.length === sequence.length) {
        setPhase("success");
        setInput([]);
        playSound("success");
        setTimeout(() => {
          const nextSeq = [...sequence, randomColor()];
          setSequence(nextSeq);
          showSequence(nextSeq);
        }, 900);
      } else {
        setInput(nextInput);
      }
    },
    [phase, input, sequence, showSequence, playSound, best],
  );

  const reset = useCallback(() => {
    setSequence([]);
    setInput([]);
    setPhase("idle");
    setHighlight(null);
  }, []);

  const progress = input.length;
  const totalInStage = sequence.length;

  return (
    <FullscreenHost label="全画面で覚える">
    <div className="flex flex-col gap-5 md:gap-6">
      <Hud
        level={level}
        phase={phase}
        best={best}
        onStart={start}
        onReset={reset}
      />
      {phase === "waiting" && totalInStage > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <span className="font-label text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft md:text-[12px]">
            あと
          </span>
          <span className="font-display text-[24px] font-black md:text-[32px]">
            {totalInStage - progress}
          </span>
          <span className="text-[13px] text-ink-soft md:text-[14px]">個　思い出そう</span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalInStage }).map((_, i) => (
              <span
                key={i}
                className={`inline-block h-3 w-3 rounded-full border-2 border-ink md:h-4 md:w-4 ${
                  i < progress ? "bg-green" : "bg-bg"
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {phase === "showing" && highlight && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <span className="font-label text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft md:text-[12px]">
            いま光ってる
          </span>
          <span
            className="inline-block h-8 w-8 rounded-full border-2 border-ink ring-ink md:h-10 md:w-10"
            style={{ background: COLOR_HEX[highlight] }}
          />
          <span className="font-display text-[22px] font-black md:text-[28px]">
            {JAPANESE[highlight]}
          </span>
        </div>
      )}
      <div className="relative overflow-hidden rounded-[28px] border-2 border-ink bg-bg-ink ring-ink-lg">
        <div className="relative aspect-[4/3] w-full max-h-[580px]">
          <Canvas
            camera={{ position: [0, 3.4, 4.8], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#EDE4CF"]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 6, 3]} intensity={0.9} castShadow />
            <directionalLight position={[-3, 2, -2]} intensity={0.35} />
            <Pad color="red" position={[-1.1, 0, -1.1]} highlight={highlight === "red"} onTap={() => onTap("red")} />
            <Pad color="yellow" position={[1.1, 0, -1.1]} highlight={highlight === "yellow"} onTap={() => onTap("yellow")} />
            <Pad color="blue" position={[-1.1, 0, 1.1]} highlight={highlight === "blue"} onTap={() => onTap("blue")} />
            <Pad color="green" position={[1.1, 0, 1.1]} highlight={highlight === "green"} onTap={() => onTap("green")} />
            <CenterRing phase={phase} />
          </Canvas>
          {phase === "idle" && <StartOverlay onStart={start} />}
          {phase === "fail" && <FailOverlay level={sequence.length - 1} onRetry={start} onReset={reset} />}
        </div>
      </div>
    </div>
    </FullscreenHost>
  );
}

function Hud({
  level,
  phase,
  best,
  onStart,
  onReset,
}: {
  level: number;
  phase: Phase;
  best: number;
  onStart: () => void;
  onReset: () => void;
}) {
  const label =
    phase === "idle" ? "はじめよう" :
    phase === "showing" ? "よく見てね" :
    phase === "waiting" ? "あなたのばん" :
    phase === "success" ? "せいかい！" : "ざんねん";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
      <div className="flex items-center gap-5 md:gap-7">
        <Stat label="ステージ" value={String(level || "-")} />
        <Stat label="さいこう" value={String(best)} />
        <Stat label="いま" value={label} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onStart}
          disabled={phase === "showing"}
          className="btn-lift rounded-full border-2 border-ink bg-ink px-4 py-2 font-display text-[13px] font-black text-bg ring-ink-sm disabled:opacity-40 md:px-5 md:py-2.5 md:text-[14px]"
        >
          {level === 0 ? "スタート" : "やりなおす"}
        </button>
        <button
          onClick={onReset}
          className="btn-lift rounded-full border-2 border-ink bg-bg px-4 py-2 font-display text-[13px] font-black ring-ink-sm md:px-5 md:py-2.5 md:text-[14px]"
        >
          リセット
        </button>
      </div>
    </div>
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

function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-ink/70 backdrop-blur-[2px]">
      <p className="max-w-xs text-center font-display text-[18px] font-bold leading-snug md:text-[20px]">
        4色が光ります。<br />同じ順にタップしてください。
      </p>
      <button
        onClick={onStart}
        className="btn-lift rounded-full border-2 border-ink bg-green px-7 py-3 font-display text-[18px] font-black text-bg ring-ink md:px-8 md:py-4 md:text-[20px]"
      >
        はじめる
      </button>
    </div>
  );
}

function FailOverlay({
  level,
  onRetry,
  onReset,
}: {
  level: number;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-ink/85 backdrop-blur-[2px]">
      <p className="font-display text-[18px] font-bold md:text-[22px]">
        ステージ {level} まで！
      </p>
      <p className="text-[14px] text-ink-soft md:text-[15px]">もう一回やってみよう</p>
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="btn-lift rounded-full border-2 border-ink bg-red px-6 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
        >
          もう一度
        </button>
        <button
          onClick={onReset}
          className="btn-lift rounded-full border-2 border-ink bg-bg px-6 py-3 font-display text-[16px] font-black ring-ink md:text-[18px]"
        >
          やめる
        </button>
      </div>
    </div>
  );
}


function Pad({
  color,
  position,
  highlight,
  onTap,
}: {
  color: Color;
  position: [number, number, number];
  highlight: boolean;
  onTap: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const target = highlight ? 1 : 0;

  useFrame((_, dt) => {
    if (!ref.current || !matRef.current) return;
    const cur = ref.current.position.y;
    const desiredY = highlight ? 0.22 : 0;
    ref.current.position.y = THREE.MathUtils.damp(cur, desiredY, 12, dt);
    const em = matRef.current.emissiveIntensity;
    matRef.current.emissiveIntensity = THREE.MathUtils.damp(em, target * 1.4, 10, dt);
  });

  return (
    <group ref={ref} position={position}>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          onTap();
        }}
      >
        <boxGeometry args={[1.7, 0.4, 1.7]} />
        <meshStandardMaterial
          ref={matRef}
          color={COLOR_HEX[color]}
          emissive={COLOR_HEX[color]}
          emissiveIntensity={0}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.72, 0.02, 1.72]} />
        <meshStandardMaterial color="#1B1A17" />
      </mesh>
    </group>
  );
}

function CenterRing({ phase }: { phase: Phase }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (phase === "showing" ? 1.2 : 0.25);
    const s = phase === "success" ? 1.15 : 1;
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, s, 8, dt));
  });
  return (
    <group position={[0, 0.45, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[0.42, 0.06, 24, 48]} />
        <meshStandardMaterial color="#1B1A17" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 40]} />
        <meshStandardMaterial color="#F6F1E4" />
      </mesh>
    </group>
  );
}

let _ctx: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

function randomColor(): Color {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
