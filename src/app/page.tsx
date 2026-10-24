import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { getEvent, getEvents } from "@/lib/data";
import { biasLabel } from "@/lib/outlets";
import { biasColor, coverageSkew } from "@/lib/spectrum";
import type { ArticleView, EventCard, EventDetail, FeedMeta } from "@/lib/types";
import { distinctiveWords, segment } from "@/lib/wording";
import { SpectrumPlot } from "@/components/spectrum/spectrum-plot";
import { CoverageStrip } from "@/components/spectrum/coverage-strip";
import { StoryProvider } from "@/components/story/story-context";
import { SampleNotice } from "@/components/sample-notice";
import { TimeAgo } from "@/components/time";

export default function Home() {
  return (
    <Suspense fallback={<WallSkeleton />}>
      <Wall />
    </Suspense>
  );
}

async function Wall() {
  const { events, meta } = await getEvents();
  const [leadCard, ...rest] = events;
  const lead = leadCard ? await getEvent(leadCard.id) : null;

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
      {meta.source === "sample" && <SampleNotice className="mt-6" />}
      {lead ? <Lead event={lead} meta={meta} /> : <EmptyWall />}
      {rest.length > 0 && <StoryGrid events={rest} />}
    </div>
  );
}

function Lead({ event, meta }: { event: EventDetail; meta: FeedMeta }) {
  const outlets = [...new Map(event.articles.map((a) => [a.outlet.id, a.outlet])).values()].map((o) => ({
    id: o.id,
    name: o.name,
    short: o.short,
    bias: o.bias,
    reliability: o.reliability,
    articles: event.articles.filter((a) => a.outlet.id === o.id).length,
  }));
  const agreed = event.claims.filter((c) => c.status === "agreed");

  return (
    <StoryProvider>
      <section aria-labelledby="lead-heading" className="pt-10 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink-2">
                <span className="size-2 rounded-full bg-magenta" aria-hidden />
                Lead story
              </span>
              <span aria-hidden>·</span>
              <span className="tabular">{event.outletCount} outlets</span>
              <span aria-hidden>·</span>
              <span>
                updated <TimeAgo iso={event.lastUpdated} />
              </span>
            </p>
            <h1 id="lead-heading" className="mt-3 font-serif text-[clamp(2.4rem,5.4vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.03em] text-balance">
              <Link href={`/story/${event.id}`} className="decoration-2 underline-offset-[0.12em] hover:underline">
                {event.title}
              </Link>
            </h1>
            {event.summary[0] && (
              <p className="mt-5 max-w-[60ch] font-serif text-[20px] leading-[1.5] text-ink-2">{event.summary[0].text}</p>
            )}
            {agreed.length > 0 && (
              <div className="mt-7 border-t-2 border-ink pt-4">
                <h2 className="text-[13px] font-bold">Every side reports</h2>
                <ul className="mt-2 space-y-1.5">
                  {agreed.slice(0, 3).map((c, i) => (
                    <li key={i} className="flex gap-3 font-serif text-[16.5px] leading-snug">
                      <span className="mt-[0.55em] h-px w-3 shrink-0 bg-ink" aria-hidden />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href={`/story/${event.id}`}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink py-3 pr-5 pl-6 text-[14px] font-semibold text-paper transition-transform active:scale-[0.98]"
            >
              Open the full spectrum
              <ArrowRight size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-sheet p-5 shadow-[var(--shadow)] sm:p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] font-bold">Who covered it</h2>
                <Freshness meta={meta} />
              </div>
              <div className="mt-3">
                <SpectrumPlot outlets={outlets} height={330} />
              </div>
            </div>
          </div>
        </div>

        <ThreeWays articles={event.articles} />
      </section>
    </StoryProvider>
  );
}

function Freshness({ meta }: { meta: FeedMeta }) {
  if (meta.source === "sample") return <span className="text-[12px] text-ink-3">Sample data</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-3">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-cyan" />
      </span>
      Live{meta.lastRun ? <> · <TimeAgo iso={meta.lastRun} /></> : null}
    </span>
  );
}

// Leftmost, most central and rightmost headline, side by side.
function ThreeWays({ articles }: { articles: ArticleView[] }) {
  const byOutlet = [...new Map([...articles].reverse().map((a) => [a.outlet.id, a])).values()].sort(
    (a, b) => a.outlet.bias - b.outlet.bias,
  );
  if (byOutlet.length < 3) return null;
  const left = byOutlet[0];
  const right = byOutlet[byOutlet.length - 1];
  const center = byOutlet.reduce((best, a) => (Math.abs(a.outlet.bias) < Math.abs(best.outlet.bias) ? a : best));
  const picks = [left, center, right].filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i);
  // Compare against every outlet's headline, not just these three.
  const all = distinctiveWords(byOutlet.map((p) => p.title));
  const distinct = picks.map((p) => all[byOutlet.indexOf(p)]);

  return (
    <div className="mt-14">
      <h2 className="font-serif text-[22px] font-semibold tracking-[-0.01em]">Three ways to headline it</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {picks.map((a, i) => (
          <article key={a.id} className="flex flex-col bg-sheet shadow-[var(--shadow)]">
            <div className="h-[4px]" style={{ background: biasColor(a.outlet.bias) }} aria-hidden />
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-baseline justify-between text-[10px] font-semibold tracking-[0.1em] text-ink-3 uppercase">
                <span>{biasLabel(a.outlet.bias)}</span>
              </div>
              <div className="mt-2 border-y-[3px] border-double border-ink py-1.5 text-center font-serif text-[16px] leading-none font-bold [font-variant:small-caps]">
                {a.outlet.name}
              </div>
              <h3 className="mt-4 font-serif text-[23px] leading-[1.12] font-bold tracking-[-0.015em] text-balance">
                {segment(a.title, distinct[i], []).map((s, k) =>
                  s.distinctive ? (
                    <span key={k} className="mark-diff">
                      {s.text}
                    </span>
                  ) : (
                    <span key={k}>{s.text}</span>
                  ),
                )}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function StoryGrid({ events }: { events: EventCard[] }) {
  return (
    <section aria-labelledby="wall-heading" className="mt-20">
      <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
        <h2 id="wall-heading" className="font-serif text-[30px] leading-none font-bold tracking-[-0.02em]">
          Today’s wall
        </h2>
        <span className="tabular text-[13px] text-ink-3">{events.length} more stories</span>
      </div>
      <ol className="grid sm:-ml-6 sm:grid-cols-2 sm:[clip-path:inset(0_0_0_25px)] lg:grid-cols-3">
        {events.map((e, i) => (
          <StoryCardItem key={e.id} event={e} featured={i < 2} />
        ))}
      </ol>
    </section>
  );
}

function StoryCardItem({ event, featured }: { event: EventCard; featured: boolean }) {
  const skew = coverageSkew(event.coverage.map((c) => c.bias));
  return (
    <li className="group relative border-b border-rule">
      <Link
        href={`/story/${event.id}`}
        className="flex h-full flex-col gap-4 py-6 sm:border-l sm:border-rule sm:px-6 lg:py-7"
      >
        <h3
          className={`font-serif font-bold tracking-[-0.015em] text-balance group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 ${
            featured ? "text-[26px] leading-[1.08]" : "text-[21px] leading-[1.15]"
          }`}
        >
          {event.title}
        </h3>
        {event.leadHeadline && featured && (
          <p className="line-clamp-2 font-serif text-[15px] leading-snug text-ink-3 italic">“{event.leadHeadline}”</p>
        )}
        <div className="mt-auto space-y-3">
          <CoverageStrip coverage={event.coverage} />
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
            {event.topic && <span className="font-semibold text-ink-2">{event.topic}</span>}
            {event.topic && <span aria-hidden>·</span>}
            <span className="tabular">{event.outletCount} outlets</span>
            {event.agreedCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="tabular">{event.agreedCount} agreed facts</span>
              </>
            )}
            <span aria-hidden>·</span>
            <TimeAgo iso={event.lastUpdated} />
          </p>
          {skew && (
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: skew.side === "left" ? "var(--cyan)" : "var(--magenta)" }}>
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {skew.label}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

function EmptyWall() {
  return (
    <section className="py-24 text-center">
      <h1 className="font-serif text-[36px] font-bold">The presses are warming up</h1>
      <p className="mx-auto mt-3 max-w-[48ch] text-ink-2">
        No stories have been analysed yet. The first ingest run reads every feed, groups the coverage and writes the
        wall.
      </p>
    </section>
  );
}

function WallSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] animate-pulse px-4 pt-14 sm:px-6 lg:px-10" aria-busy="true" aria-label="Loading today’s wall">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="h-4 w-40 rounded bg-sheet-2" />
          <div className="h-16 w-11/12 rounded bg-sheet-2" />
          <div className="h-16 w-9/12 rounded bg-sheet-2" />
          <div className="h-5 w-10/12 rounded bg-sheet-2" />
        </div>
        <div className="h-[400px] bg-sheet lg:col-span-5" />
      </div>
    </div>
  );
}
