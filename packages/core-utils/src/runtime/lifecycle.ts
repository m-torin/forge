/**
 * Runtime lifecycle management (stub for future implementation)
 */

export const CLEANUP_PRIORITIES = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
} as const;

export type CleanupPriority = (typeof CLEANUP_PRIORITIES)[keyof typeof CLEANUP_PRIORITIES];

export interface CleanupHandler {
  name: string;
  priority: CleanupPriority;
  handler: () => void | Promise<void>;
}

const cleanupHandlers: CleanupHandler[] = [];

export function registerCleanupHandler(
  name: string,
  handler: () => void | Promise<void>,
  priority: CleanupPriority = CLEANUP_PRIORITIES.NORMAL,
): void {
  cleanupHandlers.push({ name, handler, priority });
}

export async function runCleanup(): Promise<void> {
  const sorted = cleanupHandlers.sort((a, b) => a.priority - b.priority);
  for (const { handler } of sorted) {
    await Promise.resolve(handler());
  }
}
