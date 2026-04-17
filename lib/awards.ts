import { ScoreEntry, User, Facility } from "./types";

export type AwardIcon =
  | "sparkle"
  | "flame"
  | "leaf"
  | "crown"
  | "heart"
  | "bolt"
  | "shield"
  | "star"
  | "moon";

export type Award = {
  id: string;
  title: string;
  description: string;
  icon: AwardIcon;
  color: "red" | "yellow" | "blue" | "green" | "ink";
  check: (ctx: AwardContext) => boolean;
};

export type AwardContext = {
  user: User;
  myScores: ScoreEntry[];
  allScores: ScoreEntry[];
  allUsers: User[];
  facility: Facility | null;
};

function uniqueGames(scores: ScoreEntry[]) {
  return new Set(scores.map((s) => s.gameSlug)).size;
}

function consecutiveDays(scores: ScoreEntry[]) {
  if (scores.length === 0) return 0;
  const days = new Set(
    scores.map((s) => {
      const d = new Date(s.playedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );
  const sorted = [...days]
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => b - a);
  let run = 1;
  let best = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round((sorted[i - 1] - sorted[i]) / 86400_000);
    if (diff === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function bestLevel(scores: ScoreEntry[], slug: string) {
  return scores.filter((s) => s.gameSlug === slug).reduce((m, s) => Math.max(m, s.level), 0);
}

function totalScore(scores: ScoreEntry[]) {
  return scores.reduce((a, b) => a + b.score, 0);
}

function facilityRank(user: User, allScores: ScoreEntry[], allUsers: User[]) {
  if (!user.facilityId) return Infinity;
  const mates = allUsers.filter((u) => u.facilityId === user.facilityId);
  const leaderboard = mates
    .map((u) => ({ id: u.id, total: totalScore(allScores.filter((s) => s.userId === u.id)) }))
    .sort((a, b) => b.total - a.total);
  const idx = leaderboard.findIndex((x) => x.id === user.id);
  return idx === -1 ? Infinity : idx + 1;
}

function globalRank(user: User, allScores: ScoreEntry[], allUsers: User[]) {
  const lb = allUsers
    .map((u) => ({ id: u.id, total: totalScore(allScores.filter((s) => s.userId === u.id)) }))
    .sort((a, b) => b.total - a.total);
  const idx = lb.findIndex((x) => x.id === user.id);
  return idx === -1 ? Infinity : idx + 1;
}

export const AWARDS: Award[] = [
  {
    id: "welcome",
    title: "ようこそ",
    description: "ゲームフルネスに参加しました。",
    icon: "sparkle",
    color: "yellow",
    check: ({ user }) => !!user,
  },
  {
    id: "first-step",
    title: "はじめの一歩",
    description: "最初のひとあそびを終えました。",
    icon: "leaf",
    color: "green",
    check: ({ myScores }) => myScores.length >= 1,
  },
  {
    id: "play-5",
    title: "5あそび",
    description: "累計5プレイを達成。",
    icon: "star",
    color: "yellow",
    check: ({ myScores }) => myScores.length >= 5,
  },
  {
    id: "play-20",
    title: "20あそび",
    description: "累計20プレイ。あそびが習慣に。",
    icon: "flame",
    color: "red",
    check: ({ myScores }) => myScores.length >= 20,
  },
  {
    id: "play-50",
    title: "50あそび",
    description: "累計50プレイの達人。",
    icon: "crown",
    color: "red",
    check: ({ myScores }) => myScores.length >= 50,
  },
  {
    id: "manekko-5",
    title: "まねっこ レベル5",
    description: "まねっこでレベル5まで到達。",
    icon: "bolt",
    color: "red",
    check: ({ myScores }) => bestLevel(myScores, "manekko") >= 5,
  },
  {
    id: "manekko-10",
    title: "まねっこ名人",
    description: "まねっこでレベル10を突破。",
    icon: "crown",
    color: "red",
    check: ({ myScores }) => bestLevel(myScores, "manekko") >= 10,
  },
  {
    id: "variety-3",
    title: "3色のあそび",
    description: "3種類以上のあそびを体験。",
    icon: "heart",
    color: "blue",
    check: ({ myScores }) => uniqueGames(myScores) >= 3,
  },
  {
    id: "variety-5",
    title: "遊びの探検家",
    description: "5種類以上のあそびを体験。",
    icon: "shield",
    color: "green",
    check: ({ myScores }) => uniqueGames(myScores) >= 5,
  },
  {
    id: "daily-3",
    title: "3日つづいた",
    description: "3日連続であそびました。",
    icon: "moon",
    color: "blue",
    check: ({ myScores }) => consecutiveDays(myScores) >= 3,
  },
  {
    id: "daily-7",
    title: "1週間つづいた",
    description: "7日連続であそびました。",
    icon: "moon",
    color: "blue",
    check: ({ myScores }) => consecutiveDays(myScores) >= 7,
  },
  {
    id: "facility-top",
    title: "施設のかお",
    description: "施設内ランキング1位。",
    icon: "crown",
    color: "yellow",
    check: ({ user, allScores, allUsers }) => facilityRank(user, allScores, allUsers) === 1,
  },
  {
    id: "national-top10",
    title: "全国トップ10",
    description: "全体ランキング10位以内。",
    icon: "crown",
    color: "red",
    check: ({ user, allScores, allUsers }) => globalRank(user, allScores, allUsers) <= 10,
  },
];

export const TITLES = [
  { threshold: 0, name: "あそび見習い", hue: "ink" },
  { threshold: 3, name: "あそびなじみ", hue: "green" },
  { threshold: 10, name: "あそび常連", hue: "blue" },
  { threshold: 25, name: "あそび名人", hue: "yellow" },
  { threshold: 60, name: "あそびマスター", hue: "red" },
  { threshold: 120, name: "ウェルネス伝道師", hue: "ink" },
] as const;

export function titleFor(playCount: number) {
  let t: (typeof TITLES)[number] = TITLES[0];
  for (const x of TITLES) if (playCount >= x.threshold) t = x;
  return t;
}

export function evaluateAwards(ctx: AwardContext): Award[] {
  return AWARDS.filter((a) => a.check(ctx));
}
