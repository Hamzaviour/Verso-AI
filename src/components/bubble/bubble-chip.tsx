"use client";

import Link from "next/link";
import { bubbleStats, useReading } from "@/lib/bubble";

const BIN_COLORS = [
  "var(--cyan)",
  "color-mix(in oklab, var(--cyan) 50%, var(--key))",
  "var(--key)",
  "color-mix(in oklab, var(--magenta) 50%, var(--key))",
  "var(--magenta)",
];

export function BubbleChip() {
  const stats = bubbleStats(useReading());
  const max = Math.max(1, ...stats.bins);
  return (
    <Link
      href="/bubble"
      className="group hidden items-center gap-2.5 rounded-full border border-rule py-1.5 pr-3 pl-2.5 text-[12px] text-ink-2 transition-colors hover:border-ink hover:text-ink sm:flex"
      aria-label={stats.total ? `Your reading balance: ${stats.balance} out of 100` : "Your bubble meter: no reading yet"}
    >
      <span className="flex h-4 items-end gap-[2px]" aria-hidden>
        {stats.bins.map((b, i) => (
          <span
            key={i}
            className="w-[4px] rounded-[1px] transition-[height] duration-500"
            style={{ height: stats.total ? `${Math.max(2, (b / max) * 16)}px` : "2px", background: BIN_COLORS[i] }}
          />
        ))}
      </span>
      <span className="tabular font-medium">{stats.total ? `Balance ${stats.balance}` : "Your bubble"}</span>
    </Link>
  );
}
