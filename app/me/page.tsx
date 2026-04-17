"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ensureSeed,
  getCurrentUser,
  getFacility,
  getScores,
  getUsers,
  resetAll,
  signOut,
  subscribe,
} from "@/lib/store";
import { GAME_BY_SLUG } from "@/lib/games";
import { AWARDS, evaluateAwards, titleFor } from "@/lib/awards";
import { Facility, ScoreEntry, User } from "@/lib/types";
import AwardBadge from "@/components/AwardBadge";

export default function MePage() {
  const [user, setUser] = useState<User | null>(null);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [myScores, setMyScores] = useState<ScoreEntry[]>([]);
  const [allScores, setAllScores] = useState<ScoreEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ensureSeed();
    setMounted(true);
    const sync = () => {
      const u = getCurrentUser();
      setUser(u);
      setFacility(getFacility(u?.facilityId));
      const sc = getScores();
      setAllScores(sc);
      setAllUsers(getUsers());
      setMyScores(u ? sc.filter((s) => s.userId === u.id) : []);
    };
    sync();
    return subscribe(sync);
  }, []);

  if (!mounted) return null;

  if (!user) {
    return (
      <section className="mx-auto max-w-[760px] px-5 py-16 text-center md:px-8 md:py-24">
        <h1 className="font-display text-[28px] font-black md:text-[40px]">
          まだユーザー登録されていません
        </h1>
        <p className="mt-3 text-[14px] text-ink-soft md:text-[16px]">
          アワードや記録を貯めるには、ニックネームの登録が必要です。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="btn-lift rounded-full border-2 border-ink bg-ink px-7 py-3 font-display text-[16px] font-black text-bg ring-ink md:text-[18px]"
          >
            ユーザー登録へ
          </Link>
          <Link
            href="/"
            className="btn-lift rounded-full border-2 border-ink bg-bg px-7 py-3 font-display text-[16px] font-black ring-ink-sm md:text-[18px]"
          >
            トップへ
          </Link>
        </div>
      </section>
    );
  }

  const title = titleFor(myScores.length);
  const awardsUnlocked = evaluateAwards({
    user,
    myScores,
    allScores,
    allUsers,
    facility,
  });
  const unlockedIds = new Set(awardsUnlocked.map((a) => a.id));

  const bestByGame = Object.entries(GAME_BY_SLUG)
    .map(([slug, g]) => {
      const best = myScores
        .filter((s) => s.gameSlug === slug)
        .reduce((m, s) => Math.max(m, s.level), 0);
      const plays = myScores.filter((s) => s.gameSlug === slug).length;
      return { slug, title: g.title, color: g.color, best, plays };
    })
    .filter((x) => x.plays > 0)
    .sort((a, b) => b.best - a.best);

  const recent = [...myScores].sort((a, b) => b.playedAt - a.playedAt).slice(0, 12);

  return (
    <>
      <section className="border-b-2 border-ink bg-bg-ink">
        <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-16">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
                MY PAGE
              </div>
              <h1 className="mt-2 truncate font-display text-[32px] font-black md:text-[48px]">
                {user.nickname}
              </h1>
              <p className="mt-1 text-[14px] text-ink-soft md:text-[16px]">
                {facility ? `${facility.name} ・ ${facility.type}` : "個人として参加"}
              </p>
            </div>
            <div className="rounded-[24px] border-2 border-ink bg-bg px-5 py-4 ring-ink md:px-6 md:py-5">
              <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
                CURRENT TITLE
              </div>
              <div className="mt-1 font-display text-[22px] font-black md:text-[28px]">
                {title.name}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-5">
            <Kpi label="プレイ数" value={`${myScores.length}`} />
            <Kpi label="アワード" value={`${awardsUnlocked.length} / ${AWARDS.length}`} />
            <Kpi
              label="合計スコア"
              value={`${myScores.reduce((a, b) => a + b.score, 0)}`}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/ranking"
              className="btn-lift rounded-full border-2 border-ink bg-bg px-5 py-2 text-[13px] font-bold ring-ink-sm md:text-[14px]"
            >
              ランキングを見る
            </Link>
            <button
              onClick={() => signOut()}
              className="text-[13px] text-ink-soft hover:text-ink"
            >
              別のユーザーに切替
            </button>
            <button
              onClick={() => {
                if (confirm("本当にデモデータを全て初期化しますか？")) resetAll();
              }}
              className="text-[12px] text-ink-soft hover:text-red"
            >
              （デモをリセット）
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-16">
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          ACHIEVEMENTS
        </div>
        <h2 className="mt-2 font-display text-[26px] font-black md:text-[36px]">
          アワード
        </h2>
        <p className="mt-2 text-[13px] text-ink-soft md:text-[14px]">
          プレイすることで少しずつ開放されます。あなたの今日の一歩が、次のアワードになります。
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
          {AWARDS.map((a) => (
            <AwardBadge key={a.id} award={a} unlocked={unlockedIds.has(a.id)} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-16">
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          BEST BY GAME
        </div>
        <h2 className="mt-2 font-display text-[26px] font-black md:text-[36px]">
          ゲーム別のベスト
        </h2>
        {bestByGame.length === 0 ? (
          <p className="mt-4 text-[14px] text-ink-soft">まだ記録がありません。1本あそんでみましょう。</p>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 md:gap-5">
            {bestByGame.map((g) => (
              <Link
                key={g.slug}
                href={`/play/${g.slug}`}
                className="btn-lift flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-bg px-5 py-3 ring-ink-sm md:px-6 md:py-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3.5 w-3.5 rounded-full border-2 border-ink ${DOT[g.color]}`} />
                  <div>
                    <div className="font-display text-[15px] font-black md:text-[18px]">
                      {g.title}
                    </div>
                    <div className="text-[11px] text-ink-soft md:text-[12px]">
                      {g.plays} プレイ
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-label text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                    BEST
                  </div>
                  <div className="font-display text-[20px] font-black md:text-[26px]">
                    Lv.{g.best}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-16">
        <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          PLAY LOG
        </div>
        <h2 className="mt-2 font-display text-[26px] font-black md:text-[36px]">
          最近のあそび
        </h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-[14px] text-ink-soft">まだ記録がありません。</p>
        ) : (
          <ul className="mt-6 divide-y-2 divide-ink/10 rounded-2xl border-2 border-ink bg-bg">
            {recent.map((s) => {
              const g = GAME_BY_SLUG[s.gameSlug];
              if (!g) return null;
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4">
                  <div className={`h-3 w-3 rounded-full border-2 border-ink ${DOT[g.color]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[14px] font-black md:text-[15px]">
                      {g.title}
                    </div>
                    <div className="text-[11px] text-ink-soft md:text-[12px]">
                      {new Date(s.playedAt).toLocaleString("ja-JP")}
                    </div>
                  </div>
                  <div className="font-display text-[16px] font-black md:text-[18px]">
                    Lv.{s.level}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

const DOT = {
  red: "bg-red",
  yellow: "bg-yellow",
  blue: "bg-blue",
  green: "bg-green",
} as const;

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-bg px-4 py-3 ring-ink-sm md:px-5 md:py-4">
      <div className="font-label text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </div>
      <div className="font-display text-[22px] font-black md:text-[30px]">{value}</div>
    </div>
  );
}
