"use client";

import { ArrowUpRight } from "lucide-react";
import { recordRead } from "@/lib/bubble";
import { biasColor } from "@/lib/spectrum";
import type { ArticleView } from "@/lib/types";
import { TimeAgo } from "@/components/time";

export function AllCoverage({ articles }: { articles: ArticleView[] }) {
  const sorted = [...articles].sort((a, b) => a.outlet.bias - b.outlet.bias || b.publishedAt.localeCompare(a.publishedAt));
  return (
    <section aria-labelledby="coverage-heading">
      <h2 id="coverage-heading" className="font-serif text-[28px] leading-tight font-semibold tracking-[-0.01em]">
        All coverage
      </h2>
      <p className="mt-1 text-[14px] text-ink-2">
        {articles.length} articles, left to right. Opening one counts toward your bubble meter.
      </p>
      <ul className="mt-5 divide-y divide-rule border-y border-rule">
        {sorted.map((a) => {
          const external = a.url !== "#";
          const onOpen = () => recordRead({ kind: "article", id: String(a.id), outlet: a.outlet.id, bias: a.outlet.bias });
          return (
            <li key={a.id}>
              <a
                href={external ? a.url : undefined}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={onOpen}
                className="group grid cursor-pointer grid-cols-[10px_1fr_auto] items-baseline gap-3 py-3"
              >
                <span className="size-[8px] translate-y-[-1px] rounded-full" style={{ background: biasColor(a.outlet.bias) }} aria-hidden />
                <span>
                  <span className="block text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">{a.outlet.name}</span>
                  <span className="mt-0.5 block font-serif text-[15.5px] leading-snug text-ink group-hover:underline group-hover:decoration-rule group-hover:underline-offset-4">
                    {a.title}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-ink-3">
                  <TimeAgo iso={a.publishedAt} className="tabular whitespace-nowrap" />
                  {external && <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
