# Multi-stage build producing Next.js's standalone output — a small, self-contained
# runner image that runs on any container orchestrator (Kubernetes / OpenShift) with
# no dependency on Vercel's platform. Secrets are injected at runtime by the
# orchestrator (env / mounted Secret), never baked into the image.

# 1. Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build (needs output:"standalone" in next.config.ts)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time placeholders — never used at runtime. Module-level init (lib/db, lib/auth)
# reads these during `next build`; the orchestrator supplies real values at runtime. Set
# inline on the build so they don't persist as image ENV (and don't trip secret linters).
RUN DATABASE_URL=postgres://user:pass@localhost:5432/db \
    BETTER_AUTH_SECRET=build-placeholder-secret-value-0000 \
    BETTER_AUTH_URL=http://localhost:3000 \
    npm run build

# 3. Runtime — only the standalone server + static assets, running as a non-root user
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# .next/standalone bundles a minimal node_modules + server.js; static assets ship beside it.
# (No public/ dir in this project — add a COPY for it here if one is introduced.)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# Orchestrator liveness/readiness signal (busybox wget ships in alpine).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server.js"]
