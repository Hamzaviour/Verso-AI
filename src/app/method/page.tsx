import type { Metadata } from "next";
import { Suspense } from "react";
import { getOutletStatus } from "@/lib/data";
import { OUTLETS, biasLabel, reliabilityLabel } from "@/lib/outlets";
import { biasColor, biasToPct } from "@/lib/spectrum";

export const metadata: Metadata = { title: "Method" };

const STEPS = [
  {
    name: "Ingest",
    body: "A scheduled job reads the public RSS feeds of every outlet below and keeps the last 48 hours of headlines and descriptions.",
  },
  {
    name: "Embed and cluster",
    body: "Each article becomes a 1,536-dimension embedding. Articles join the closest event by cosine similarity; close events are merged. Only events covered by three or more outlets reach the wall.",
  },
  {
    name: "Extract claims",
    body: "A language model writes a neutral headline and summary, splits coverage into atomic claims, and attributes each claim to every article that reports it. It is never told which way an outlet leans.",
  },
  {
    name: "Compute agreement",
    body: "Code, not the model, decides what counts as agreed: a claim reported on both sides of centre is agreed; one reported only on one side is one-sided; one that an outlet contradicts is contested.",
  },
];

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-bold tracking-[-0.03em]">Method</h1>
      <p className="mt-4 max-w-[62ch] font-serif text-[19px] leading-[1.5] text-ink-2">
        Verso is a pipeline you can inspect. Here is what happens between an outlet publishing a headline and that headline
        appearing on the wall, and every judgement call we make along the way.
      </p>

      <section aria-labelledby="pipeline-heading" className="mt-16">
        <h2 id="pipeline-heading" className="font-serif text-[28px] font-semibold tracking-[-0.01em]">
          The pipeline
        </h2>
        <ol className="relative mt-8 grid gap-10 md:grid-cols-4 md:gap-6">
          <span className="reg-rule absolute top-[7px] right-0 left-0 hidden h-[2px] md:block" aria-hidden />
          {STEPS.map((s) => (
            <li key={s.name} className="relative">
              <span className="relative z-10 block size-4 rounded-full border-[3px] border-ink bg-paper" aria-hidden />
              <h3 className="mt-4 text-[15px] font-bold">{s.name}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="limits-heading" className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="limits-heading" className="font-serif text-[28px] font-semibold tracking-[-0.01em]">
            What this can’t tell you
          </h2>
          <ul className="mt-4 space-y-3 font-serif text-[17px] leading-[1.5] text-ink-2">
            <li>RSS gives headlines and short descriptions, not full articles. A fact missing here may be in the body.</li>
            <li>Not reporting something is not the same as denying it. “One-sided” means only one side mentioned it.</li>
            <li>The model can misattribute a claim. Every claim links to its sources so you can check.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-[28px] font-semibold tracking-[-0.01em]">About the ratings</h2>
          <p className="mt-4 font-serif text-[17px] leading-[1.5] text-ink-2">
            Positions are Verso’s editorial estimates, informed by public media-bias ratings from AllSides, Ad Fontes Media
            and Media Bias/Fact Check. They describe an outlet’s overall output, not any single article, and reasonable
            people disagree with some of them. They live in one file in the source code so they can be argued with in the
            open.
          </p>
        </div>
      </section>

      <section aria-labelledby="outlets-heading" className="mt-20">
        <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
          <h2 id="outlets-heading" className="font-serif text-[28px] leading-none font-semibold tracking-[-0.01em]">
            The {OUTLETS.length} outlets
          </h2>
          <span className="text-[12px] text-ink-3">Sorted left to right</span>
        </div>
        <Suspense fallback={<OutletTable status={{}} />}>
          <OutletTableLive />
        </Suspense>
      </section>
    </div>
  );
}

async function OutletTableLive() {
  const status = await getOutletStatus();
  return <OutletTable status={status} />;
}

function OutletTable({ status }: { status: Record<string, { lastFetched: string | null; error: string | null }> }) {
  const rows = [...OUTLETS].sort((a, b) => a.bias - b.bias);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead>
          <tr className="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
            <th scope="col" className="py-3 pr-4 font-semibold">Outlet</th>
            <th scope="col" className="w-[34%] py-3 pr-4 font-semibold">Lean</th>
            <th scope="col" className="w-[22%] py-3 pr-4 font-semibold">Reliability</th>
            <th scope="col" className="py-3 font-semibold">Feed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule border-t border-rule">
          {rows.map((o) => {
            const s = status[o.id];
            return (
              <tr key={o.id}>
                <th scope="row" className="py-3 pr-4 font-serif text-[16px] font-semibold">
                  {o.name}
                </th>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="relative h-[3px] flex-1 rounded-full bg-rule" aria-hidden>
                      <span className="absolute top-1/2 left-1/2 h-[9px] w-px -translate-y-1/2 bg-ink-3" />
                      <span
                        className="absolute top-1/2 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ left: `${biasToPct(o.bias)}%`, background: biasColor(o.bias) }}
                      />
                    </span>
                    <span className="w-20 text-[12px] text-ink-2">{biasLabel(o.bias)}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="relative h-[3px] w-16 rounded-full bg-rule" aria-hidden>
                      <span className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${o.reliability * 100}%` }} />
                    </span>
                    <span className="text-[12px] text-ink-2">{reliabilityLabel(o.reliability)}</span>
                  </div>
                </td>
                <td className="py-3 text-[12px]">
                  {!s || !s.lastFetched ? (
                    <span className="text-ink-3">Not yet read</span>
                  ) : s.error ? (
                    <span className="text-magenta" title={s.error}>Unreachable last run</span>
                  ) : (
                    <span className="text-ink-2">OK</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
