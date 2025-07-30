/**
 * Account security plugin for better-auth
 * Handles account lockout, failed attempts tracking, and suspicious login detection
 */

// No-op fallback - observability integration can be added later
const logWarn = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper error logging via observability package
};

export interface AccountSecurityOptions {
  maxFailedAttempts?: number;
  lockoutDuration?: number; // in minutes
  resetFailedAttemptsAfter?: number; // in minutes
  detectSuspiciousLogin?: boolean;
  notifySuspiciousLogin?: boolean;
}

const DEFAULT_OPTIONS: AccountSecurityOptions = {
  maxFailedAttempts: 5,
  lockoutDuration: 30, // 30 minutes
  resetFailedAttemptsAfter: 60, // 1 hour
  detectSuspiciousLogin: true,
  notifySuspiciousLogin: true,
};

interface FailedAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
  ipAddresses: string[];
  userAgents: string[];
}

// In-memory store for failed attempts (should be replaced with Redis in production)
const failedAttempts = new Map<string, FailedAttempt>();

export function accountSecurityPlugin(options: AccountSecurityOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const getClientInfo = (request: Request) => {
    const headers = request.headers;
    const ipAddress =
      headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
    const userAgent = headers.get('user-agent') || 'unknown';
    return { ipAddress, userAgent };
  };

  const checkAccountLockout = async (
    email: string,
  ): Promise<{ locked: boolean; message?: string }> => {
    const attempt = failedAttempts.get(email.toLowerCase());

    if (!attempt) {
      return { locked: false };
    }

    // Check if lockout has expired
    if (attempt.lockedUntil && new Date() > attempt.lockedUntil) {
      failedAttempts.delete(email.toLowerCase());
      return { locked: false };
    }

    // Check if account is locked
    if (attempt.lockedUntil && new Date() <= attempt.lockedUntil) {
      const minutesRemaining = Math.ceil(
        (attempt.lockedUntil.getTime() - Date.now()) / (1000 * 60),
      );
      return {
        locked: true,
        message: `Account is locked due to too many failed attempts. Please try again in ${minutesRemaining} minutes.`,
      };
    }

    // Check if failed attempts should be reset
    const resetAfterMs = config.resetFailedAttemptsAfter || 60 * 60 * 1000;
    if (new Date().getTime() - attempt.lastAttempt.getTime() > resetAfterMs) {
      failedAttempts.delete(email.toLowerCase());
      return { locked: false };
    }

    return { locked: false };
  };

  const recordFailedAttempt = async (email: string, ipAddress: string, userAgent: string) => {
    const key = email.toLowerCase();
    const existing = failedAttempts.get(key);

    if (existing) {
      existing.attempts += 1;
      existing.lastAttempt = new Date();

      if (!existing.ipAddresses.includes(ipAddress)) {
        existing.ipAddresses.push(ipAddress);
      }
      if (!existing.userAgents.includes(userAgent)) {
        existing.userAgents.push(userAgent);
      }

      // Lock account if max attempts reached
      if (existing.attempts >= (config.maxFailedAttempts ?? 5)) {
        existing.lockedUntil = new Date(Date.now() + (config.lockoutDuration ?? 30) * 60 * 1000);
      }

      failedAttempts.set(key, existing);
    } else {
      failedAttempts.set(key, {
        email,
        attempts: 1,
        lastAttempt: new Date(),
        ipAddresses: [ipAddress],
        userAgents: [userAgent],
      });
    }
  };

  const clearFailedAttempts = (email: string) => {
    failedAttempts.delete(email.toLowerCase());
  };

  const detectSuspiciousLogin = async (): Promise<boolean> => {
    if (!config.detectSuspiciousLogin) {
      return false;
    }

    // TODO: Implement suspicious login detection once session model has ipAddress and userAgent fields
    // For now, return false to avoid type errors
    return false;
  };

  return {
    id: 'account-security',
    hooks: {
      before: [
        {
          matcher: (context: any) => context.path === '/sign-in',
          handler: async (context: any) => {
            const { email } = context.body || {};

            if (!email) {
              return context;
            }

            // Check if account is locked
            const lockStatus = await checkAccountLockout(email);
            if (lockStatus.locked) {
              throw new Error(lockStatus.message);
            }

            return context;
          },
        },
      ],
      after: [
        {
          matcher: (context: any) => context.path === '/sign-in',
          handler: async (context: any) => {
            const { email } = context.body || {};
            const { ipAddress, userAgent } = getClientInfo(context.request);

            // If sign-in failed
            if (context.error || !context.context?.session) {
              if (email) {
                await recordFailedAttempt(email, ipAddress, userAgent);
              }
            } else {
              // Sign-in succeeded
              if (email) {
                clearFailedAttempts(email);
              }

              // Check for suspicious login
              if (context.context?.user?.id) {
                const isSuspicious = await detectSuspiciousLogin();

                if (isSuspicious && config.notifySuspiciousLogin) {
                  // Log suspicious login (integrate with your notification system)
                  logWarn('Suspicious login detected', {
                    userId: context.context.user.id,
                    email: context.context.user.email,
                    ipAddress,
                    userAgent,
                    timestamp: new Date(),
                  });
                }
              }
            }

            return context;
          },
        },
      ],
    },
  };
}

// Export function for testing
export async function validateAccountSecurity(data: {
  userId: string;
  action: string;
}): Promise<{ isValid: boolean; error?: string }> {
  // Basic implementation for testing
  if (!data.userId || !data.action) {
    return { isValid: false, error: 'Missing required parameters' };
  }
  return { isValid: true };
}
