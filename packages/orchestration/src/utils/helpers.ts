import crypto from 'node:crypto';

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Creates a deterministic hash of a URL for deduplication
 */
export function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Calculates next run time for a cron expression
 */
export function calculateNextCronRun(cron: string): Date {
  // This is a simplified implementation
  // In production, use a library like node-cron or croner
  const now = new Date();
  const parts = cron.split(' ');

  if (parts[0] === '0' && parts[1] === '*') {
    // Every hour
    const next = new Date(now);
    next.setHours(next.getHours() + 1);
    next.setMinutes(0);
    next.setSeconds(0);
    return next;
  }

  if (parts[0] === '0' && parts[1] === '0') {
    // Daily
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0);
    next.setMinutes(0);
    next.setSeconds(0);
    return next;
  }

  // Default: 1 hour from now
  return new Date(now.getTime() + 3600000);
}

/**
 * Exponential backoff calculator
 */
export function calculateBackoff(attempt: number, baseDelayMs = 1000): number {
  return Math.min(baseDelayMs * Math.pow(2, attempt), 30000); // Max 30 seconds
}

/**
 * Extract data from HTML/JSON using selectors
 */
export function extractWithSelectors(
  content: string | object,
  selectors: Record<string, string>,
): Record<string, unknown> {
  // If content is already an object, use it directly
  if (typeof content === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      // Simple dot notation path extraction
      const value = selector.split('.').reduce((obj: any, key) => obj?.[key], content);
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  // For HTML content, you would use a library like cheerio
  // This is a placeholder implementation
  try {
    const parsed = JSON.parse(content);
    return extractWithSelectors(parsed, selectors);
  } catch {
    // If not JSON, return empty object
    // In production, implement HTML parsing with cheerio
    return {};
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(prefix = 'session'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
