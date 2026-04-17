"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Color = "red" | "yellow" | "blue" | "green";
type Word = { kana: string; color: Color };
type Phase = "idle" | "playing" | "done";

const HEX: Record<Color, string> = {
  red: "#E23D3D",
  yellow: "#F4B533",
  blue: "#2F7FE0",
  green: "#2FA66E",
};

const WORDS: Word[] = [
  { kana: "あか", color: "red" },
  { kana: "あお", color: "blue" },
  { kana: "あめ", color: "blue" },
  { kana: "あじさい", color: "blue" },
  { kana: "あり", color: "red" },
  { kana: "いちご", color: "red" },
  { kana: "いけ", color: "blue" },
  { kana: "いか", color: "blue" },
  { kana: "いぬ", color: "yellow" },
  { kana: "うみ", color: "blue" },
  { kana: "うし", color: "yellow" },
  { kana: "えだまめ", color: "green" },
  { kana: "えび", color: "red" },
  { kana: "おちば", color: "red" },
  { kana: "おに", color: "red" },
  { kana: "かに", color: "red" },
  { kana: "かえる", color: "green" },
  { kana: "かぼちゃ", color: "yellow" },
  { kana: "かわ", color: "blue" },
  { kana: "かめ", color: "green" },
  { kana: "きいろ", color: "yellow" },
  { kana: "きく", color: "yellow" },
  { kana: "きゃべつ", color: "green" },
  { kana: "くさ", color: "green" },
  { kana: "くり", color: "yellow" },
  { kana: "くま", color: "red" },
  { kana: "こい", color: "red" },
  { kana: "こけ", color: "green" },
  { kana: "ことり", color: "yellow" },
  { kana: "さくら", color: "red" },
  { kana: "さかな", color: "blue" },
  { kana: "さる", color: "red" },
  { kana: "しお", color: "blue" },
  { kana: "すいか", color: "green" },
  { kana: "すずめ", color: "yellow" },
  { kana: "せみ", color: "green" },
  { kana: "そら", color: "blue" },
  { kana: "たけ", color: "green" },
  { kana: "たこ", color: "red" },
  { kana: "たまご", color: "yellow" },
  { kana: "ちず", color: "yellow" },
  { kana: "つき", color: "yellow" },
  { kana: "つる", color: "red" },
  { kana: "とまと", color: "red" },
  { kana: "とり", color: "yellow" },
  { kana: "なす", color: "blue" },
  { kana: "にく", color: "red" },
  { kana: "にじ", color: "yellow" },
  { kana: "にわとり", color: "red" },
  { kana: "ぬま", color: "green" },
  { kana: "ねぎ", color: "green" },
  { kana: "ねこ", color: "yellow" },
  { kana: "のはら", color: "green" },
  { kana: "はな", color: "red" },
  { kana: "はっぱ", color: "green" },
  { kana: "はと", color: "yellow" },
  { kana: "ひよこ", color: "yellow" },
  { kana: "ひまわり", color: "yellow" },
  { kana: "ふうせん", color: "red" },
  { kana: "ふね", color: "yellow" },
  { kana: "ほし", color: "yellow" },
  { kana: "ほたる", color: "green" },
  { kana: "まつ", color: "green" },
  { kana: "みかん", color: "yellow" },
  { kana: "みず", color: "blue" },
  { kana: "みどり", color: "green" },
  { kana: "もも", color: "red" },
  { kana: "やま", color: "green" },
  { kana: "やね", color: "red" },
  { kana: "ゆり", color: "red" },
  { kana: "ゆき", color: "blue" },
  { kana: "よぞら", color: "blue" },
  { kana: "りんご", color: "red" },
  { kana: "れもん", color: "yellow" },
  { kana: "ろうそく", color: "yellow" },
  { kana: "わかめ", color: "green" },
];

const DAKU: Record<string, string> = {
  が: "か", ぎ: "き", ぐ: "く", げ: "け", ご: "こ",
  ざ: "さ", じ: "し", ず: "す", ぜ: "せ", ぞ: "そ",
  だ: "た", ぢ: "ち", づ: "つ", で: "て", ど: "と",
  ば: "は", び: "ひ", ぶ: "ふ", べ: "へ", ぼ: "ほ",
  ぱ: "は", ぴ: "ひ", ぷ: "ふ", ぺ: "へ", ぽ: "ほ",
};
const SMALL: Record<string, string> = {
  ゃ: "や", ゅ: "ゆ", ょ: "よ", っ: "つ", ぁ: "あ", ぃ: "い", ぅ: "う", ぇ: "え", ぉ: "お",
};

