import Link from "next/link";
import { GAMES } from "@/lib/games";
import { thumbnailPath } from "@/lib/thumbnails";
import TopHighlights from "./_home/TopHighlights";

export default function Home() {
  return (
    <>
      <Hero />
      <MissionStrip />
      <section className="mx-auto max-w-[1280px] px-5 pt-10 md:px-8 md:pt-16">
        <TopHighlights />
      </section>
      <section className="mx-auto max-w-[1280px] px-5 pt-10 md:px-8 md:pt-16">
        <GameGrid />
      </section>
      <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-14 md:px-8 md:pt-20">
        <SpecialBanner />
      </section>
    </>
  );
}

function SpecialBanner() {
  return (
    <Link
      href="/play/shacho"
      className="group relative block overflow-hidden rounded-[28px] border-2 border-ink ring-ink-lg btn-lift"
    >
      <div className="relative grid grid-cols-[120px_1fr_auto] items-stretch gap-0 bg-yellow md:grid-cols-[260px_1fr_auto]">
        <div className="relative overflow-hidden border-r-2 border-ink bg-bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/shacho.png"
            alt="ヤングカレッジ社長"
            className="block h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center gap-2 px-4 py-4 md:px-7 md:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-ink bg-ink px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-wider text-bg md:text-[11px]">
              SPECIAL
            </span>
            <span className="rounded-full border-2 border-ink bg-bg px-2.5 py-1 font-label text-[9px] font-bold uppercase tracking-[0.2em] md:text-[10px]">
              PRESENTED BY YOUNG COLLEGE
            </span>
          </div>
          <h3 className="font-display text-[20px] font-black leading-tight md:text-[30px]">
            社長の要望に、こたえろ。
          </h3>
          <p className="hidden max-w-[52ch] text-[12px] leading-snug text-ink md:block md:text-[14px]">
            水をつくるヤングカレッジ社長が投げかけるアイデアに、あなたの判断で応える60秒の特別ゲーム。
            社長を笑顔にできたら、あなたも今日のMVPだ。
          </p>
          <p className="text-[11px] leading-snug text-ink md:hidden">
            60秒、10問。社長を笑顔にできるか？
          </p>
        </div>
        <div className="flex items-center border-l-2 border-ink bg-red pr-4 pl-3 md:pr-7 md:pl-5">
          <span className="font-display text-[14px] font-black text-bg md:text-[18px]">
            あそぶ →
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t-2 border-ink bg-bg px-4 py-2 text-[10px] font-bold md:px-7 md:text-[11px]">
        <span className="font-label tracking-[0.15em] text-ink-soft">
          ゲームフルネス × YOUNG COLLEGE コラボゲーム ／ 水と健康をつくる会社
        </span>
        <span className="hidden font-label tracking-[0.15em] text-ink-soft md:inline">
          ★ Special collaboration
        </span>
      </div>
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      <HeroArt />
      <div className="relative mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-24">
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          GAME × WELLNESS
        </div>
        <h1 className="mt-3 max-w-[14ch] font-display text-[40px] font-black leading-[1.05] tracking-tight md:text-[72px]">
          あそびで、
          <br />
          こころ満たされる
          <br />
          毎日を。
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-[17px]">
          ゲームフルネスは、年齢や障がいにかかわらず誰もが1タップで楽しめるミニゲームのあつまり。
          遊んだ記録は施設や仲間と共有でき、小さな達成が称号やアワードになっていきます。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="btn-lift rounded-full border-2 border-ink bg-ink px-7 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
          >
            ユーザー登録してはじめる
          </Link>
          <Link
            href="#games"
            className="btn-lift rounded-full border-2 border-ink bg-bg px-7 py-3 font-display text-[16px] font-black ring-ink-sm md:text-[18px]"
          >
            まずあそぶ →
          </Link>
          <Link
            href="/facilities/new"
            className="btn-lift rounded-full border-2 border-ink bg-yellow px-6 py-3 font-display text-[15px] font-black text-ink ring-ink-sm md:text-[16px]"
          >
            施設として登録
          </Link>
        </div>

        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 md:mt-14 md:gap-5">
          <Kpi value="14" label="ゲーム ラインナップ" />
          <Kpi value="1タップ" label="誰でも、すぐに" />
          <Kpi value="7〜99" label="年齢の壁はありません" />
        </div>
      </div>
    </section>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-bg px-3 py-3 ring-ink-sm md:px-5 md:py-4">
      <div className="font-display text-[22px] font-black leading-none md:text-[32px]">{value}</div>
      <div className="mt-1 text-[11px] leading-tight text-ink-soft md:text-[13px]">{label}</div>
    </div>
  );
}

