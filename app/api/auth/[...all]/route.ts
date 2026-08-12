import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// All Better Auth endpoints (sign-in, sign-up, social, callback, get-session, sign-out)
// live here on the app's own origin.
export const { GET, POST } = toNextJsHandler(auth);
