/**
 * Helper utilities for scraping
 */

import crypto from 'crypto';

/**
 * User agent management
 */
const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Delay utilities
 */
export function humanDelay(min: number = 100, max: number = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min) + min);
  return new Promise((resolve: any) => setTimeout(resolve, delay));
}

export function exponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000,
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  return Math.floor(delay + jitter);
}

/**
 * Retry utilities
 */
export interface RetryOptions {
  attempts?: number;
  delay?: number;
  multiplier?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    attempts = 3,
    delay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === attempts - 1 || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      const retryDelay = exponentialBackoff(attempt, delay, maxDelay);

      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      await new Promise((resolve: any) => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * URL utilities
 */
export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function resolveUrl(baseUrl: string, relativeUrl: string): string {
  if (isAbsoluteUrl(relativeUrl)) {
    return relativeUrl;
  }

  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
}

export function getUrlHash(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
}

/**
 * Content utilities
 */
export function detectCaptcha(html: string): boolean {
  const captchaPatterns = [
    /recaptcha/i,
    /g-recaptcha/i,
    /h-captcha/i,
    /cf-challenge/i,
    /captcha-container/i,
    /solve-captcha/i,
    /security-check/i,
    /<iframe[^>]*src="[^"]*captcha[^"]*"/i,
  ];

  return captchaPatterns.some((pattern: any) => pattern.test(html));
}

export function detectCloudflare(html: string, headers?: Record<string, string>): boolean {
  const htmlPatterns = [
    /Checking your browser before accessing/i,
    /cf-browser-verification/i,
    /cf-challenge-error/i,
    /cloudflare-static/i,
  ];

  const headerIndicators = headers
    ? [
        headers['cf-ray'],
        headers['cf-cache-status'],
        headers['server']?.includes('cloudflare'),
      ].some(Boolean)
    : false;

  return headerIndicators || htmlPatterns.some((pattern: any) => pattern.test(html));
}

/**
 * Resource blocking utilities
 */
export function createResourceBlocker(blockedTypes: string[]) {
  const typeSet = new Set(blockedTypes);

  return (resourceType: string): boolean => {
    return typeSet.has(resourceType.toLowerCase());
  };
}

/**
 * Device emulation presets
 */
export const DEVICE_PRESETS = {
  'iPhone 12': {
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
    _userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  },
  iPad: {
    viewport: {
      width: 820,
      height: 1180,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
    _userAgent:
      'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  },
  'Pixel 5': {
    viewport: {
      width: 393,
      height: 851,
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
    },
    _userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  },
  Desktop: {
    viewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    },
    _userAgent: getRandomUserAgent(),
  },
};

/**
 * Memory utilities
 */
export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  const percentage = (used / total) * 100;

  return {
    used,
    total,
    percentage: Math.round(percentage),
  };
}

export function isMemoryPressure(threshold: number = 0.85): boolean {
  const { percentage } = getMemoryUsage();
  return percentage / 100 > threshold;
}

/**
 * Timing utilities
 */
export class Timer {
  private start: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.start = Date.now();
  }

  mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  duration(name?: string): number {
    const end = name && this.marks.has(name) ? (this.marks.get(name) ?? Date.now()) : Date.now();
    return end - this.start;
  }

  reset(): void {
    this.start = Date.now();
    this.marks.clear();
  }
}

/**
 * Batch processing utilities
 */
export async function* batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5,
): AsyncIterableIterator<R> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(processor));

    for (const result of results) {
      yield result;
    }
  }
}

/**
 * Queue utilities
 */
export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  enqueueMany(items: T[]): void {
    this.items.push(...items);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }
}

/**
 * Check if URL is allowed by robots.txt rules
 * This is a simplified implementation
 */
export async function checkRobotsTxt(): Promise<boolean> {
  try {
    // In production, fetch and parse robots.txt
    // For now, always return true
    return true;
  } catch {
    return false;
  }
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
    ([key]: any) => key.toLowerCase() === 'content-type',
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
  return !nonScrapableExtensions.some((ext: any) => urlLower.endsWith(ext));
}
