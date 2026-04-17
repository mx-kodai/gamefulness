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
    topic: "水の安心",
    quote: "うちのRO水、もっと安心して飲んでほしいんだよね。",
    choices: [
      { label: "水質検査の結果をWebで毎月公開する", good: true },
      { label: "おしゃれなボトルに入れ替える", good: false },
      { label: "CMを一気に増やす", good: false },
      { label: "販売店を限定して希少感を出す", good: false },
    ],
  },
  {
    topic: "お届けの現場",
    quote: "高齢のお客さまへの配達、もっと喜ばれるには？",
    choices: [
      { label: "重いボトルを玄関の中まで運び、ひと言添える", good: true },
      { label: "配送スピードを何より優先する", good: false },
      { label: "注文はアプリからだけにする", good: false },
      { label: "月に1回まとめて大量納品にする", good: false },
    ],
  },
  {
    topic: "環境",
    quote: "ペットボトルのゴミ、気になるんだよ。",
    choices: [
      { label: "リターナブルボトルで回収・再利用する", good: true },
      { label: "ラベルだけ小さくして節約感を出す", good: false },
      { label: "輸入ブランド水に切り替える", good: false },
      { label: "サイズを大きくしてゴミを目立たなくする", good: false },
    ],
  },
  {
    topic: "子育て家庭",
    quote: "子育て世帯にも、うちの水を届けたい。",
    choices: [
      { label: "ミルク作りに向く軟水であることをやさしく伝える", good: true },
      { label: "高級路線にふりきる", good: false },
      { label: "子ども向けに甘い味の水を新発売する", good: false },
      { label: "子育て世帯は対象外にして効率化する", good: false },
    ],
  },
  {
    topic: "スタッフへ",
    quote: "最近、配達スタッフがちょっと疲れていてね…",
    choices: [
      { label: "ルートと休憩を見直し、声をちゃんと聴く", good: true },
      { label: "朝礼で順位を貼り出して競わせる", good: false },
      { label: "歩合を強めて台数をこなしてもらう", good: false },
      { label: "辞めた分は残った人でカバーしてもらう", good: false },
    ],
  },
  {
    topic: "水源を守る",
    quote: "水源の森を、ずっと守っていきたい。",
    choices: [
      { label: "地元の植樹活動や水源保全に寄付する", good: true },
      { label: "工場を拡張して売上を増やす", good: false },
      { label: "看板を大きく立ててアピールする", good: false },
      { label: "水源は海外に切り替える", good: false },
    ],
  },
  {
    topic: "サーバー衛生",
    quote: "ウォーターサーバー、家庭で安心して使ってもらうには？",
    choices: [
      { label: "定期メンテナンスと抗菌仕様を標準にする", good: true },
      { label: "買い切りにしてメンテは自己責任にする", good: false },
      { label: "一度導入したら交換せず長く使ってもらう", good: false },
      { label: "クレームはテンプレで返信する", good: false },
    ],
  },
  {
    topic: "地域の健康",
    quote: "水で、地域の健康寿命を延ばせないかな。",
    choices: [
      { label: "こまめな水分補給を呼びかけ、介護施設にサーバーを置く", good: true },
      { label: "事業をエナジードリンクに切り替える", good: false },
      { label: "健康情報は出さず水だけ売る", good: false },
      { label: "スポーツ選手にだけ特別供給する", good: false },
    ],
  },
  {
    topic: "災害への備え",
    quote: "災害のとき、地域の役に立てる会社でありたい。",
    choices: [
      { label: "自治体と給水協定を結び、有事に無償で届ける", good: true },
      { label: "非常時は値上げして希少価値を出す", good: false },
      { label: "災害時は配達を全休にする", good: false },
      { label: "在庫はすべて都会へ集める", good: false },
    ],
  },
  {
    topic: "地元のお祭り",
    quote: "夏祭り、うちも何か協力したいんだよね。",
    choices: [
      { label: "給水所を無料で設置して熱中症を防ぐ", good: true },
      { label: "屋台をたくさん出して売上を作る", good: false },
      { label: "会社の名前をハッピに大きく入れる", good: false },
      { label: "来場者にチラシを大量配布する", good: false },
    ],
  },
  {
    topic: "子ども食堂",
    quote: "地域の子ども食堂に、できることはあるかな？",
    choices: [
      { label: "月に1度、水とウォーターサーバーを無償提供する", good: true },
      { label: "広告を貼らせてもらう条件で支援する", good: false },
      { label: "年末だけ目立つ寄付をする", good: false },
      { label: "お金は出さず名前だけ貸す", good: false },
    ],
  },
  {
    topic: "季節の暮らし",
    quote: "夏、地域の人に喜んでもらう企画ない？",
    choices: [
      { label: "氷水の無料給水スタンドを街角に置く", good: true },
      { label: "期間限定でボトルを値上げする", good: false },
      { label: "派手な看板を出してブランド露出する", good: false },
      { label: "SNSで抽選で1人だけ当選させる", good: false },
    ],
  },
  {
    topic: "地元の学校",
    quote: "子どもたちに、水の大切さを伝えたい。",
    choices: [
      { label: "小中学校で出前授業と水源地ツアーを開く", good: true },
      { label: "ロゴ入りグッズを配って宣伝する", good: false },
      { label: "学校に自販機だけ置く", good: false },
      { label: "動画を配信して終わりにする", good: false },
    ],
  },
  {
    topic: "ご高齢のお客さま",
    quote: "ひとり暮らしの方の見守り、何かできないかな。",
    choices: [
      { label: "配達時に声かけをして、異変があれば家族に連絡する", good: true },
      { label: "見守りプランとして別料金で提供する", good: false },
      { label: "IoTボトルで自動監視だけにする", good: false },
      { label: "見守りは民生委員に任せる", good: false },
    ],
  },
  {
    topic: "10年後",
    quote: "10年後、どんな会社でありたい？",
    choices: [
      { label: "水と健康で、地域になくてはならない存在", good: true },
      { label: "上場して社長はFIREする", good: false },
      { label: "全国チェーン化して知名度で勝負する", good: false },
      { label: "事業はそっと縮小して静かに続ける", good: false },
    ],
  },
  {
    topic: "地域清掃",
    quote: "街の川を、きれいに保ちたいんだよ。",
    choices: [
      { label: "社員で毎月、川の清掃ボランティアをする", good: true },
      { label: "清掃団体に名前だけ貸す", good: false },
      { label: "清掃の日だけ広告を出す", good: false },
      { label: "街の美化は行政に任せる", good: false },
    ],
  },
  {
    topic: "働く家族",
    quote: "スタッフの家族にも、大事にしてほしい。",
    choices: [
      { label: "家族を招いた工場見学日や誕生日祝いを用意する", good: true },
      { label: "家族手当は一律0円で公平にする", good: false },
      { label: "家族の話は業務中は禁止する", good: false },
      { label: "残業手当を削って給与を増やす", good: false },
    ],
  },
  {
    topic: "新人育成",
    quote: "新人がすぐ辞めちゃうんだ。なにができる？",
    choices: [
      { label: "3か月の研修とメンター制度でじっくり育てる", good: true },
      { label: "即戦力を求めて現場に即投入する", good: false },
      { label: "厳しく叱って根性を鍛える", good: false },
      { label: "給料だけ上げて対応する", good: false },
    ],
  },
  {
    topic: "障がい者雇用",
    quote: "障がいのある方と、一緒に働きたいな。",
    choices: [
      { label: "業務を丁寧に切り分け、専任サポーターを置く", good: true },
      { label: "対応が難しいので今回は見送る", good: false },
      { label: "制度に反しないレベルで最小人数だけ", good: false },
      { label: "雇用は見せかけで実質は別室待機", good: false },
    ],
  },
  {
    topic: "健康経営",
    quote: "社員の健康診断、もっと役立てたい。",
    choices: [
      { label: "結果に応じて運動・食事のアドバイス窓口を設ける", good: true },
      { label: "結果が悪い人は配置転換する", good: false },
      { label: "診断結果は会社に報告せず自己管理", good: false },
      { label: "診断回数を2年に1度に減らす", good: false },
    ],
  },
  {
    topic: "農家さんと",
    quote: "地元の米農家さんたちに、水で恩返しできないかな。",
    choices: [
      { label: "稲作に向く水の活用法を一緒に研究する", good: true },
      { label: "農家には営業しないと決める", good: false },
      { label: "自社ブランドの米を単独で作る", good: false },
      { label: "農業用水は高く売る", good: false },
    ],
  },
  {
    topic: "DX化",
    quote: "配達の仕組みをもっと効率化したい。",
    choices: [
      { label: "注文アプリと電話注文を両方残して誰でも使えるようにする", good: true },
      { label: "注文は全部LINEだけに統一する", good: false },
      { label: "電話は廃止してスマホ必須にする", good: false },
      { label: "FAXに戻して確実性を取る", good: false },
    ],
  },
  {
    topic: "スポーツ",
    quote: "地元のスポーツチームを応援したい。",
    choices: [
      { label: "給水サポートとスポンサーを組み合わせて長く関わる", good: true },
      { label: "強いチームだけ選んで短期で広告する", good: false },
      { label: "勝ったチームにだけボトルを贈る", good: false },
      { label: "社員は応援に行かせない", good: false },
    ],
  },
  {
    topic: "商店街",
    quote: "シャッター通りが増えてて、気になってね。",
    choices: [
      { label: "空き店舗で地域の交流スペースを共同運営する", good: true },
      { label: "買い取って自社店舗にして家賃を稼ぐ", good: false },
      { label: "見なかったことにする", good: false },
      { label: "商店街に自販機だけ並べる", good: false },
    ],
  },
  {
    topic: "花火大会",
    quote: "地元の花火大会、毎年楽しみでね。",
    choices: [
      { label: "会場に無料の給水所を置き、熱中症予防に貢献する", good: true },
      { label: "協賛金だけ出して現場には関わらない", good: false },
      { label: "花火の音を録音して自社CMに使う", good: false },
      { label: "花火の日は全員残業にする", good: false },
    ],
  },
  {
    topic: "病院連携",
    quote: "地元病院の患者さんにも、水で何かできないかな。",
    choices: [
      { label: "点滴や調乳用途にも使える水質を看護部と一緒に検討する", good: true },
      { label: "営業目的で病室にパンフを置く", good: false },
      { label: "病院食の味付けを監修する", good: false },
      { label: "病院には宣伝せず遠ざかる", good: false },
    ],
  },
  {
    topic: "保育園",
    quote: "保育園の子どもたちに、安全な水を届けたい。",
    choices: [
      { label: "水質を優しく伝える紙芝居と無償サーバー提供を組み合わせる", good: true },
      { label: "保護者向けにセールスする", good: false },
      { label: "園児にロゴ入りグッズを配る", good: false },
      { label: "自治体と契約しないと動かない", good: false },
    ],
  },
  {
    topic: "情報発信",
    quote: "会社の取り組み、もっと知ってほしい。",
    choices: [
      { label: "現場の小さな出来事を毎週SNSで丁寧に発信する", good: true },
      { label: "広告費をかけてテレビCMを流す", good: false },
      { label: "プレスリリースだけ年1回", good: false },
      { label: "発信は社長のスピーチに任せる", good: false },
    ],
  },
  {
    topic: "長く働く",
    quote: "ベテランさんに、長く気持ちよく続けてほしい。",
    choices: [
      { label: "60代以降も選べる働き方と体力に合わせた役割を用意する", good: true },
      { label: "ベテランは60歳で一律引退", good: false },
      { label: "給与を据え置きにして辞めるのを待つ", good: false },
      { label: "現場を退いて事務だけにする", good: false },
    ],
  },
];

