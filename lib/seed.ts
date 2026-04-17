import { AgeBand, Facility, ScoreEntry, User } from "./types";
import { GAMES } from "./games";

type SeedSink = {
  saveUsers: (us: User[]) => void;
  saveFacilities: (fs: Facility[]) => void;
  saveScores: (ss: ScoreEntry[]) => void;
};

const FAC_SEED: Array<Pick<Facility, "name" | "type" | "location">> = [
  { name: "ひだまりデイサービス", type: "デイサービス", location: "東京都 世田谷区" },
  { name: "あおぞら特別養護", type: "特別養護老人ホーム", location: "神奈川県 横浜市" },
  { name: "富士見リハ病院", type: "リハ病院", location: "静岡県 三島市" },
  { name: "こがねサ高住", type: "サ高住", location: "大阪府 堺市" },
  { name: "つばさ放課後デイ", type: "放課後デイ", location: "愛知県 名古屋市" },
  { name: "北の海デイ", type: "デイサービス", location: "北海道 札幌市" },
];

const NICKS = [
  "たけしさん", "みちこさん", "はるおさん", "のりこさん", "ゆきちゃん",
  "まさる", "けいこさん", "よしえさん", "あきらさん", "さちえさん",
  "まことさん", "みねこさん", "ひろみさん", "たえさん", "とおるさん",
  "なおや", "いずみさん", "ゆうじさん", "みおちゃん", "しんちゃん",
  "かよこさん", "さとし", "あやか", "まもるさん",
];

const AGE_POOL: AgeBand[] = [
  "70s", "70s", "80+", "70s", "~19",
  "60s", "70s", "80+", "80+", "70s",
  "60s", "80+", "70s", "80+", "60s",
  "20s", "70s", "80+", "~19", "~19",
  "80+", "50s", "20s", "60s",
];

function rand<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}
function ri(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function seedIfNeeded(sink: SeedSink) {
  const now = Date.now();
  const facilities: Facility[] = FAC_SEED.map((f, i) => ({
    ...f,
    id: `fac_seed_${i}`,
    createdAt: now - (90 - i * 4) * 86400_000,
    isSeed: true,
  }));

  const users: User[] = NICKS.map((n, i) => {
    let facIdx = i % facilities.length;
    // 児童系施設に若年ユーザーを寄せる
    if (AGE_POOL[i] === "~19" || AGE_POOL[i] === "20s") {
      facIdx = 4; // つばさ放課後デイ
    }
    return {
      id: `usr_seed_${i}`,
      nickname: n,
      ageBand: AGE_POOL[i] ?? "70s",
      facilityId: facilities[facIdx].id,
      createdAt: now - ri(1, 80) * 86400_000,
      isSeed: true,
    };
  });

  const playable = GAMES.map((g) => g.slug);
  const scores: ScoreEntry[] = [];
  for (const u of users) {
    const count = ri(4, 28);
    for (let i = 0; i < count; i++) {
      const slug = rand(playable);
      const level =
        slug === "manekko"
          ? ri(2, 13)
          : slug === "kazerin"
            ? ri(1, 10)
            : slug === "sorami"
              ? ri(3, 15)
              : ri(1, 8);
      scores.push({
        id: `sc_${u.id}_${i}`,
        userId: u.id,
        gameSlug: slug,
        level,
        score: level * 10,
        playedAt: now - ri(0, 40) * 86400_000 - ri(0, 86400_000),
      });
    }
  }

  sink.saveUsers(users);
  sink.saveFacilities(facilities);
  sink.saveScores(scores);
}
