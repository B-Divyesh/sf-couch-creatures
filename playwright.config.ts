import { defineConfig } from "@playwright/test";

const liveSite = process.env.COUCH_SITE_URL;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  use: {
    baseURL: liveSite || "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
  },
  webServer: liveSite
    ? undefined
    : [
        {
          command: "NODE_ENV=test npm --prefix realtime start",
          url: "http://127.0.0.1:8787/api/health",
          reuseExistingServer: true,
        },
        {
          command: "npm run dev -- --port 4173",
          url: "http://127.0.0.1:4173",
          reuseExistingServer: true,
        },
      ],
});
