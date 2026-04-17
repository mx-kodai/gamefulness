import type { Metadata } from "next";
import NekonadeGame from "./Game";

export const metadata: Metadata = {
  title: "ねこなで",
  description: "画面のねこをやさしく撫でて、ごろごろ鳴かせよう。触覚のリラックス。",
  alternates: { canonical: "/play/nekonade" },
  openGraph: {
    title: "ねこなで | ゲームフルネス",
    description: "やさしく、ゆっくり。ねこをなでてごろごろ。",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          NEKONADE
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">ねこなで</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          ねこをゆっくりなでて、ごろごろ鳴くまで。強すぎると逃げちゃうよ。
        </p>
      </div>
      <div className="mt-6">
        <NekonadeGame />
      </div>
    </section>
  );
}
