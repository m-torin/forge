/**
 * Session-based scraping patterns
 * Persistent browser sessions with state management
 */

import { createScrapingManager } from '../utils/scraping-manager';
import { ScrapingError, ScrapingErrorCode } from '../errors';
import { humanDelay } from '../utils/helpers';
import type { ProviderRegistry, ScrapingConfig, ScrapeOptions } from '../types/scraping-types';
import type { SessionOptions, SessionResult } from './types';

interface ScrapingSession {
  id: string;
  manager: any;
  startTime: number;
  lastActivity: number;
  persistent: boolean;
  cookies: any[];
  localStorage: Record<string, string>;
  sessionData: Record<string, any>;
}

// Global session storage
const sessions = new Map<string, ScrapingSession>();

/**
 * Create a persistent scraping session
 */
export async function createSession(
  options: SessionOptions & { provider?: string } = {},
): Promise<string> {
  const {
    timeout = 3600000, // 1 hour default
    persistent = true,
    cookies = true,
    localStorage = true,
    provider = 'playwright',
  } = options;

  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Persistent sessions require server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const sessionId = generateSessionId();

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

  const providers: ProviderRegistry = {
    [provider]: (config) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    providers: {
      [provider]: {
        options: {
          autoClose: false,
          persistent: true,
        },
      },
    },
    debug: false,
  };

  const manager = createScrapingManager(config, providers);

  try {
    await manager.initialize();

    const session: ScrapingSession = {
      id: sessionId,
      manager,
      startTime: Date.now(),
      lastActivity: Date.now(),
      persistent,
      cookies: [],
      localStorage: {},
      sessionData: {},
    };

    sessions.set(sessionId, session);

    // Set up session timeout
    if (timeout > 0) {
      setTimeout(() => {
        closeSession(sessionId);
      }, timeout);
    }

    return sessionId;
  } catch (error) {
    await manager.dispose();
    throw new ScrapingError(
      `Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ScrapingErrorCode.SESSION_EXPIRED,
      { sessionId },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Use an existing session for scraping
 */
export async function withSession<T>(
  sessionId: string,
  callback: (manager: any) => Promise<T>,
): Promise<T> {
  const session = sessions.get(sessionId);

  if (!session) {
    throw new ScrapingError(`Session not found: ${sessionId}`, ScrapingErrorCode.SESSION_EXPIRED, {
      sessionId,
    });
  }

  // Update last activity
  session.lastActivity = Date.now();

  try {
    return await callback(session.manager);
  } catch (error) {
    throw new ScrapingError(
      `Session operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ScrapingErrorCode.SCRAPING_FAILED,
      { sessionId },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Scrape using a session
 */
export async function sessionScrape(
  sessionId: string,
  url: string,
  options: ScrapeOptions = {},
): Promise<SessionResult> {
  return withSession(sessionId, async (manager) => {
    const result = await manager.scrape(url, options);

    const session = sessions.get(sessionId)!;

    // Update session data
    if (options.extract) {
      session.sessionData = { ...session.sessionData, ...result.data };
    }

    return {
      sessionId,
      data: result.data || {},
      cookies: session.cookies,
      localStorage: session.localStorage,
    };
  });
}

/**
 * Close a session and clean up resources
 */
export async function closeSession(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId);

  if (!session) {
    return; // Session already closed or doesn't exist
  }

  try {
    await session.manager.dispose();
  } catch {
    // Ignore cleanup errors
  }

  sessions.delete(sessionId);
}

/**
 * Get session information
 */
export function getSessionInfo(sessionId: string): {
  id: string;
  startTime: number;
  lastActivity: number;
  duration: number;
  persistent: boolean;
  active: boolean;
} | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    startTime: session.startTime,
    lastActivity: session.lastActivity,
    duration: Date.now() - session.startTime,
    persistent: session.persistent,
    active: true,
  };
}

/**
 * List all active sessions
 */
export function listSessions(): Array<{
  id: string;
  startTime: number;
  lastActivity: number;
  duration: number;
  persistent: boolean;
}> {
  return Array.from(sessions.values()).map((session) => ({
    id: session.id,
    startTime: session.startTime,
    lastActivity: session.lastActivity,
    duration: Date.now() - session.startTime,
    persistent: session.persistent,
  }));
}

/**
 * Clean up expired sessions
 */
export function cleanupSessions(maxAge: number = 3600000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > maxAge) {
      closeSession(sessionId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Save session state to storage
 */
export async function saveSessionState(sessionId: string, key: string, value: any): Promise<void> {
  const session = sessions.get(sessionId);

  if (!session) {
    throw new ScrapingError(`Session not found: ${sessionId}`, ScrapingErrorCode.SESSION_EXPIRED, {
      sessionId,
    });
  }

  session.sessionData[key] = value;
  session.lastActivity = Date.now();
}

/**
 * Load session state from storage
 */
export function loadSessionState(sessionId: string, key: string): any {
  const session = sessions.get(sessionId);

  if (!session) {
    throw new ScrapingError(`Session not found: ${sessionId}`, ScrapingErrorCode.SESSION_EXPIRED, {
      sessionId,
    });
  }

  session.lastActivity = Date.now();
  return session.sessionData[key];
}

/**
 * Update session cookies
 */
export async function updateSessionCookies(sessionId: string, cookies: any[]): Promise<void> {
  return withSession(sessionId, async (manager) => {
    const session = sessions.get(sessionId)!;
    session.cookies = cookies;
    session.lastActivity = Date.now();

    // Apply cookies to browser
    // Note: This would need to be implemented in the provider
    // await manager.setCookies(cookies);
  });
}

/**
 * Multi-step session workflow
 */
export async function sessionWorkflow(
  sessionId: string,
  steps: Array<{
    url?: string;
    action?: 'scrape' | 'click' | 'type' | 'wait' | 'navigate';
    selector?: string;
    value?: string;
    extract?: any;
    delay?: number;
    name?: string;
  }>,
): Promise<Array<{ name?: string; data: any; step: number }>> {
  const results: Array<{ name?: string; data: any; step: number }> = [];

  await withSession(sessionId, async (manager) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      try {
        let data: any = {};

        switch (step.action) {
          case 'scrape':
            if (step.url) {
              const result = await manager.scrape(step.url, {
                extract: step.extract,
              });
              data = result.data || {};
            }
            break;

          case 'click':
            if (step.selector) {
              // await manager.click(step.selector);
            }
            break;

          case 'type':
            if (step.selector && step.value) {
              // await manager.type(step.selector, step.value);
            }
            break;

          case 'wait':
            if (step.selector) {
              // await manager.waitForSelector(step.selector);
            } else {
              await humanDelay(step.delay || 1000, (step.delay || 1000) * 1.2);
            }
            break;

          case 'navigate':
            if (step.url) {
              // await manager.navigate(step.url);
            }
            break;
        }

        results.push({
          name: step.name,
          data,
          step: i + 1,
        });

        // Add delay between steps
        if (step.delay && i < steps.length - 1) {
          await humanDelay(step.delay, step.delay * 1.2);
        }
      } catch (error) {
        throw new ScrapingError(
          `Workflow step ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ScrapingErrorCode.SCRAPING_FAILED,
          { sessionId, step: i + 1, stepName: step.name },
          error instanceof Error ? error : undefined,
        );
      }
    }
  });

  return results;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Auto-cleanup sessions every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(
    () => {
      cleanupSessions();
    },
    5 * 60 * 1000,
  );
}
