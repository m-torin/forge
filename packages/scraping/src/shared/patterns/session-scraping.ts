/**
 * Session-based scraping patterns
 * Persistent browser sessions with state management
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import { ProviderRegistry, ScrapeOptions, ScrapingConfig } from '../types/scraping-types';
import { humanDelay } from '../utils/helpers';
import { createScrapingManager } from '../utils/scraping-manager';

import { SessionOptions, SessionResult } from './types';

interface ScrapingSession {
  cookies: any[];
  id: string;
  lastActivity: number;
  localStorage: Record<string, string>;
  manager: any;
  persistent: boolean;
  sessionData: Record<string, any>;
  startTime: number;
}

// Global session storage
const sessions = new Map<string, ScrapingSession>();

/**
 * Clean up expired sessions
 */
export function cleanupSessions(maxAge = 3600000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of Array.from(sessions.entries())) {
    if (now - session.lastActivity > maxAge) {
      void closeSession(sessionId);
      cleaned++;
    }
  }

  return cleaned;
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
 * Create a persistent scraping session
 */
export async function createSession(
  options: SessionOptions & { provider?: string } = {},
): Promise<string> {
  const {
    persistent = true,
    provider = 'playwright',
    timeout = 3600000, // 1 hour default
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
    [provider]: (_config: any) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    debug: false,
    providers: {
      [provider]: {
        options: {
          autoClose: false,
          persistent: true,
        },
      },
    },
  };

  const manager = createScrapingManager(config, providers);

  try {
    await manager.initialize();

    const session: ScrapingSession = {
      cookies: [],
      id: sessionId,
      lastActivity: Date.now(),
      localStorage: {},
      manager,
      persistent,
      sessionData: {},
      startTime: Date.now(),
    };

    sessions.set(sessionId, session);

    // Set up session timeout
    if (timeout > 0) {
      setTimeout(() => {
        void closeSession(sessionId);
      }, timeout);
    }

    return sessionId;
  } catch (error) {
    await manager.dispose();
    throw new ScrapingError(
      `Failed to create session: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.SESSION_EXPIRED,
      { sessionId },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get session information
 */
export function getSessionInfo(sessionId: string): null | {
  active: boolean;
  duration: number;
  id: string;
  lastActivity: number;
  persistent: boolean;
  startTime: number;
} {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  return {
    active: true,
    duration: Date.now() - session.startTime,
    id: session.id,
    lastActivity: session.lastActivity,
    persistent: session.persistent,
    startTime: session.startTime,
  };
}

/**
 * List all active sessions
 */
export function listSessions(): {
  duration: number;
  id: string;
  lastActivity: number;
  persistent: boolean;
  startTime: number;
}[] {
  return Array.from(sessions.values()).map((session: any) => ({
    duration: Date.now() - session.startTime,
    id: session.id,
    lastActivity: session.lastActivity,
    persistent: session.persistent,
    startTime: session.startTime,
  }));
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
 * Scrape using a session
 */
export async function sessionScrape(
  sessionId: string,
  url: string,
  options: ScrapeOptions = {},
): Promise<SessionResult> {
  return withSession(sessionId, async (manager: any) => {
    const result = await manager.scrape(url, options);

    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Update session data
    if (options.extract) {
      session.sessionData = { ...session.sessionData, ...result?.data };
    }

    return {
      cookies: session.cookies,
      data: result?.data ?? {},
      localStorage: session.localStorage,
      sessionId,
    };
  });
}

/**
 * Multi-step session workflow
 */
export async function sessionWorkflow(
  sessionId: string,
  steps: {
    action?: 'click' | 'navigate' | 'scrape' | 'type' | 'wait';
    delay?: number;
    extract?: any;
    name?: string;
    selector?: string;
    url?: string;
    value?: string;
  }[],
): Promise<{ data: any; name?: string; step: number }[]> {
  const results: { data: any; name?: string; step: number }[] = [];

  await withSession(sessionId, async (manager: any) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      try {
        let data: any = {};

        switch (step.action) {
          case 'click':
            if (step.selector) {
              // await manager.click(step.selector);
            }
            break;

          case 'navigate':
            if (step.url) {
              // await manager.navigate(step.url);
            }
            break;

          case 'scrape':
            if (step.url) {
              const result = await manager.scrape(step.url, {
                extract: step.extract,
              });
              data = result?.data ?? {};
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
              await humanDelay(step.delay ?? 1000, (step.delay ?? 1000) * 1.2);
            }
            break;
        }

        results.push({
          data,
          name: step.name,
          step: i + 1,
        });

        // Add delay between steps
        if (step.delay && i < steps.length - 1) {
          await humanDelay(step.delay, step.delay * 1.2);
        }
      } catch (error) {
        throw new ScrapingError(
          `Workflow step ${i + 1} failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
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
 * Update session cookies
 */
export async function updateSessionCookies(sessionId: string, cookies: any[]): Promise<void> {
  return withSession(sessionId, async (_manager: any) => {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.cookies = cookies;
    session.lastActivity = Date.now();

    // Apply cookies to browser
    // Note: This would need to be implemented in the provider
    // await manager.setCookies(cookies);
  });
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
      `Session operation failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.SCRAPING_FAILED,
      { sessionId },
      error instanceof Error ? error : undefined,
    );
  }
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
