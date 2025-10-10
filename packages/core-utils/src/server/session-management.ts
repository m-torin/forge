/**
 * MCP Tools for Session Management
 */

import { safeThrowIfAborted, type AbortableToolArgs } from './abort-support.js';
import {
  closeAgentSession,
  getSessionCacheKey,
  initializeAgentSession,
  type AgentSession,
} from './session';
import { ok, runTool } from './tool-helpers.js';

// Store active sessions with WeakRef for memory management
const activeSessions = new Map<string, AgentSession>();
const sessionWeakRefs = new Map<string, WeakRef<AgentSession>>();
const sessionFinalizationRegistry = new FinalizationRegistry((sessionKey: string) => {
  sessionWeakRefs.delete(sessionKey);
  activeSessions.delete(sessionKey);
  console.debug(`Session ${sessionKey} was garbage collected`);
});

export interface InitSessionArgs extends AbortableToolArgs {
  sessionId: string;
  agentType: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheSize?: number;
  cacheTTL?: number;
  enableAnalytics?: boolean;
}

export interface CloseSessionArgs extends AbortableToolArgs {
  sessionId: string;
  agentType: string;
}

export interface GetCacheKeyArgs extends AbortableToolArgs {
  sessionId: string;
  operation: string;
  parts?: string[];
}

/**
 * Initialize an agent session MCP Tool
 */
export const initializeSessionTool = {
  name: 'initialize_session',
  description: 'Initialize an agent session for tracking and caching',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sessionId: {
        type: 'string' as const,
        description: 'Session identifier',
      },
      agentType: {
        type: 'string' as const,
        description: 'Type of agent for the session',
      },
      logLevel: {
        type: 'string' as const,
        enum: ['debug', 'info', 'warn', 'error'],
        description: 'Log level for the session',
      },
      cacheSize: {
        type: 'number' as const,
        description: 'Maximum cache size',
      },
      cacheTTL: {
        type: 'number' as const,
        description: 'Cache time-to-live in milliseconds',
      },
      enableAnalytics: {
        type: 'boolean' as const,
        description: 'Whether to enable analytics for the session',
      },
    },
    required: ['sessionId', 'agentType'],
    additionalProperties: false,
  },

  async execute(args: InitSessionArgs) {
    return runTool('initialize_session', 'initialize', async () => {
      safeThrowIfAborted(args.signal);

      const sessionKey = `${args.agentType}-${args.sessionId}`;

      // Check if session already exists
      if (activeSessions.has(sessionKey)) {
        return ok({
          success: true,
          message: 'Session already exists',
          sessionId: sessionKey,
        });
      }

      // Create session using our utility
      const session = await initializeAgentSession(args.sessionId, args.agentType, {
        logLevel: args.logLevel || 'info',
        cacheSize: args.cacheSize || 100,
        cacheTTL: args.cacheTTL || 1800000,
        enableAnalytics: args.enableAnalytics !== false,
      });

      // Store session with WeakRef for memory management
      activeSessions.set(sessionKey, session);
      const weakRef = new WeakRef(session);
      sessionWeakRefs.set(sessionKey, weakRef);
      sessionFinalizationRegistry.register(session, sessionKey);

      return ok({
        success: true,
        sessionId: sessionKey,
        agentType: args.agentType,
        startTime: session.startTime,
      });
    });
  },
};

/**
 * Close an agent session MCP Tool
 */
export const closeSessionTool = {
  name: 'close_session',
  description: 'Close an agent session and cleanup resources',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sessionId: {
        type: 'string' as const,
        description: 'Session identifier',
      },
      agentType: {
        type: 'string' as const,
        description: 'Type of agent for the session',
      },
    },
    required: ['sessionId', 'agentType'],
    additionalProperties: false,
  },

  async execute(args: CloseSessionArgs) {
    return runTool('close_session', 'close', async () => {
      safeThrowIfAborted(args.signal);

      const sessionKey = `${args.agentType}-${args.sessionId}`;
      const session = activeSessions.get(sessionKey);

      if (!session) {
        return ok({
          success: false,
          message: 'Session not found',
        });
      }

      const duration = Date.now() - session.startTime;

      // Get analytics before closing
      const cacheAnalytics = session.cache?.getAnalytics();

      // Close session
      await closeAgentSession(session);

      // Remove from active sessions
      activeSessions.delete(sessionKey);

      return ok({
        success: true,
        duration,
        cacheAnalytics,
      });
    });
  },
};

/**
 * Get a standardized cache key MCP Tool
 */
export const getSessionCacheKeyTool = {
  name: 'get_session_cache_key',
  description: 'Generate a standardized cache key for session operations',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sessionId: {
        type: 'string' as const,
        description: 'Session identifier',
      },
      operation: {
        type: 'string' as const,
        description: 'Operation name for the cache key',
      },
      parts: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Additional parts to include in the cache key',
      },
    },
    required: ['sessionId', 'operation'],
    additionalProperties: false,
  },

  execute(args: GetCacheKeyArgs) {
    return runTool('get_session_cache_key', 'generate', async () => {
      safeThrowIfAborted(args.signal);

      const key = getSessionCacheKey(args.sessionId, args.operation, ...(args.parts || []));
      return ok({ key });
    });
  },
};
