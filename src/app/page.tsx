import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { getLandingData } from "@/lib/landing";
import { groupClaims } from "@/lib/claims";
import type { ArticleView, Claim, EventDetail, FeedMeta } from "@/lib/types";
import { Mark } from "@/components/brand/logo";
import { HeadlineQuiz } from "@/components/landing/headline-quiz";
import { HeadlineWall } from "@/components/story/headline-wall";
import { OutletChips } from "@/components/story/outlet-chips";
import { StoryProvider } from "@/components/story/story-context";
import { SampleNotice } from "@/components/sample-notice";
import { TimeAgo } from "@/components/time";

export default function LandingPage() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <Landing />
    </Suspense>
  );
}

async function Landing() {
  const { rounds, lead, meta, storyCount } = await getLandingData();
  return (
    <>
      <Hero rounds={rounds} meta={meta} storyCount={storyCount} />
      {lead && <WallDemo event={lead} />}
      {lead && <AgreementDemo event={lead} />}
      <HowItWorks meta={meta} storyCount={storyCount} />
      <BubbleTeaser />
      <Promises />
      <Close />
    </>
  );
}

function Wrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10 ${className ?? ""}`}>{children}</div>;
}

function Hero({ rounds, meta, storyCount }: { rounds: Awaited<ReturnType<typeof getLandingData>>["rounds"]; meta: FeedMeta; storyCount: number }) {
  return (
    <section aria-labelledby="hero-heading" className="pt-10 pb-20 lg:pt-16 lg:pb-28">
      <Wrap>
        {meta.source === "sample" && <SampleNotice className="mb-8" />}
        {/* Phones: headline, quiz, then copy. Desktop: copy column left, quiz right. */}
        <div className="grid gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0">
          <h1
            id="hero-heading"
            className="font-serif text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.95] font-bold tracking-[-0.035em] text-balance lg:col-span-5 lg:self-end"
          >
            Can you tell who wrote this headline?
          </h1>
          <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center">
            <HeadlineQuiz rounds={rounds} />
            <p className="mt-3 text-[12px] text-ink-3">
              Real headlines from today’s wall. Outlet positions are{" "}
              <Link href="/method" className="underline decoration-rule underline-offset-4 hover:decoration-ink">
                Verso’s editorial estimates
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-5 lg:row-start-2">
            <p className="max-w-[46ch] lg:mt-6 font-serif text-[20px] leading-[1.5] text-ink-2">
              The same event reads differently depending on who prints it. Verso gathers every outlet’s version, maps them
              from left to right, and puts what they all agree on first.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/today"
                className="group inline-flex items-center gap-2 rounded-full bg-ink py-3.5 pr-5 pl-6 text-[15px] font-semibold text-paper transition-transform active:scale-[0.98]"
              >
                Open today’s wall
                <ArrowRight size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#how" className="rounded-full px-4 py-3.5 text-[15px] font-semibold text-ink-2 hover:text-ink">
                How it works
              </a>
            </div>
            <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3">
              {meta.source === "live" ? (
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-cyan" />
                  </span>
                  <span>
                    <span className="tabular font-semibold text-ink-2">{storyCount} stories</span> from{" "}
                    <span className="tabular font-semibold text-ink-2">{meta.outletCount} outlets</span> on the wall now
                  </span>
                  {meta.lastRun && (
                    <>
                      <span aria-hidden>·</span>
                      <span>
                        updated <TimeAgo iso={meta.lastRun} />
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span>Showing the sample edition</span>
              )}
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

function WallDemo({ event }: { event: EventDetail }) {
  return (
    <section aria-label="Headline comparison" className="border-t border-rule bg-sheet-2/60 py-20 lg:py-24">
      <Wrap>
        <div className="mb-10 grid gap-6 lg:grid-cols-12">
          <h2 className="font-serif text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-bold tracking-[-0.025em] text-balance lg:col-span-6">
            One event. Every front page. Side by side.
          </h2>
          <p className="max-w-[52ch] font-serif text-[18px] leading-[1.55] text-ink-2 lg:col-span-5 lg:col-start-8">
            Today’s lead story, <Link href={`/story/${event.id}`} className="font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">{event.title}</Link>, as {event.outletCount} outlets printed it. Words that only a few of them chose light up.
          </p>
        </div>
        <StoryProvider>
          <HeadlineWall articles={event.articles} loadedTerms={event.loadedTerms} embedded />
        </StoryProvider>
      </Wrap>
    </section>
  );
}

function ClaimLine({ claim, byId }: { claim: Claim; byId: Record<number, ArticleView> }) {
  return (
    <li className="border-t border-rule py-3.5 first:border-t-0">
      <p className="font-serif text-[17px] leading-[1.45]">{claim.text}</p>
      <div className="mt-1.5">
        <OutletChips ids={claim.sources} byId={byId} size="xs" label="Reported by" />
      </div>
    </li>
  );
}

function AgreementDemo({ event }: { event: EventDetail }) {
  const g = groupClaims(event.claims);
  const byId: Record<number, ArticleView> = Object.fromEntries(event.articles.map((a) => [a.id, a]));
  if (!g.agreed.length && !g.left.length && !g.right.length) return null;
  // A lone one-sided card takes the full row instead of leaving a gap.
  const single = (g.left.length > 0) !== (g.right.length > 0) ? " lg:col-span-2" : "";
  return (
    <section aria-labelledby="agree-heading" className="py-20 lg:py-28">
      <Wrap>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="agree-heading" className="font-serif text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-bold tracking-[-0.025em] text-balance">
              Agreed facts first. Then the rest.
            </h2>
            <p className="mt-5 font-serif text-[18px] leading-[1.55] text-ink-2">
              A language model splits the coverage into single, checkable claims and notes which outlets report each one.
              It never learns which way an outlet leans.
            </p>
            <p className="mt-4 font-serif text-[18px] leading-[1.55] text-ink-2">
              Then plain code decides: reported on both sides of center means agreed. Reported on one side only means
              one-sided. Contradicted means contested.
            </p>
          </div>
          <StoryProvider>
            <div className="grid gap-4 lg:col-span-8 lg:grid-cols-2">
              {g.agreed.length > 0 && (
                <div className="bg-sheet px-6 pt-5 pb-2 shadow-[var(--shadow)] lg:col-span-2">
                  <h3 className="border-b-2 border-ink pb-2.5 text-[14px] font-bold">Every side reports</h3>
                  <ul>
                    {g.agreed.slice(0, 3).map((c, i) => (
                      <ClaimLine key={i} claim={c} byId={byId} />
                    ))}
                  </ul>
                </div>
              )}
              {g.left.length > 0 && (
                <div className={`bg-sheet px-6 pt-5 pb-2 shadow-[var(--shadow)]${single}`}>
                  <h3 className="border-b-2 border-cyan pb-2.5 text-[14px] font-bold">Only on the left</h3>
                  <ul>
                    {g.left.slice(0, 2).map((c, i) => (
                      <ClaimLine key={i} claim={c} byId={byId} />
                    ))}
                  </ul>
                </div>
              )}
              {g.right.length > 0 && (
                <div className={`bg-sheet px-6 pt-5 pb-2 shadow-[var(--shadow)]${single}`}>
                  <h3 className="border-b-2 border-magenta pb-2.5 text-[14px] font-bold">Only on the right</h3>
                  <ul>
                    {g.right.slice(0, 2).map((c, i) => (
                      <ClaimLine key={i} claim={c} byId={byId} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </StoryProvider>
        </div>
      </Wrap>
    </section>
  );
}

function HowItWorks({ meta, storyCount }: { meta: FeedMeta; storyCount: number }) {
  const live = meta.source === "live";
  const steps = [
    {
      name: "Read every feed",
      body: live
        ? `${meta.outletCount} outlets across the spectrum, ${meta.articleCount.toLocaleString("en-US")} articles in the last 48 hours.`
        : "Public RSS feeds from 33 outlets across the spectrum, refreshed on a schedule.",
    },
    {
      name: "Find the same event",
      body: "Each headline becomes a vector. Articles that land close together become one story, but only once three or more outlets cover it.",
    },
    {
      name: "Split it into claims",
      body: "A model writes a neutral headline and summary, and attributes every claim to the outlets that report it. Every sentence cites its sources.",
    },
    {
      name: "Put it on the wall",
      body: live ? `${storyCount} stories right now, ranked by how widely they’re covered and how fresh they are.` : "Stories ranked by how widely they’re covered and how fresh they are.",
    },
  ];
  return (
    <section id="how" aria-labelledby="how-heading" className="scroll-mt-8 border-t border-rule py-20 lg:py-28">
      <Wrap>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="how-heading" className="max-w-[18ch] font-serif text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-bold tracking-[-0.025em]">
            A newsroom’s reading, done by a pipeline.
          </h2>
          <Link href="/method" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-2 hover:text-ink">
            The full method <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-8">
          <span className="reg-rule absolute top-[9px] right-0 left-0 hidden h-[3px] rounded-full md:block" aria-hidden />
          {steps.map((s) => (
            <li key={s.name} className="relative">
              <span className="relative z-10 block size-5 rounded-full border-[3px] border-ink bg-paper" aria-hidden />
              <h3 className="mt-5 font-serif text-[22px] leading-tight font-bold tracking-[-0.01em]">{s.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}

const EXAMPLE_BINS = [
  { h: 92, c: "var(--cyan)" },
  { h: 64, c: "color-mix(in oklab, var(--cyan) 55%, var(--key))" },
  { h: 30, c: "var(--key)" },
  { h: 10, c: "color-mix(in oklab, var(--magenta) 55%, var(--key))" },
  { h: 6, c: "var(--magenta)" },
];

function BubbleTeaser() {
  return (
    <section aria-labelledby="bubble-heading" className="border-t border-rule py-20 lg:py-28">
      <Wrap>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="bubble-heading" className="font-serif text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-bold tracking-[-0.025em] text-balance">
              See the shape of your own bubble.
            </h2>
            <p className="mt-5 font-serif text-[18px] leading-[1.55] text-ink-2">
              Every article you open from Verso lands somewhere on the spectrum. The bubble meter shows where your reading
              clusters, and it never leaves your browser. No account, nothing sent.
            </p>
            <Link href="/bubble" className="mt-7 inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-[14px] font-semibold hover:bg-ink hover:text-paper">
              Check your bubble <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
          <figure className="bg-sheet p-6 shadow-[var(--shadow)] sm:p-8 lg:col-span-6 lg:col-start-7">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-bold">Balance</span>
              <span className="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">Example reader</span>
            </div>
            <p className="mt-1 font-sans text-[72px] leading-[0.9] font-extrabold tracking-[-0.05em] tabular" style={{ fontStretch: "118%" }}>
              38
            </p>
            <div className="mt-6 flex h-32 items-end gap-2" aria-hidden>
              {EXAMPLE_BINS.map((b, i) => (
                <span key={i} className="flex-1 rounded-t-[3px]" style={{ height: `${b.h}%`, background: b.c }} />
              ))}
            </div>
            <div className="reg-rule mt-3 h-[3px] rounded-full" aria-hidden />
            <figcaption className="mt-4 font-serif text-[16px] leading-snug text-ink-2">
              <strong className="font-bold text-ink">A tight bubble.</strong> Most of this example reader’s articles come from
              left of center.
            </figcaption>
          </figure>
        </div>
      </Wrap>
    </section>
  );
}

function Promises() {
  const items = [
    { title: "Every sentence cites its sources", body: "Summaries link each line to the outlets it came from, so you can check the work." },
    { title: "Ratings out in the open", body: "Where each outlet sits is a published judgement you can read, and argue with, on the method page." },
    { title: "No account, no tracking", body: "Reading history stays in your browser. There is nothing to sign up for." },
  ];
  return (
    <section aria-label="Principles" className="border-t border-rule py-16 lg:py-20">
      <Wrap>
        <ul className="grid gap-10 md:grid-cols-3">
          {items.map((it) => (
            <li key={it.title}>
              <h3 className="font-serif text-[21px] leading-tight font-bold tracking-[-0.01em]">{it.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{it.body}</p>
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  );
}

function Close() {
  return (
    <section aria-labelledby="close-heading" className="-mb-24 bg-[#131314] py-24 text-[#ecebe6] lg:py-32">
      <Wrap className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Mark size={56} className="[--ink:#ecebe6]" />
          <h2 id="close-heading" className="mt-8 font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.92] font-bold tracking-[-0.04em]">
            Read the <span className="italic">other</span> side.
          </h2>
          <p className="mt-5 max-w-[44ch] font-serif text-[19px] leading-[1.5] text-[#b4b4b0]">
            Verso: the reverse of a printed page. Every story, from every side, on one wall.
          </p>
        </div>
        <Link
          href="/today"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ecebe6] py-4 pr-6 pl-7 text-[16px] font-semibold text-[#131314] transition-transform active:scale-[0.98]"
        >
          Open today’s wall
          <ArrowRight size={18} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Wrap>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] animate-pulse px-4 pt-16 sm:px-6 lg:px-10" aria-busy="true" aria-label="Loading">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="h-16 w-full rounded bg-sheet-2" />
          <div className="h-16 w-10/12 rounded bg-sheet-2" />
          <div className="h-16 w-8/12 rounded bg-sheet-2" />
        </div>
        <div className="h-[460px] bg-sheet lg:col-span-7" />
      </div>
    </div>
  );
}
