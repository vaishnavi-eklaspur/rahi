"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin: auth runs inside this app at /api/auth, so the session cookie is
// first-party and rides along automatically on our API calls — no cross-site
// requests, no bearer-token juggling.
export const authClient = createAuthClient();
