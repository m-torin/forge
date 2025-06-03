import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for workers app...');

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the app to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3400';
    console.log(`📡 Waiting for app at ${baseURL} to be ready...`);

    // Try to connect to the app with retries
    let retries = 30;
    let connected = false;

    while (retries > 0 && !connected) {
      try {
        const response = await page.goto(`${baseURL}/health`);
        if (response && response.status() === 200) {
          connected = true;
          console.log('✅ App health check passed');
        }
      } catch (error) {
        // Try the root path if health endpoint doesn't exist
        try {
          const response = await page.goto(baseURL);
          if (response && response.status() < 400) {
            connected = true;
            console.log('✅ App root endpoint accessible');
          }
        } catch (rootError) {
          retries--;
          if (retries > 0) {
            console.log(`⏳ App not ready, retrying... (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
    }

    if (!connected) {
      throw new Error('❌ Failed to connect to the workers app after multiple attempts');
    }

    // Perform any additional setup here
    console.log('🔧 Setting up test environment...');

    // Set up any test data or configurations needed
    // This could include creating test users, seeding data, etc.

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
