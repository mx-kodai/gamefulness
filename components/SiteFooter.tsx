import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="zorge" className="mt-12 border-t-2 border-ink bg-bg-ink">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:px-8 md:py-16">
        <div>
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
            OPERATED BY
          </div>
          <div className="mt-2 font-display text-[32px] font-black md:text-[42px]">Zorge</div>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
            ゾージは、テクノロジーとデザインを通じて「ウェルビーイングな社会」を目指すスタジオです。年齢・障がい・環境にかかわらず、誰もが気軽に触れて、ちいさく元気になれる遊び場を作ります。
          </p>
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
          <div>© {new Date().getFullYear()} Zorge. Gamefulness.</div>
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
