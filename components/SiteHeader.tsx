"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, subscribe, signOut } from "@/lib/store";
import { User } from "@/lib/types";

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setUser(getCurrentUser());
    sync();
    const unsub = subscribe(sync);
    return unsub;
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 md:gap-5 md:px-8 md:py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <div className="leading-tight">
            <div className="font-display text-[20px] font-black tracking-tight md:text-[24px]">
              ゲームフルネス
            </div>
            <div className="font-label text-[9px] font-medium uppercase tracking-[0.25em] text-ink-soft md:text-[10px]">
              GAMEFULNESS
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <NavLink href="/#games">あそぶ</NavLink>
          <NavLink href="/ranking">ランキング</NavLink>
          <NavLink href="/facilities">施設</NavLink>
          <NavLink href="/about">コンセプト</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {mounted && user ? (
            <>
              <Link
                href="/me"
                className="hidden items-center gap-2 rounded-full border-2 border-ink bg-bg px-3 py-1.5 text-[13px] font-bold md:flex md:px-4 md:py-2 md:text-[14px]"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-green" />
                {user.nickname}
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden text-[12px] text-ink-soft hover:text-ink md:block"
                aria-label="サインアウト"
              >
                切替
              </button>
              <Link
                href="/me"
                className="rounded-full border-2 border-ink bg-bg px-3 py-1.5 text-[12px] font-bold md:hidden"
              >
                マイ
              </Link>
            </>
          ) : (
            <Link
              href="/signup"
              className="btn-lift rounded-full border-2 border-ink bg-ink px-4 py-2 text-[13px] font-black text-bg ring-ink-sm md:px-5 md:py-2.5 md:text-[14px]"
            >
              はじめる →
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-ink/15 bg-bg md:hidden">
        <div className="mx-auto flex max-w-[1280px] justify-between px-3 py-1 text-[12px] font-bold">
          <MobileNav href="/#games">あそぶ</MobileNav>
          <MobileNav href="/ranking">ランキング</MobileNav>
          <MobileNav href="/facilities">施設</MobileNav>
          <MobileNav href="/about">コンセプト</MobileNav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-display text-[14px] font-bold hover:text-red md:text-[15px]">
      {children}
    </Link>
  );
}

function MobileNav({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-2 py-2">
      {children}
    </Link>
  );
}

function LogoMark() {
  return (
    <div className="relative h-9 w-9 md:h-11 md:w-11">
      <div className="absolute inset-0 rounded-2xl border-2 border-ink bg-bg-ink" />
      <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-sm bg-red md:h-3.5 md:w-3.5" />
      <div className="absolute right-1.5 top-1.5 h-3 w-3 rounded-sm bg-yellow md:h-3.5 md:w-3.5" />
      <div className="absolute bottom-1.5 left-1.5 h-3 w-3 rounded-sm bg-blue md:h-3.5 md:w-3.5" />
      <div className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-sm bg-green md:h-3.5 md:w-3.5" />
    </div>
  );
}
