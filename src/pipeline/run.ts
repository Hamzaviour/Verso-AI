import { db } from "@/lib/db";
import { fetchFeeds, syncOutlets } from "./fetch-feeds";
import { embedPending } from "./embed";
import { clusterRecent } from "./cluster";
import { analyzePending } from "./analyze";

export type RunOptions = { analyzeLimit?: number; log?: (msg: string) => void };

export async function runPipeline({ analyzeLimit = 10, log = () => {} }: RunOptions = {}) {
  const sql = db();
  const [run] = (await sql`INSERT INTO ingest_runs DEFAULT VALUES RETURNING id`) as { id: number }[];
  const stats: Record<string, unknown> = {};
  try {
    await syncOutlets();
    stats.fetch = await fetchFeeds();
    log(`fetch: ${JSON.stringify(stats.fetch)}`);
    stats.embed = await embedPending();
    log(`embed: ${JSON.stringify(stats.embed)}`);
    stats.cluster = await clusterRecent();
    log(`cluster: ${JSON.stringify(stats.cluster)}`);
    stats.analyze = await analyzePending(analyzeLimit);
    log(`analyze: ${JSON.stringify(stats.analyze)}`);
  } catch (err) {
    stats.error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    await sql`UPDATE ingest_runs SET finished_at = now(), stats = ${JSON.stringify(stats)}::jsonb WHERE id = ${run.id}`;
  }
  return stats;
}
