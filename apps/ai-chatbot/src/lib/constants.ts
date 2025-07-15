import { generateDummyPassword } from './db/utils';

/**
 * Environment detection flags
 */
export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.PLAYWRIGHT || process.env.CI_PLAYWRIGHT,
);

/**
 * Regular expression to match guest user patterns
 */
export const guestRegex = /^guest-\d+$/;

/**
 * Dummy password for timing attack prevention
 */
export const DUMMY_PASSWORD = generateDummyPassword();