function HeroArt() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-yellow md:h-72 md:w-72" />
      <div className="absolute right-16 bottom-[-40px] h-32 w-32 rounded-full bg-red/90 md:h-48 md:w-48" />
      <div className="absolute -left-6 top-32 h-24 w-24 rounded-2xl border-2 border-ink bg-blue md:h-40 md:w-40" />
      <div className="absolute right-48 top-20 hidden h-16 w-16 rounded-full border-2 border-ink bg-green md:block" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.15]" aria-hidden>
        <defs>
          <pattern id="dots-bg" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#1B1A17" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-bg)" />
      </svg>
    </div>
  );
}

function MissionStrip() {
  return (
    <section className="border-b-2 border-ink bg-bg-ink">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
        <p className="font-display text-[18px] font-bold leading-snug md:text-[22px]">
          入力はちいさく。こころには、ゆたかに。
        </p>
        <p className="max-w-xl text-[13px] text-ink-soft md:text-[15px]">
          1タップで応答が返る体験を重ねていくと、記憶も、呼吸も、笑顔も、ゆっくり動きはじめます。
          そんな”あそぶこと”自体が健やかさになる場所。
        </p>
      </div>
    </section>
  );
}

function GameGrid() {
  const playable = GAMES.filter((g) => g.status === "playable").length;
  const soon = GAMES.length - playable;
  return (
    <div id="games">
      <div className="mb-6 flex items-end justify-between md:mb-8">
        <div>
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
            01 / LINEUP
          </div>
          <h2 className="mt-1 font-display text-[28px] font-black tracking-tight md:text-[36px]">
            今日のあそび
          </h2>
        </div>
        <div className="hidden items-center gap-2 text-[13px] text-ink-soft md:flex">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green pulse-ring" />
          あそべる {playable}本 / じゅんびちゅう {soon}本
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {GAMES.map((g, i) => (
          <GameCard key={g.slug} game={g} index={i} />
        ))}
      </div>
    </div>
  );
}

const COLOR_MAP = {
  red: { bg: "bg-red", text: "text-red" },
  yellow: { bg: "bg-yellow", text: "text-yellow" },
  blue: { bg: "bg-blue", text: "text-blue" },
  green: { bg: "bg-green", text: "text-green" },
} as const;

