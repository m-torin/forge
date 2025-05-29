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
 * Flexible backoff calculator supporting exponential and custom strategies
 */
export function calculateBackoff(
  attempt: number,
  options: {
    baseDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    jitter?: boolean | number;
    strategy?: 'exponential' | 'linear' | 'constant';
  } = {}
): number {
  const {
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    multiplier = 2,
    jitter = false,
    strategy = 'exponential'
  } = options;

  let delay: number;
  
  switch (strategy) {
    case 'exponential':
      delay = baseDelayMs * Math.pow(multiplier, attempt);
      break;
    case 'linear':
      delay = baseDelayMs * (attempt + 1);
      break;
    case 'constant':
      delay = baseDelayMs;
      break;
    default:
      delay = baseDelayMs * Math.pow(multiplier, attempt);
  }

  // Cap at maximum
  delay = Math.min(delay, maxDelayMs);

  // Add jitter if requested
  if (jitter) {
    const jitterAmount = typeof jitter === 'number' 
      ? jitter 
      : baseDelayMs * 0.5; // Default 50% of base
    delay += Math.random() * jitterAmount;
  }

  return Math.floor(delay);
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

// ===== Date/Time Utilities =====

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

// ===== URL/Domain Utilities =====

/**
 * Extract domain from URL
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url; // Return as-is if invalid
  }
}

/**
 * Normalize URL (remove trailing slashes, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash from pathname
    if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.href;
  } catch {
    return url;
  }
}

// ===== Key/ID Generation =====

/**
 * Generate a namespaced key
 */
export function generateKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].filter(Boolean).join(':');
}

/**
 * Generate a unique ID with optional prefix
 */
export function generateUniqueId(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

// ===== Error Utilities =====

/**
 * Create a formatted error message
 */
export function createErrorMessage(operation: string, error: unknown): string {
  if (error instanceof Error) return `${operation}: ${error.message}`;
  return `${operation}: ${String(error)}`;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }
  return false;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') || message.includes('too many requests');
  }
  return false;
}

// ===== Type Guards and Validators =====

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a record object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


// ===== Polling Utilities =====

/**
 * Generic polling utility with resource cleanup
 */
export async function pollUntilCondition<T>(
  operation: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    intervalMs?: number;
    timeoutMs?: number;
    onPoll?: (result: T, attempt: number) => void;
  } = {}
): Promise<T> {
  const { intervalMs = 2000, timeoutMs = 300000, onPoll } = options;
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < timeoutMs) {
    const result = await operation();
    
    if (onPoll) {
      onPoll(result, attempt);
    }

    if (condition(result)) {
      return result;
    }

    attempt++;
    await sleep(intervalMs);
  }

  throw new Error(`Polling timeout after ${timeoutMs}ms`);
}

// ===== Environment Detection =====

/**
 * Development environment detection
 */
export function isDevelopment(): boolean {
  return (
    (process.env.NODE_ENV === 'development' ||
      process.env.QSTASH_URL?.includes('localhost') === true ||
      process.env.QSTASH_URL?.includes('127.0.0.1') === true ||
      process.env.QSTASH_URL?.includes('host.docker.internal') === true) ??
    false
  );
}

/**
 * Production environment detection
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' && !isDevelopment();
}

// ===== Result Type Guards =====

/**
 * Check if result is successful with data
 */
export function isSuccessResult<T>(result: {
  success: boolean;
  data?: T;
  error?: string;
}): result is { success: true; data: T } {
  return result.success === true && result.data !== undefined;
}

/**
 * Check if result is an error
 */
export function isErrorResult(result: {
  success: boolean;
  data?: unknown;
  error?: string;
}): result is { success: false; error: string } {
  return result.success === false && result.error !== undefined;
}

// ===== Map Utilities =====

/**
 * Clean up expired entries from a map based on timestamp
 */
export function cleanupExpiredEntries(map: Map<string, number>, ttl: number, debug = false): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, timestamp] of map.entries()) {
    if (now - timestamp > ttl) {
      map.delete(id);
      cleaned++;
    }
  }

  if (debug && cleaned > 0) {
    console.log(`[CLEANUP] Cleaned up ${cleaned} expired entries`);
  }
}

/**
 * Clean up oldest entries when map exceeds maximum size
 */
export function cleanupOldestEntries(map: Map<string, number>, maxEntries: number, debug = false): void {
  if (map.size <= maxEntries) {
    return;
  }

  // Sort entries by timestamp (oldest first)
  const entries = [...map.entries()].sort((a, b) => a[1] - b[1]);

  // Calculate how many entries to remove
  const removeCount = map.size - maxEntries;
  const toRemove = entries.slice(0, removeCount);

  // Remove oldest entries
  for (const [key] of toRemove) {
    map.delete(key);
  }

  if (debug) {
    console.log(`[CLEANUP] Removed ${removeCount} oldest entries to maintain size limit`);
  }
}

