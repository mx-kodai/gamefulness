import type { Metadata } from "next";
import ShachoGame from "./Game";

export const metadata: Metadata = {
  title: "社長の要望にこたえろ",
  description: "ヤングドライ社長の一言に、ベストな一手で応える特別ゲーム。",
  alternates: { canonical: "/play/shacho" },
  openGraph: {
    title: "社長の要望にこたえろ | ゲームフルネス",
    description: "ヤングドライ提供の特別ゲーム。",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-center gap-3 text-[12px] md:text-[13px]">
        <span className="rounded-full border-2 border-ink bg-yellow px-3 py-1 font-display font-black">
          SPECIAL
        </span>
        <span className="font-label font-semibold uppercase tracking-[0.2em] text-ink-soft">
          PRESENTED BY YOUNG DRY
        </span>
      </div>
      <ShachoGame />
    </main>
  );
}
