import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    environmentMatchGlobs: [["tests/**/*.test.tsx", "jsdom"]],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      include: [
        "src/js/lib/annotations.ts",
        "src/js/main/annotationStore.ts",
        "src/js/main/main.tsx",
        "src/jsx/utils/utils.ts",
        "src/jsx/ppro/ppro.ts",
        "src/jsx/utils/samples.ts",
      ],
      reporter: ["text", "json-summary", "lcov"],
      provider: "v8",
    },
  },
  resolve: {
    alias: {
      "@esTypes": path.resolve(__dirname, "src"),
    },
  },
});
