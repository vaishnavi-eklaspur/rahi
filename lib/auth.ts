import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

// Self-hosted auth, running on the app's OWN domain at /api/auth. That makes the
// session cookie first-party, so login survives ad blockers and third-party-cookie
// blocking (the reason the old Neon-hosted auth on a separate domain couldn't stick).
// Uses the same Neon Postgres DB as the rest of the app, in its own tables.
//
// ponytail: the Neon Pool talks WebSocket and relies on Node's global WebSocket
// (Node 22+, which Vercel and local both run). If ever deployed on Node <22, add
// the `ws` package and set neonConfig.webSocketConstructor = ws.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: process.env.BETTER_AUTH_URL, // secret is read from BETTER_AUTH_SECRET
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
});
