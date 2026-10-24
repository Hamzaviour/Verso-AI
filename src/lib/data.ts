import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase, sql } from "./db";
import { OUTLETS, type Outlet } from "./outlets";
import { SAMPLE_EVENTS } from "./sample";
import type { ArticleView, Claim, EventCard, EventDetail, FeedMeta, LoadedTerm, SummarySentence } from "./types";

type EventRow = {
  id: number;
  title: string;
  topic: string | null;
  summary: SummarySentence[] | null;
  claims: Claim[] | null;
  loaded_terms: LoadedTerm[] | null;
  article_count: number;
  outlet_count: number;
  first_seen: string;
  last_updated: string;
  analyzed_at: string | null;
};

type CoverageRow = { event_id: number; outlet_id: string; short: string; bias: number; reliability: number };

function toCard(e: EventRow, coverage: CoverageRow[], leadHeadline: string | null): EventCard {
  return {
    id: Number(e.id),
    title: e.title,
    topic: e.topic,
    articleCount: e.article_count,
    outletCount: e.outlet_count,
    firstSeen: new Date(e.first_seen).toISOString(),
    lastUpdated: new Date(e.last_updated).toISOString(),
    coverage: coverage.map((c) => ({ outletId: c.outlet_id, short: c.short, bias: c.bias, reliability: c.reliability })),
    agreedCount: (e.claims ?? []).filter((c) => c.status === "agreed").length,
    leadHeadline,
  };
}

function sampleCards(): EventCard[] {
  return SAMPLE_EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    topic: e.topic,
    articleCount: e.articleCount,
    outletCount: e.outletCount,
    firstSeen: e.firstSeen,
    lastUpdated: e.lastUpdated,
    coverage: e.coverage,
    agreedCount: e.agreedCount,
    leadHeadline: e.leadHeadline,
  }));
}

export async function getEvents(limit = 30): Promise<{ events: EventCard[]; meta: FeedMeta }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  if (!hasDatabase || !sql) {
    return { events: sampleCards(), meta: { source: "sample", lastRun: null, outletCount: 8, articleCount: 18 } };
  }

  try {
    const events = (await sql`
      SELECT id, title, topic, claims, article_count, outlet_count, first_seen, last_updated, analyzed_at
      FROM events
      WHERE analyzed_at IS NOT NULL AND outlet_count >= 3
        AND last_updated > now() - interval '72 hours'
      ORDER BY (outlet_count * 2 + article_count) * exp(-extract(epoch FROM now() - last_updated) / 86400.0) DESC
      LIMIT ${limit}`) as EventRow[];

    if (events.length === 0) {
      return { events: sampleCards(), meta: { source: "sample", lastRun: null, outletCount: 8, articleCount: 18 } };
    }

    const ids = events.map((e) => e.id);
    const coverage = (await sql`
      SELECT DISTINCT a.event_id, o.id AS outlet_id, o.short, o.bias, o.reliability
      FROM articles a JOIN outlets o ON o.id = a.outlet_id
      WHERE a.event_id = ANY(${ids})`) as CoverageRow[];
    const leads = (await sql`
      SELECT DISTINCT ON (a.event_id) a.event_id, a.title
      FROM articles a JOIN outlets o ON o.id = a.outlet_id
      WHERE a.event_id = ANY(${ids})
      ORDER BY a.event_id, o.reliability DESC, a.published_at DESC`) as { event_id: number; title: string }[];
    const [stats] = (await sql`
      SELECT (SELECT max(finished_at) FROM ingest_runs WHERE finished_at IS NOT NULL) AS last_run,
             (SELECT count(*)::int FROM articles WHERE published_at > now() - interval '48 hours') AS articles,
             (SELECT count(*)::int FROM outlets WHERE last_error IS NULL AND last_fetched IS NOT NULL) AS outlets`) as {
      last_run: string | null;
      articles: number;
      outlets: number;
    }[];

    const leadBy = new Map(leads.map((l) => [Number(l.event_id), l.title]));
    return {
      events: events.map((e) =>
        toCard(e, coverage.filter((c) => Number(c.event_id) === Number(e.id)), leadBy.get(Number(e.id)) ?? null),
      ),
      meta: {
        source: "live",
        lastRun: stats.last_run ? new Date(stats.last_run).toISOString() : null,
        outletCount: stats.outlets,
        articleCount: stats.articles,
      },
    };
  } catch (err) {
    console.error("getEvents failed, serving sample data", err);
    return { events: sampleCards(), meta: { source: "sample", lastRun: null, outletCount: 8, articleCount: 18 } };
  }
}

export async function getEvent(id: number): Promise<EventDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events", `event-${id}`);

  if (!Number.isInteger(id)) return null;
  if (id < 0 || !hasDatabase || !sql) {
    return SAMPLE_EVENTS.find((e) => e.id === id) ?? null;
  }

  const [e] = (await sql`
    SELECT id, title, topic, summary, claims, loaded_terms, article_count, outlet_count, first_seen, last_updated, analyzed_at
    FROM events WHERE id = ${id} AND analyzed_at IS NOT NULL`) as EventRow[];
  if (!e) return null;

  const rows = (await sql`
    SELECT a.id, a.title, a.description, a.url, a.published_at, o.id AS outlet_id
    FROM articles a JOIN outlets o ON o.id = a.outlet_id
    WHERE a.event_id = ${id}
    ORDER BY o.bias ASC, a.published_at DESC`) as {
    id: number;
    title: string;
    description: string;
    url: string;
    published_at: string;
    outlet_id: string;
  }[];

  const outletBy = new Map<string, Outlet>(OUTLETS.map((o) => [o.id, o]));
  const articles: ArticleView[] = rows
    .filter((r) => outletBy.has(r.outlet_id))
    .map((r) => ({
      id: Number(r.id),
      outlet: outletBy.get(r.outlet_id)!,
      title: r.title,
      description: r.description,
      url: r.url,
      publishedAt: new Date(r.published_at).toISOString(),
    }));

  const coverage = [...new Map(articles.map((a) => [a.outlet.id, a.outlet])).values()].map((o) => ({
    event_id: id,
    outlet_id: o.id,
    short: o.short,
    bias: o.bias,
    reliability: o.reliability,
  }));
  const lead = [...articles].sort((a, b) => b.outlet.reliability - a.outlet.reliability)[0]?.title ?? null;

  return {
    ...toCard(e, coverage, lead),
    summary: e.summary ?? [],
    claims: e.claims ?? [],
    loadedTerms: e.loaded_terms ?? [],
    articles,
    analyzedAt: e.analyzed_at ? new Date(e.analyzed_at).toISOString() : null,
  };
}

export async function getOutletStatus() {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  if (!hasDatabase || !sql) return {} as Record<string, { lastFetched: string | null; error: string | null }>;
  try {
    const rows = (await sql`SELECT id, last_fetched, last_error FROM outlets`) as {
      id: string;
      last_fetched: string | null;
      last_error: string | null;
    }[];
    return Object.fromEntries(rows.map((r) => [r.id, { lastFetched: r.last_fetched ? new Date(r.last_fetched).toISOString() : null, error: r.last_error }])) as Record<string, { lastFetched: string | null; error: string | null }>;
  } catch {
    return {} as Record<string, { lastFetched: string | null; error: string | null }>;
  }
}
