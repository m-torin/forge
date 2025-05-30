import type { ExtractionResult, SelectorConfig, SelectorMap } from '../types';

/**
 * Extract data from HTML using CSS selectors
 * This is a placeholder - in production, use cheerio or similar
 */
export function extractFromHtml(html: string, selectors: SelectorMap): ExtractionResult {
  const result: ExtractionResult = {};

  // This is a simplified implementation
  // In production, use a proper HTML parser like cheerio
  for (const [key, selectorOrConfig] of Object.entries(selectors)) {
    const _config: SelectorConfig =
      typeof selectorOrConfig === 'string'
        ? { selector: selectorOrConfig, transform: 'text' }
        : selectorOrConfig;

    // Placeholder extraction logic
    result[key] = null;
  }

  return result;
}

/**
 * Detect if a page contains a CAPTCHA
 */
export function detectCaptcha(html: string): boolean {
  const captchaIndicators = [
    'g-recaptcha',
    'h-captcha',
    'cf-turnstile',
    'captcha',
    'recaptcha',
    '/captcha/',
    'solve the puzzle',
    'verify you are human',
  ];

  const lowerHtml = html.toLowerCase();
  return captchaIndicators.some((indicator) => lowerHtml.includes(indicator));
}

/**
 * Check if URL is allowed by robots.txt rules
 * This is a simplified implementation
 */
export async function checkRobotsTxt(url: string, _userAgent = '*'): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const _robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    // In production, fetch and parse robots.txt
    // For now, always return true
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a random user agent
 */
export function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];

  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Wait for a random delay to appear more human-like
 */
export function humanDelay(min = 1000, max = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Sanitize filename for screenshots
 */
export function sanitizeFilename(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9-._]/g, '_')
    .slice(0, 200);
}

/**
 * Parse content type from headers
 */
export function parseContentType(headers: Record<string, string>): string | null {
  const contentType = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'content-type',
  )?.[1];

  return contentType ? contentType.split(';')[0].trim() : null;
}

/**
 * Check if URL is scrapable based on content type
 */
export function isScrapableUrl(url: string): boolean {
  const nonScrapableExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.zip',
    '.rar',
    '.tar',
    '.gz',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.mp4',
    '.avi',
    '.mov',
    '.mp3',
    '.wav',
  ];

  const urlLower = url.toLowerCase();
  return !nonScrapableExtensions.some((ext) => urlLower.endsWith(ext));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