// ===== Validation Utilities =====

/**
 * Validate required fields in payload
 */
export function validatePayload<T extends Record<string, any>>(
  payload: T | undefined,
  requiredFields: (keyof T)[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload || !isRecord(payload)) {
    errors.push('Missing or invalid request payload');
    return { valid: false, errors };
  }

  for (const field of requiredFields) {
    const value = payload[field];
    if (value === undefined || value === null) {
      errors.push(`Missing required field: ${String(field)}`);
    } else if (typeof field === 'string' && field.endsWith('Id') && !isNonEmptyString(value)) {
      errors.push(`Invalid value for field: ${String(field)} (must be non-empty string)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe payload extraction with defaults
 */
export function extractPayload<T extends Record<string, any>>(
  context: { requestPayload?: T | null },
  defaults: Partial<T>,
): T {
  return {
    ...defaults,
    ...context.requestPayload,
  } as T;
}

// ===== State Machine Utilities =====

/**
 * Generic state machine for consistent state transitions
 */
export class StateMachine<TState extends string, TContext = any> {
  constructor(
    private state: TState,
    private transitions: Record<TState, Partial<Record<string, TState>>>,
    private context?: TContext
  ) {}

  getState(): TState {
    return this.state;
  }

  getContext(): TContext | undefined {
    return this.context;
  }

  canTransition(event: string): boolean {
    const stateTransitions = this.transitions[this.state];
    return stateTransitions ? event in stateTransitions : false;
  }

  transition(event: string, newContext?: TContext): TState {
    const stateTransitions = this.transitions[this.state];
    if (!stateTransitions || !(event in stateTransitions)) {
      throw new Error(`Invalid transition: ${event} from state ${this.state}`);
    }

    this.state = stateTransitions[event]!;
    if (newContext !== undefined) {
      this.context = newContext;
    }

    return this.state;
  }

  reset(initialState: TState, initialContext?: TContext): void {
    this.state = initialState;
    this.context = initialContext;
  }
}

// ===== Additional DRY Consolidation Helpers =====

/**
 * QStash environment detection
 */
export function isLocalQStash(): boolean {
  const qstashUrl = process.env.QSTASH_URL;
  return !!(qstashUrl && (qstashUrl.includes('127.0.0.1') || qstashUrl.includes('localhost')));
}

/**
 * Build workflow URL with optional base URL
 */
export function buildWorkflowUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http')) {
    return normalizeUrl(url);
  }
  return normalizeUrl(`${baseUrl || ''}${url}`);
}

/**
 * Parse time window strings (e.g., '5m', '1h', '2d')
 */
export function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ];
  
  return csvContent.join('\n');
}

/**
 * Convert data to XML format
 */
export function convertToXML(data: any[], rootElement = 'data'): string {
  const toXML = (obj: any, indent = ''): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(item => `${indent}<${key}>${toXML(item, indent + '  ')}</${key}>`).join('\n');
        }
        if (typeof value === 'object' && value !== null) {
          return `${indent}<${key}>\n${toXML(value, indent + '  ')}\n${indent}</${key}>`;
        }
        return `${indent}<${key}>${String(value)}</${key}>`;
      })
      .join('\n');
  };
  
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${data.map(item => toXML(item, '  ')).join('\n')}\n</${rootElement}>`;
}

/**
 * Create QStash client with error handling
 */
export function createQStashClient(): { token: string } | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    return null;
  }
  return { token };
}

/**
 * Build API endpoint URL with tenant ID
 */
export function buildApiEndpoint(base: string, tenantId: string, path: string): string {
  return `${base.replace(/\/$/, '')}/tenants/${tenantId}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Calculate success rate as formatted percentage
 */
export function calculateSuccessRate(successful: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((successful / total) * 100)}%`;
}

/**
 * Format a number as a percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Aggregate data by key with sum operation
 */
export function aggregateByKey<T>(
  data: T[], 
  keyFn: (item: T) => string, 
  valueFn: (item: T) => number
): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const item of data) {
    const key = keyFn(item);
    result[key] = (result[key] || 0) + valueFn(item);
  }
  
  return result;
}

/**
 * Enhanced safe JSON parsing with optional validation
 */
export function safeJsonParseWithValidation<T>(
  str: string | null | undefined, 
  fallback: T,
  validator?: (data: any) => data is T
): T {
  if (!str) return fallback;
  
  try {
    const parsed = JSON.parse(str);
    if (validator && !validator(parsed)) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}
