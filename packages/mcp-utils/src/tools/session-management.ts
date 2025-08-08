/**
 * MCP Tools for Session Management
 */

import {
  closeAgentSession,
  getSessionCacheKey,
  initializeAgentSession,
  type AgentSession,
} from '../utils/session';

// Store active sessions with WeakRef for memory management
const activeSessions = new Map<string, AgentSession>();
const sessionWeakRefs = new Map<string, WeakRef<AgentSession>>();
const sessionFinalizationRegistry = new FinalizationRegistry((sessionKey: string) => {
  sessionWeakRefs.delete(sessionKey);
  activeSessions.delete(sessionKey);
  console.debug(`Session ${sessionKey} was garbage collected`);
});

export interface InitSessionArgs {
  sessionId: string;
  agentType: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheSize?: number;
  cacheTTL?: number;
  enableAnalytics?: boolean;
}

export interface CloseSessionArgs {
  sessionId: string;
  agentType: string;
}

export interface GetCacheKeyArgs {
  sessionId: string;
  operation: string;
  parts?: string[];
}

/**
 * Initialize an agent session
 */
export async function initializeSessionTool(args: InitSessionArgs) {
  try {
    const sessionKey = `${args.agentType}-${args.sessionId}`;

    // Check if session already exists
    if (activeSessions.has(sessionKey)) {
      return {
        success: true,
        message: 'Session already exists',
        sessionId: sessionKey,
      };
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

    return {
      success: true,
      sessionId: sessionKey,
      agentType: args.agentType,
      startTime: session.startTime,
    };
  } catch (error) {
    throw new Error(
      `Failed to initialize session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Close an agent session
 */
export async function closeSessionTool(args: CloseSessionArgs) {
  try {
    const sessionKey = `${args.agentType}-${args.sessionId}`;
    const session = activeSessions.get(sessionKey);

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
      };
    }

    const duration = Date.now() - session.startTime;

    // Get analytics before closing
    const cacheAnalytics = session.cache?.getAnalytics();

    // Close session
    await closeAgentSession(session);

    // Remove from active sessions
    activeSessions.delete(sessionKey);

    return {
      success: true,
      duration,
      cacheAnalytics,
    };
  } catch (error) {
    throw new Error(
      `Failed to close session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get a standardized cache key
 */
export function getSessionCacheKeyTool(args: GetCacheKeyArgs) {
  try {
    const key = getSessionCacheKey(args.sessionId, args.operation, ...(args.parts || []));
    return { key };
  } catch (error) {
    throw new Error(
      `Failed to generate cache key: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
