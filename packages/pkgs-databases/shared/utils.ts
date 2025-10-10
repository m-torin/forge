/**
 * Shared utilities for all database packages
 */

/**
 * Runtime environment detection
 */
export function detectRuntime(): 'nodejs' | 'edge' | 'browser' | 'worker' {
  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'nodejs';
  }

  // Check for Edge Runtime
  if (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) {
    return 'edge';
  }

  // Check for Web Worker
  if (
    typeof self !== 'undefined' &&
    'importScripts' in (self as any) &&
    typeof (self as any).importScripts === 'function'
  ) {
    return 'worker';
  }

  // Check for browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser';
  }

  // Default to edge for unknown serverless environments
  return 'edge';
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T = any>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify with fallback
 */
export function safeJsonStringify(value: any, fallback = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * Create a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff delay calculation
 */
export function exponentialBackoff(attempt: number, baseDelay = 100, maxDelay = 5000): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to avoid thundering herd
  return delay + Math.random() * delay * 0.1;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message = 'Operation timed out',
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Safe async function wrapper with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: Error) => void,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): T & { cancel(): void } {
  let timeout: NodeJS.Timeout | number | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    if (timeout !== null) {
      clearTimeout(timeout as any);
    }
    timeout = setTimeout(later, wait);
  } as T & { cancel(): void };

  debounced.cancel = function () {
    if (timeout !== null) {
      clearTimeout(timeout as any);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | number | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout as any);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  } as T;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        // Relax typing for recursive merge of nested objects
        deepMerge((target as any)[key], (source as any)[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Generate random ID
 */
export function generateId(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Environment variable helpers
 */
export const env = {
  /**
   * Get environment variable with fallback
   */
  get(key: string, fallback = ''): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || fallback;
    }
    return fallback;
  },

  /**
   * Get boolean environment variable
   */
  getBoolean(key: string, fallback = false): boolean {
    const value = this.get(key);
    if (!value) return fallback;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  },

  /**
   * Get number environment variable
   */
  getNumber(key: string, fallback = 0): number {
    const value = this.get(key);
    const num = parseInt(value, 10);
    return isNaN(num) ? fallback : num;
  },
};

/**
 * Performance measurement utility
 */
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.startTime = this.now();
  }

  private now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }

  mark(name: string): void {
    this.marks.set(name, this.now());
  }

  measure(name: string, startMark?: string): number {
    const endTime = this.now();
    const startTime = startMark ? this.marks.get(startMark) || this.startTime : this.startTime;
    const duration = endTime - startTime;
    this.marks.set(name, duration);
    return duration;
  }

  getDuration(name?: string): number {
    if (name) {
      return this.marks.get(name) || 0;
    }
    return this.now() - this.startTime;
  }

  reset(): void {
    this.startTime = this.now();
    this.marks.clear();
  }
}
