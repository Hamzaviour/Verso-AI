# Verso

**The other side of every story.** Verso groups coverage of each news event from 33 outlets across the political spectrum, plots who covered it by lean and reliability, writes a neutral summary where every sentence cites its sources, and separates the facts every side reports from the ones only one side does.

Project codename: Spectrum (see `12-spectrum.pdf` for the original brief).

## What it does

- **Event clustering.** RSS feeds from 33 outlets are embedded and grouped into events (TypeScript centroid clustering with a merge pass, `src/lib/cluster-core.ts`).
- **Neutral summary with citations.** Claude (via Vercel AI Gateway) writes a neutral headline and summary; every sentence links back to the outlets it draws on.
- **Agreed facts vs one-sided claims.** The model only attributes atomic claims to articles. Code decides agreement from where those outlets sit on the spectrum (`src/lib/claims.ts`), so "agreed" never depends on the model's opinion.
- **Loaded-language detector.** Framing words are flagged next to a neutral alternative and underlined on the front pages.
- **Headline comparison.** Every outlet's headline as a front page, left to right, with words few other outlets used highlighted.
- **Bubble meter.** Articles you open are scored for spread across the spectrum. Stored only in your browser.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · D3 (scales + force layout) · Neon Postgres + pgvector · AI SDK 7 through Vercel AI Gateway (`anthropic/claude-sonnet-5.5`, `openai/text-embedding-3-small`) · Vercel Cron.

## Run it

```bash
npm install
cp .env.example .env.local     # fill DATABASE_URL and AI_GATEWAY_API_KEY
npm run db:migrate             # creates tables + pgvector
npm run ingest                 # fetch, embed, cluster, analyse (arg = max events to analyse, default 10)
npm run dev
```

Without a database or before the first analysed event, the site shows a clearly labelled **sample edition** built from a fictional event and fictional outlets.

On Vercel, `vercel.json` schedules `/api/cron/ingest` every two hours (requires a plan that allows that cadence; Hobby allows daily). Set `CRON_SECRET`; Vercel sends it as a bearer token.

## Layout

```
src/pipeline/      fetch-feeds → embed → cluster → analyze, orchestrated by run.ts
src/lib/           outlets table, clustering, claim classification, wording diff, data access, bubble storage
src/components/    spectrum plot, front-page wall, claims ledger, bubble meter, brand mark
src/app/           /, /story/[id], /bubble, /method, /brand, /api/cron/ingest
db/schema.sql      idempotent schema
```

## Honesty notes

- Outlet bias and reliability are editorial estimates (`src/lib/outlets.ts`), informed by public ratings, and shown as such on `/method`.
- RSS provides headlines and short descriptions only; claims are extracted from those, not full articles.
- No outlet logos are reproduced; outlets appear as typographic marks.

## Tests

```bash
npm test         # claim classification, clustering, wording diff
npm run typecheck
```
