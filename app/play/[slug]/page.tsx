import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GAME_BY_SLUG, GAMES, COLOR_HEX } from "@/lib/games";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = GAME_BY_SLUG[slug];
  if (!g) return {};
  const url = `https://gamefulness.vercel.app/play/${g.slug}`;
  return {
    title: g.title,
    description: `${g.tagline} ${g.concept}`.slice(0, 140),
    alternates: { canonical: `/play/${g.slug}` },
    openGraph: {
      title: `${g.title} | ゲームフルネス`,
      description: g.tagline,
      url,
      type: "article",
      images: [{ url: "/og.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${g.title} | ゲームフルネス`,
      description: g.tagline,
    },
  };
}

export async function generateStaticParams() {
  return GAMES.filter((g) => g.status === "soon").map((g) => ({ slug: g.slug }));
}

export default async function GameSlugPage({ params }: Props) {
  const { slug } = await params;
  const game = GAME_BY_SLUG[slug];
  if (!game) notFound();

  const bg = COLOR_HEX[game.color];
  const related = GAMES.filter((g) => g.slug !== slug).slice(0, 4);

  return (
    <>
      <section
        className="border-b-2 border-ink"
        style={{ background: bg }}
      >
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-14 md:grid-cols-[1.3fr_1fr] md:px-8 md:py-24">
          <div>
            <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink">
              {game.kana} ・ {game.status === "playable" ? "NOW PLAYING" : "COMING SOON"}
            </div>
            <h1 className="mt-3 font-display text-[44px] font-black leading-[1.05] tracking-tight text-ink md:text-[72px]">
              {game.title}
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink md:text-[18px]">
              {game.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {game.status === "playable" ? (
                <Link
                  href={`/play/${game.slug}`}
                  className="btn-lift rounded-full border-2 border-ink bg-ink px-7 py-3 font-display text-[17px] font-black text-bg ring-ink md:text-[19px]"
                >
                  あそぶ →
                </Link>
              ) : (
                <button
                  disabled
                  className="cursor-not-allowed rounded-full border-2 border-ink bg-bg px-7 py-3 font-display text-[17px] font-black opacity-60 md:text-[19px]"
                >
                  近日公開
                </button>
              )}
              <Link
                href="/"
                className="btn-lift rounded-full border-2 border-ink bg-bg px-6 py-3 font-display text-[15px] font-black ring-ink-sm md:text-[17px]"
              >
                ← ラインナップへ
              </Link>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-[32px] border-2 border-ink bg-bg">
            <ConceptArt color={game.color} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <Block label="CONCEPT" title="コンセプト" body={game.concept} />
          <Block
            label="HOW TO PLAY"
            title="あそびかた"
            body={
              <ol className="list-inside list-decimal space-y-1.5 text-[14px] leading-relaxed text-ink md:text-[16px]">
                {game.howTo.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ol>
            }
          />
          <Block
            label="WELLNESS"
            title="ウェルネス効用"
            body={
              <>
                <p className="text-[14px] leading-relaxed md:text-[16px]">{game.wellness}</p>
                <p className="mt-3 rounded-full border-2 border-ink bg-bg-ink px-3 py-1 text-center text-[12px] font-bold md:text-[13px]">
                  {game.duration}
                </p>
              </>
            }
          />
        </div>
      </section>

      <section className="border-t-2 border-ink bg-bg-ink">
        <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8 md:py-16">
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
            ALSO ON GAMEFULNESS
          </div>
          <h2 className="mt-2 font-display text-[24px] font-black md:text-[32px]">
            ほかのあそび
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/play/${g.slug}`}
                className="btn-lift rounded-2xl border-2 border-ink bg-bg p-4 ring-ink-sm md:p-5"
              >
                <div
                  className="mb-3 h-12 w-12 rounded-xl border-2 border-ink"
                  style={{ background: COLOR_HEX[g.color] }}
                />
                <div className="font-display text-[15px] font-black md:text-[17px]">
                  {g.title}
                </div>
                <div className="text-[11px] text-ink-soft md:text-[12px]">{g.tagline}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Block({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
        {label}
      </div>
      <h3 className="mt-1 font-display text-[22px] font-black md:text-[26px]">{title}</h3>
      <div className="mt-3 text-[14px] leading-relaxed text-ink md:text-[16px]">{body}</div>
    </div>
  );
}

function ConceptArt({ color }: { color: "red" | "yellow" | "blue" | "green" }) {
  const fill = COLOR_HEX[color];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <defs>
        <pattern id="ca-dot" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="rgba(27,26,23,0.18)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#ca-dot)" />
      <circle cx="50" cy="50" r="30" fill={fill} stroke="#1B1A17" strokeWidth="2" />
      <circle cx="50" cy="50" r="18" fill="#F6F1E4" stroke="#1B1A17" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="#1B1A17" />
    </svg>
  );
}
