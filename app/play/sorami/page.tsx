import type { Metadata } from "next";
import SoramiGame from "./Game";

export const metadata: Metadata = {
  title: "そら見る | ゲームフルネス",
  description: "空をよぎる鳥・ふうせん・流れ星をタップ。静かな空気で手軽に夢中になれる40秒。",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          SORAMI
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">そら見る</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          空を流れる鳥、ふうせん、流れ星。見つけたら、タップ。穏やかで、でも手が動く40秒。
        </p>
      </div>
      <div className="mt-6">
        <SoramiGame />
      </div>
    </section>
  );
}
