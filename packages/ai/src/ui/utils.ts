/**
 * UI Utilities
 * Helper functions for AI Elements and UI components
 */

import { logError, logWarn } from '@repo/observability';
import { clsx, type ClassValue } from 'clsx';

/**
 * Merge className strings with support for conditional classes
 * Similar to shadcn/ui's cn() function but without tailwind-merge dependency
 *
 * @param inputs - Class values to merge
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Generate unique IDs for component instances
 */
let idCounter = 0;
export function generateId(prefix = 'ui'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString();
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({ behavior, block: 'nearest' });
}

/**
 * Copy text to clipboard with fallback
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (err) {
    logWarn('Failed to copy text to clipboard', { error: err });
    return false;
  }
}

/**
 * Share content using Web Share API with fallback to clipboard
 */
export async function shareContent(data: {
  text?: string;
  url?: string;
  title?: string;
}): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback to clipboard
      const shareText = data.text || data.url || '';
      if (shareText) {
        return await copyToClipboard(shareText);
      }
      return false;
    }
  } catch {
    // User cancelled share or other error
    return false;
  }
}

/**
 * React 19 compatible throttle function with cleanup support
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) & { cleanup: () => void } {
  let inThrottle: boolean;
  let timeoutId: NodeJS.Timeout | undefined;

  const throttledFunc = (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      timeoutId = setTimeout(() => {
        inThrottle = false;
        timeoutId = undefined;
      }, limit);
    }
  };

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
      inThrottle = false;
    }
  };

  return Object.assign(throttledFunc, { cleanup });
}

/**
 * React 19 compatible debounce function with cleanup support
 */
export function debounceWithCleanup<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cleanup: () => void } {
  let timeout: NodeJS.Timeout | undefined;

  const debouncedFunc = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      func(...args);
    }, wait);
  };

  const cleanup = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  return Object.assign(debouncedFunc, { cleanup });
}

/**
 * Hook for managing cleanup functions in React 19
 */
export interface CleanupTracker {
  addCleanup: (fn: () => void) => void;
  cleanup: () => void;
}

export function createCleanupTracker(): CleanupTracker {
  const cleanupFunctions: (() => void)[] = [];

  return {
    addCleanup: (fn: () => void) => {
      cleanupFunctions.push(fn);
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          logWarn('Cleanup function failed', { error });
        }
      });
      cleanupFunctions.length = 0;
    },
  };
}

/**
 * Timer management for React 19 compatibility
 */
export interface TimerManager {
  setTimeout: (callback: () => void, delay: number) => number;
  setInterval: (callback: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
  clearInterval: (id: number) => void;
  clearAll: () => void;
}

export function createTimerManager(): TimerManager {
  const timers = new Set<number>();

  return {
    setTimeout: (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        callback();
      }, delay);
      timers.add(id);
      return id;
    },

    setInterval: (callback: () => void, delay: number) => {
      const id = window.setInterval(callback, delay);
      timers.add(id);
      return id;
    },

    clearTimeout: (id: number) => {
      window.clearTimeout(id);
      timers.delete(id);
    },

    clearInterval: (id: number) => {
      window.clearInterval(id);
      timers.delete(id);
    },

    clearAll: () => {
      timers.forEach(id => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
      timers.clear();
    },
  };
}

/**
 * React 19 compatible async error handler
 */
export function withAsyncErrorBoundary<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  onError?: (error: Error) => void,
): T {
  return (async (...args: any[]) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err; // Re-throw to let error boundary catch it
    }
  }) as T;
}

/**
 * Safe JSON parsing with error handling
 */
export function safeParse<T = any>(jsonString: string, fallback?: T): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logWarn('[safeParse] Failed to parse JSON', { jsonString, error });
    return fallback || null;
  }
}

/**
 * React 19 compatible event handler with error boundary support
 */
export function createSafeEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  onError?: (error: Error) => void,
): T {
  return ((...args: any[]) => {
    try {
      return handler(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      logError('[SafeEventHandler] Error in event handler', err as Error);
      throw err; // Re-throw to let error boundary catch it
    }
  }) as T;
}

/**
 * Validate React 19 component props
 */
export function validateProps<T extends Record<string, any>>(
  props: T,
  requiredProps: (keyof T)[],
  componentName?: string,
): T {
  const missing = requiredProps.filter(prop => !(prop in props));

  if (missing.length > 0) {
    const error = new Error(
      `Missing required props in ${componentName || 'component'}: ${missing.join(', ')}`,
    );
    logError('[validateProps]', error as Error);
    throw error;
  }

  return props;
}

/**
 * React 19 compatible ref callback creator
 */
export function createRefCallback<T>(
  onMount?: (element: T) => void,
  onUnmount?: (element: T) => void,
) {
  let currentElement: T | null = null;

  return (element: T | null) => {
    if (element !== currentElement) {
      if (currentElement && onUnmount) {
        onUnmount(currentElement);
      }

      currentElement = element;

      if (element && onMount) {
        onMount(element);
      }
    }
  };
}
