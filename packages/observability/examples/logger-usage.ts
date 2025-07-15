/**
 * Example: Using the new simplified logger functions
 */

// ===== Next.js Server Components =====
// In server components, API routes, or server actions
import { logDebug, logError, logInfo } from '@repo/observability/server/next';

// ===== Edge Runtime (Middleware) =====
// In middleware.ts or edge functions
import { logInfo as logInfoEdge } from '@repo/observability/server/edge';

// ===== Node.js Workers =====
// In background jobs or standalone Node.js apps
import { configureLogger, logInfo as logInfoNode, logWarn } from '@repo/observability/server';

// ===== Benefits Over Old Pattern =====

// Old pattern (deprecated):
/*
import { createLogger } from '@repo/observability/server/next';
const logger = createLogger();

async function oldWay() {
  await logger.info('This blocks execution');
  await logger.error('Must await every log', error);
}
*/

// New pattern (recommended):

export async function serverAction(formData: FormData) {
  'use server';

  // Simple logging - no await needed!
  logInfo('Server action called', {
    action: 'updateUser',
    timestamp: Date.now(),
  });

  try {
    // Do some work...
    const userId = formData.get('userId') as string | null;
    logDebug('Processing user', { userId: userId ?? undefined });

    // Simulate work
    await updateUserInDatabase(userId);

    logInfo('User updated successfully', { userId: userId ?? undefined });
  } catch (error) {
    logError('Failed to update user', error, {
      userId: (formData.get('userId') as string | null) ?? undefined,
      action: 'updateUser',
    });
    throw error;
  }
}

export function middleware(request: Request) {
  // Edge-compatible logging
  logInfoEdge('Request received', {
    path: new URL(request.url).pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
  });

  // Continue with middleware logic...
}

// Optional: Configure once at startup
configureLogger({
  providers: {
    console: {
      enabled: true,
      level: 'debug',
      prefix: '[Worker]',
    },
  },
});

export async function processJob(job: any) {
  logInfoNode('Job started', { jobId: job.id, type: job.type });

  if (job.retryCount > 3) {
    logWarn('High retry count', {
      jobId: job.id,
      retries: job.retryCount,
    });
  }

  // Process job...
}

function _newWay() {
  logInfo('This is fire-and-forget'); // No await!
  logError('Instant logging', new Error('Example'));
  // Execution continues immediately
}

// Helper function (not part of the example, just for TypeScript)
async function updateUserInDatabase(_userId: any) {
  // Simulate database work
  await new Promise(resolve => setTimeout(resolve, 100));
}