type Phase = "idle" | "playing" | "feedback" | "done";
type PreparedQ = { topic: string; quote: string; choices: Choice[] };
const TOTAL = 10;
const PER_Q_MS = 10000;
const FEEDBACK_MS = 2200;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ShachoGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const [lastPicked, setLastPicked] = useState<number | null>(null);
  const [msLeft, setMsLeft] = useState(PER_Q_MS);
  const [isFs, setIsFs] = useState(false);
  const prepared = useRef<PreparedQ[]>([]);
  const startTs = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("shacho:best") : null;
    if (v) setBest(parseInt(v, 10) || 0);
  }, []);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const q = useMemo<PreparedQ | null>(() => {
    if (phase !== "playing" && phase !== "feedback") return null;
    return prepared.current[qIdx] ?? null;
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
    }, FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [phase, qIdx, nextQ]);

  const start = useCallback(() => {
    enterFs();
    const picked = shuffle(Array.from({ length: REQUESTS.length }, (_, i) => i)).slice(0, TOTAL);
    prepared.current = picked.map((idx) => {
      const r = REQUESTS[idx];
      return { topic: r.topic, quote: r.quote, choices: shuffle(r.choices) };
    });
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

  return (
    <FullscreenHost label="全画面で応える">
      <div
        className={`flex flex-col gap-3 ${
          isFs ? "mx-auto h-[100dvh] max-w-[1100px] justify-center overflow-hidden px-4 py-3" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-4 py-3 pr-28 ring-ink-sm md:px-5 md:py-4 md:pr-36">
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

        <div
          className={`relative overflow-hidden rounded-[28px] border-2 border-ink bg-bg-ink ring-ink-lg ${
            isFs ? "min-h-0 flex-1" : ""
          }`}
        >
          <div className="h-2 w-full border-b-2 border-ink bg-bg">
            <div
              className="h-full bg-red transition-[width] duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div
            className={`grid gap-5 p-5 md:gap-7 md:p-7 ${
              isFs ? "h-full md:grid-cols-[220px_1fr]" : "md:grid-cols-[260px_1fr]"
            }`}
          >
            <div
              className={`relative mx-auto w-full md:mx-0 ${
                isFs ? "max-w-[180px] md:max-w-none" : "max-w-[320px] md:max-w-none"
              }`}
            >
              <div
                className={`relative overflow-hidden rounded-[22px] border-2 border-ink bg-bg ring-ink transition-transform ${
                  feedback === "good" ? "rotate-1" : feedback === "bad" ? "-rotate-1" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/shacho.png"
                  alt="ヤングカレッジ社長"
                  className={`block w-full object-cover ${isFs ? "aspect-[4/5]" : "aspect-[3/4]"}`}
                />
                <div className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-bg/95 px-3 py-2 text-center">
                  <div className="font-label text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    YOUNG COLLEGE
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
