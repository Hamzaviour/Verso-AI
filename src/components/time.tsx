"use client";

import { useSyncExternalStore } from "react";

function rel(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

const subscribers = new Map<number, (cb: () => void) => () => void>();
function subscribeEvery(intervalMs: number) {
  let fn = subscribers.get(intervalMs);
  if (!fn) {
    fn = (cb) => {
      const t = setInterval(cb, intervalMs);
      return () => clearInterval(t);
    };
    subscribers.set(intervalMs, fn);
  }
  return fn;
}

function useNow(intervalMs = 60_000): number | null {
  return useSyncExternalStore(
    subscribeEvery(intervalMs),
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}

export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const now = useNow();
  const abs = now == null ? undefined : new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  return (
    <time dateTime={iso} title={abs} className={className}>
      {now == null ? " " : rel(iso, now)}
    </time>
  );
}

export function EditionDate() {
  const now = useNow(300_000);
  if (now == null) return <span className="tabular">&nbsp;</span>;
  const d = new Date(now);
  const date = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const edition = d.getHours() < 12 ? "Morning edition" : d.getHours() < 18 ? "Afternoon edition" : "Evening edition";
  return (
    <span className="tabular">
      {date} <span className="mx-1.5 text-rule">|</span> {edition}
    </span>
  );
}
