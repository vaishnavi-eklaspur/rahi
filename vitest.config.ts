import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Unit/integration tests run on Node (route handlers are plain Request→Response
// functions). The `@/` alias mirrors tsconfig so imports resolve the same way.
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": root },
  },
});
