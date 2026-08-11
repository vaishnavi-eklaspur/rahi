import { neon } from "@neondatabase/serverless";

// null when DATABASE_URL is unset — routes fall back to the no-DB (full-code URL) path,
// so the app still works without Neon configured.
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
