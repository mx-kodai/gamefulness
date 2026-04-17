import type { Metadata } from "next";
import TsurikkoGame from "./Game";

export const metadata: Metadata = {
  title: "つりっこ | ゲームフルネス",
  description: "水面に糸を垂らして待つ。アタリのタイミングでタップ。静かだけど手に汗握る60秒の釣り。",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <div>
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          TSURIKKO
        </div>
        <h1 className="mt-1 font-display text-[32px] font-black md:text-[44px]">つりっこ</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
          「！」が出た瞬間にタップで釣れる。大物が来たら大興奮。60秒でどれだけ釣れるか勝負。
        </p>
      </div>
      <div className="mt-6">
        <TsurikkoGame />
      </div>
    </section>
  );
}
