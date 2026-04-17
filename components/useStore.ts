"use client";

import { useSyncExternalStore } from "react";
import { subscribe } from "@/lib/store";

const EMPTY = () => undefined;

export function useStoreTick(): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (typeof window === "undefined") return 0;
      const raw = window.localStorage.getItem("gf:__tick__");
      return raw ? Number(raw) : 0;
    },
    () => 0,
  );
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => EMPTY,
    () => true,
    () => false,
  );
}
