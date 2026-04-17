import type { Metadata } from "next";
import Link from "next/link";
import ManekkoGame from "./Game";

export const metadata: Metadata = {
  title: "まねっこ | ゲームフルネス",
  description: "光った順に4色をなぞる、ゆっくり楽しめる記憶あそび。",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
            MANEKKO
          </div>
          <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">まねっこ</h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
            光った順に同じ色をタップするだけ。だんだん長くなる光の列を、ゆっくり一緒に。
          </p>
        </div>
        <Link
          href="/play/manekko"
          className="hidden rounded-full border-2 border-ink bg-bg px-4 py-2 text-[13px] font-bold ring-ink-sm md:block"
        >
          コンセプト
        </Link>
      </div>
      <div className="mt-6">
        <ManekkoGame />
      </div>
    </section>
  );
}
