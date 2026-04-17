import type { Metadata } from "next";
import Link from "next/link";
import KazerinGame from "./Game";

export const metadata: Metadata = {
  title: "ふうりん | ゲームフルネス",
  description: "光った風鈴をタップして鳴らそう。やさしい音色のタイミングあそび。",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          KAZERIN
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">かぜりん</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          光った風鈴を、やさしく鳴らそう。どの風鈴にも、それぞれの音色。急がなくて大丈夫。
        </p>
      </div>
      <div className="mt-6">
        <KazerinGame />
      </div>
    </section>
  );
}
