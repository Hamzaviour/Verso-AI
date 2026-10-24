"use client";

import Link from "next/link";
import { useState } from "react";
import { bubbleStats, clearReading, useReading } from "@/lib/bubble";
import { biasLabel } from "@/lib/outlets";
import { biasToPct } from "@/lib/spectrum";

const BINS = [
  { label: "Left", color: "var(--cyan)" },
  { label: "Lean left", color: "color-mix(in oklab, var(--cyan) 55%, var(--key))" },
  { label: "Centre", color: "var(--key)" },
  { label: "Lean right", color: "color-mix(in oklab, var(--magenta) 55%, var(--key))" },
  { label: "Right", color: "var(--magenta)" },
];

function verdict(balance: number, total: number, mean: number): { title: string; body: string } {
  if (total < 5)
    return {
      title: "Not enough reading yet",
      body: "Open a few articles at their source from any story. After five, the meter has something to say.",
    };
  const lean = biasLabel(mean).toLowerCase();
  if (balance >= 75) return { title: "Wide reading", body: "You read across most of the spectrum. Few people do." };
  if (balance >= 50)
    return {
      title: "Mostly varied",
      body: `Your reading leans ${lean === "center" ? "toward the centre" : lean}, with some range on either side.`,
    };
  return {
    title: "A tight bubble",
    body: `Most of what you open comes from one part of the spectrum (${lean}). The other side’s front pages are one tap away on every story.`,
  };
}

export function BubbleMeter() {
  const entries = useReading();
  const stats = bubbleStats(entries);
  const [confirming, setConfirming] = useState(false);
  const max = Math.max(1, ...stats.bins);
  const v = verdict(stats.balance, stats.total, stats.mean);
  const stories = entries.filter((e) => e.kind === "story").length;

  return (
    <div className="mt-12 space-y-10">
      <section className="bg-sheet p-6 shadow-[var(--shadow)] sm:p-10" aria-labelledby="meter-heading">
        <div className="grid gap-10 md:grid-cols-[minmax(0,15rem)_1fr] md:items-end">
          <div>
            <h2 id="meter-heading" className="text-[13px] font-bold">
              Balance
            </h2>
            <p className="mt-1 font-sans text-[clamp(5rem,12vw,8.5rem)] leading-[0.85] font-extrabold tracking-[-0.05em] tabular" style={{ fontStretch: "118%" }}>
              {stats.total ? stats.balance : "–"}
            </p>
            <p className="mt-2 text-[13px] text-ink-3">out of 100, from {stats.total} article{stats.total === 1 ? "" : "s"}</p>
          </div>
          <div>
            <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={`Articles read: ${BINS.map((b, i) => `${b.label} ${stats.bins[i]}`).join(", ")}`}>
              {BINS.map((b, i) => (
                <div key={b.label} className="flex h-full flex-1 flex-col justify-end">
                  <span className="tabular mb-1.5 text-center text-[12px] font-semibold text-ink-2">{stats.bins[i] || ""}</span>
                  <div
                    className="w-full rounded-t-[3px] transition-[height] duration-700 ease-[var(--ease-out-expo)]"
                    style={{ height: `${stats.total ? Math.max(3, (stats.bins[i] / max) * 100) : 3}%`, background: b.color }}
                  />
                </div>
              ))}
            </div>
            <div className="relative mt-3 h-[3px] rounded-full reg-rule" aria-hidden>
              {stats.total > 0 && (
                <span
                  className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sheet bg-ink transition-[left] duration-700"
                  style={{ left: `${biasToPct(stats.mean)}%` }}
                />
              )}
            </div>
            <div className="mt-2 grid grid-cols-5 text-center text-[10px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
              {BINS.map((b) => (
                <span key={b.label}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-rule pt-6">
          <h3 className="font-serif text-[24px] font-bold tracking-[-0.01em]">{v.title}</h3>
          <p className="mt-1 max-w-[60ch] font-serif text-[17px] leading-[1.5] text-ink-2">{v.body}</p>
        </div>
      </section>

      <section className="grid gap-8 text-[14px] text-ink-2 md:grid-cols-3">
        <div>
          <h3 className="text-[13px] font-bold text-ink">How it’s scored</h3>
          <p className="mt-2 leading-relaxed">
            Balance is the spread of your reading across five bands of the spectrum (normalised entropy). 100 means an even
            spread, 0 means everything came from one band.
          </p>
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-ink">What counts</h3>
          <p className="mt-2 leading-relaxed">
            Articles opened from a front page or the coverage list. You have also opened {stories} stor
            {stories === 1 ? "y" : "ies"} on Verso, which are not scored.
          </p>
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-ink">Your data</h3>
          <p className="mt-2 leading-relaxed">Stored in this browser only, for thirty days.</p>
          {entries.length > 0 &&
            (confirming ? (
              <span className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearReading();
                    setConfirming(false);
                  }}
                  className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-paper"
                >
                  Erase history
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="text-[13px] font-medium text-ink-3 hover:text-ink">
                  Keep it
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-3 rounded-full border border-rule px-4 py-1.5 text-[13px] font-semibold hover:border-ink"
              >
                Clear reading history
              </button>
            ))}
        </div>
      </section>

      {stats.total < 5 && (
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-paper">
          Go to today’s wall
        </Link>
      )}
    </div>
  );
}
