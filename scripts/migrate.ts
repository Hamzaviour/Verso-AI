import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(readFileSync("db/schema.sql", "utf8"));
  await pool.end();
  console.log("schema applied");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
