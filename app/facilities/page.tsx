"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ensureSeed, getFacilities, getUsers, getScores, subscribe } from "@/lib/store";
import { Facility, ScoreEntry, User } from "@/lib/types";

type FacilityStat = {
  facility: Facility;
  memberCount: number;
  plays: number;
  score: number;
};

export default function FacilitiesPage() {
  const [stats, setStats] = useState<FacilityStat[]>([]);
  const [solo, setSolo] = useState<{ users: number; plays: number }>({ users: 0, plays: 0 });

  useEffect(() => {
    ensureSeed();
    const sync = () => {
      const fs = getFacilities();
      const us = getUsers();
      const sc = getScores();
      const rows: FacilityStat[] = fs
        .map((f) => {
          const members = us.filter((u) => u.facilityId === f.id);
          const memberIds = new Set(members.map((m) => m.id));
          const plays = sc.filter((s) => memberIds.has(s.userId));
          return {
            facility: f,
            memberCount: members.length,
            plays: plays.length,
            score: plays.reduce((a, b) => a + b.score, 0),
          };
        })
        .sort((a, b) => b.score - a.score);
      setStats(rows);
      const independents = us.filter((u) => !u.facilityId);
      const indIds = new Set(independents.map((u) => u.id));
      setSolo({
        users: independents.length,
        plays: sc.filter((s) => indIds.has(s.userId)).length,
      });
    };
    sync();
    return subscribe(sync);
  }, []);

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
            FACILITIES
          </div>
          <h1 className="mt-2 font-display text-[32px] font-black tracking-tight md:text-[44px]">
            施設一覧
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-soft md:text-[16px]">
            ゲームフルネスを導入している施設です。施設ごとにランキング・アワード・メンバーの記録が見られます。
          </p>
        </div>
        <Link
          href="/facilities/new"
          className="btn-lift rounded-full border-2 border-ink bg-yellow px-6 py-3 font-display text-[15px] font-black ring-ink-sm md:text-[17px]"
        >
          施設を登録する →
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
        {stats.map((s, i) => (
          <FacilityCard key={s.facility.id} stat={s} rank={i + 1} />
        ))}
      </div>

      <div className="mt-8 rounded-[20px] border-2 border-ink bg-bg-ink px-5 py-4 text-[13px] md:text-[14px]">
        <span className="font-bold">個人参加:</span> {solo.users}人 ・ {solo.plays}プレイ
      </div>
    </section>
  );
}

function FacilityCard({ stat, rank }: { stat: FacilityStat; rank: number }) {
  const { facility, memberCount, plays, score } = stat;
  return (
    <article className="relative overflow-hidden rounded-[24px] border-2 border-ink bg-bg p-5 ring-ink md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft">
            #{rank} / {facility.type}
          </div>
          <h3 className="mt-1 truncate font-display text-[22px] font-black md:text-[28px]">
            {facility.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-ink-soft md:text-[13px]">{facility.location}</p>
        </div>
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 border-ink bg-bg-ink font-display text-[18px] font-black md:h-14 md:w-14 md:text-[22px]">
          {rank}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="メンバー" value={`${memberCount}人`} />
        <Stat label="プレイ数" value={`${plays}`} />
        <Stat label="合計スコア" value={`${score}`} />
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-bg-ink px-3 py-2">
      <div className="font-label text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </div>
      <div className="font-display text-[16px] font-black md:text-[20px]">{value}</div>
    </div>
  );
}
