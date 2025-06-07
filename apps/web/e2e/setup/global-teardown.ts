import { type FullConfig } from "@playwright/test";
// Commenting out database cleanup for now as it requires proper env setup
// import { clearTestData } from '../fixtures/helpers';

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global test teardown...");

  try {
    // Database cleanup commented out - requires proper env setup
    // console.log('🗑️ Cleaning up test database...');
    // await clearTestData();
    // console.log('✅ Test database cleanup complete');

    // Clean up generated files
    console.log("📁 Cleaning up generated files...");
    await cleanupGeneratedFiles();
    console.log("✅ File cleanup complete");

    console.log("🎉 Global test teardown completed successfully");
  } catch (error) {
    console.error("❌ Global test teardown failed:", error);
    // Don't throw error to avoid failing the test run
    console.warn("⚠️ Continuing despite teardown failure");
  }
}

async function cleanupGeneratedFiles() {
  const fs = await import("fs/promises");
  const path = await import("path");

  try {
    // Remove performance baseline file
    const baselinePath = path.join(
      __dirname,
      "../utils/performance-baseline.json",
    );
    await fs.unlink(baselinePath).catch(() => {}); // Ignore if file doesn't exist

    // Clean up any test screenshots that weren't cleaned up
    const screenshotDir = path.join(__dirname, "../screenshots");
    try {
      const files = await fs.readdir(screenshotDir);
      const testScreenshots = files.filter((file) => file.startsWith("test-"));
      await Promise.all(
        testScreenshots.map((file) =>
          fs.unlink(path.join(screenshotDir, file)).catch(() => {}),
        ),
      );
    } catch {
      // Directory doesn't exist, that's fine
    }
  } catch (error) {
    console.warn("Warning: Some files could not be cleaned up:", error);
  }
}

export default globalTeardown;
