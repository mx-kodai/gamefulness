"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS, AgeBand, FACILITY_TYPES, FacilityType } from "@/lib/types";
import {
  addFacility,
  addUser,
  ensureSeed,
  getFacilities,
  setCurrentUserId,
  subscribe,
  uid,
} from "@/lib/store";
import { Facility } from "@/lib/types";

type Mode = "pick" | "new" | "none";

export default function SignupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("70s");
  const [mode, setMode] = useState<Mode>("pick");
  const [facilityId, setFacilityId] = useState<string>("");
  const [newFacName, setNewFacName] = useState("");
  const [newFacType, setNewFacType] = useState<FacilityType>("デイサービス");
  const [newFacLoc, setNewFacLoc] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureSeed();
    const sync = () => setFacilities(getFacilities());
    sync();
    return subscribe(sync);
  }, []);

  useEffect(() => {
    if (!facilityId && facilities.length > 0) {
      setFacilityId(facilities[0].id);
    }
  }, [facilities, facilityId]);

  const canSubmit = useMemo(() => {
    if (!nickname.trim()) return false;
    if (mode === "pick" && !facilityId) return false;
    if (mode === "new" && !newFacName.trim()) return false;
    return true;
  }, [nickname, mode, facilityId, newFacName]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      let assignedFacilityId: string | null = null;
      if (mode === "pick") assignedFacilityId = facilityId;
      else if (mode === "new") {
        const f: Facility = {
          id: uid("fac"),
          name: newFacName.trim(),
          type: newFacType,
          location: newFacLoc.trim(),
          createdAt: Date.now(),
        };
        addFacility(f);
        assignedFacilityId = f.id;
      }
      const userId = uid("usr");
      addUser({
        id: userId,
        nickname: nickname.trim(),
        ageBand,
        facilityId: assignedFacilityId,
        createdAt: Date.now(),
      });
      setCurrentUserId(userId);
      router.push("/me");
    } catch (e) {
      setErr("登録に失敗しました。もう一度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-[760px] px-5 py-10 md:px-8 md:py-16">
      <div className="font-label text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
        SIGN UP
      </div>
      <h1 className="mt-2 font-display text-[32px] font-black leading-tight md:text-[44px]">
        ユーザー登録
      </h1>
      <p className="mt-3 text-[14px] text-ink-soft md:text-[16px]">
        デモ版のため、データはブラウザに保存されます。登録もすべて無料、個人情報は集めません。
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field label="ニックネーム" hint="他のプレイヤーやランキングに表示されます">
          <input
            className="form-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例: たなかさん"
            maxLength={20}
            autoFocus
          />
        </Field>

        <Field label="年齢帯" hint="匿名で集計します">
          <select
            className="form-input"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as AgeBand)}
          >
            {AGE_BANDS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="所属" hint="施設に所属しない場合は「個人として参加」を選択">
          <div className="flex flex-wrap gap-2">
            <ChoiceBtn active={mode === "pick"} onClick={() => setMode("pick")}>
              既存の施設から選ぶ
            </ChoiceBtn>
            <ChoiceBtn active={mode === "new"} onClick={() => setMode("new")}>
              新しい施設を登録
            </ChoiceBtn>
            <ChoiceBtn active={mode === "none"} onClick={() => setMode("none")}>
              個人として参加
            </ChoiceBtn>
          </div>
          {mode === "pick" && (
            <select
              className="form-input mt-3"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ／ {f.type} ／ {f.location}
                </option>
              ))}
            </select>
          )}
          {mode === "new" && (
            <div className="mt-3 space-y-3 rounded-2xl border-2 border-ink bg-bg-ink p-4">
              <input
                className="form-input"
                placeholder="施設名"
                value={newFacName}
                onChange={(e) => setNewFacName(e.target.value)}
              />
              <select
                className="form-input"
                value={newFacType}
                onChange={(e) => setNewFacType(e.target.value as FacilityType)}
              >
                {FACILITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                className="form-input"
                placeholder="所在地（例: 東京都 新宿区）"
                value={newFacLoc}
                onChange={(e) => setNewFacLoc(e.target.value)}
              />
            </div>
          )}
        </Field>

        {err && <p className="text-[14px] text-red">{err}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn-lift rounded-full border-2 border-ink bg-ink px-8 py-3 font-display text-[17px] font-black text-bg ring-ink disabled:opacity-40 md:text-[19px]"
          >
            {submitting ? "登録中..." : "はじめる"}
          </button>
          <Link href="/" className="text-[14px] text-ink-soft hover:text-ink">
            あとでにする
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-display text-[15px] font-black md:text-[17px]">{label}</label>
      {hint && <p className="mt-0.5 text-[12px] text-ink-soft md:text-[13px]">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChoiceBtn({
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
      type="button"
      onClick={onClick}
      className={`btn-lift rounded-full border-2 border-ink px-4 py-2 font-display text-[13px] font-black md:px-5 md:py-2.5 md:text-[14px] ${
        active ? "bg-ink text-bg ring-ink-sm" : "bg-bg"
      }`}
    >
      {children}
    </button>
  );
}
