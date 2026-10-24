import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

// Analysis runs on Groq's free tier when GROQ_API_KEY is set, otherwise
// through Vercel AI Gateway with a plain provider/model string.
export function analysisModel(): LanguageModel {
  if (process.env.GROQ_API_KEY) {
    return groq(process.env.VERSO_ANALYSIS_MODEL || "openai/gpt-oss-120b");
  }
  return process.env.VERSO_ANALYSIS_MODEL || "anthropic/claude-sonnet-5.5";
}

// Embeddings run locally with transformers.js: no key, no cost.
export const EMBEDDING_MODEL = process.env.VERSO_EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIMS = 384;

type Extractor = (texts: string[], opts: { pooling: "mean"; normalize: boolean }) => Promise<{ tolist(): number[][] }>;

let extractor: Promise<Extractor> | null = null;

async function getExtractor(): Promise<Extractor> {
  if (!extractor) {
    extractor = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // Serverless filesystems are read-only outside /tmp.
      if (process.env.VERCEL) env.cacheDir = "/tmp/transformers-cache";
      return (await pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "q8" })) as unknown as Extractor;
    })();
  }
  return extractor;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const run = await getExtractor();
  const out = await run(texts, { pooling: "mean", normalize: true });
  return out.tolist();
}
