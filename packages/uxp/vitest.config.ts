import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      include: [
        "src/lib/annotations.ts",
        "src/lib/annotationStore.ts",
        "src/lib/host.ts",
        "src/lib/storage.ts",
        "src/main.tsx",
      ],
      reporter: ["text", "json-summary", "lcov"],
      provider: "v8",
    },
  },
});
