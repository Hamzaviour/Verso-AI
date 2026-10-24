import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { classifyClaim } from "@/lib/claims";
import type { Claim, LoadedTerm, SummarySentence } from "@/lib/types";

const MODEL = process.env.VERSO_ANALYSIS_MODEL ?? "anthropic/claude-sonnet-5.5";

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
      sources: z.array(z.string()).min(1).describe("Article keys like A3 that support this sentence."),
    }))
    .min(2).max(6),
  claims: z
    .array(z.object({
      text: z.string().describe("One atomic, checkable factual claim, written neutrally."),
      supportedBy: z.array(z.string()).min(1).describe("Article keys that state or clearly imply the claim."),
      contradictedBy: z.array(z.string()).describe("Article keys that state something incompatible. Empty if none."),
    }))
    .min(3).max(14),
  loadedTerms: z
    .array(z.object({
      term: z.string().describe("Exact word or short phrase as it appears in that article's headline or description."),
      article: z.string().describe("Article key."),
      neutral: z.string().describe("A neutral alternative wording."),
      note: z.string().describe("Under 18 words: what framing the term carries."),
    }))
    .max(10),
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

  // At most two articles per outlet, 24 total, so no single outlet dominates.
  const perOutlet = new Map<string, number>();
  const picked = all.filter((a) => {
    const n = perOutlet.get(a.outlet_id) ?? 0;
    perOutlet.set(a.outlet_id, n + 1);
    return n < 2;
  }).slice(0, 24);

  const keyToArticle = new Map(picked.map((a, i) => [keyFor(i), a]));
  const prompt = picked
    .map((a, i) => `${keyFor(i)} | ${a.outlet_name}\nHeadline: ${a.title}\nDescription: ${a.description || "(none)"}`)
    .join("\n\n");

  const { output } = await generateText({
    model: MODEL,
    system: SYSTEM,
    prompt: `Articles about one event:\n\n${prompt}\n\nProduce the analysis.`,
    output: Output.object({ schema }),
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

  const done: number[] = [];
  const failed: { id: number; error: string }[] = [];
  const queue = [...pending];
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (queue.length) {
        const { id } = queue.shift()!;
        try {
          await analyzeEvent(id);
          done.push(id);
        } catch (err) {
          failed.push({ id, error: err instanceof Error ? err.message : String(err) });
        }
      }
    }),
  );
  return { analyzed: done.length, failed };
}