function GameCard({ game, index }: { game: (typeof GAMES)[number]; index: number }) {
  const palette = COLOR_MAP[game.color];
  const isPlayable = game.status === "playable";
  const card = (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-ink bg-bg-ink ring-ink ${
        isPlayable ? "btn-lift" : ""
      }`}
    >
      <div className={`relative aspect-[4/3] w-full shrink-0 ${palette.bg}`}>
        <CardArt slug={game.slug} seed={index} color={game.color} />
        {!isPlayable && (
          <div className="absolute right-2 top-2 rounded-full border-2 border-ink bg-bg px-2.5 py-1 text-[10px] font-bold md:text-[11px]">
            COMING SOON
          </div>
        )}
        {isPlayable && (
          <div className="absolute right-2 top-2 rounded-full border-2 border-ink bg-ink px-2.5 py-1 font-display text-[10px] font-black text-bg md:text-[11px]">
            NOW PLAYING
          </div>
        )}
      </div>
      <div className="flex min-h-[102px] flex-1 flex-col border-t-2 border-ink bg-bg px-3.5 py-3 md:min-h-[112px] md:px-4 md:py-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-[17px] font-black leading-tight md:text-[19px]">
            {game.title}
          </h3>
          <span className={`font-label text-[10px] font-semibold tracking-[0.15em] ${palette.text}`}>
            {game.kana}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-soft md:text-[13px]">{game.tagline}</p>
      </div>
    </article>
  );

  return (
    <Link href={`/play/${game.slug}`} className="block h-full">
      {card}
    </Link>
  );
}

function CardArt({ slug, seed, color }: { slug: string; seed: number; color: string }) {
  const thumb = thumbnailPath(slug);
  if (thumb) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumb}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id={`dots-${seed}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(27,26,23,0.18)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="150" fill={`url(#dots-${seed})`} />
      <GameScene slug={slug} color={color} />
    </svg>
  );
}

