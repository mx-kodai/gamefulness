"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullscreenHost, { enterFs } from "@/components/FullscreenHost";
import { addScore, getCurrentUser, uid } from "@/lib/store";

type Choice = { label: string; good: boolean };
type Request = {
  quote: string;
  topic: string;
  choices: Choice[];
};

const REQUESTS: Request[] = [
  {
    topic: "地域密着",
    quote: "もっと地域に愛される店にしたいんだよね。",
    choices: [
      { label: "笑顔であいさつを徹底する", good: true },
      { label: "店内BGMをジャズに変える", good: false },
      { label: "値下げキャンペーン", good: false },
      { label: "看板を金色にする", good: false },
    ],
  },
  {
    topic: "服の扱い",
    quote: "お客さまの服は、ひとつひとつ、もっと大切に。",
    choices: [
      { label: "一点一点、手で確認する", good: true },
      { label: "機械に全部まかせる", good: false },
      { label: "とにかく速さ重視", good: false },
      { label: "まとめてどんっ", good: false },
    ],
  },
  {
    topic: "若い客層",
    quote: "若い人にも、もっと来てほしいんだよ。",
    choices: [
      { label: "店内を明るく、写真映えに", good: true },
      { label: "高級路線にふる", good: false },
      { label: "シニア割引を拡大", good: false },
      { label: "営業時間を短くする", good: false },
    ],
  },
  {
    topic: "スタッフ",
    quote: "新入社員がちょっと元気なくて…",
    choices: [
      { label: "毎朝、みんなで声出し挨拶", good: true },
      { label: "朝礼なし、無言開店", good: false },
      { label: "残業を増やす", good: false },
      { label: "個室で反省会", good: false },
    ],
  },
  {
    topic: "業界リード",
    quote: "業界をリードする会社にしたい。",
    choices: [
      { label: "エコ洗剤を全店で導入する", good: true },
      { label: "値段を一気に倍にする", good: false },
      { label: "CMを大量に流す", good: false },
      { label: "業界団体を辞める", good: false },
    ],
  },
  {
    topic: "イベント",
    quote: "地域のお祭りに、うちも出たいな。",
    choices: [
      { label: "夏祭りに出張受付ブース", good: true },
      { label: "店内で一人花見", good: false },
      { label: "オンラインで配信のみ", good: false },
      { label: "のぼりだけ立てる", good: false },
    ],
  },
  {
    topic: "お客さま感動",
    quote: "お客さまを、もっと喜ばせたい。",
    choices: [
      { label: "季節の手書きメッセージを添える", good: true },
      { label: "割引チラシを同封", good: false },
      { label: "ポイントを10倍にする", good: false },
      { label: "無言で渡す", good: false },
    ],
  },
  {
    topic: "店舗体験",
    quote: "お店に来るだけで、ちょっと元気になるようにしたい。",
    choices: [
      { label: "入り口にお花と笑顔", good: true },
      { label: "モニターで広告を流す", good: false },
      { label: "ガラス張りをやめる", good: false },
      { label: "静かにBGM消す", good: false },
    ],
  },
  {
    topic: "人材育成",
    quote: "スタッフにも成長してほしいんだよね。",
    choices: [
      { label: "月1で学びの時間をつくる", good: true },
      { label: "新人は裏方だけ", good: false },
      { label: "評価は売上だけで決める", good: false },
      { label: "研修は省略", good: false },
    ],
  },
  {
    topic: "未来構想",
    quote: "10年後、どんな会社でありたい？",
    choices: [
      { label: "地域のインフラに、なくてはならない存在", good: true },
      { label: "上場してFIRE", good: false },
      { label: "全部AIにまかせる", good: false },
      { label: "事業を縮小する", good: false },
    ],
  },
];

type Phase = "idle" | "playing" | "feedback" | "done";
const TOTAL = 10;
const PER_Q_MS = 6000;

