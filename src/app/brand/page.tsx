import type { Metadata } from "next";
import { LENS_PATH, Mark } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Brand kit" };

// The brand board is a fixed, dark presentation canvas in both themes.
const BOARD = {
  "--paper": "#e6e6e1",
  "--sheet": "#f3f3ef",
  "--ink": "#131314",
  "--ink-2": "#45464a",
  "--ink-3": "#6c6d72",
  "--rule": "#c9c9c3",
  "--cyan": "#0086c3",
  "--magenta": "#c8006a",
  "--yellow": "#ffe14a",
  "--yellow-ink": "#3a3000",
  "--key": "#2b2c30",
} as React.CSSProperties;

const SWATCHES = [
  { name: "Cyan plate", role: "Left of centre", light: "#0086C3", dark: "#3FB4EC" },
  { name: "Key", role: "Centre, text", light: "#131314", dark: "#ECEBE6" },
  { name: "Magenta plate", role: "Right of centre", light: "#C8006A", dark: "#FF5AA8" },
  { name: "Process yellow", role: "Highlighter", light: "#FFE14A", dark: "#FFD83A" },
  { name: "Newsprint", role: "Ground", light: "#E6E6E1", dark: "#0E0F11" },
  { name: "Sheet", role: "Front pages", light: "#F3F3EF", dark: "#17181B" },
];

function Panel({ label, n, children, className, dark }: { label: string; n: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <figure className={`relative flex min-h-[300px] flex-col overflow-hidden rounded-[6px] ${dark ? "bg-[#141416] text-[#ecebe6]" : "bg-paper text-ink"} ${className ?? ""}`}>
      <div className="flex-1">{children}</div>
      <figcaption className={`flex items-center justify-between px-5 pb-4 text-[10px] font-semibold tracking-[0.12em] uppercase ${dark ? "text-[#8a8a88]" : "text-ink-3"}`}>
        <span>{label}</span>
        <span className="tabular">{n}</span>
      </figcaption>
    </figure>
  );
}

