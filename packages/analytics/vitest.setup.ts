import '@testing-library/jest-dom/vitest';

// Set up required environment variables for tests
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com';
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
