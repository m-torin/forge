import { chromium, type FullConfig } from "@playwright/test";
// Commenting out database seeding for now as it requires proper env setup
// import { seedTestData, clearTestData } from '../fixtures/helpers';

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  try {
    // Database seeding commented out - requires proper env setup
    // console.log('📊 Setting up test database...');
    // await clearTestData();
    // await seedTestData();
    // console.log('✅ Test database setup complete');

    // Pre-warm the application
    console.log("🔥 Pre-warming application...");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      // Visit key pages to warm up the application
      const baseURL = config.projects[0].use.baseURL || "http://localhost:3200";

      await page.goto(`${baseURL}/`);
      await page.waitForLoadState("networkidle");

      await page.goto(`${baseURL}/en/products`);
      await page.waitForLoadState("networkidle");

      console.log("✅ Application pre-warming complete");
    } finally {
      await browser.close();
    }

    // Setup performance baseline
    console.log("⚡ Setting up performance baseline...");
    await setupPerformanceBaseline();
    console.log("✅ Performance baseline setup complete");

    console.log("🎉 Global test setup completed successfully");
  } catch (error) {
    console.error("❌ Global test setup failed:", error);
    throw error;
  }
}

async function setupPerformanceBaseline() {
  // Create performance baseline data that tests can reference
  const performanceBaseline = {
    fid: { error: 300, warning: 100 },
    cls: { error: 0.25, warning: 0.1 },
    fcp: { error: 3000, warning: 1800 },
    lcp: { error: 4000, warning: 2500 },
    loadComplete: { error: 5000, warning: 3000 },
    ttfb: { error: 1800, warning: 800 },
  };

  // Store baseline in a file that tests can read
  const fs = await import("fs/promises");
  const path = await import("path");

  const baselinePath = path.join(
    __dirname,
    "../utils/performance-baseline.json",
  );
  await fs.writeFile(
    baselinePath,
    JSON.stringify(performanceBaseline, null, 2),
  );
}

export default globalSetup;
