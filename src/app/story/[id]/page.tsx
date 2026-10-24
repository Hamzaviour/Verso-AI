import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getEvent } from "@/lib/data";
import { coverageSkew, side } from "@/lib/spectrum";
import type { ArticleView } from "@/lib/types";
import { SpectrumPlot, type PlotOutlet } from "@/components/spectrum/spectrum-plot";
import { StoryProvider } from "@/components/story/story-context";
import { HeadlineWall } from "@/components/story/headline-wall";
import { ClaimsLedger } from "@/components/story/claims-ledger";
import { LoadedLanguage } from "@/components/story/loaded-language";
import { OutletChips } from "@/components/story/outlet-chips";
import { AllCoverage } from "@/components/story/all-coverage";
import { RecordStoryView } from "@/components/bubble/record-story-view";
import { SampleNotice } from "@/components/sample-notice";
import { TimeAgo } from "@/components/time";

export async function generateMetadata({ params }: PageProps<"/story/[id]">): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(Number(id));
  return { title: event?.title ?? "Story" };
}

export default function StoryPage({ params }: PageProps<"/story/[id]">) {
  return (
    <Suspense fallback={<StorySkeleton />}>
      <Story params={params} />
    </Suspense>
  );
}

async function Story({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const event = await getEvent(num);
  if (!event) notFound();

  const byId: Record<number, ArticleView> = Object.fromEntries(event.articles.map((a) => [a.id, a]));
  const outlets: PlotOutlet[] = [...new Map(event.articles.map((a) => [a.outlet.id, a.outlet])).values()].map((o) => ({
    id: o.id,
    name: o.name,
    short: o.short,
    bias: o.bias,
    reliability: o.reliability,
    articles: event.articles.filter((a) => a.outlet.id === o.id).length,
  }));
  const counts = { left: 0, center: 0, right: 0 };
  for (const o of outlets) counts[side(o.bias)]++;
  const skew = coverageSkew(outlets.map((o) => o.bias));
  const isSample = num < 0;

  return (
    <StoryProvider>
      <RecordStoryView id={String(num)} biases={outlets.map((o) => o.bias)} />
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="pt-6">
          <Link href="/today" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-ink">
            <ArrowLeft size={14} strokeWidth={2} /> Today’s wall
          </Link>
        </div>
        {isSample && <SampleNotice className="mt-4" />}

        <header className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.02] font-bold tracking-[-0.025em] text-balance">
              {event.title}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3">
              {event.topic && <span className="font-semibold text-ink-2">{event.topic}</span>}
              {event.topic && <span aria-hidden>·</span>}
              <span className="tabular">{event.outletCount} outlets</span>
              <span aria-hidden>·</span>
              <span className="tabular">{event.articleCount} articles</span>
              <span aria-hidden>·</span>
              <span>
                updated <TimeAgo iso={event.lastUpdated} />
              </span>
            </p>

            <div className="mt-8 border-t-2 border-ink pt-5">
              <h2 className="text-[13px] font-bold tracking-[-0.005em]">Neutral summary</h2>
              <ol className="mt-3 space-y-3">
                {event.summary.map((s, i) => (
                  <li key={i} className="font-serif text-[19px] leading-[1.55] text-ink">
                    {s.text} <OutletChips ids={s.sources} byId={byId} />
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[12px] text-ink-3">
                Written by a language model from the headlines and descriptions below. Every sentence cites the outlets it
                draws on; hover a citation to find it on the spectrum.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-5" aria-labelledby="spectrum-heading">
            <div className="bg-sheet p-5 shadow-[var(--shadow)] sm:p-6 lg:sticky lg:top-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="spectrum-heading" className="font-sans text-[15px] font-bold">
                  Who covered it
                </h2>
                <span className="tabular text-[12px] text-ink-3">
                  {counts.left} left · {counts.center} center · {counts.right} right
                </span>
              </div>
              <div className="mt-3">
                <SpectrumPlot outlets={outlets} height={360} />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-3">
                {skew ? <strong className="font-semibold text-ink-2">{skew.label}. </strong> : null}
                Horizontal: political lean. Vertical: factual reliability. Both are editorial estimates;{" "}
                <Link href="/method" className="underline decoration-rule underline-offset-4 hover:decoration-ink">
                  see the method
                </Link>
                .
              </p>
            </div>
          </aside>
        </header>

        <div className="mt-20">
          <HeadlineWall articles={event.articles} loadedTerms={event.loadedTerms} />
        </div>

        <div className="mt-20">
          <ClaimsLedger claims={event.claims} byId={byId} />
        </div>

        <div className="mt-20 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <LoadedLanguage terms={event.loadedTerms} byId={byId} />
          </div>
          <div className="lg:col-span-5">
            <AllCoverage articles={event.articles} />
          </div>
        </div>
      </div>
    </StoryProvider>
  );
}

function StorySkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] animate-pulse px-4 pt-14 sm:px-6 lg:px-10" aria-busy="true" aria-label="Loading story">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="h-14 w-11/12 rounded bg-sheet-2" />
          <div className="h-14 w-8/12 rounded bg-sheet-2" />
          <div className="mt-10 h-4 w-full rounded bg-sheet-2" />
          <div className="h-4 w-10/12 rounded bg-sheet-2" />
          <div className="h-4 w-9/12 rounded bg-sheet-2" />
        </div>
        <div className="h-[440px] bg-sheet lg:col-span-5" />
      </div>
    </div>
  );
}
