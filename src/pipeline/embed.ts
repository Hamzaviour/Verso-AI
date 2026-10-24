import { db, toVector } from "@/lib/db";
import { embedTexts } from "@/lib/models";

export async function embedPending(limit = 1500) {
  const sql = db();
  const rows = (await sql`
    SELECT id, title, description FROM articles
    WHERE embedding IS NULL
    ORDER BY published_at DESC
    LIMIT ${limit}`) as { id: number; title: string; description: string }[];

  let embedded = 0;
  for (let i = 0; i < rows.length; i += 32) {
    const batch = rows.slice(i, i + 32);
    // MiniLM reads ~256 tokens; headline plus the start of the description is enough.
    const embeddings = await embedTexts(batch.map((r) => `${r.title}. ${r.description}`.slice(0, 700)));
    const ids = batch.map((r) => r.id);
    const vectors = embeddings.map(toVector);
    await sql`
      UPDATE articles a SET embedding = x.e::vector
      FROM unnest(${ids}::bigint[], ${vectors}::text[]) AS x(id, e)
      WHERE a.id = x.id`;
    embedded += batch.length;
  }
  return { embedded };
}
