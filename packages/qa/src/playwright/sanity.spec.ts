import { expect, test } from "@playwright/test";

test.describe("Sanity Tests", () => {
  test("should load example.com and have correct title", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example Domain/);
  });
});
