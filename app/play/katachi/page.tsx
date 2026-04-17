import type { Metadata } from "next";
import KatachiGame from "./Game";

export const metadata: Metadata = {
  title: "かたち合わせ",
  description: "指でなぞって丸・三角・四角を描く、手指とこころのウォーミングアップ。",
  alternates: { canonical: "/play/katachi" },
  openGraph: {
    title: "かたち合わせ | ゲームフルネス",
    description: "線をそっとなぞって、かたちを作る。",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          KATACHI
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">かたち合わせ</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          薄く光るガイド線を、指でそっとなぞる。丸・三角・四角、3つのかたち。
        </p>
      </div>
      <div className="mt-6">
        <KatachiGame />
      </div>
    </section>
  );
}
