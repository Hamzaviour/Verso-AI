import { embedMany } from "ai";
import { db, toVector } from "@/lib/db";

const MODEL = process.env.VERSO_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

export async function embedPending(limit = 600) {
  const sql = db();
  const rows = (await sql`
    SELECT id, title, description FROM articles
    WHERE embedding IS NULL
    ORDER BY published_at DESC
    LIMIT ${limit}`) as { id: number; title: string; description: string }[];

  let embedded = 0;
  for (let i = 0; i < rows.length; i += 96) {
    const batch = rows.slice(i, i + 96);
    const { embeddings } = await embedMany({
      model: MODEL,
      values: batch.map((r) => `${r.title}\n${r.description}`.slice(0, 2000)),
    });
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
