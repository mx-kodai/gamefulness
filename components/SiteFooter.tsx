import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="zorge" className="mt-12 border-t-2 border-ink bg-bg-ink">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:px-8 md:py-16">
        <div>
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
            OPERATED BY
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-[32px] font-black md:text-[42px]">ZORGE</span>
            <span className="font-display text-[15px] font-bold text-ink-soft md:text-[17px]">ゾルゲ</span>
          </div>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
            株式会社ZORGE（ゾルゲ）は、富山に拠点を置くeスポーツとゲーム×地域の会社。
            <br />
            地域の人たちと一緒にゲームを通じて成長し躍進する——をテーマに、大会運営、メタバース、教育・健康・地域活性化に関わる企画を全国で手がけています。
            <br className="hidden md:inline" />
            ゲームフルネスは、その遊びの力を「ウェルビーイング」の現場へひらくプロジェクトです。
          </p>
          <a
            href="https://zorge.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-bg px-4 py-2 font-display text-[13px] font-black ring-ink-sm md:text-[14px]"
          >
            zorge.jp →
          </a>
        </div>
        <FooterCol title="あそぶ">
          <FootLink href="/">ラインナップ</FootLink>
          <FootLink href="/ranking">ランキング</FootLink>
          <FootLink href="/about">コンセプト</FootLink>
        </FooterCol>
        <FooterCol title="つかう">
          <FootLink href="/signup">ユーザー登録</FootLink>
          <FootLink href="/facilities">施設一覧</FootLink>
          <FootLink href="/facilities/new">施設を登録</FootLink>
          <FootLink href="/me">マイページ</FootLink>
        </FooterCol>
      </div>
      <div className="border-t-2 border-ink">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-2 px-5 py-4 text-[12px] text-ink-soft md:flex-row md:items-center md:px-8">
          <div>© {new Date().getFullYear()} ZORGE Inc. Gamefulness.</div>
          <div className="font-label uppercase tracking-[0.25em]">MADE FOR EVERYONE</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-display text-[13px] font-black uppercase tracking-[0.15em] text-ink-soft">
        {title}
      </div>
      <div className="mt-2 flex flex-col gap-1.5 text-[14px] md:text-[15px]">{children}</div>
    </div>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ink hover:text-red">
      {children}
    </Link>
  );
}
