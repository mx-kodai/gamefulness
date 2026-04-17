import type { Metadata } from "next";
import IroshiriGame from "./Game";

export const metadata: Metadata = {
  title: "いろしりとり",
  description: "言葉をつなげるたびに、画面がその色に染まる。色と言葉のやさしいしりとり。",
  alternates: { canonical: "/play/iroshiri" },
  openGraph: {
    title: "いろしりとり | ゲームフルネス",
    description: "色と言葉でつなぐ、やさしいしりとり。",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          IRO-SHIRITORI
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">いろしりとり</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          ことばをつないで、その色に画面を染めよう。「あか → かば → ばなな」みたいに。
        </p>
      </div>
      <div className="mt-6">
        <IroshiriGame />
      </div>
    </section>
  );
}
