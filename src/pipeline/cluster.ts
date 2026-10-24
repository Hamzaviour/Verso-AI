import { db } from "@/lib/db";
import { clusterPoints, normalize, outletCount, type Point } from "@/lib/cluster-core";

const WINDOW_HOURS = 48;

type Row = { id: number; outlet_id: string; embedding: string; event_id: number | null };

export async function clusterRecent() {
  const sql = db();
  const rows = (await sql`
    SELECT id, outlet_id, embedding::text AS embedding, event_id
    FROM articles
    WHERE embedding IS NOT NULL AND published_at > now() - make_interval(hours => ${WINDOW_HOURS})
    ORDER BY published_at ASC`) as Row[];

  const prevEvent = new Map(rows.map((r) => [r.id, r.event_id]));
  const points: Point[] = rows.map((r) => ({
    id: r.id,
    outletId: r.outlet_id,
    vec: normalize(JSON.parse(r.embedding) as number[]),
  }));

  // Only multi-outlet groups become events; singletons stay unassigned.
  const groups = clusterPoints(points).filter((g) => outletCount(g) >= 2);

  // Keep event ids stable across runs: a group inherits the event most of its
  // members already belonged to, unless a larger group claimed it first.
  groups.sort((a, b) => b.length - a.length);
  const claimed = new Set<number>();
  const assignments: { eventId: number | null; ids: number[] }[] = [];
  for (const g of groups) {
    const votes = new Map<number, number>();
    for (const p of g) {
      const e = prevEvent.get(p.id);
      if (e != null) votes.set(e, (votes.get(e) ?? 0) + 1);
    }
    const winner = [...votes.entries()]
      .filter(([e]) => !claimed.has(e))
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    if (winner != null) claimed.add(winner);
    assignments.push({ eventId: winner ?? null, ids: g.map((p) => p.id) });
  }

  const windowIds = rows.map((r) => r.id);
  if (windowIds.length) {
    await sql`UPDATE articles SET event_id = NULL WHERE id = ANY(${windowIds})`;
  }

  const fresh = assignments.filter((a) => a.eventId == null);
  if (fresh.length) {
    const newIds = (await sql`
      INSERT INTO events (first_seen) SELECT now() FROM generate_series(1, ${fresh.length}::int)
      RETURNING id`) as { id: number }[];
    fresh.forEach((a, i) => (a.eventId = newIds[i].id));
  }
  const articleIds = assignments.flatMap((a) => a.ids);
  const eventIds = assignments.flatMap((a) => a.ids.map(() => a.eventId!));
  if (articleIds.length) {
    await sql`
      UPDATE articles a SET event_id = x.e
      FROM unnest(${articleIds}::bigint[], ${eventIds}::bigint[]) AS x(id, e)
      WHERE a.id = x.id`;
  }
  const created = fresh.length;

  // Recount every event touched in the window, drop ones left empty.
  await sql`
    UPDATE events e SET
      article_count = s.n,
      outlet_count = s.o,
      last_updated = s.latest,
      first_seen = LEAST(e.first_seen, s.earliest)
    FROM (
      SELECT event_id, count(*)::int AS n, count(DISTINCT outlet_id)::int AS o,
             max(published_at) AS latest, min(published_at) AS earliest
      FROM articles WHERE event_id IS NOT NULL GROUP BY event_id
    ) s
    WHERE e.id = s.event_id`;
  await sql`DELETE FROM events e WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.event_id = e.id)`;

  return { articles: rows.length, events: assignments.length, created };
}
