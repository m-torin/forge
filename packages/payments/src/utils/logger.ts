/**
 * Payments Logger - Using Observability System
 *
 * This file provides logging functionality for payments operations using the centralized
 * observability system from @repo/observability.
 *
 * @example
 * ```typescript
 * import { paymentsLogger } from './utils/logger';
 *
 * await paymentsLogger.error('Error creating payment intent', error, {
 *   operation: 'create_payment_intent',
 *   stripeId: 'pi_1234567890',
 *   amount: 1000,
 *   currency: 'usd'
 * });
 * ```
 */

import { createServerObservability } from '@repo/observability/shared-env';

import type { ObservabilityManager } from '@repo/observability/server';

let observabilityInstance: ObservabilityManager | null = null;

export interface PaymentsLogContext {
  operation?: string;
  stripeId?: string;
  amount?: number;
  currency?: string;
  customerId?: string;
  eventType?: string;
  metadata?: Record<string, any>;
  error?: Error;
  timestamp?: string;
}

export class PaymentsLogger {
  private static instance?: PaymentsLogger;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): PaymentsLogger {
    PaymentsLogger.instance ??= new PaymentsLogger();
    return PaymentsLogger.instance;
  }

  async error(
    message: string,
    error?: Error,
    context: Partial<PaymentsLogContext> = {},
  ): Promise<void> {
    try {
      const observability = await getObservability();

      if (error) {
        void observability.captureException(error, {
          extra: {
            operation: context.operation,
            stripeId: context.stripeId,
            amount: context.amount,
            currency: context.currency,
            customerId: context.customerId,
            eventType: context.eventType,
            metadata: context.metadata,
            timestamp: context.timestamp ?? new Date().toISOString(),
          },
          tags: {
            component: 'payments',
            operation: context.operation ?? 'unknown',
            eventType: context.eventType ?? 'unknown',
          },
        });
      } else {
        void observability.captureMessage(message, 'error', {
          extra: context,
          tags: {
            component: 'payments',
            operation: context.operation ?? 'unknown',
          },
        });
      }
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.error('[Payments] Failed to log error:', logError);
      // eslint-disable-next-line no-console
      console.error('[Payments] Original error:', error || message);
    }
  }

  async warn(message: string, context: Partial<PaymentsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        stripeId: context.stripeId,
        amount: context.amount,
        currency: context.currency,
        customerId: context.customerId,
        eventType: context.eventType,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('warn', `[Payments] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.warn('[Payments] Failed to log warning:', logError);
      // eslint-disable-next-line no-console
      console.warn('[Payments] Original message:', message);
    }
  }

  async info(message: string, context: Partial<PaymentsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        stripeId: context.stripeId,
        amount: context.amount,
        currency: context.currency,
        customerId: context.customerId,
        eventType: context.eventType,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('info', `[Payments] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.info('[Payments] Failed to log info:', logError);
      // eslint-disable-next-line no-console
      console.info('[Payments] Original message:', message);
    }
  }

  async debug(message: string, context: Partial<PaymentsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        stripeId: context.stripeId,
        amount: context.amount,
        currency: context.currency,
        customerId: context.customerId,
        eventType: context.eventType,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('debug', `[Payments] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.debug('[Payments] Failed to log debug:', logError);
      // eslint-disable-next-line no-console
      console.debug('[Payments] Original message:', message);
    }
  }
}

async function getObservability(): Promise<ObservabilityManager> {
  if (!observabilityInstance) {
    observabilityInstance = await createServerObservability({
      providers: {
        console: { enabled: true },
      },
    });
  }
  return observabilityInstance;
}

export const paymentsLogger = PaymentsLogger.getInstance();

/**
 * Synchronous logger for use in contexts where async is not supported (e.g., Proxy getters)
 * Falls back to console logging with structured format
 */
export const syncPaymentsLogger = {
  warn(message: string, context: Partial<PaymentsLogContext> = {}): void {
    // eslint-disable-next-line no-console
    console.warn(`[Payments] ${message}`, context);
  },

  error(message: string, error?: Error, context: Partial<PaymentsLogContext> = {}): void {
    // eslint-disable-next-line no-console
    console.error(`[Payments] ${message}`, error, context);
  },

  info(message: string, context: Partial<PaymentsLogContext> = {}): void {
    // eslint-disable-next-line no-console
    console.info(`[Payments] ${message}`, context);
  },
};
