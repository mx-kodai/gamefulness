import type { Metadata } from "next";
import TsukihiGame from "./Game";

export const metadata: Metadata = {
  title: "月のリズム",
  description: "月の満ち欠けに合わせて、やさしく呼吸を整える静かなタップゲーム。",
  alternates: { canonical: "/play/tsukihi" },
  openGraph: {
    title: "月のリズム | ゲームフルネス",
    description: "月の満ち欠けに合わせてタップ。呼吸を整える静かなゲーム。",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          TSUKI
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">月のリズム</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          満ちる月に合わせて息を吸い、欠ける月に合わせて吐く。満月のタイミングでそっとタップ。
        </p>
      </div>
      <div className="mt-6">
        <TsukihiGame />
      </div>
    </section>
  );
}
