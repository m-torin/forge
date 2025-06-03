import { createAppPlaywrightConfig } from "@repo/testing/playwright";

export default createAppPlaywrightConfig({
  name: "web",
  appDirectory: "/Users/torin/repos/new--/forge/apps/web",
  baseURL: "http://localhost:3200",
  devCommand: "pnpm dev",
  port: 3200,
});
