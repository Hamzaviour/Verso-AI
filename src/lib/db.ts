import { neon } from "@neondatabase/serverless";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const sql = hasDatabase ? neon(process.env.DATABASE_URL!) : null;

export function db() {
  if (!sql) throw new Error("DATABASE_URL is not set");
  return sql;
}

export function toVector(v: number[]): string {
  return `[${v.join(",")}]`;
}
