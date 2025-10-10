/**
 * Session Management Utilities
 * Standardized session initialization for all agents
 */

import { BoundedCache } from './cache';
import { createMCPLogger } from './logger';

export interface AgentSession {
  sessionId: string;
  agentType: string;
  logger: any | null;
  cache: BoundedCache | null;
  startTime: number;
}

export interface SessionOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheSize?: number;
  cacheTTL?: number;
  enableAnalytics?: boolean;
}

/**
 * Initialize a standardized agent session with logger and cache
 * Eliminates duplicate initialization code across all agents
 */
export async function initializeAgentSession(
  sessionId: string,
  agentType: string,
  options: SessionOptions = {},
): Promise<AgentSession> {
  const {
    logLevel = 'info',
    cacheSize = 100,
    cacheTTL = 1800000, // 30 minutes default
    enableAnalytics = true,
  } = options;

  // Create logger with consistent naming
  const logger = createMCPLogger({
    sessionId: `${agentType}-${sessionId}`,
    logLevel,
    logDir: './logs',
    maxBufferSize: 16384,
    maxFileSize: 10485760,
    maxFiles: 5,
  });

  // Create cache with consistent naming
  const cache = new BoundedCache({
    maxSize: cacheSize,
    ttl: cacheTTL,
    enableAnalytics,
  });

  // Log session initialization
  await logger.info(`🚀 Initializing ${agentType} session: ${sessionId}`);
  await logger.info(`📊 Cache: size=${cacheSize}, ttl=${cacheTTL}ms, analytics=${enableAnalytics}`);

  return {
    sessionId,
    agentType,
    logger,
    cache,
    startTime: Date.now(),
  };
}

/**
 * Close an agent session, cleaning up resources
 */
export async function closeAgentSession(session: AgentSession): Promise<void> {
  const duration = Date.now() - session.startTime;

  if (session.logger) {
    await session.logger.info(`✅ Closing ${session.agentType} session after ${duration}ms`);

    // Log cache analytics if available
    if (session.cache) {
      const analytics = session.cache.getAnalytics();
      await session.logger.info(
        `📈 Cache stats: ${analytics.hitRate} hit rate, ${analytics.currentSize} entries`,
      );
    }

    await session.logger.close();
  }

  if (session.cache) {
    session.cache.clear();
  }
}

/**
 * Get standardized cache key for agent operations
 * Ensures consistent cache key format across agents
 */
export function getSessionCacheKey(
  sessionId: string,
  operation: string,
  ...parts: string[]
): string {
  const key = [sessionId, operation, ...parts].filter(Boolean).join(':');
  // Ensure key is not too long
  return key.length > 100 ? key.substring(0, 97) + '...' : key;
}