export default function BrandPage() {
  return (
    <div className="bg-[#0b0b0c] pb-16 text-[#ecebe6]">
      <div className="mx-auto max-w-[1320px] px-4 pt-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
          <div>
            <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-bold tracking-[-0.03em]">Verso brand kit</h1>
            <p className="mt-3 max-w-[58ch] font-serif text-[18px] leading-[1.5] text-[#b4b4b0]">
              Two plates printed slightly out of register. Cyan carries the left, magenta the right, and where they overlap
              the ink goes solid: the facts both sides print.
            </p>
          </div>
          <p className="text-[12px] text-[#8a8a88]">Identity system v1 · October 2026</p>
        </div>

        <div style={BOARD} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Logo cover */}
          <Panel label="Logo" n="01">
            <div className="grid h-full min-h-[260px] place-items-center px-6">
              <span className="inline-flex items-center gap-4 font-sans text-[64px] leading-none font-extrabold tracking-[-0.045em] text-ink" style={{ fontStretch: "112%" }}>
                <Mark size={56} />
                verso
              </span>
            </div>
          </Panel>

          {/* 2. Construction */}
          <Panel label="Construction" n="02" dark>
            <div className="grid h-full min-h-[260px] place-items-center p-6">
              <svg viewBox="-4 -6 48 40" className="w-full max-w-[300px]" aria-label="Mark construction: two circles of radius 11, centres 12 apart, their overlap filled">
                <line x1="-4" x2="44" y1="14" y2="14" stroke="#3a3b40" strokeWidth="0.2" />
                <line x1="14" x2="14" y1="-6" y2="34" stroke="#3a3b40" strokeWidth="0.2" />
                <line x1="26" x2="26" y1="-6" y2="34" stroke="#3a3b40" strokeWidth="0.2" />
                <line x1="20" x2="20" y1="-6" y2="34" stroke="#3a3b40" strokeWidth="0.2" strokeDasharray="0.6 0.6" />
                <circle cx="14" cy="14" r="11" fill="none" stroke="#3fb4ec" strokeWidth="0.35" />
                <circle cx="26" cy="14" r="11" fill="none" stroke="#ff5aa8" strokeWidth="0.35" />
                <path d={LENS_PATH} fill="#ecebe6" />
                <circle cx="14" cy="14" r="0.6" fill="#3fb4ec" />
                <circle cx="26" cy="14" r="0.6" fill="#ff5aa8" />
                <line x1="14" x2="25" y1="14" y2="14" stroke="#3fb4ec" strokeWidth="0.25" transform="rotate(-38 14 14)" />
                <text x="5" y="31.5" fill="#8a8a88" fontSize="2" fontFamily="var(--font-archivo)">r = 11</text>
                <text x="16.2" y="-2.2" fill="#8a8a88" fontSize="2" fontFamily="var(--font-archivo)">d = 12</text>
                <line x1="14" x2="26" y1="-1.2" y2="-1.2" stroke="#8a8a88" strokeWidth="0.2" />
              </svg>
            </div>
          </Panel>

          {/* 3. Digital application */}
          <Panel label="Digital" n="03">
            <div className="p-5">
              <div className="overflow-hidden rounded-[8px] bg-sheet shadow-[0_10px_30px_-14px_rgb(0_0_0/0.4)]">
                <div className="flex items-center gap-1.5 border-b border-rule px-3 py-2">
                  <span className="size-2 rounded-full bg-rule" />
                  <span className="size-2 rounded-full bg-rule" />
                  <span className="size-2 rounded-full bg-rule" />
                  <span className="ml-3 flex-1 rounded-full bg-paper px-3 py-0.5 text-[10px] text-ink-3">verso (illustrative URL)</span>
                </div>
                <div className="px-4 pt-3 pb-4">
                  <div className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-[-0.04em]" style={{ fontStretch: "112%" }}>
                    <Mark size={13} /> verso
                  </div>
                  <div className="reg-rule mt-2 h-[2px]" />
                  <p className="mt-3 font-serif text-[19px] leading-[1.05] font-bold tracking-[-0.02em]">
                    Council approves $9 weekday congestion charge
                  </p>
                  <div className="mt-3 flex items-end gap-1">
                    {[-0.8, -0.5, -0.3, -0.05, 0.1, 0.35, 0.6, 0.85].map((b) => (
                      <span key={b} className="h-2 flex-1 rounded-[2px]" style={{ background: b < -0.18 ? "var(--cyan)" : b > 0.18 ? "var(--magenta)" : "var(--key)", opacity: 0.35 + Math.abs(b) * 0.65 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* 4. Essence */}
          <Panel label="Essence" n="04" dark>
            <div className="flex h-full min-h-[260px] flex-col justify-center px-8">
              <p className="font-serif text-[clamp(2.2rem,4vw,3.25rem)] leading-[1] font-bold tracking-[-0.03em]">
                Read the <span className="italic">other</span> side.
              </p>
              <p className="mt-4 text-[13px] text-[#8a8a88]">Verso: the reverse of a printed page.</p>
            </div>
          </Panel>

          {/* 5. Colour */}
          <Panel label="Colour" n="05">
            <div className="grid grid-cols-3 gap-2 p-5">
              {SWATCHES.map((s) => (
                <div key={s.name}>
                  <div className="flex h-16 overflow-hidden rounded-[4px] ring-1 ring-black/10">
                    <span className="flex-1" style={{ background: s.light }} />
                    <span className="w-1/3" style={{ background: s.dark }} />
                  </div>
                  <p className="mt-1.5 text-[11px] font-bold leading-tight">{s.name}</p>
                  <p className="text-[10px] leading-tight text-ink-3">{s.role}</p>
                  <p className="tabular text-[10px] leading-tight text-ink-3">{s.light}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* 6. Type */}
          <Panel label="Typography" n="06">
            <div className="grid h-full grid-cols-2 gap-4 p-6">
              <div>
                <p className="font-serif text-[88px] leading-[0.85] font-bold tracking-[-0.04em]">Aa</p>
                <p className="mt-3 text-[12px] font-bold">Source Serif 4</p>
                <p className="text-[11px] text-ink-3">Headlines, summaries, claims. Optical sizes on.</p>
              </div>
              <div>
                <p className="font-sans text-[88px] leading-[0.85] font-extrabold tracking-[-0.05em]" style={{ fontStretch: "118%" }}>
                  Aa
                </p>
                <p className="mt-3 text-[12px] font-bold">Archivo, variable width</p>
                <p className="text-[11px] text-ink-3">Wordmark, interface, data. Wide for numbers, normal for text.</p>
              </div>
            </div>
          </Panel>

          {/* 7. Physical */}
          <Panel label="Print" n="07" dark>
            <div className="grid h-full min-h-[260px] place-items-center p-6">
              <div className="w-[210px] rotate-[-3deg] bg-[#f3f3ef] p-4 text-[#131314] shadow-[0_20px_40px_-12px_rgb(0_0_0/0.7)]">
                <div className="border-y-[3px] border-double border-[#131314] py-1 text-center text-[22px] font-extrabold tracking-[-0.04em]" style={{ fontStretch: "112%" }}>
                  verso
                </div>
                <div className="mt-1 flex justify-between text-[6px] tracking-[0.1em] uppercase">
                  <span>Morning edition</span>
                  <span>Every side</span>
                </div>
                <p className="mt-2 font-serif text-[15px] leading-[1.02] font-bold">What both sides printed this morning</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-[3px]">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <span key={j} className="block h-[2px] bg-[#c9c9c3]" style={{ width: `${70 + ((i * 7 + j * 13) % 30)}%` }} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Mark size={12} />
                  <span className="flex gap-[2px]">
                    {["#0086c3", "#c8006a", "#ffe14a", "#131314"].map((c) => (
                      <span key={c} className="size-[6px]" style={{ background: c }} />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {/* 8. Image direction */}
          <Panel label="Texture" n="08">
            <div className="relative h-full min-h-[260px] overflow-hidden">
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ backgroundImage: "radial-gradient(var(--cyan) 28%, transparent 30%)", backgroundSize: "9px 9px", maskImage: "linear-gradient(105deg, black 10%, transparent 75%)" }}
              />
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ backgroundImage: "radial-gradient(var(--magenta) 28%, transparent 30%)", backgroundSize: "9px 9px", backgroundPosition: "3px 2px", maskImage: "linear-gradient(255deg, black 10%, transparent 75%)" }}
              />
              <div className="absolute inset-x-6 bottom-6">
                <p className="max-w-[16ch] font-serif text-[26px] leading-[1.02] font-bold tracking-[-0.02em]">
                  Halftone from both plates, meeting in the middle.
                </p>
              </div>
            </div>
          </Panel>

          {/* 9. System detail */}
          <Panel label="Interface atoms" n="09">
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { s: "CD", b: "var(--cyan)" },
                  { s: "PWR", b: "color-mix(in oklab, var(--cyan) 40%, var(--key))" },
                  { s: "MM", b: "var(--key)" },
                  { s: "CMJ", b: "color-mix(in oklab, var(--magenta) 45%, var(--key))" },
                  { s: "PD", b: "var(--magenta)" },
                ].map((p) => (
                  <span key={p.s} className="rounded-[5px] border px-2 py-1 text-[11px] font-bold tracking-[0.04em]" style={{ borderColor: p.b, background: `color-mix(in oklab, ${p.b} 12%, var(--sheet))` }}>
                    {p.s}
                  </span>
                ))}
              </div>
              <p className="font-serif text-[20px] leading-[1.2] font-bold">
                Council <span className="mark-loaded">slaps</span> commuters with <span className="mark-diff">$9 daily toll</span>
              </p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-rule py-1 pr-3 pl-1 text-[12px] font-medium">
                  <span className="relative h-4 w-7 rounded-full bg-ink">
                    <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-sheet" />
                  </span>
                  Compare headlines
                </span>
                <span className="rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-paper">Open the spectrum</span>
              </div>
            </div>
          </Panel>
        </div>

        <section className="mt-14 grid gap-10 text-[14px] text-[#b4b4b0] md:grid-cols-3">
          <div>
            <h2 className="text-[13px] font-bold text-[#ecebe6]">Voice</h2>
            <p className="mt-2 leading-relaxed">
              Plain, exact, unhurried. Verso describes; it never takes a side. Say what happened, who said it, and how sure
              we are. No exclamation marks, no “slams”, no “destroys”.
            </p>
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-[#ecebe6]">Colour rules</h2>
            <p className="mt-2 leading-relaxed">
              Cyan and magenta only ever mean left and right; never use them for decoration. Position carries meaning first,
              colour second. Yellow is reserved for highlighting differences in wording.
            </p>
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-[#ecebe6]">The mark</h2>
            <p className="mt-2 leading-relaxed">
              Keep clear space equal to one circle’s radius. On photographs or colour, use the one-colour version: two
              outlines and a solid lens. Never rotate it; left stays left.
            </p>
            <div className="mt-4 flex items-center gap-6 text-[#ecebe6]">
              <Mark size={28} mono title="One-colour mark" />
              <span className="rounded-[6px] bg-[#ecebe6] px-3 py-2 text-[#131314]">
                <Mark size={28} mono title="One-colour mark on light" />
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
