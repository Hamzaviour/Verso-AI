import { ArrowRight } from "lucide-react";
import { biasLabel } from "@/lib/outlets";
import { biasColor } from "@/lib/spectrum";
import type { ArticleView, LoadedTerm } from "@/lib/types";

export function LoadedLanguage({ terms, byId }: { terms: LoadedTerm[]; byId: Record<number, ArticleView> }) {
  const rows = terms.filter((t) => byId[t.articleId]).sort((a, b) => byId[a.articleId].outlet.bias - byId[b.articleId].outlet.bias);
  return (
    <section aria-labelledby="loaded-heading">
      <h2 id="loaded-heading" className="font-serif text-[28px] leading-tight font-semibold tracking-[-0.01em]">
        Loaded language
      </h2>
      <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
        Words that carry a frame, next to a plainer way to say the same thing.
      </p>
      {rows.length === 0 ? (
        <p className="mt-6 border-t border-rule pt-6 font-serif text-[16px] text-ink-2 italic">
          No strongly loaded wording found in these headlines.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-rule border-y border-rule">
          {rows.map((t, i) => {
            const a = byId[t.articleId];
            return (
              <li key={i} className="grid gap-x-6 gap-y-1.5 py-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,12rem)] md:items-baseline">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-serif text-[19px]">
                  <span className="mark-loaded font-semibold">{t.term}</span>
                  <ArrowRight size={14} className="shrink-0 translate-y-[1px] text-ink-3" aria-label="plainer:" />
                  <span className="text-ink-2">{t.neutral}</span>
                </div>
                <p className="text-[14px] leading-relaxed text-ink-2">{t.note}</p>
                <div className="flex items-center gap-2 text-[12px] text-ink-3 md:justify-end">
                  <span className="size-[7px] rounded-full" style={{ background: biasColor(a.outlet.bias) }} aria-hidden />
                  <span className="font-semibold text-ink-2">{a.outlet.name}</span>
                  <span className="hidden lg:inline">· {biasLabel(a.outlet.bias)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