function lastKana(w: string): string {
  if (!w) return "";
  let c = w[w.length - 1];
  if (c === "ん") return "ん";
  if (c === "ー" && w.length > 1) c = w[w.length - 2];
  if (SMALL[c]) c = SMALL[c];
  if (DAKU[c]) c = DAKU[c];
  return c;
}

function firstKana(w: string): string {
  if (!w) return "";
  let c = w[0];
  if (DAKU[c]) c = DAKU[c];
  if (SMALL[c]) c = SMALL[c];
  return c;
}

function pickChoices(head: string, used: Set<string>, desired: number): Word[] {
  const pool = WORDS.filter((w) => !used.has(w.kana) && firstKana(w.kana) === head);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, desired);
}

const TOTAL_TIME_MS = 90000;

export default function IroshiriGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [history, setHistory] = useState<Word[]>([]);
  const [choices, setChoices] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_MS);
  const [isFs, setIsFs] = useState(false);
  const used = useRef<Set<string>>(new Set());
  const startTs = useRef(0);
  const raf = useRef<number | null>(null);
  const finalScoreRef = useRef(0);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("iroshiri:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const finish = useCallback(
    (finalScore: number) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      setPhase("done");
      const nb = Math.max(best, finalScore);
      if (nb > best) {
        setBest(nb);
        try {
          localStorage.setItem("iroshiri:best", String(nb));
        } catch {}
      }
      const u = getCurrentUser();
      if (u && finalScore > 0) {
        addScore({
          id: uid("sc"),
          userId: u.id,
          gameSlug: "iroshiri",
          level: Math.max(1, Math.round(finalScore / 50)),
          score: finalScore,
          playedAt: Date.now(),
        });
      }
    },
    [best],
  );

  const tick = useCallback(() => {
    const left = Math.max(0, TOTAL_TIME_MS - (performance.now() - startTs.current));
    setTimeLeft(left);
    if (left <= 0) {
      finish(finalScoreRef.current);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [finish]);

  const start = useCallback(() => {
    enterFs();
    const first = WORDS[Math.floor(Math.random() * WORDS.length)];
    used.current = new Set([first.kana]);
    setHistory([first]);
    setScore(0);
    finalScoreRef.current = 0;
    setTimeLeft(TOTAL_TIME_MS);
    const lk = lastKana(first.kana);
    setChoices(lk === "ん" ? [] : pickChoices(lk, used.current, 4));
    startTs.current = performance.now();
    setPhase("playing");
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const pick = useCallback(
    (w: Word) => {
      if (phase !== "playing") return;
      used.current.add(w.kana);
      const nextScore = score + 10;
      setScore(nextScore);
      finalScoreRef.current = nextScore;
      setHistory((h) => [...h, w].slice(-6));
      playBlip(w.color);
      const lk = lastKana(w.kana);
      if (lk === "ん") {
        finish(nextScore);
        return;
      }
      const nx = pickChoices(lk, used.current, 4);
      if (nx.length === 0) {
        finish(nextScore);
        return;
      }
      setChoices(nx);
    },
    [phase, score, finish],
  );

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setPhase("idle");
    setHistory([]);
    setChoices([]);
    setScore(0);
    finalScoreRef.current = 0;
    setTimeLeft(TOTAL_TIME_MS);
    used.current = new Set();
  }, []);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const timePct = timeLeft / TOTAL_TIME_MS;
  const current = history[history.length - 1] ?? null;
  const head = current ? lastKana(current.kana) : "";
  const chain = history.length;
  const bgColor = current ? HEX[current.color] : "#EDE4CF";

  return (
    <FullscreenHost label="全画面でつなぐ">
      <div
        className={`flex flex-col gap-4 ${
          isFs ? "mx-auto h-[100dvh] max-w-[1100px] justify-center overflow-hidden px-4 py-3" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 pr-28 ring-ink-sm md:px-5 md:py-4 md:pr-36">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="スコア" value={String(score)} />
            <Stat label="れんさ" value={`${chain}`} />
            <Stat label="のこり" value={`${Math.ceil(timeLeft / 1000)}s`} />
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
          className={`relative overflow-hidden rounded-[28px] border-2 border-ink ring-ink-lg transition-colors duration-500 ${
            isFs ? "min-h-0 flex-1" : ""
          }`}
          style={{ background: bgColor }}
        >
          <div className="h-2 w-full border-b-2 border-ink bg-bg/70">
            <div
              className="h-full bg-ink transition-[width] duration-100"
              style={{ width: `${timePct * 100}%` }}
            />
          </div>

          <div className={`flex flex-col gap-4 p-4 md:gap-5 md:p-6 ${isFs ? "h-full" : ""}`}>
            {/* Word chain history */}
            {history.length > 0 && phase !== "idle" && (
              <div className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 px-2">
                {history.slice(-5).map((w, i, arr) => (
                  <div key={`${w.kana}-${i}`} className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full border-2 border-ink px-3 py-1 font-display text-[13px] font-black ring-ink-sm md:text-[15px] ${
                        i === arr.length - 1 ? "bg-bg" : "bg-bg/70"
                      }`}
                    >
                      {w.kana}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="font-display text-[16px] font-black text-bg">→</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Current prompt — show required starting kana BIG */}
            {phase === "playing" && head && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="font-label text-[10px] font-semibold uppercase tracking-[0.3em] text-bg md:text-[11px]">
                  つぎは この もじから
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="rounded-2xl border-[3px] border-ink bg-bg px-8 py-3 ring-ink">
                    <div className="font-display text-[56px] font-black leading-none text-ink md:text-[72px]">
                      {head}
                    </div>
                  </div>
                  <div className="font-display text-[40px] font-black text-bg md:text-[52px]">→</div>
                  <div className="rounded-2xl border-2 border-bg bg-transparent px-5 py-3">
                    <div className="font-display text-[28px] font-black leading-none text-bg md:text-[36px]">
                      ？
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Choices */}
            {phase === "playing" && choices.length > 0 && (
              <div className="mx-auto grid w-full max-w-[640px] grid-cols-2 gap-3 md:gap-4">
                {choices.map((c) => (
                  <button
                    key={c.kana}
                    onClick={() => pick(c)}
                    className="btn-lift rounded-2xl border-2 border-ink bg-bg px-4 py-4 font-display text-[20px] font-black ring-ink-sm transition-transform md:py-5 md:text-[26px]"
                  >
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded-full border-2 border-ink align-middle"
                      style={{ background: HEX[c.color] }}
                    />
                    {c.kana}
                  </button>
                ))}
              </div>
            )}

            {phase === "idle" && (
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border-2 border-ink bg-bg/95 px-6 py-6 ring-ink">
                <p className="text-center font-display text-[16px] font-bold leading-snug md:text-[18px]">
                  ことばの 最後の もじで、<br />
                  つぎの ことばを えらぶ しりとり。<br />
                  画面が その ことばの いろに そまります。
                </p>
                <button
                  onClick={start}
                  className="btn-lift rounded-full border-2 border-ink bg-yellow px-7 py-3 font-display text-[18px] font-black ring-ink md:px-8 md:py-4 md:text-[20px]"
                >
                  はじめる
                </button>
              </div>
            )}

            {phase === "done" && (
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border-2 border-ink bg-bg/95 px-6 py-6 ring-ink">
                <p className="font-display text-[22px] font-black md:text-[26px]">{chain}れんさ！</p>
                <p className="text-[13px] text-ink-soft md:text-[15px]">
                  スコア：{score}{" "}
                  {chain >= 8 ? "すばらしい連鎖！" : chain >= 4 ? "いい調子" : "またあそぼう"}
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

function playBlip(color: Color) {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const freq = color === "red" ? 523 : color === "yellow" ? 659 : color === "blue" ? 784 : 880;
  [1, 2.01].forEach((mul, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq * mul;
    o.connect(g);
    g.connect(ctx.destination);
    const peak = i === 0 ? 0.14 : 0.05;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    o.start(now);
    o.stop(now + 0.75);
  });
}
