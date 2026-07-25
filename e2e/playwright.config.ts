import { defineConfig, devices } from "@playwright/test";

const WEB_URL = process.env.E2E_WEB_URL ?? "http://localhost:3000";
const WIDGET_URL = process.env.E2E_WIDGET_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "web",
      testMatch: /web\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: WEB_URL },
    },
    {
      name: "web-mobile",
      testMatch: /web\..*\.spec\.ts/,
      use: { ...devices["iPhone 14"], baseURL: WEB_URL },
    },
    {
      name: "widget",
      testMatch: /widget\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: WIDGET_URL },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter web start --port 3000",
      url: WEB_URL,
      cwd: "..",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter widget start --port 3001",
      url: WIDGET_URL,
      cwd: "..",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
