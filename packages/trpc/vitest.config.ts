import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["server/**/__tests__/**/*.test.ts", "server/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["server/**/*.ts"],
      exclude: ["server/**/__tests__/**", "server/**/index.ts"],
    },
  },
});
