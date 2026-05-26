import { defineConfig } from "@playwright/test";

const DEMO_URL = process.env.DEMO_URL ?? "http://localhost:4173";

export default defineConfig({
    testDir: "./tests/e2e",
    use: {
        baseURL: DEMO_URL,
        headless: true,
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
    },
    // When DEMO_URL is set (e.g. live GH Pages), no local server is needed.
    // Otherwise start vite preview (assumes demo is already built).
    webServer: process.env.DEMO_URL
        ? undefined
        : {
              command: "npm run preview:demo",
              url: "http://localhost:4173",
              reuseExistingServer: true,
          },
});
