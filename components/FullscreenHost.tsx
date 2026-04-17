"use client";

import { useCallback, useEffect, useState } from "react";

export function enterFs() {
  if (typeof document === "undefined") return;
  if (document.fullscreenElement) return;
  try {
    document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  } catch {
    // fullscreen denied or not supported
  }
}

export function exitFs() {
  if (typeof document === "undefined") return;
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

type Props = {
  children: React.ReactNode;
  label?: string;
  className?: string;
};

export default function FullscreenHost({ children, label = "全画面", className = "" }: Props) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const handler = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) exitFs();
    else enterFs();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggle}
        className="btn-lift absolute right-3 top-3 z-30 rounded-full border-2 border-ink bg-bg px-3 py-1.5 font-display text-[11px] font-black ring-ink-sm md:right-4 md:top-4 md:text-[12px]"
        aria-label={isFs ? "全画面を解除" : "全画面で遊ぶ"}
        type="button"
      >
        {isFs ? "✕ もどす" : `⛶ ${label}`}
      </button>
      {children}
    </div>
  );
}
