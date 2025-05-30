/**
 * Centralized time and date utilities
 */

// Time constants
export const TIME_UNITS = {
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  s: 1000,
} as const;

export const HOUR_MS = 3600000;
export const MINUTE_MS = 60000;
export const SECOND_MS = 1000;

/**
 * Format a timestamp to ISO string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Get a future date from now
 */
export function getTimeFromNow(ms: number): Date {
  return new Date(Date.now() + ms);
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Calculate elapsed time in milliseconds
 */
export function calculateElapsedTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Parse time window strings (e.g., '5m', '1h', '2d')
 */
export function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) return 0;

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  return num * (TIME_UNITS[unit as keyof typeof TIME_UNITS] ?? 0);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate next run time for a cron expression
 */
export function calculateNextCronRun(cron: string): Date {
  // This is a simplified implementation
  // In production, use a library like node-cron or croner
  const now = new Date();
  const [minute, hour] = cron.split(' ');

  if (minute === '0' && hour === '*') {
    // Every hour
    const next = new Date(now);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  }

  if (minute === '0' && hour === '0') {
    // Daily
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  // Default: 1 hour from now
  return new Date(now.getTime() + HOUR_MS);
}

/**
 * Format a relative time (e.g., "2 hours ago", "in 5 minutes")
 */
export function formatRelativeTime(date: Date | number): string {
  const timestamp = typeof date === 'number' ? date : date.getTime();
  const now = Date.now();
  const diff = now - timestamp;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / MINUTE_MS);
  const hours = Math.floor(absDiff / HOUR_MS);
  const days = Math.floor(absDiff / TIME_UNITS.d);

  const prefix = diff > 0 ? '' : 'in ';
  const suffix = diff > 0 ? ' ago' : '';

  if (days > 0) return `${prefix}${days} day${days > 1 ? 's' : ''}${suffix}`;
  if (hours > 0) return `${prefix}${hours} hour${hours > 1 ? 's' : ''}${suffix}`;
  if (minutes > 0) return `${prefix}${minutes} minute${minutes > 1 ? 's' : ''}${suffix}`;
  return diff > 0 ? 'just now' : 'now';
}

/**
 * Check if a date is within a time window
 */
export function isWithinTimeWindow(date: Date | number, windowMs: number): boolean {
  const timestamp = typeof date === 'number' ? date : date.getTime();
  return Date.now() - timestamp <= windowMs;
}

/**
 * Create a timeout promise that rejects after specified time
 */
export function createTimeoutPromise<T = never>(
  ms: number,
  message = 'Operation timed out',
): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}
