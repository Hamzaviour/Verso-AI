# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the user ("default, go"). Chosen: Next.js (App Router) + TypeScript + Tailwind CSS, D3.js for the spectrum visualisation, Neon Postgres + pgvector for storage and similarity search, Vercel AI SDK through Vercel AI Gateway (Claude models) for summaries and claim extraction, Vercel Cron for scheduled RSS ingestion. Event clustering runs in TypeScript first (agglomerative, cosine distance over embeddings); a separate Python HDBSCAN service from the original brief is deferred.

## Users

Primary (from the brief): news readers who sense they live inside an algorithmic filter bubble and have no time to read ten versions of the same story. They open the product to understand one event quickly and from every side.

Secondary (confirmed by the user): hiring managers and interviewers viewing it as a portfolio piece. It must also run as a real product on live news, not seeded demo data.

## Product Purpose

Verso (project codename: Spectrum) clusters articles about the same event from many outlets, plots those outlets on a left-right bias axis and a factual-reliability axis, writes a neutral summary where every sentence cites its sources, separates facts every side agrees on from claims only one side reports, and surfaces where wording differs ("protesters" vs "rioters"). Success: a reader grasps the shape of a story's coverage in under a minute, and a reviewer sees a real pipeline (ingestion, clustering, extraction, evaluation) behind a polished UI.

## Positioning

Not another aggregator with a bias label per article. The unit is the event, and the product's claim is cross-source agreement computed from atomic claims: what is shared, what is one-sided, and how the same thing is worded differently.

## Operating Context

- Scheduled pipeline ingests RSS feeds from roughly 30 outlets (MVP), embeds articles, clusters them into events.
- Per event, an LLM extracts atomic claims per article; claims are matched across sources to compute agreement.
- Readers browse today's events, open one, see outlets slide onto the spectrum, compare headlines, read agreed facts first.
- A personal "bubble meter" reflects how balanced the reader's own reading has been (stored per browser, no accounts in MVP).

## Capabilities and Constraints

- Core features (from brief): event clustering across RSS feeds; neutral summary with per-source citations; agreed facts vs disputed claims; loaded-language detector; bubble meter.
- Signature moments (from brief): horizontal spectrum with outlet marks sliding into place when a story opens; side-by-side headline comparison with highlighted word differences; editorial, newspaper-inspired typography with a modern dark mode.
- Outlet bias and reliability positions come from a hand-curated table in the repo; they are editorial judgements and must be presented as such, with methodology visible.
- No logos of real outlets are reproduced; outlets are shown as typographic marks (name/initials).
- Undecided: user accounts, browser extension, audio briefing, framing history (all stretch goals).

## Brand Commitments

- Name chosen in this session: **Verso** (the reverse side of a printed page; "the other side of every story"). Brief title "Spectrum" remains the feature name for the bias axis.
- Brief requires: editorial, newspaper-inspired typography and a modern dark mode.

## Evidence on Hand

- `12-spectrum.pdf`: original project brief.
- No real users, testimonials, metrics, or press. None may be fabricated. Any demonstration data shown before live ingestion runs must be labelled as sample data.

## Product Principles

1. Show the shape of coverage before any single opinion.
2. Every AI sentence is traceable to sources; no uncited claims.
3. Neutral in voice, honest about method: bias ratings are labelled judgements, not facts.
4. Speed to understanding over volume of content.
5. A real pipeline, visibly real: freshness, source counts, and timestamps are always shown.

## Accessibility & Inclusion

Inferred, not confirmed: WCAG 2.2 AA. Bias encoding must never rely on color alone (position plus label), since left/right color coding is unreadable for many color-vision deficiencies.
