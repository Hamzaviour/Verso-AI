import { biasColor, biasToPct, side } from "@/lib/spectrum";

type Item = { outletId: string; short: string; bias: number };

// Compact, static spectrum for cards: one dot per outlet, stacked where they
// collide. Pure markup so it renders on the server.
export function CoverageStrip({ coverage, className }: { coverage: Item[]; className?: string }) {
  const sorted = [...coverage].sort((a, b) => a.bias - b.bias);
  const lanes: number[] = [];
  const placed = sorted.map((c) => {
    const x = biasToPct(c.bias);
    let lane = 0;
    while (lanes[lane] != null && x - lanes[lane] < 3.6) lane++;
    lanes[lane] = x;
    return { ...c, x, lane };
  });
  const depth = Math.max(1, ...placed.map((p) => p.lane + 1));
  const counts = { left: 0, center: 0, right: 0 };
  for (const c of coverage) counts[side(c.bias)]++;

  return (
    <div
      className={`relative ${className ?? ""}`}
      role="img"
      aria-label={`Covered by ${coverage.length} outlets: ${counts.left} left of center, ${counts.center} center, ${counts.right} right of center`}
    >
      <div className="relative" style={{ height: 6 + depth * 9 }}>
        {placed.map((p) => (
          <span
            key={p.outletId}
            className="absolute size-[7px] -translate-x-1/2 rounded-full"
            style={{ left: `${p.x}%`, bottom: 4 + p.lane * 9, background: biasColor(p.bias) }}
          />
        ))}
        <span className="absolute inset-x-0 bottom-0 h-px bg-rule" />
        <span className="absolute bottom-0 left-1/2 h-[5px] w-px bg-ink-3" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold tracking-[0.08em] text-ink-3 uppercase" aria-hidden>
        <span>Left</span>
        <span>Right</span>
      </div>
    </div>
  );
}
