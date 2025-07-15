// Environment setup for scraping tests
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('SCRAPER_USER_AGENT', 'Test Agent');
vi.stubEnv('FIRECRAWL_API_KEY', 'test-api-key');
vi.stubEnv('PLAYWRIGHT_HEADLESS', 'true');
vi.stubEnv('PLAYWRIGHT_TIMEOUT', '30000');
