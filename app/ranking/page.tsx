"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ensureSeed,
  getCurrentUser,
  getFacilities,
  getScores,
  getUsers,
  subscribe,
} from "@/lib/store";
import { GAMES, GAME_BY_SLUG } from "@/lib/games";
import { Facility, ScoreEntry, User } from "@/lib/types";

type Tab = "global" | "facility" | "game";

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>("global");
  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [gameSlug, setGameSlug] = useState<string>("manekko");
  const [facilityId, setFacilityId] = useState<string>("");

  useEffect(() => {
    ensureSeed();
    const sync = () => {
      setUsers(getUsers());
      setFacilities(getFacilities());
      setScores(getScores());
      setMe(getCurrentUser());
    };
    sync();
    return subscribe(sync);
  }, []);

  useEffect(() => {
    if (!facilityId && facilities.length > 0) {
      setFacilityId(me?.facilityId ?? facilities[0].id);
    }
  }, [facilities, facilityId, me]);

  const playableGames = GAMES.filter((g) => g.status === "playable");

  const globalRank = useMemo(() => {
    return users
      .map((u) => {
        const s = scores.filter((x) => x.userId === u.id);
        return {
          user: u,
          facility: facilities.find((f) => f.id === u.facilityId) ?? null,
          plays: s.length,
          total: s.reduce((a, b) => a + b.score, 0),
          best: s.reduce((m, x) => Math.max(m, x.level), 0),
        };
      })
      .filter((r) => r.plays > 0)
      .sort((a, b) => b.total - a.total);
  }, [users, scores, facilities]);

  const facilityRank = useMemo(() => {
    return facilities
      .map((f) => {
        const members = users.filter((u) => u.facilityId === f.id);
        const memberIds = new Set(members.map((m) => m.id));
        const plays = scores.filter((s) => memberIds.has(s.userId));
        return {
          facility: f,
          members: members.length,
          plays: plays.length,
          total: plays.reduce((a, b) => a + b.score, 0),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [facilities, users, scores]);

  const gameRank = useMemo(() => {
    const filtered = scores.filter((s) => s.gameSlug === gameSlug);
    const byUser = new Map<string, number>();
    for (const s of filtered) {
      byUser.set(s.userId, Math.max(byUser.get(s.userId) ?? 0, s.level));
    }
    return [...byUser.entries()]
      .map(([userId, best]) => {
        const u = users.find((x) => x.id === userId);
        if (!u) return null;
        return {
          user: u,
          facility: facilities.find((f) => f.id === u.facilityId) ?? null,
          best,
        };
      })
      .filter((x): x is { user: User; facility: Facility | null; best: number } => x !== null)
      .sort((a, b) => b.best - a.best);
  }, [scores, gameSlug, users, facilities]);

  const currentFacilityRank = useMemo(() => {
    if (!facilityId) return [];
    const members = users.filter((u) => u.facilityId === facilityId);
    return members
      .map((u) => {
        const s = scores.filter((x) => x.userId === u.id);
        return {
          user: u,
          plays: s.length,
          total: s.reduce((a, b) => a + b.score, 0),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [facilityId, users, scores]);

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-16">
      <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
        LEADERBOARD
      </div>
      <h1 className="mt-2 font-display text-[32px] font-black tracking-tight md:text-[48px]">
        ランキング
      </h1>
      <p className="mt-2 max-w-xl text-[14px] text-ink-soft md:text-[16px]">
        他のユーザーや施設と、記録をゆるくくらべっこ。無理せず、今日の一歩の分だけ。
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <TabBtn active={tab === "global"} onClick={() => setTab("global")}>
          全体
        </TabBtn>
        <TabBtn active={tab === "facility"} onClick={() => setTab("facility")}>
          施設別
        </TabBtn>
        <TabBtn active={tab === "game"} onClick={() => setTab("game")}>
          ゲーム別
        </TabBtn>
      </div>

      {tab === "global" && (
        <div className="mt-6 space-y-2">
          {globalRank.map((r, i) => (
            <RankRow
              key={r.user.id}
              rank={i + 1}
              title={r.user.nickname}
              subtitle={`${r.facility?.name ?? "個人参加"} ・ ${r.plays}プレイ`}
              value={`${r.total}`}
              isMe={r.user.id === me?.id}
            />
          ))}
        </div>
      )}

      {tab === "facility" && (
        <>
          <div className="mt-6 space-y-2">
            {facilityRank.map((r, i) => (
              <RankRow
                key={r.facility.id}
                rank={i + 1}
                title={r.facility.name}
                subtitle={`${r.facility.type} ・ ${r.facility.location} ・ ${r.members}人`}
                value={`${r.total}`}
              />
            ))}
          </div>

          <div className="mt-10">
            <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
              WITHIN FACILITY
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-[22px] font-black md:text-[28px]">施設内ランキング</h2>
              <select
                className="form-input max-w-sm"
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 space-y-2">
              {currentFacilityRank.map((r, i) => (
                <RankRow
                  key={r.user.id}
                  rank={i + 1}
                  title={r.user.nickname}
                  subtitle={`${r.plays}プレイ`}
                  value={`${r.total}`}
                  isMe={r.user.id === me?.id}
                />
              ))}
              {currentFacilityRank.length === 0 && (
                <p className="text-[14px] text-ink-soft">この施設にはまだメンバーがいません。</p>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "game" && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {playableGames.map((g) => (
              <button
                key={g.slug}
                onClick={() => setGameSlug(g.slug)}
                className={`btn-lift rounded-full border-2 border-ink px-4 py-2 font-display text-[13px] font-black md:px-5 md:py-2.5 md:text-[14px] ${
                  gameSlug === g.slug ? "bg-ink text-bg ring-ink-sm" : "bg-bg"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            {gameRank.map((r, i) => (
              <RankRow
                key={r.user.id}
                rank={i + 1}
                title={r.user.nickname}
                subtitle={`${r.facility?.name ?? "個人参加"}`}
                value={`Lv.${r.best}`}
                isMe={r.user.id === me?.id}
              />
            ))}
            {gameRank.length === 0 && (
              <p className="text-[14px] text-ink-soft">
                {GAME_BY_SLUG[gameSlug]?.title} の記録はまだありません。
              </p>
            )}
          </div>
        </>
      )}

      {!me && (
        <div className="mt-10 rounded-2xl border-2 border-ink bg-bg-ink px-5 py-4 text-[13px] md:text-[15px]">
          まだユーザー登録されていません。
          <Link href="/signup" className="ml-2 underline">
            登録してランキングに参加する
          </Link>
        </div>
      )}
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-lift rounded-full border-2 border-ink px-5 py-2.5 font-display text-[14px] font-black md:px-6 md:py-3 md:text-[15px] ${
        active ? "bg-ink text-bg ring-ink-sm" : "bg-bg"
      }`}
    >
      {children}
    </button>
  );
}

function RankRow({
  rank,
  title,
  subtitle,
  value,
  isMe,
}: {
  rank: number;
  title: string;
  subtitle: string;
  value: string;
  isMe?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border-2 border-ink px-3 py-2.5 md:px-5 md:py-3 ${
        isMe ? "bg-yellow ring-ink" : "bg-bg"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-ink font-display text-[15px] font-black ${
          rank === 1
            ? "bg-yellow"
            : rank === 2
              ? "bg-bg-ink"
              : rank === 3
                ? "bg-red text-bg"
                : "bg-bg"
        } ${isMe ? "bg-bg" : ""}`}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] font-black md:text-[17px]">{title}</div>
        <div className="truncate text-[11px] text-ink-soft md:text-[12px]">{subtitle}</div>
      </div>
      <div className="font-display text-[18px] font-black md:text-[22px]">{value}</div>
    </div>
  );
}
