import Parser from "rss-parser";
import { db } from "@/lib/db";
import { OUTLETS, type Outlet } from "@/lib/outlets";

const parser = new Parser({
  timeout: 12_000,
  headers: { "User-Agent": "VersoBot/1.0 (+https://github.com/verso-news)" },
});

const WINDOW_HOURS = 48;

function clean(s: string | undefined, max: number): string {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function syncOutlets() {
  const sql = db();
  for (const o of OUTLETS) {
    await sql`
      INSERT INTO outlets (id, name, short, homepage, feed_url, bias, reliability)
      VALUES (${o.id}, ${o.name}, ${o.short}, ${o.homepage}, ${o.feedUrl}, ${o.bias}, ${o.reliability})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, short = EXCLUDED.short, homepage = EXCLUDED.homepage,
        feed_url = EXCLUDED.feed_url, bias = EXCLUDED.bias, reliability = EXCLUDED.reliability`;
  }
}

async function fetchOutlet(o: Outlet): Promise<{ inserted: number; error?: string }> {
  const sql = db();
  try {
    const feed = await parser.parseURL(o.feedUrl);
    const cutoff = Date.now() - WINDOW_HOURS * 3600_000;
    const urls: string[] = [];
    const titles: string[] = [];
    const descriptions: string[] = [];
    const dates: string[] = [];
    for (const item of feed.items.slice(0, 60)) {
      const url = item.link?.trim();
      const title = clean(item.title, 300);
      if (!url || !title || urls.includes(url)) continue;
      const published = new Date(item.isoDate ?? item.pubDate ?? Date.now());
      if (Number.isNaN(published.getTime()) || published.getTime() < cutoff) continue;
      urls.push(url);
      titles.push(title);
      descriptions.push(clean(item.contentSnippet ?? item.summary ?? item.content, 600));
      dates.push(published.toISOString());
    }
    let inserted = 0;
    if (urls.length) {
      const rows = await sql`
        INSERT INTO articles (outlet_id, url, title, description, published_at)
        SELECT ${o.id}, u, t, d, p::timestamptz
        FROM unnest(${urls}::text[], ${titles}::text[], ${descriptions}::text[], ${dates}::text[]) AS x(u, t, d, p)
        ON CONFLICT (url) DO NOTHING
        RETURNING id`;
      inserted = rows.length;
    }
    await sql`UPDATE outlets SET last_fetched = now(), last_error = NULL WHERE id = ${o.id}`;
    return { inserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`UPDATE outlets SET last_fetched = now(), last_error = ${message.slice(0, 300)} WHERE id = ${o.id}`;
    return { inserted: 0, error: message };
  }
}

export async function fetchFeeds() {
  const results: Record<string, { inserted: number; error?: string }> = {};
  const queue = [...OUTLETS];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const o = queue.shift()!;
      results[o.id] = await fetchOutlet(o);
    }
  });
  await Promise.all(workers);
  const inserted = Object.values(results).reduce((n, r) => n + r.inserted, 0);
  const failed = Object.entries(results).filter(([, r]) => r.error).map(([id]) => id);
  return { inserted, failed };
}
