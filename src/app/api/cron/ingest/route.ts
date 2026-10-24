import { revalidateTag } from "next/cache";
import { runPipeline } from "@/pipeline/run";

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const stats = await runPipeline({ analyzeLimit: 12 });
    revalidateTag("events", "max");
    return Response.json({ ok: true, stats });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
