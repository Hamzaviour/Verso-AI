import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { runPipeline } = await import("../src/pipeline/run");
  const limit = Number(process.argv[2] ?? 10);
  const stats = await runPipeline({ analyzeLimit: limit, log: (m) => console.log(m) });
  console.log("done", JSON.stringify(stats).slice(0, 400));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
