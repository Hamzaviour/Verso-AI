"use client";

import { biasColor } from "@/lib/spectrum";
import type { ArticleView } from "@/lib/types";
import { useStory } from "./story-context";

// Inline citation plates. Hovering one lights the outlet on the spectrum.
export function OutletChips({
  ids,
  byId,
  size = "sm",
  label,
}: {
  ids: number[];
  byId: Record<number, ArticleView>;
  size?: "sm" | "xs";
  label?: string;
}) {
  const { active, setActive } = useStory();
  const outlets = [...new Map(ids.map((id) => byId[id]).filter(Boolean).map((a) => [a.outlet.id, a])).values()].sort(
    (a, b) => a.outlet.bias - b.outlet.bias,
  );
  if (!outlets.length) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-[0.12em]" aria-label={label ?? `Sources: ${outlets.map((a) => a.outlet.name).join(", ")}`}>
      {outlets.map((a) => {
        const isActive = active === a.outlet.id;
        const inner = (
          <>
            <span className="size-[6px] rounded-full" style={{ background: biasColor(a.outlet.bias) }} aria-hidden />
            {a.outlet.short}
          </>
        );
        const cls = `inline-flex items-center gap-1 rounded-[4px] border font-sans font-bold tracking-[0.03em] not-italic transition-colors ${
          size === "xs" ? "px-1 py-px text-[9.5px]" : "px-1.5 py-[1px] text-[10.5px]"
        } ${isActive ? "border-ink bg-ink text-paper" : "border-rule bg-sheet text-ink-2 hover:border-ink-3"}`;
        const handlers = {
          onMouseEnter: () => setActive(a.outlet.id),
          onMouseLeave: () => setActive(null),
          onFocus: () => setActive(a.outlet.id),
          onBlur: () => setActive(null),
        };
        return a.url && a.url !== "#" ? (
          <a key={a.outlet.id} href={a.url} target="_blank" rel="noopener noreferrer" title={`${a.outlet.name}: ${a.title}`} className={cls} {...handlers}>
            {inner}
          </a>
        ) : (
          <span key={a.outlet.id} tabIndex={0} title={`${a.outlet.name}: ${a.title}`} className={cls} {...handlers}>
            {inner}
          </span>
        );
      })}
    </span>
  );
}
