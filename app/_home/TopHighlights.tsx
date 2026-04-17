"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getScores, getUsers, getFacilities, subscribe } from "@/lib/store";
import { ScoreEntry, User, Facility } from "@/lib/types";
import { GAME_BY_SLUG } from "@/lib/games";

type Row = { user: User; facility: Facility | null; total: number; plays: number };

export default function TopHighlights() {
  const [rows, setRows] = useState<Row[]>([]);
  const [recent, setRecent] = useState<ScoreEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const calc = () => {
      const us = getUsers();
      const fs = getFacilities();
      const sc = getScores();
      setUsers(us);
      const byUser = us.map((u) => {
        const mine = sc.filter((s) => s.userId === u.id);
        const total = mine.reduce((a, b) => a + b.score, 0);
        return {
          user: u,
          facility: fs.find((f) => f.id === u.facilityId) ?? null,
          total,
          plays: mine.length,
        } as Row;
      });
      byUser.sort((a, b) => b.total - a.total);
      setRows(byUser.slice(0, 5));
      const rs = [...sc].sort((a, b) => b.playedAt - a.playedAt).slice(0, 6);
      setRecent(rs);
    };
    calc();
    return subscribe(calc);
  }, []);

  if (rows.length === 0) return null;

  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[24px] border-2 border-ink bg-bg-ink p-5 ring-ink md:p-7">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
              02 / LEADERBOARD
            </div>
            <h3 className="mt-1 font-display text-[22px] font-black md:text-[28px]">
              今日のトップ
            </h3>
          </div>
          <Link
            href="/ranking"
            className="rounded-full border-2 border-ink bg-bg px-3.5 py-1.5 text-[12px] font-bold ring-ink-sm md:text-[13px]"
          >
            全ランキング →
          </Link>
        </div>
        <ol className="mt-5 space-y-2">
          {rows.map((r, i) => (
            <li
              key={r.user.id}
              className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-bg px-3 py-2.5 md:px-4 md:py-3"
            >
              <div
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-ink font-display text-[14px] font-black ${
                  i === 0
                    ? "bg-yellow"
                    : i === 1
                      ? "bg-bg-ink"
                      : i === 2
                        ? "bg-red text-bg"
                        : "bg-bg"
                }`}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[14px] font-black md:text-[16px]">
                  {r.user.nickname}
                </div>
                <div className="truncate text-[11px] text-ink-soft md:text-[12px]">
                  {r.facility?.name ?? "個人参加"} ・ {r.plays}プレイ
                </div>
              </div>
              <div className="font-display text-[16px] font-black md:text-[20px]">{r.total}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-[24px] border-2 border-ink bg-bg-ink p-5 ring-ink md:p-7">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
              03 / RECENT
            </div>
            <h3 className="mt-1 font-display text-[22px] font-black md:text-[28px]">
              最近のあそび
            </h3>
          </div>
        </div>
        <ul className="mt-5 space-y-2">
          {recent.map((s) => {
            const u = users.find((x) => x.id === s.userId);
            const g = GAME_BY_SLUG[s.gameSlug];
            if (!u || !g) return null;
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-bg px-3 py-2 md:px-4 md:py-2.5"
              >
                <div className={`h-3 w-3 flex-none rounded-full border-2 border-ink ${DOT[g.color]}`} />
                <div className="min-w-0 flex-1 text-[13px] md:text-[14px]">
                  <span className="font-bold">{u.nickname}</span>
                  <span className="text-ink-soft"> が {g.title} で </span>
                  <span className="font-bold">レベル{s.level}</span>
                </div>
                <div className="text-[11px] text-ink-soft md:text-[12px]">
                  {relTime(s.playedAt)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const DOT = {
  red: "bg-red",
  yellow: "bg-yellow",
  blue: "bg-blue",
  green: "bg-green",
} as const;

function relTime(ts: number) {
  const diff = Date.now() - ts;
  const hours = Math.round(diff / 3_600_000);
  if (hours < 1) return "さっき";
  if (hours < 24) return `${hours}時間前`;
  const days = Math.round(diff / 86_400_000);
  return `${days}日前`;
}
