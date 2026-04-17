"use client";

import { Facility, ScoreEntry, User } from "./types";
import { seedIfNeeded } from "./seed";

const K = {
  CURRENT: "gf:currentUserId",
  USERS: "gf:users",
  FACILITIES: "gf:facilities",
  SCORES: "gf:scores",
  SEEDED: "gf:seeded/v1",
};

const CHANGE_EVT = "gf:store-change";

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(k);
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function write(k: string, v: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new Event(CHANGE_EVT));
}

export function uid(prefix: string) {
  const s =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${s}`;
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (read(K.SEEDED, false)) return;
  seedIfNeeded({
    saveUsers: (us) => window.localStorage.setItem(K.USERS, JSON.stringify(us)),
    saveFacilities: (fs) => window.localStorage.setItem(K.FACILITIES, JSON.stringify(fs)),
    saveScores: (ss) => window.localStorage.setItem(K.SCORES, JSON.stringify(ss)),
  });
  window.localStorage.setItem(K.SEEDED, JSON.stringify(true));
  window.dispatchEvent(new Event(CHANGE_EVT));
}

export function subscribe(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(CHANGE_EVT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(CHANGE_EVT, h);
    window.removeEventListener("storage", h);
  };
}

export function getUsers(): User[] {
  return read<User[]>(K.USERS, []);
}
export function saveUsers(us: User[]) {
  write(K.USERS, us);
}
export function addUser(u: User) {
  const us = getUsers();
  us.push(u);
  saveUsers(us);
}
export function updateUser(u: User) {
  saveUsers(getUsers().map((x) => (x.id === u.id ? u : x)));
}
export function getUser(id: string | null | undefined): User | null {
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function getFacilities(): Facility[] {
  return read<Facility[]>(K.FACILITIES, []);
}
export function addFacility(f: Facility) {
  const fs = getFacilities();
  fs.push(f);
  write(K.FACILITIES, fs);
}
export function getFacility(id: string | null | undefined): Facility | null {
  if (!id) return null;
  return getFacilities().find((f) => f.id === id) ?? null;
}

export function getScores(): ScoreEntry[] {
  return read<ScoreEntry[]>(K.SCORES, []);
}
export function addScore(s: ScoreEntry) {
  const ss = getScores();
  ss.push(s);
  write(K.SCORES, ss);
}

export function getCurrentUserId(): string | null {
  return read<string | null>(K.CURRENT, null);
}
export function setCurrentUserId(id: string | null) {
  write(K.CURRENT, id);
}
export function getCurrentUser(): User | null {
  return getUser(getCurrentUserId());
}

export function signOut() {
  setCurrentUserId(null);
}

export function resetAll() {
  if (typeof window === "undefined") return;
  [K.CURRENT, K.USERS, K.FACILITIES, K.SCORES, K.SEEDED].forEach((k) =>
    window.localStorage.removeItem(k),
  );
  window.dispatchEvent(new Event(CHANGE_EVT));
}
