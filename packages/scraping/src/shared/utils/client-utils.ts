/**
 * Client-side utilities
 * Utilities specific to browser/client-side scraping operations
 */

import { logInfo } from '@repo/observability';

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running in Node.js environment
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && !!process.versions?.node;
}

/**
 * Get current page URL (browser only)
 */
export function getCurrentUrl(): string {
  if (!isBrowser()) {
    throw new Error('getCurrentUrl() can only be called in browser environment');
  }
  return window.location.href;
}

/**
 * Get current page title (browser only)
 */
export function getCurrentTitle(): string {
  if (!isBrowser()) {
    throw new Error('getCurrentTitle() can only be called in browser environment');
  }
  return document.title;
}

/**
 * Get page HTML content (browser only)
 */
export function getPageHtml(): string {
  if (!isBrowser()) {
    throw new Error('getPageHtml() can only be called in browser environment');
  }
  return document.documentElement.outerHTML;
}

/**
 * Extract data using CSS selectors (browser only)
 */
export function extractFromCurrentPage(
  selectors: Record<string, string>,
): Record<string, string | string[] | null> {
  if (!isBrowser()) {
    throw new Error('extractFromCurrentPage() can only be called in browser environment');
  }

  const result: Record<string, string | string[] | null> = {};

  for (const [key, selector] of Object.entries(selectors)) {
    try {
      const elements = document.querySelectorAll(selector);

      if (elements.length === 0) {
        result[key] = null;
      } else if (elements.length === 1) {
        result[key] = elements[0].textContent?.trim() || null;
      } else {
        result[key] = Array.from(elements).map((el: any) => el.textContent?.trim() || '');
      }
    } catch {
      // Client-side errors are handled differently
      result[key] = null;
    }
  }

  return result;
}

/**
 * Download content as file (browser only)
 */
export function downloadContent(
  content: string,
  filename: string,
  mimeType: string = 'text/plain',
): void {
  if (!isBrowser()) {
    throw new Error('downloadContent() can only be called in browser environment');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Log to browser console with timestamp
 */
export function clientLog(message: string, ...args: any[]): void {
  if (isBrowser()) {
    // Client logging is acceptable for debugging purposes
    logInfo(`[${new Date().toISOString()}] ${message}`, ...args);
  }
}

/**
 * Create a simple progress tracker
 */
export class ClientProgressTracker {
  private element: HTMLElement | null = null;
  private total = 0;
  private completed = 0;

  constructor(containerId?: string) {
    if (isBrowser() && containerId) {
      this.element = document.getElementById(containerId);
    }
  }

  start(total: number): void {
    this.total = total;
    this.completed = 0;
    this.updateDisplay();
  }

  increment(): void {
    this.completed++;
    this.updateDisplay();
  }

  finish(): void {
    this.completed = this.total;
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const percentage = this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0;
    const message = `Progress: ${this.completed}/${this.total} (${percentage}%)`;

    if (this.element) {
      this.element.textContent = message;
    } else {
      clientLog(message);
    }
  }
}

/**
 * Get browser information
 */
export function getBrowserInfo(): {
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
} | null {
  if (!isBrowser()) {
    return null;
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  };
}

/**
 * Simple fetch wrapper with timeout
 */
export async function clientFetch(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  if (!isBrowser()) {
    throw new Error('clientFetch() can only be called in browser environment');
  }

  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Parse URL parameters
 */
export function parseUrlParams(url?: string): Record<string, string> {
  if (!isBrowser() && !url) {
    return {};
  }

  const searchParams = new URLSearchParams(url ? new URL(url).search : window.location.search);

  const params: Record<string, string> = {};
  for (const [key, value] of searchParams) {
    params[key] = value;
  }

  return params;
}
