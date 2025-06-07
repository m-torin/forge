import { test } from "@playwright/test";

import { createVisualTester, visualTestHelpers } from "../utils/visual-testing";

test.describe("Visual Regression Tests", () => {
  test("homepage visual comparison", async ({ page }) => {
    await page.goto("/");

    const tester = createVisualTester(page, "homepage");

    // Full page screenshot
    const result = await tester.compareScreenshot("full-page");

    if (!result.passed) {
      console.log(`❌ Visual test failed: ${result.imagePath}`);
    }
  });

  test("homepage responsive design", async ({ page }) => {
    await page.goto("/");

    const results = await visualTestHelpers.testResponsiveDesign(
      page,
      "homepage",
      {
        // Mask dynamic elements like dates or user-specific content
        mask: [page.locator('[data-testid="current-time"]')],
      },
    );

    // Check that all viewport tests passed
    for (const [viewport, result] of Object.entries(results)) {
      if (!result.passed) {
        console.log(`❌ ${viewport} visual test failed`);
      }
    }
  });

  test("product card hover states", async ({ page }) => {
    await page.goto("/en/products");

    const tester = createVisualTester(page, "product-card");
    const productCard = page.locator('[data-testid="product-card"]').first();

    const results = await tester.compareHoverState(
      productCard,
      "product-card-hover",
    );

    console.log("Normal state:", results.normal.passed ? "✅" : "❌");
    console.log("Hover state:", results.hover.passed ? "✅" : "❌");
  });

  test("theme variations", async ({ page }) => {
    await page.goto("/");

    const results = await visualTestHelpers.testThemeVariations(
      page,
      "theme-comparison",
    );

    console.log("Light theme:", results.light.passed ? "✅" : "❌");
    console.log("Dark theme:", results.dark.passed ? "✅" : "❌");
  });

  test("form states", async ({ page }) => {
    await page.goto("/en/contact");

    const tester = createVisualTester(page, "contact-form");
    const form = page.locator("form").first();

    const results = await tester.compareFormStates(form, "contact-form");

    console.log("Empty form:", results.empty.passed ? "✅" : "❌");
    console.log("Filled form:", results.filled.passed ? "✅" : "❌");
    if (results.error) {
      console.log("Error state:", results.error.passed ? "✅" : "❌");
    }
  });

  test("scroll positions", async ({ page }) => {
    await page.goto("/en/about");

    const tester = createVisualTester(page, "about-page");

    const results = await tester.compareScrollPositions("about-scroll", [
      { name: "top", x: 0, y: 0 },
      { name: "middle", x: 0, y: 500 },
      { name: "bottom", x: 0, y: 1000 },
    ]);

    for (const [position, result] of Object.entries(results)) {
      console.log(`${position} position:`, result.passed ? "✅" : "❌");
    }
  });

  test("component states", async ({ page }) => {
    await page.goto("/en/products");

    const searchBox = page.locator('[data-testid="search-input"]');

    const results = await visualTestHelpers.testComponentStates(
      page,
      searchBox,
      "search-component",
      [
        {
          name: "empty",
          setup: async () => {
            await searchBox.clear();
          },
        },
        {
          name: "focused",
          setup: async () => {
            await searchBox.focus();
          },
        },
        {
          name: "with-text",
          setup: async () => {
            await searchBox.fill("test search query");
          },
        },
        {
          name: "with-suggestions",
          setup: async () => {
            await searchBox.fill("laptop");
            await page.waitForTimeout(500); // Wait for suggestions
          },
        },
      ],
    );

    for (const [state, result] of Object.entries(results)) {
      console.log(`${state} state:`, result.passed ? "✅" : "❌");
    }
  });
});
