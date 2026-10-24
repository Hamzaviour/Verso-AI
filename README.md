# Verso

**The other side of every story.** Verso groups coverage of each news event from 33 outlets across the political spectrum, plots who covered it by lean and reliability, writes a neutral summary where every sentence cites its sources, and separates the facts every side reports from the ones only one side does.

Project codename: Spectrum (see `12-spectrum.pdf` for the original brief).

## What it does

- **Event clustering.** RSS feeds from 33 outlets are embedded locally (all-MiniLM-L6-v2 via transformers.js) and grouped into events (TypeScript centroid clustering with a merge pass, `src/lib/cluster-core.ts`).
- **Neutral summary with citations.** An LLM (Groq free tier, `openai/gpt-oss-120b`; or any model via Vercel AI Gateway) writes a neutral headline and summary; every sentence links back to the outlets it draws on.
- **Agreed facts vs one-sided claims.** The model only attributes atomic claims to articles. Code decides agreement from where those outlets sit on the spectrum (`src/lib/claims.ts`), so "agreed" never depends on the model's opinion.
- **Loaded-language detector.** Framing words are flagged next to a neutral alternative and underlined on the front pages.
- **Headline comparison.** Every outlet's headline as a front page, left to right, with words few other outlets used highlighted.
- **Bubble meter.** Articles you open are scored for spread across the spectrum. Stored only in your browser.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · D3 (scales + force layout) · Neon Postgres + pgvector · AI SDK 7 with Groq (free tier) or Vercel AI Gateway · local embeddings with transformers.js · Vercel Cron.

Runs at zero cost: Neon free plan, Groq free key (no card), embeddings on your own machine.

## Run it

```bash
npm install
cp .env.example .env.local     # fill DATABASE_URL and GROQ_API_KEY (free at console.groq.com)
npm run db:migrate             # creates tables + pgvector
npm run ingest                 # fetch, embed, cluster, analyse (arg = max events to analyse, default 10)
                               # Groq free tier: calls are paced ~32s apart to stay under 8k tokens/min
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
