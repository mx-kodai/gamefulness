import type { Metadata } from "next";
import TobikkoGame from "./Game";

export const metadata: Metadata = {
  title: "とびっこ | ゲームフルネス",
  description: "画面をタップでジャンプ。岩をよけて走り続ける、一本道のシンプルランナー。",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          TOBIKKO
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">とびっこ</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          タップでジャンプ。岩にぶつかるまで、どこまでも走ろう。ゲームが苦手でも3秒で遊べる。
        </p>
      </div>
      <div className="mt-6">
        <TobikkoGame />
      </div>
    </section>
  );
}
