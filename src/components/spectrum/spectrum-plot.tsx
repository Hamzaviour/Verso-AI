"use client";

import { forceCollide, forceSimulation, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import { scaleLinear } from "d3-scale";
import { useEffect, useMemo, useRef, useState } from "react";
import { biasLabel, reliabilityLabel } from "@/lib/outlets";
import { biasColor } from "@/lib/spectrum";
import { useStory } from "@/components/story/story-context";

export type PlotOutlet = {
  id: string;
  name: string;
  short: string;
  bias: number;
  reliability: number;
  articles: number;
};

type Node = SimulationNodeDatum & PlotOutlet & { tx: number; ty: number; w: number };

const PAD = { top: 22, right: 18, bottom: 40, left: 18 };
const PLATE_H = 26;

function plateWidth(short: string) {
  return 18 + short.length * 8.4;
}

export function SpectrumPlot({ outlets, height = 340, compact = false }: { outlets: PlotOutlet[]; height?: number; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [entered, setEntered] = useState(false);
  const { active, setActive } = useStory();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Trigger the slide-in once the layout is known.
  useEffect(() => {
    if (!width || entered) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, [width, entered]);

  const h = width && width < 560 ? Math.min(height, 280) : height;

  const { nodes, x, y } = useMemo(() => {
    const x = scaleLinear().domain([-1, 1]).range([PAD.left + 24, Math.max(PAD.left + 25, width - PAD.right - 24)]);
    const y = scaleLinear().domain([0.35, 0.95]).range([h - PAD.bottom - PLATE_H / 2, PAD.top + PLATE_H / 2]).clamp(true);
    if (!width) return { nodes: [] as Node[], x, y };
    const nodes: Node[] = outlets.map((o) => {
      const tx = x(o.bias);
      const ty = y(o.reliability);
      return { ...o, tx, ty, x: tx, y: ty, w: plateWidth(o.short) };
    });
    // Settle overlapping plates near their true position.
    const sim = forceSimulation(nodes)
      .force("x", forceX<Node>((d) => d.tx).strength(0.9))
      .force("y", forceY<Node>((d) => d.ty).strength(0.5))
      .force("collide", forceCollide<Node>((d) => d.w / 2 + 2).strength(0.9).iterations(3))
      .stop();
    for (let i = 0; i < 220; i++) sim.tick();
    for (const n of nodes) {
      n.x = Math.max(PAD.left + n.w / 2, Math.min(width - PAD.right - n.w / 2, n.x!));
      n.y = Math.max(PAD.top + PLATE_H / 2, Math.min(h - PAD.bottom - PLATE_H / 2, n.y!));
    }
    return { nodes, x, y };
  }, [outlets, width, h]);

  const activeNode = nodes.find((n) => n.id === active) ?? null;
  const reliabilityTicks = [0.4, 0.6, 0.8];
  const zero = x(0);

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height: h }}>
      {width > 0 && (
        <>
          <svg width={width} height={h} className="absolute inset-0" aria-hidden>
            <defs>
              <linearGradient id="spectrum-axis" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--cyan)" />
                <stop offset="50%" stopColor="var(--key)" />
                <stop offset="100%" stopColor="var(--magenta)" />
              </linearGradient>
            </defs>
            {reliabilityTicks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--rule)" strokeDasharray="2 4" />
                {!compact && (
                  <text x={PAD.left} y={y(t) - 5} fill="var(--ink-3)" fontSize="10" letterSpacing="0.06em">
                    {reliabilityLabel(t + 0.001).toUpperCase()}
                  </text>
                )}
              </g>
            ))}
            <line x1={zero} x2={zero} y1={PAD.top - 8} y2={h - PAD.bottom} stroke="var(--rule)" />
            <rect x={PAD.left} y={h - PAD.bottom + 6} width={width - PAD.left - PAD.right} height={3} fill="url(#spectrum-axis)" rx={1.5} />
            {[
              { v: -1, label: "Left", anchor: "start" as const },
              { v: 0, label: "Centre", anchor: "middle" as const },
              { v: 1, label: "Right", anchor: "end" as const },
            ].map((t) => (
              <text
                key={t.v}
                x={t.v === -1 ? PAD.left : t.v === 1 ? width - PAD.right : zero}
                y={h - PAD.bottom + 26}
                textAnchor={t.anchor}
                fill="var(--ink-2)"
                fontSize="11"
                fontWeight="600"
                letterSpacing="0.08em"
              >
                {t.label.toUpperCase()}
              </text>
            ))}
            {!compact && (
              <text
                x={width - PAD.right}
                y={PAD.top - 8}
                textAnchor="end"
                fill="var(--ink-3)"
                fontSize="10"
                letterSpacing="0.06em"
              >
                ↑ MORE RELIABLE
              </text>
            )}
          </svg>

          <ul className="absolute inset-0" aria-label="Outlets covering this story, placed by political lean and reliability">
            {[...nodes]
              .sort((a, b) => Math.abs(a.bias) - Math.abs(b.bias))
              .map((n, i) => {
                const isActive = active === n.id;
                const dim = active != null && !isActive;
                const startX = zero;
                const startY = h - PAD.bottom + 8;
                const px = entered ? n.x! : startX;
                const py = entered ? n.y! : startY;
                return (
                  <li key={n.id} className="absolute top-0 left-0" style={{ zIndex: isActive ? 20 : 10 }}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(n.id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(n.id)}
                      onBlur={() => setActive(null)}
                      aria-label={`${n.name}: ${biasLabel(n.bias)}, reliability ${reliabilityLabel(n.reliability).toLowerCase()}, ${n.articles} article${n.articles === 1 ? "" : "s"}`}
                      className="absolute flex items-center justify-center rounded-[5px] border font-sans text-[11px] font-bold tracking-[0.04em] text-ink outline-offset-2"
                      style={{
                        width: n.w,
                        height: PLATE_H,
                        transform: `translate(${px - n.w / 2}px, ${py - PLATE_H / 2}px) scale(${isActive ? 1.12 : entered ? 1 : 0.6})`,
                        opacity: entered ? (dim ? 0.35 : 1) : 0,
                        borderColor: biasColor(n.bias),
                        background: `color-mix(in oklab, ${biasColor(n.bias)} ${isActive ? 26 : 12}%, var(--sheet))`,
                        boxShadow: isActive ? "var(--shadow)" : "none",
                        transition: `transform 900ms var(--ease-out-expo) ${entered && !active ? i * 45 : 0}ms, opacity 500ms ease ${entered && !active ? i * 45 : 0}ms, background 200ms, box-shadow 200ms`,
                      }}
                    >
                      {n.short}
                    </button>
                  </li>
                );
              })}
          </ul>

          {activeNode && (
            <div
              className="pointer-events-none absolute z-30 w-max max-w-[220px] rounded-md border border-rule bg-sheet px-3 py-2 text-[12px] shadow-[var(--shadow)]"
              style={{
                left: Math.min(Math.max(activeNode.x! - 110, 4), width - 224),
                top: activeNode.y! > h / 2 ? activeNode.y! - PLATE_H / 2 - 70 : activeNode.y! + PLATE_H / 2 + 8,
              }}
              role="status"
            >
              <div className="font-serif text-[14px] font-semibold text-ink">{activeNode.name}</div>
              <div className="mt-0.5 text-ink-2">
                {biasLabel(activeNode.bias)} · {reliabilityLabel(activeNode.reliability)}
              </div>
              <div className="tabular text-ink-3">
                {activeNode.articles} article{activeNode.articles === 1 ? "" : "s"} on this story
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
