import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { analysisModel } from "@/lib/models";
import { classifyClaim } from "@/lib/claims";
import type { Claim, LoadedTerm, SummarySentence } from "@/lib/types";

export const TOPICS = [
  "Politics", "World", "Business", "Technology", "Science",
  "Health", "Climate", "Justice", "Culture", "Sports",
] as const;

const schema = z.object({
  title: z.string().describe("Neutral, factual headline for the event, max 14 words, no loaded words, no outlet voice."),
  topic: z.enum(TOPICS),
  summary: z
    .array(z.object({
      text: z.string().describe("One neutral sentence."),
      sources: z.array(z.string()).describe("Article keys like A3 that support this sentence."),
    }))
    ,
  claims: z
    .array(z.object({
      text: z.string().describe("One atomic, checkable factual claim, written neutrally."),
      supportedBy: z.array(z.string()).describe("Article keys that state or clearly imply the claim."),
      contradictedBy: z.array(z.string()).describe("Article keys that state something incompatible. Empty if none."),
    }))
    ,
  loadedTerms: z
    .array(z.object({
      term: z.string().describe("Exact word or short phrase as it appears in that article's headline or description."),
      article: z.string().describe("Article key."),
      neutral: z.string().describe("A neutral alternative wording."),
      note: z.string().describe("Under 18 words: what framing the term carries."),
    }))
    ,
});

const SYSTEM = `You are the analysis desk of Verso, a news product that shows how one event is covered across the political spectrum.
You receive headlines and short descriptions from different outlets about what should be one news event.
Rules:
- Write in a strictly neutral register. Never adopt any outlet's framing or adjectives.
- Every summary sentence must cite the article keys it relies on. Do not state anything no article supports.
- Claims must be atomic (one fact each) and attributed to every article that supports them, not just one.
- Only mark contradictedBy when an article states something genuinely incompatible, not merely omits it.
- Loaded terms: words that carry emotional or political framing (e.g. "rioters" vs "protesters", "slams", "regime", "radical"). Quote them exactly as written.
- You do not know outlets' political leanings and must not guess them.`;

type ArticleRow = { id: number; outlet_id: string; outlet_name: string; bias: number; title: string; description: string };

function keyFor(i: number) {
  return `A${i + 1}`;
}

export async function analyzeEvent(eventId: number) {
  const sql = db();
  const all = (await sql`
    SELECT a.id, a.outlet_id, o.name AS outlet_name, o.bias, a.title, a.description
    FROM articles a JOIN outlets o ON o.id = a.outlet_id
    WHERE a.event_id = ${eventId}
    ORDER BY a.published_at DESC`) as ArticleRow[];

  // At most two articles per outlet, 18 total, so no single outlet dominates.
  const perOutlet = new Map<string, number>();
  const picked = all.filter((a) => {
    const n = perOutlet.get(a.outlet_id) ?? 0;
    perOutlet.set(a.outlet_id, n + 1);
    return n < 2;
  }).slice(0, 18);

  const keyToArticle = new Map(picked.map((a, i) => [keyFor(i), a]));
  const prompt = picked
    .map((a, i) => `${keyFor(i)} | ${a.outlet_name}\nHeadline: ${a.title}\nDescription: ${a.description.slice(0, 320) || "(none)"}`)
    .join("\n\n");

  const { output } = await generateText({
    model: analysisModel(),
    system: SYSTEM,
    prompt: `Articles about one event:\n\n${prompt}\n\nProduce the analysis: 2 to 6 summary sentences, 3 to 14 claims, at most 10 loaded terms (an empty list is fine).`,
    output: Output.object({ schema }),
    maxRetries: 0,
  });

  const resolve = (keys: string[]) =>
    [...new Set(keys.map((k) => keyToArticle.get(k.trim())?.id).filter((x): x is number => x != null))];
  const biasOf = new Map(picked.map((a) => [a.id, a.bias]));
  const outletOf = new Map(picked.map((a) => [a.id, a.outlet_id]));
  const totalOutlets = new Set(picked.map((a) => a.outlet_id)).size;

  const summary: SummarySentence[] = output.summary.map((s) => ({ text: s.text, sources: resolve(s.sources) }));

  const claims: Claim[] = output.claims
    .map((c) => {
      const sources = resolve(c.supportedBy);
      const contradictedBy = resolve(c.contradictedBy);
      // One vote per outlet when judging spread.
      const outletBias = new Map<string, number>();
      for (const id of sources) outletBias.set(outletOf.get(id)!, biasOf.get(id)!);
      return {
        text: c.text,
        sources,
        contradictedBy,
        status: classifyClaim([...outletBias.values()], contradictedBy.length, totalOutlets),
      };
    })
    .filter((c) => c.sources.length > 0);

  const loadedTerms: LoadedTerm[] = output.loadedTerms
    .map((t) => ({ term: t.term, articleId: keyToArticle.get(t.article.trim())?.id ?? -1, neutral: t.neutral, note: t.note }))
    .filter((t) => t.articleId !== -1);

  await sql`
    UPDATE events SET
      title = ${output.title},
      topic = ${output.topic},
      summary = ${JSON.stringify(summary)}::jsonb,
      claims = ${JSON.stringify(claims)}::jsonb,
      loaded_terms = ${JSON.stringify(loadedTerms)}::jsonb,
      analyzed_count = article_count,
      analyzed_at = now()
    WHERE id = ${eventId}`;

  return { eventId, claims: claims.length };
}

export async function analyzePending(limit = 10) {
  const sql = db();
  const pending = (await sql`
    SELECT id FROM events
    WHERE outlet_count >= 3
      AND (analyzed_at IS NULL OR article_count >= analyzed_count + 3)
    ORDER BY outlet_count DESC, last_updated DESC
    LIMIT ${limit}`) as { id: number }[];

  // Sequential on purpose: free tiers cap tokens per minute, so when the
  // provider says "try again in Ns" we wait that long and retry.
  const done: number[] = [];
  const failed: { id: number; error: string }[] = [];
  // Groq free tier: ~8k tokens/min and each call is ~4k, so pace the calls.
  const gapMs = process.env.GROQ_API_KEY ? 32_000 : 0;
  for (const [i, { id }] of pending.entries()) {
    if (i > 0 && gapMs) await new Promise((r) => setTimeout(r, gapMs));
    for (let attempt = 0; ; attempt++) {
      try {
        await analyzeEvent(id);
        done.push(id);
        break;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const wait = message.match(/try again in ([\d.]+)s/i);
        if (wait && attempt < 4) {
          await new Promise((r) => setTimeout(r, (Number(wait[1]) + 1) * 1000));
          continue;
        }
        failed.push({ id, error: message.slice(0, 300) });
        break;
      }
    }
  }
  return { analyzed: done.length, failed };
}
