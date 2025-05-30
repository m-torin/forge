/**
 * Date and time utilities for consistent formatting across the workers app
 */

/**
 * Convert Unix timestamp (seconds) to ISO string
 */
export function unixToISO(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Convert Unix timestamp (milliseconds) to ISO string
 */
export function msToISO(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentISO(): string {
  return new Date().toISOString();
}

/**
 * Calculate time ago string
 */
export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) {
    return 'just now';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Parse cron expression into human readable format
 */
export function parseCronExpression(cron: string): string {
  const cronMap: Record<string, string> = {
    '0 */2 * * *': 'Every 2 hours',
    '0 */6 * * *': 'Every 6 hours',
    '0 */12 * * *': 'Every 12 hours',
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * *': 'Daily at 9:00 AM',
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
  };

  return cronMap[cron] || `Custom schedule: ${cron}`;
}