export default function ShachoGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const [lastPicked, setLastPicked] = useState<number | null>(null);
  const [msLeft, setMsLeft] = useState(PER_Q_MS);
  const order = useRef<number[]>([]);
  const startTs = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("shacho:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  const q = useMemo(() => {
    if (phase !== "playing" && phase !== "feedback") return null;
    const idx = order.current[qIdx];
    return REQUESTS[idx];
  }, [qIdx, phase]);

  const nextQ = useCallback(() => {
    if (qIdx + 1 >= TOTAL) {
      setPhase("done");
      return;
    }
    setQIdx((i) => i + 1);
    setMsLeft(PER_Q_MS);
    setFeedback(null);
    setLastPicked(null);
    startTs.current = performance.now();
    setPhase("playing");
  }, [qIdx]);

  const tick = useCallback(() => {
    const dt = performance.now() - startTs.current;
    const left = Math.max(0, PER_Q_MS - dt);
    setMsLeft(left);
    if (left <= 0) {
      setFeedback("bad");
      setPhase("feedback");
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      raf.current = requestAnimationFrame(tick);
      return () => {
        if (raf.current) cancelAnimationFrame(raf.current);
      };
    }
    return undefined;
  }, [phase, tick]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(() => {
      if (qIdx + 1 >= TOTAL) {
        finalize();
      } else {
        nextQ();
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [phase, qIdx, nextQ]);

  const start = useCallback(() => {
    enterFs();
    const a = Array.from({ length: REQUESTS.length }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    order.current = a.slice(0, TOTAL);
    setQIdx(0);
    setScore(0);
    setMsLeft(PER_Q_MS);
    setFeedback(null);
    setLastPicked(null);
    startTs.current = performance.now();
    setPhase("playing");
  }, []);

  const pick = useCallback(
    (i: number) => {
      if (phase !== "playing" || !q) return;
      const left = Math.max(0, PER_Q_MS - (performance.now() - startTs.current));
      const isGood = q.choices[i].good;
      setLastPicked(i);
      if (isGood) {
        const base = 100;
        const speedBonus = Math.round(left / PER_Q_MS * 100);
        setScore((s) => s + base + speedBonus);
        setFeedback("good");
        playDing();
      } else {
        setFeedback("bad");
        playBuzz();
      }
      setPhase("feedback");
    },
    [phase, q],
  );

  const finalize = useCallback(() => {
    const u = getCurrentUser();
    if (u && score > 0) {
      addScore({
        id: uid("sc"),
        userId: u.id,
        gameSlug: "shacho",
        level: Math.round(score / 100),
        score,
        playedAt: Date.now(),
      });
    }
    const nb = Math.max(best, score);
    if (nb > best) {
      setBest(nb);
      try {
        localStorage.setItem("shacho:best", String(nb));
      } catch {}
    }
    setPhase("done");
  }, [best, score]);

  const reset = useCallback(() => {
    setPhase("idle");
    setQIdx(0);
    setScore(0);
    setFeedback(null);
    setLastPicked(null);
    setMsLeft(PER_Q_MS);
  }, []);

  const progress = phase === "playing" || phase === "feedback" ? (qIdx + 1) / TOTAL : 0;
  const timerPct = msLeft / PER_Q_MS;

  return (
    <FullscreenHost label="全画面で応える">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
          <div className="flex items-center gap-5 md:gap-7">
            <Stat label="スコア" value={String(score)} />
            <Stat label="問題" value={`${Math.min(qIdx + 1, TOTAL)} / ${TOTAL}`} />
            <Stat label="さいこう" value={String(best)} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={start}
              disabled={phase === "playing" || phase === "feedback"}
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

        <div className="relative overflow-hidden rounded-[28px] border-2 border-ink bg-bg-ink ring-ink-lg">
          <div className="h-2 w-full border-b-2 border-ink bg-bg">
            <div
              className="h-full bg-red transition-[width] duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-[260px_1fr] md:gap-7 md:p-7">
            <div className="relative mx-auto w-full max-w-[320px] md:mx-0 md:max-w-none">
              <div
                className={`relative overflow-hidden rounded-[22px] border-2 border-ink bg-bg ring-ink transition-transform ${
                  feedback === "good" ? "rotate-1" : feedback === "bad" ? "-rotate-1" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/shacho.png"
                  alt="ヤングドライ社長"
                  className="block aspect-[3/4] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-bg/95 px-3 py-2 text-center">
                  <div className="font-label text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    YOUNG DRY
                  </div>
                  <div className="font-display text-[14px] font-black">社長</div>
                </div>
              </div>
              {phase === "playing" && (
                <div className="absolute -right-2 -top-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-yellow font-display text-[15px] font-black ring-ink">
                  {Math.ceil(msLeft / 1000)}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <SpeechBubble>
                {phase === "idle" ? (
                  <>
                    <div className="font-display text-[18px] font-black leading-snug md:text-[22px]">
                      ちょっと聞いてくれる？
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
                      会社をもっと良くするアイデアがいろいろあって。ひとつずつ相談するから、
                      いちばんしっくりくる一手を教えてほしいんだ。
                    </p>
                  </>
                ) : phase === "done" ? (
                  <>
                    <div className="font-display text-[18px] font-black leading-snug md:text-[22px]">
                      {score >= 800 ? "最高だよ、ありがとう！" : score >= 500 ? "いい線だね、助かった。" : "…うーん、また明日、頼むよ。"}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
                      スコア：{score}点
                    </p>
                  </>
                ) : q ? (
                  <>
                    <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
                      {q.topic}について
                    </div>
                    <div className="mt-1 font-display text-[18px] font-black leading-snug md:text-[22px]">
                      {q.quote}
                    </div>
                  </>
                ) : null}
              </SpeechBubble>

              {phase === "idle" && (
                <button
                  onClick={start}
                  className="btn-lift self-start rounded-full border-2 border-ink bg-red px-7 py-3 font-display text-[17px] font-black text-bg ring-ink md:text-[20px]"
                >
                  はじめる →
                </button>
              )}

              {(phase === "playing" || phase === "feedback") && q && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {q.choices.map((c, i) => {
                    const picked = lastPicked === i;
                    const show = phase === "feedback";
                    const bgClass = show
                      ? c.good
                        ? "bg-green text-bg"
                        : picked
                          ? "bg-red text-bg"
                          : "bg-bg"
                      : "bg-bg hover:bg-bg-ink";
                    return (
                      <button
                        key={i}
                        disabled={phase !== "playing"}
                        onClick={() => pick(i)}
                        className={`btn-lift rounded-2xl border-2 border-ink px-4 py-3 text-left font-display text-[14px] font-bold leading-snug ring-ink-sm transition-colors md:text-[15px] ${bgClass}`}
                      >
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-bg text-[11px] font-black">
                          {"ABCD"[i]}
                        </span>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {phase === "done" && (
                <div className="flex gap-2">
                  <button
                    onClick={start}
                    className="btn-lift rounded-full border-2 border-ink bg-red px-6 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
                  >
                    もう一度
                  </button>
                  <button
                    onClick={reset}
                    className="btn-lift rounded-full border-2 border-ink bg-bg px-6 py-3 font-display text-[16px] font-black ring-ink-sm md:text-[18px]"
                  >
                    閉じる
                  </button>
                </div>
              )}
            </div>
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

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[20px] border-2 border-ink bg-bg px-5 py-4 ring-ink-sm">
      <span
        aria-hidden
        className="absolute -left-3 top-6 h-5 w-5 rotate-45 border-b-2 border-l-2 border-ink bg-bg md:top-8"
      />
      {children}
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

function playDing() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  [880, 1320].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(g);
    g.connect(ctx.destination);
    const peak = i === 0 ? 0.14 : 0.06;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    o.start(now);
    o.stop(now + 0.75);
  });
}

function playBuzz() {
  const ctx = getAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 180;
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  o.start(now);
  o.stop(now + 0.4);
}
