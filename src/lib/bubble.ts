"use client";

import { useSyncExternalStore } from "react";

// Reading history lives only in this browser. Each entry is one article the
// reader opened at its source, or one story they opened on Verso.

export type ReadEntry = { kind: "article" | "story"; id: string; outlet?: string; bias: number; at: number };

const KEY = "verso-reading";
const MAX = 400;
const WINDOW_MS = 30 * 24 * 3600_000;

let cache: ReadEntry[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: ReadEntry[] = [];

function load(): ReadEntry[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as ReadEntry[]) : [];
    const cutoff = Date.now() - WINDOW_MS;
    cache = parsed.filter((e) => e.at > cutoff);
  } catch {
    cache = [];
  }
  return cache;
}

function save(list: ReadEntry[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {
    // Storage unavailable (private mode): keep it in memory for this visit.
  }
  listeners.forEach((l) => l());
}

export function recordRead(entry: Omit<ReadEntry, "at">) {
  const list = load();
  const recent = list.find((e) => e.kind === entry.kind && e.id === entry.id && Date.now() - e.at < 6 * 3600_000);
  if (recent) return;
  save([...list, { ...entry, at: Date.now() }]);
}

export function clearReading() {
  save([]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useReading(): ReadEntry[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export type BubbleStats = {
  total: number;
  left: number;
  center: number;
  right: number;
  mean: number;
  // 0 = everything from one side, 100 = evenly spread across the spectrum.
  balance: number;
  bins: number[];
};

export function bubbleStats(entries: ReadEntry[]): BubbleStats {
  const articles = entries.filter((e) => e.kind === "article");
  const bins = [0, 0, 0, 0, 0];
  for (const e of articles) {
    const i = Math.min(4, Math.max(0, Math.floor(((e.bias + 1) / 2) * 5)));
    bins[i]++;
  }
  const total = articles.length;
  const left = bins[0] + bins[1];
  const right = bins[3] + bins[4];
  const center = bins[2];
  const mean = total ? articles.reduce((s, e) => s + e.bias, 0) / total : 0;
  // Normalised entropy over the five bins.
  let h = 0;
  for (const b of bins) if (b) h -= (b / total) * Math.log(b / total);
  const balance = total ? Math.round((h / Math.log(5)) * 100) : 0;
  return { total, left, center, right, mean, balance, bins };
}
