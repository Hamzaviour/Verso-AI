"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { recordRead } from "@/lib/bubble";
import { biasLabel } from "@/lib/outlets";
import { biasColor, biasToPct } from "@/lib/spectrum";
import type { ArticleView, LoadedTerm } from "@/lib/types";
import { distinctiveWords, segment, sharedWords } from "@/lib/wording";
import { TimeAgo } from "@/components/time";
import { useStory } from "./story-context";

export function HeadlineWall({ articles, loadedTerms }: { articles: ArticleView[]; loadedTerms: LoadedTerm[] }) {
  const [compare, setCompare] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const { active, setActive } = useStory();

  // One front page per outlet: its most recent headline, ordered left to right.
  const pages = useMemo(() => {
    const byOutlet = new Map<string, ArticleView>();
    for (const a of articles) {
      const cur = byOutlet.get(a.outlet.id);
      if (!cur || a.publishedAt > cur.publishedAt) byOutlet.set(a.outlet.id, a);
    }
    return [...byOutlet.values()].sort((a, b) => a.outlet.bias - b.outlet.bias);
  }, [articles]);

  const distinct = useMemo(() => distinctiveWords(pages.map((p) => p.title)), [pages]);
  const shared = useMemo(() => sharedWords(pages.map((p) => p.title)), [pages]);

  function scrollBy(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section aria-labelledby="wall-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="wall-heading" className="font-serif text-[28px] leading-tight font-semibold tracking-[-0.01em]">
            The same event, {pages.length} front pages
          </h2>
          <p className="mt-1 max-w-[60ch] text-[14px] text-ink-2">
            Ordered from left to right.{" "}
            {compare ? (
              <>
                <span className="mark-diff">Highlighted</span> words appear in this headline but in few of the others;{" "}
                <span className="mark-loaded">wavy underlines</span> mark loaded language.
              </>
            ) : (
              "Turn on compare to see where the wording differs."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-full border border-rule py-1.5 pr-3.5 pl-1.5 text-[13px] font-medium">
            <span className="relative inline-flex h-5 w-9 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              <span className="absolute inset-0 rounded-full bg-rule transition-colors peer-checked:bg-ink" />
              <span className="absolute left-0.5 size-4 rounded-full bg-sheet transition-transform duration-300 ease-[var(--ease-out-expo)] peer-checked:translate-x-4" />
            </span>
            Compare headlines
          </label>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll front pages left"
            className="grid size-9 place-items-center rounded-full border border-rule text-ink-2 hover:border-ink hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll front pages right"
            className="grid size-9 place-items-center rounded-full border border-rule text-ink-2 hover:border-ink hover:text-ink"
          >
            <ArrowRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {shared.length > 0 && (
        <p className="mt-4 text-[13px] text-ink-3">
          Words most headlines share:{" "}
          {shared.map((w, i) => (
            <span key={w}>
              <span className="font-semibold text-ink-2">{w}</span>
              {i < shared.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}

      <div
        ref={scroller}
        className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
        tabIndex={0}
        aria-label="Front pages, scroll horizontally"
      >
        {pages.map((a, i) => {
          const terms = loadedTerms.filter((t) => t.articleId === a.id);
          const segs = segment(a.title, compare ? distinct[i] : new Set(), compare ? terms : []);
          const isActive = active === a.outlet.id;
          return (
            <article
              key={a.id}
              onMouseEnter={() => setActive(a.outlet.id)}
              onMouseLeave={() => setActive(null)}
              className={`relative flex w-[272px] shrink-0 snap-start flex-col bg-sheet shadow-[var(--shadow)] transition-[transform,box-shadow] duration-300 sm:w-[300px] ${
                isActive ? "-translate-y-1" : ""
              }`}
            >
              <div className="h-[4px]" style={{ background: biasColor(a.outlet.bias) }} aria-hidden />
              <header className="px-5 pt-4">
                <div className="flex items-baseline justify-between gap-2 text-[10px] font-semibold tracking-[0.1em] text-ink-3 uppercase">
                  <span>{biasLabel(a.outlet.bias)}</span>
                  <span className="relative h-[3px] w-14 rounded-full bg-rule" aria-hidden>
                    <span
                      className="absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{ left: `${biasToPct(a.outlet.bias)}%`, background: biasColor(a.outlet.bias) }}
                    />
                  </span>
                </div>
                <div className="mt-2 border-y-[3px] border-double border-ink py-1.5 text-center font-serif text-[17px] leading-none font-bold tracking-[-0.01em] [font-variant:small-caps]">
                  {a.outlet.name}
                </div>
              </header>
              <div className="flex flex-1 flex-col px-5 pt-4 pb-4">
                <h3 className="font-serif text-[22px] leading-[1.12] font-bold tracking-[-0.015em] text-balance">
                  {segs.map((s, k) =>
                    s.loaded ? (
                      <span key={k} className="mark-loaded" title={`Loaded: “${s.text}”. Neutral: ${s.loaded.neutral}. ${s.loaded.note}`}>
                        {s.text}
                      </span>
                    ) : s.distinctive ? (
                      <span key={k} className="mark-diff">
                        {s.text}
                      </span>
                    ) : (
                      <span key={k}>{s.text}</span>
                    ),
                  )}
                </h3>
                {a.description && (
                  <p className="mt-3 line-clamp-4 font-serif text-[14px] leading-[1.5] text-ink-2">{a.description}</p>
                )}
                <footer className="mt-auto flex items-center justify-between gap-2 pt-4 text-[12px] text-ink-3">
                  <TimeAgo iso={a.publishedAt} className="tabular" />
                  {a.url !== "#" ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordRead({ kind: "article", id: String(a.id), outlet: a.outlet.id, bias: a.outlet.bias })}
                      className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-ink"
                    >
                      Read at source <ArrowUpRight size={13} strokeWidth={2} />
                      <span className="sr-only">(opens {a.outlet.name} in a new tab)</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => recordRead({ kind: "article", id: String(a.id), outlet: a.outlet.id, bias: a.outlet.bias })}
                      className="font-medium text-ink-2 hover:text-ink"
                    >
                      Mark as read
                    </button>
                  )}
                </footer>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