function GameScene({ slug, color }: { slug: string; color: string }) {
  const INK = "#1B1A17";
  const BG = "#F6F1E4";
  const RED = "#E23D3D";
  const YEL = "#F4B533";
  const BLU = "#2F7FE0";
  const GRN = "#2FA66E";
  const stroke = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (slug) {
    case "tobikko":
      return (
        <g>
          <path d="M0 120 Q 60 105 100 118 T 200 122 L 200 150 L 0 150 Z" fill="#E9DFC2" stroke={INK} strokeWidth="3" />
          <path d="M45 88 Q 70 48 100 88" {...stroke} fill="none" strokeDasharray="6,5" />
          <circle cx="100" cy="82" r="16" fill={YEL} {...stroke} />
          <circle cx="106" cy="78" r="2.5" fill={INK} />
          <circle cx="109" cy="84" r="1.8" fill={RED} />
          <path d="M140 120 L 150 96 L 162 104 L 170 120 Z" fill="#2F3028" {...stroke} />
          <path d="M40 120 L 48 108 L 56 118 L 62 120 Z" fill="#2F3028" {...stroke} />
        </g>
      );
    case "tsurikko":
      return (
        <g>
          <rect x="0" y="0" width="200" height="75" fill="#C5E3F2" />
          <rect x="0" y="75" width="200" height="75" fill="#2C6EA7" />
          <path d="M145 20 Q 120 35 100 55" {...stroke} fill="none" />
          <line x1="100" y1="55" x2="100" y2="98" stroke={INK} strokeWidth="1.5" />
          <circle cx="100" cy="100" r="8" fill={RED} {...stroke} />
          <ellipse cx="85" cy="115" rx="18" ry="8" fill={BLU} {...stroke} opacity="0.8" />
          <path d="M67 115 L 60 110 L 60 120 Z" fill={BLU} {...stroke} />
          <ellipse cx="140" cy="128" rx="14" ry="6" fill="#1B3E78" {...stroke} opacity="0.7" />
          <path d="M90 80 Q 96 72 104 80" {...stroke} fill="none" />
        </g>
      );
    case "manekko":
      return (
        <g>
          <rect x="30" y="30" width="50" height="50" rx="6" fill={RED} {...stroke} />
          <rect x="90" y="30" width="50" height="50" rx="6" fill={YEL} {...stroke} />
          <rect x="30" y="88" width="50" height="50" rx="6" fill={BLU} {...stroke} />
          <rect x="90" y="88" width="50" height="50" rx="6" fill={GRN} {...stroke} />
          <circle cx="115" cy="55" r="7" fill={BG} {...stroke} />
          <path d="M160 30 L 175 15 M 165 45 L 185 45 M 160 65 L 175 80" {...stroke} fill="none" />
        </g>
      );
    case "kazerin":
      return (
        <g>
          <line x1="100" y1="10" x2="100" y2="55" {...stroke} />
          <path d="M75 55 Q 100 85 125 55 Z" fill={BLU} {...stroke} />
          <line x1="75" y1="55" x2="125" y2="55" stroke={INK} strokeWidth="3" />
          <circle cx="100" cy="92" r="4" fill={INK} />
          <line x1="100" y1="96" x2="100" y2="115" stroke={INK} strokeWidth="1.5" />
          <rect x="92" y="115" width="16" height="4" fill={BLU} stroke={INK} strokeWidth="1.5" />
          <path d="M40 40 Q 50 30 60 40" {...stroke} fill="none" />
          <path d="M150 30 Q 160 22 170 30" {...stroke} fill="none" />
        </g>
      );
    case "sorami":
      return (
        <g>
          <rect x="0" y="0" width="200" height="150" fill="#CDE5F5" />
          <ellipse cx="40" cy="35" rx="18" ry="8" fill={BG} {...stroke} />
          <ellipse cx="150" cy="50" rx="22" ry="10" fill={BG} {...stroke} />
          <path d="M80 60 Q 90 50 100 62 Q 110 50 120 60" {...stroke} fill="none" />
          <circle cx="100" cy="95" r="12" fill={RED} {...stroke} />
          <path d="M100 107 L 98 115" stroke={INK} strokeWidth="1.5" />
          <polygon points="160,100 164,110 174,110 166,116 170,126 160,120 150,126 154,116 146,110 156,110" fill={YEL} {...stroke} />
          <path d="M0 135 Q 50 128 100 135 T 200 132 L 200 150 L 0 150 Z" fill="#1B1A17" opacity="0.8" />
        </g>
      );
    case "iroshiri":
      return (
        <g>
          <path d="M25 30 Q 25 20 35 20 L 165 20 Q 175 20 175 30 L 175 80 Q 175 90 165 90 L 80 90 L 60 110 L 70 90 L 35 90 Q 25 90 25 80 Z" fill={BG} {...stroke} />
          <circle cx="60" cy="55" r="8" fill={RED} {...stroke} />
          <circle cx="95" cy="55" r="8" fill={YEL} {...stroke} />
          <circle cx="130" cy="55" r="8" fill={GRN} {...stroke} />
        </g>
      );
    case "katachi":
      return (
        <g>
          <circle cx="55" cy="75" r="30" fill={RED} {...stroke} strokeDasharray="4,4" />
          <rect x="85" y="50" width="52" height="52" rx="4" fill={YEL} {...stroke} strokeDasharray="4,4" />
          <polygon points="160,105 135,55 185,55" fill={BLU} {...stroke} strokeDasharray="4,4" />
        </g>
      );
    case "tsukihi":
      return (
        <g>
          <circle cx="50" cy="75" r="18" fill={BG} {...stroke} />
          <circle cx="100" cy="75" r="18" fill={YEL} {...stroke} />
          <path d="M100 57 A 18 18 0 0 1 100 93 Z" fill={INK} />
          <circle cx="150" cy="75" r="18" fill={INK} {...stroke} />
          <path d="M150 57 A 18 18 0 0 1 150 93 Z" fill={YEL} />
        </g>
      );
    case "kotoba":
      return (
        <g>
          <path d="M100 120 Q 80 100 80 70 Q 80 45 100 45 Q 120 45 120 70 Q 120 100 100 120" fill={GRN} {...stroke} />
          <circle cx="100" cy="55" r="14" fill={RED} {...stroke} />
          <circle cx="95" cy="55" r="3" fill={BG} />
          <circle cx="105" cy="55" r="3" fill={BG} />
          <line x1="100" y1="100" x2="100" y2="135" {...stroke} />
          <path d="M100 120 Q 85 125 80 135" {...stroke} fill="none" />
          <path d="M100 115 Q 115 122 125 130" {...stroke} fill="none" />
        </g>
      );
    case "nekonade":
      return (
        <g>
          <ellipse cx="100" cy="120" rx="55" ry="14" fill={INK} opacity="0.18" />
          <path d="M60 100 Q 55 70 70 55 L 80 75 L 100 58 L 120 75 L 130 55 Q 145 70 140 100 Z" fill={GRN} {...stroke} />
          <circle cx="88" cy="82" r="3.5" fill={INK} />
          <circle cx="112" cy="82" r="3.5" fill={INK} />
          <path d="M95 92 Q 100 97 105 92" {...stroke} fill="none" strokeWidth="2.5" />
          <circle cx="78" cy="90" r="3" fill={RED} opacity="0.6" />
          <circle cx="122" cy="90" r="3" fill={RED} opacity="0.6" />
          <line x1="82" y1="88" x2="72" y2="86" {...stroke} strokeWidth="1.5" />
          <line x1="82" y1="90" x2="72" y2="92" {...stroke} strokeWidth="1.5" />
          <line x1="118" y1="88" x2="128" y2="86" {...stroke} strokeWidth="1.5" />
          <line x1="118" y1="90" x2="128" y2="92" {...stroke} strokeWidth="1.5" />
          <path d="M150 60 Q 165 50 170 65 Q 172 78 160 80" {...stroke} fill="none" strokeWidth="2" />
        </g>
      );
    case "egao":
      return (
        <g>
          <circle cx="100" cy="75" r="40" fill={YEL} {...stroke} />
          <circle cx="85" cy="70" r="4" fill={INK} />
          <circle cx="115" cy="70" r="4" fill={INK} />
          <path d="M78 85 Q 100 108 122 85" {...stroke} fill="none" strokeWidth="4" />
          <circle cx="72" cy="85" r="4" fill={RED} opacity="0.7" />
          <circle cx="128" cy="85" r="4" fill={RED} opacity="0.7" />
        </g>
      );
    case "origami":
      return (
        <g>
          <polygon points="40,100 100,40 160,100 100,120" fill={BG} {...stroke} />
          <line x1="100" y1="40" x2="100" y2="120" {...stroke} strokeDasharray="4,4" />
          <line x1="40" y1="100" x2="160" y2="100" {...stroke} strokeDasharray="4,4" />
          <polygon points="100,40 70,80 100,70" fill={YEL} {...stroke} />
          <polygon points="100,40 130,80 100,70" fill={RED} {...stroke} />
        </g>
      );
    case "yubiuta":
      return (
        <g>
          <rect x="35" y="70" width="18" height="50" fill={RED} {...stroke} />
          <rect x="63" y="55" width="18" height="65" fill={YEL} {...stroke} />
          <rect x="91" y="80" width="18" height="40" fill={BLU} {...stroke} />
          <rect x="119" y="60" width="18" height="60" fill={GRN} {...stroke} />
          <rect x="147" y="75" width="18" height="45" fill={RED} {...stroke} />
          <path d="M30 40 Q 40 25 55 35 Q 65 45 80 30" {...stroke} fill="none" />
        </g>
      );
    case "maigo":
      return (
        <g>
          <path d="M30 30 H 90 V 60 H 60 V 90 H 120 V 30 H 170 V 120 H 30 Z" fill="none" {...stroke} strokeWidth="4" />
          <g transform="translate(40 100)">
            <ellipse cx="10" cy="12" rx="14" ry="9" fill={YEL} {...stroke} />
            <polygon points="0,5 4,0 6,8" fill={YEL} {...stroke} />
            <polygon points="20,5 16,0 14,8" fill={YEL} {...stroke} />
            <circle cx="6" cy="11" r="1.5" fill={INK} />
            <circle cx="14" cy="11" r="1.5" fill={INK} />
          </g>
          <path d="M155 110 L 170 90 L 175 115 Z" fill={RED} {...stroke} />
        </g>
      );
    default:
      return <circle cx="100" cy="75" r="30" fill={color} stroke={INK} strokeWidth="3" />;
  }
}
