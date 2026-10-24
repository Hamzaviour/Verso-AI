"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { QuizRound } from "@/lib/landing";
import { biasLabel } from "@/lib/outlets";
import { biasColor, biasToPct } from "@/lib/spectrum";

function verdict(diff: number) {
  if (diff <= 0.2) return { word: "Spot on.", tone: "var(--ink)" };
  if (diff <= 0.45) return { word: "Close.", tone: "var(--ink-2)" };
  return { word: "Not this time.", tone: "var(--ink-2)" };
}

export function HeadlineQuiz({ rounds }: { rounds: QuizRound[] }) {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const done = index >= rounds.length;

  if (!rounds.length) return null;

  if (done) {
    const close = results.filter((d) => d <= 0.45).length;
    return (
      <div className="bg-sheet p-6 shadow-[var(--shadow)] sm:p-8">
        <div className="reg-rule -mx-6 -mt-6 mb-6 h-[4px] sm:-mx-8 sm:-mt-8" aria-hidden />
        <p className="font-sans text-[64px] leading-none font-extrabold tracking-[-0.05em] tabular" style={{ fontStretch: "118%" }}>
          {close}/{rounds.length}
        </p>
        <h3 className="mt-3 font-serif text-[26px] leading-tight font-bold tracking-[-0.015em]">
          {close === rounds.length
            ? "You read the room perfectly."
            : close >= rounds.length / 2
              ? "Good instincts. Wording gives a lot away."
              : "Harder than it looks."}
        </h3>
        <p className="mt-2 font-serif text-[16px] leading-[1.5] text-ink-2">
          Every one of those headlines came from a story with several other versions. Verso lays them all side by side.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/today" className="inline-flex items-center gap-2 rounded-full bg-ink py-3 pr-5 pl-6 text-[14px] font-semibold text-paper">
            Open today’s wall <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setResults([]);
              setGuess(0);
              setRevealed(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-rule px-4 py-2.5 text-[13px] font-semibold hover:border-ink"
          >
            <RotateCcw size={14} strokeWidth={2} /> Play again
          </button>
        </div>
      </div>
    );
  }

  const r = rounds[index];
  const diff = Math.abs(guess - r.outlet.bias);
  const v = verdict(diff);

  function reveal() {
    setRevealed(true);
    setResults((x) => [...x, diff]);
  }

  function next() {
    setIndex((i) => i + 1);
    setGuess(0);
    setRevealed(false);
  }

  return (
    <div className="bg-sheet shadow-[var(--shadow)]">
      <div
        className="h-[4px] transition-colors duration-700"
        style={{ background: revealed ? biasColor(r.outlet.bias) : "var(--rule)" }}
        aria-hidden
      />
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.1em] text-ink-3 uppercase">
          <span className="tabular">
            Headline {index + 1} of {rounds.length}
          </span>
          <span className="flex gap-1" aria-hidden>
            {rounds.map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-4 rounded-full"
                style={{
                  background:
                    i < results.length ? (results[i] <= 0.45 ? "var(--ink)" : "var(--ink-3)") : i === index ? "var(--ink-2)" : "var(--rule)",
                  opacity: i < results.length || i === index ? 1 : 0.6,
                }}
              />
            ))}
          </span>
        </div>

        <div className="mt-4 border-y-[3px] border-double border-ink py-1.5 text-center font-serif text-[18px] leading-none font-bold [font-variant:small-caps]">
          {revealed ? (
            <span className="animate-[fadein_500ms_ease-out]">{r.outlet.name}</span>
          ) : (
            <span className="text-ink-3">Which outlet ran this?</span>
          )}
        </div>

        <blockquote className="mt-5 font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] font-bold tracking-[-0.02em] text-balance">
          {r.headline}
        </blockquote>
        <p className="mt-3 text-[12px] text-ink-3">
          From the story: <span className="text-ink-2">{r.eventTitle}</span>
        </p>

        <div className="mt-8">
          <label htmlFor="quiz-guess" className="text-[13px] font-bold">
            {revealed ? "Where it sits" : "Drag to where you think it sits"}
          </label>
          <div className="relative mt-4 h-12">
            {/* Inset by half the thumb so marks line up with the slider's travel. */}
            <div className="absolute inset-y-0 right-[13px] left-[13px]">
            {/* Other outlets on the same story appear after the reveal. */}
            {revealed &&
              r.others.map((o, i) => (
                <span
                  key={o.id}
                  title={`${o.name}: ${o.headline}`}
                  className="absolute top-[3px] size-[9px] -translate-x-1/2 rounded-full opacity-0 animate-[fadein_400ms_ease-out_forwards]"
                  style={{ left: `${biasToPct(o.bias)}%`, background: biasColor(o.bias), animationDelay: `${300 + i * 60}ms` }}
                />
              ))}
            <span className="reg-rule absolute inset-x-0 top-[18px] h-[3px] rounded-full" aria-hidden />
            <span className="absolute top-[13px] left-1/2 h-[13px] w-px bg-ink-3" aria-hidden />
            {revealed && (
              <span
                className="absolute top-[6px] flex h-[27px] -translate-x-1/2 items-center rounded-[5px] border-2 bg-sheet px-2 text-[11px] font-bold tracking-[0.04em] shadow-[var(--shadow)] transition-[left] duration-[900ms] ease-[var(--ease-out-expo)]"
                style={{ left: `${biasToPct(r.outlet.bias)}%`, borderColor: biasColor(r.outlet.bias) }}
              >
                {r.outlet.short}
              </span>
            )}
            </div>
            <input
              id="quiz-guess"
              type="range"
              min={-100}
              max={100}
              step={1}
              value={Math.round(guess * 100)}
              disabled={revealed}
              onChange={(e) => setGuess(Number(e.target.value) / 100)}
              aria-valuetext={`${biasLabel(guess)}`}
              className={`verso-range absolute inset-x-0 top-[6px] w-full ${revealed ? "opacity-40" : ""}`}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold tracking-[0.08em] text-ink-3 uppercase" aria-hidden>
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
        </div>

        <div className="mt-6 min-h-[72px]" aria-live="polite">
          {revealed ? (
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink-2">
                <strong className="font-serif text-[20px] font-bold" style={{ color: v.tone }}>
                  {v.word}
                </strong>{" "}
                You said {biasLabel(guess).toLowerCase()}; {r.outlet.name} sits {biasLabel(r.outlet.bias).toLowerCase()} on our
                scale. {r.outletCount} outlets covered this story.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/story/${r.eventId}`}
                  className="rounded-full border border-rule px-4 py-2.5 text-[13px] font-semibold hover:border-ink"
                >
                  See every version
                </Link>
                <button
                  type="button"
                  onClick={next}
                  autoFocus
                  className="inline-flex items-center gap-2 rounded-full bg-ink py-2.5 pr-4 pl-5 text-[13px] font-semibold text-paper"
                >
                  {index + 1 < rounds.length ? "Next headline" : "See your score"} <ArrowRight size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] text-ink-3">Your guess: <span className="font-semibold text-ink-2">{biasLabel(guess)}</span></p>
              <button
                type="button"
                onClick={reveal}
                className="inline-flex items-center gap-2 rounded-full bg-ink py-2.5 pr-4 pl-5 text-[13px] font-semibold text-paper transition-transform active:scale-[0.98]"
              >
                Reveal the outlet <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
