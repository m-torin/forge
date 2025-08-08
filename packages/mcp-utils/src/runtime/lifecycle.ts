/**
 * Centralized Process Lifecycle Management
 * Provides idempotent process event handlers to prevent duplicate registrations
 * and ensure proper cleanup ordering across the application
 */

export interface LifecycleCleanupHandler {
  name: string;
  priority: number; // Higher number = higher priority (executed first)
  cleanup: () => Promise<void> | void;
}

/**
 * Centralized lifecycle manager to prevent duplicate process handlers
 */
class ProcessLifecycleManager {
  private cleanupHandlers = new Set<LifecycleCleanupHandler>();
  private isShuttingDown = false;
  private handlersRegistered = false;

  /**
   * Register a cleanup handler with optional priority
   */
  registerCleanupHandler(handler: LifecycleCleanupHandler): void {
    this.cleanupHandlers.add(handler);

    // Ensure process handlers are registered (idempotent)
    this.ensureProcessHandlers();
  }

  /**
   * Remove a cleanup handler
   */
  removeCleanupHandler(name: string): boolean {
    for (const handler of this.cleanupHandlers) {
      if (handler.name === name) {
        return this.cleanupHandlers.delete(handler);
      }
    }
    return false;
  }

  /**
   * Get all registered handlers (for testing)
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.cleanupHandlers).map(h => h.name);
  }

  /**
   * Check if handlers are already registered (for testing)
   */
  areHandlersRegistered(): boolean {
    return this.handlersRegistered;
  }

  /**
   * Execute all cleanup handlers in priority order
   */
  private async executeCleanup(reason: string): Promise<void> {
    if (this.isShuttingDown) {
      console.error(`[Lifecycle] Already shutting down, ignoring ${reason}`);
      return;
    }

    this.isShuttingDown = true;
    console.error(`[Lifecycle] Starting cleanup for ${reason}`);

    // Sort handlers by priority (highest first)
    const sortedHandlers = Array.from(this.cleanupHandlers).sort((a, b) => b.priority - a.priority);

    for (const handler of sortedHandlers) {
      try {
        console.error(`[Lifecycle] Executing cleanup: ${handler.name}`);
        const result = handler.cleanup();
        if (result instanceof Promise) {
          await result;
        }
        console.error(`[Lifecycle] Completed cleanup: ${handler.name}`);
      } catch (error) {
        console.error(`[Lifecycle] Error in cleanup handler '${handler.name}':`, error);
      }
    }

    console.error(`[Lifecycle] All cleanup handlers completed for ${reason}`);
  }

  /**
   * Ensure process handlers are registered exactly once
   */
  private ensureProcessHandlers(): void {
    if (this.handlersRegistered) {
      return;
    }

    // Check if any handlers are already registered by other code
    const hasExistingHandlers =
      process.listeners('SIGTERM').length > 0 ||
      process.listeners('SIGINT').length > 0 ||
      process.listeners('uncaughtException').length > 0 ||
      process.listeners('unhandledRejection').length > 0 ||
      process.listeners('exit').length > 0 ||
      process.listeners('beforeExit').length > 0;

    if (hasExistingHandlers) {
      console.error(
        '[Lifecycle] Warning: Existing process handlers detected. Some cleanup may be duplicated.',
      );
    }

    // Register handlers with 'once' where appropriate
    process.once('SIGTERM', async () => {
      console.error('[Lifecycle] Received SIGTERM');
      await this.executeCleanup('SIGTERM');
      process.exit(0);
    });

    process.once('SIGINT', async () => {
      console.error('[Lifecycle] Received SIGINT');
      await this.executeCleanup('SIGINT');
      process.exit(0);
    });

    // Use 'on' for exception handlers as they may occur multiple times
    process.on('uncaughtException', async error => {
      console.error('[Lifecycle] Uncaught exception:', error);
      await this.executeCleanup('uncaughtException');
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('[Lifecycle] Unhandled rejection at:', promise, 'reason:', reason);
      await this.executeCleanup('unhandledRejection');
      process.exit(1);
    });

    // Handle graceful shutdown scenarios
    process.once('exit', () => {
      if (!this.isShuttingDown) {
        console.error('[Lifecycle] Process exit without cleanup');
      }
    });

    process.once('beforeExit', async () => {
      if (!this.isShuttingDown) {
        console.error('[Lifecycle] Before exit - starting cleanup');
        await this.executeCleanup('beforeExit');
      }
    });

    this.handlersRegistered = true;
    console.error('[Lifecycle] Process handlers registered successfully');
  }
}

// Global singleton instance
const globalLifecycleManager = new ProcessLifecycleManager();

/**
 * Register a cleanup handler that will be called on process shutdown
 *
 * @param name Unique name for the handler
 * @param cleanup Async or sync cleanup function
 * @param priority Priority level (higher = executed first, default: 50)
 */
export function registerCleanupHandler(
  name: string,
  cleanup: () => Promise<void> | void,
  priority: number = 50,
): void {
  globalLifecycleManager.registerCleanupHandler({
    name,
    cleanup,
    priority,
  });
}

/**
 * Remove a previously registered cleanup handler
 */
export function removeCleanupHandler(name: string): boolean {
  return globalLifecycleManager.removeCleanupHandler(name);
}

/**
 * Get list of registered cleanup handlers (for testing)
 */
export function getRegisteredHandlers(): string[] {
  return globalLifecycleManager.getRegisteredHandlers();
}

/**
 * Check if process handlers are registered (for testing)
 */
export function areHandlersRegistered(): boolean {
  return globalLifecycleManager.areHandlersRegistered();
}

// Export the manager for advanced use cases
export { globalLifecycleManager };

/**
 * Common cleanup priorities for consistent ordering
 */
export const CLEANUP_PRIORITIES = {
  CRITICAL_RESOURCES: 100, // Database connections, critical file handles
  MONITORING: 90, // Performance monitors, memory trackers
  WORKERS: 80, // Worker pools, background processes
  CACHES: 70, // Cache cleanup, temporary data
  LOGGING: 60, // Log flushing, file handles
  DEFAULT: 50, // Standard cleanup operations
  FINAL: 10, // Final cleanup, metrics reporting
} as const;
