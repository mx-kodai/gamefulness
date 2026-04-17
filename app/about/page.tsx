import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "コンセプト | ゲームフルネス",
  description: "ゲーム × ウェルネスの思想と設計原則。株式会社ZORGE（ゾルゲ）が大切にしていること。",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b-2 border-ink bg-bg-ink">
        <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-24">
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
            CONCEPT
          </div>
          <h1 className="mt-3 max-w-[18ch] font-display text-[36px] font-black leading-[1.1] tracking-tight md:text-[64px]">
            触れたら応える。
            <br />
            それだけで、
            <br />
            こころは動く。
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft md:text-[17px]">
            ゲームフルネスは「ゲーム × ウェルネス」を軸に、勝ち負けではなく、触れた瞬間の気持ちよさに設計をあつめたミニゲームのあつまりです。
            1タップで応答が返る体験を通じて、記憶・呼吸・表情・対話、その人の中でほんのすこし動きはじめる何かを大切に扱います。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <Pillar
            num="01"
            title="誰のため"
            body="高齢者、子ども、障害のある方、その周りの方。年齢・状態・環境にかかわらず、1タップで手応えが返る体験を届けます。"
            color="red"
          />
          <Pillar
            num="02"
            title="なにをする"
            body="12本のミニゲームのあつまり。記憶・呼吸・リズム・ことば。どれも1分から3分で、無理のない範囲に設計されています。"
            color="blue"
          />
          <Pillar
            num="03"
            title="なぜ"
            body="ウェルビーイングは、いちど大きく動かすよりも、毎日の小さな応答の積み重ねで育つ。私たちはその小さな応答を設計しています。"
            color="green"
          />
        </div>
      </section>

      <section className="border-y-2 border-ink bg-bg-ink">
        <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
            DESIGN PRINCIPLES
          </div>
          <h2 className="mt-2 font-display text-[28px] font-black md:text-[40px]">設計の鉄則</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
            <Rule n="1" t="入力はちいさく、出力はゆたかに" b="1タップ、1クリック、ひと息。触れたことが光と音でしっかり返ってくる。" />
            <Rule n="2" t="勝敗ではなく、応答" b="失敗しても叱らない。どんな触り方も、景色として受けとめる。" />
            <Rule n="3" t="18pxを下回らない" b="高齢者の方が眼鏡なしで読める大きさ。ボタンは指の腹にきちんと乗る。" />
            <Rule n="4" t="ルール説明は3行まで" b="読まなくてもはじめられる。3行読めばもう十分遊べる。" />
            <Rule n="5" t="音は割れない、派手すぎない" b="WebAudioで生成する、やさしい持続音。静かな空間でも浮かない。" />
            <Rule n="6" t="やめることも褒める" b="短く切ることができて、また来るのが楽しみになる手応えを残す。" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          INSPIRATION
        </div>
        <h2 className="mt-2 font-display text-[28px] font-black md:text-[40px]">
          参考にしている世界の表現
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] text-ink-soft md:text-[16px]">
          AIと3D表現の組み合わせで、1タップ級のやさしい入力から、こんなにも豊かな応答が返る事例が世界中で生まれています。ゲームフルネスはその系譜の中に、ウェルネスという視点を足しました。
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
          <Inspo
            title="Bruno Simon Portfolio"
            href="https://bruno-simon.com/"
            body="Three.js + 物理。説明書ゼロでハンドルを切ったら楽しい、の原点。"
          />
          <Inspo
            title="Active Theory"
            href="https://activetheory.net/"
            body="WebGL空間にAIナビゲーターが常駐し、見たいものを見せてくれるナビUI。"
          />
          <Inspo
            title="Quick, Draw! / Teachable Machine"
            href="https://quickdraw.withgoogle.com/"
            body="お絵かき・ポーズ・音、どんな入力もAIが受けとめる。非対称勝負のやさしさ。"
          />
          <Inspo
            title="MediaPipe × Three.js"
            href="https://tympanus.net/codrops/2024/10/24/creating-a-3d-hand-controller-using-a-webcam-with-mediapipe-and-three-js/"
            body="Webカメラで手を21点追跡。コントローラ不要、リハビリや運動不足解消に直結。"
          />
          <Inspo
            title="GPGPU Particles"
            href="https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/"
            body="WebGPUで100万粒子級の流体。見ているだけで整う絵の力。"
          />
          <Inspo
            title="Land Lines"
            href="https://lines.chromeexperiments.com/"
            body="指でなぞった線に合う衛星画像をAIが繋ぐ。描く=世界旅行。"
          />
        </div>

        <div className="mt-10 rounded-[24px] border-2 border-ink bg-bg-ink p-6 md:p-10">
          <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
            SYNTHESIS
          </div>
          <p className="mt-2 font-display text-[20px] font-bold leading-relaxed md:text-[28px]">
            「入力の最小化 × 出力の最大化」 × AIは判定者ではなく相棒。
          </p>
          <p className="mt-3 max-w-2xl text-[14px] text-ink-soft md:text-[16px]">
            触れたら応える。それが誰に対しても平等に成立する場所。私たちはそれをゲームフルネスと呼んでいます。
          </p>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink text-bg">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <div>
            <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-bg/60">
              START
            </div>
            <p className="mt-2 font-display text-[24px] font-black md:text-[36px]">
              まずは一本、あそんでみてください。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/play/manekko"
              className="btn-lift rounded-full border-2 border-bg bg-red px-6 py-3 font-display text-[16px] font-black text-bg md:text-[18px]"
            >
              まねっこをあそぶ
            </Link>
            <Link
              href="/signup"
              className="btn-lift rounded-full border-2 border-bg bg-bg px-6 py-3 font-display text-[16px] font-black text-ink md:text-[18px]"
            >
              ユーザー登録
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Pillar({
  num,
  title,
  body,
  color,
}: {
  num: string;
  title: string;
  body: string;
  color: "red" | "yellow" | "blue" | "green";
}) {
  const colorMap = { red: "bg-red", yellow: "bg-yellow", blue: "bg-blue", green: "bg-green" };
  return (
    <article className="relative overflow-hidden rounded-[24px] border-2 border-ink bg-bg p-6 ring-ink md:p-8">
      <div
        className={`absolute -right-6 -top-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-ink ${colorMap[color]} font-display text-[22px] font-black text-bg`}
      >
        {num}
      </div>
      <h3 className="mt-14 font-display text-[22px] font-black md:text-[28px]">{title}</h3>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">{body}</p>
    </article>
  );
}

function Rule({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-bg px-5 py-4 ring-ink-sm md:px-6 md:py-5">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[22px] font-black text-ink-soft">{n}</span>
        <h3 className="font-display text-[16px] font-black md:text-[19px]">{t}</h3>
      </div>
      <p className="mt-1 pl-8 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">{b}</p>
    </div>
  );
}

function Inspo({ title, href, body }: { title: string; href: string; body: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border-2 border-ink bg-bg px-5 py-4 ring-ink-sm transition-transform hover:-translate-y-0.5 md:px-6 md:py-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-[16px] font-black md:text-[19px]">{title}</h3>
        <span className="font-label text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          OPEN ↗
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">{body}</p>
    </a>
  );
}
