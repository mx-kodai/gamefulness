"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FacilityType, FACILITY_TYPES } from "@/lib/types";
import { addFacility, uid } from "@/lib/store";

export default function NewFacilityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<FacilityType>("デイサービス");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    addFacility({
      id: uid("fac"),
      name: name.trim(),
      type,
      location: location.trim(),
      createdAt: Date.now(),
    });
    router.push("/facilities");
  }

  return (
    <section className="mx-auto max-w-[760px] px-5 py-10 md:px-8 md:py-16">
      <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
        REGISTER A FACILITY
      </div>
      <h1 className="mt-2 font-display text-[32px] font-black leading-tight md:text-[44px]">
        施設を登録
      </h1>
      <p className="mt-3 text-[14px] text-ink-soft md:text-[16px]">
        デイサービス・特養・放課後デイ・リハ施設など、どんな施設でも登録できます。デモ版のためブラウザに保存されます。
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="font-display text-[15px] font-black md:text-[17px]">施設名</label>
          <input
            className="form-input mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: ひまわりデイサービス"
            maxLength={40}
            autoFocus
          />
        </div>
        <div>
          <label className="font-display text-[15px] font-black md:text-[17px]">種別</label>
          <select
            className="form-input mt-2"
            value={type}
            onChange={(e) => setType(e.target.value as FacilityType)}
          >
            {FACILITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-display text-[15px] font-black md:text-[17px]">所在地</label>
          <input
            className="form-input mt-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例: 東京都 世田谷区"
            maxLength={60}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="btn-lift rounded-full border-2 border-ink bg-ink px-8 py-3 font-display text-[16px] font-black text-bg ring-ink disabled:opacity-40 md:text-[18px]"
          >
            登録する
          </button>
          <Link href="/facilities" className="text-[14px] text-ink-soft hover:text-ink">
            キャンセル
          </Link>
        </div>
      </form>
    </section>
  );
}
