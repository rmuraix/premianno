import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      include: ["src/js/lib/annotations.ts", "src/jsx/utils/utils.ts"],
      reporter: ["text", "json-summary"],
      provider: "v8",
    },
  },
  resolve: {
    alias: {
      "@esTypes": path.resolve(__dirname, "src"),
    },
  },
});
