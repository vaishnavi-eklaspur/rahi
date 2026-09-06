// Liveness/readiness probe for container orchestrators (Kubernetes / OpenShift).
// Dependency-free on purpose: the app degrades gracefully without DB or AI, so
// "healthy" = the server process is up and serving. A DB check here would wrongly
// fail readiness whenever Neon is briefly unreachable and evict a working pod.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
