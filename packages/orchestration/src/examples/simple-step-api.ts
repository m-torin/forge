/**
 * Simple Step Factory API Usage Example
 *
 * Demonstrates the modern function-based approach to step creation in the orchestration
 * package. This API design handles 80% of use cases with minimal complexity, while
 * advanced features are available as opt-in enhancers.
 *
 * API Design Philosophy:
 * - Simple cases should be simple (80% of usage)
 * - Complex cases should be possible (20% of usage)
 * - Functional composition over class hierarchies
 * - Progressive enhancement of capabilities
 *
 * Examples Included:
 * - Basic step creation with minimal configuration
 * - Step validation with input/output checking
 * - Monitoring and logging enhancement
 * - Retry and resilience patterns
 * - Circuit breaker integration
 * - Functional composition of enhancers
 *
 * Prerequisites:
 * - @repo/orchestration package configured
 * - Understanding of functional composition
 *
 * Environment: Node.js Server-Side
 *
 * @see ./step-factory-simple.ts for class-based approach
 */

import {
  compose,
  createStep,
  createStepWithValidation,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '../shared/factories';

// ===== SIMPLE API EXAMPLES (80% of use cases) =====

/**
 * Example 1: Basic step creation
 * Just a name and action function - that's it!
 */
const sendEmailStep = createStep(
  'send-welcome-email',
  async (input: { email: string; name: string }) => {
    // Simulate email sending
    console.log(`Sending welcome email to ${input.email} for ${input.name}`);
    return { messageId: 'msg_123', status: 'sent' };
  },
);

/**
 * Example 2: Step with validation
 * Add input/output validation when needed
 */
const processPaymentStep = createStepWithValidation(
  'process-payment',
  async (input: { amount: number; currency: string }) => {
    // Simulate payment processing
    return { amount: input.amount, status: 'completed', transactionId: 'txn_456' };
  },
  // Input validator
  (input: any) => input.amount > 0 && ['EUR', 'GBP', 'USD'].includes(input.currency),
  // Output validator
  (output: any) => output.status === 'completed',
);

// ===== ADVANCED FEATURES AS OPT-IN ENHANCERS (20% of use cases) =====

/**
 * Example 3: Adding monitoring to a step
 * Only when you need detailed logging and metrics
 */
const monitoredStep = withStepMonitoring(sendEmailStep, {
  onStepComplete: (stepName: string, duration: number, success: boolean) => {
    console.log(`Step ${stepName} completed in ${duration}ms, success: ${success}`);
  },
});

/**
 * Example 4: Adding retry capabilities
 * Only when you need resilience patterns
 */
const resilientStep = withStepRetry(processPaymentStep, {
  backoff: 'exponential',
  delay: 1000,
  jitter: true,
  maxAttempts: 3,
});

/**
 * Example 5: Composing multiple enhancers
 * Chain together the patterns you need
 */
const robustEmailStep = compose(
  sendEmailStep,
  (step: any) => withStepTimeout(step, 30000),
  (step: any) => withStepRetry(step, { maxAttempts: 3 }),
  (step: any) => withStepCircuitBreaker(step, { failureThreshold: 5 }),
  (step: any) =>
    withStepMonitoring(step, {
      onStepComplete: (stepName: string, duration: number, success: boolean) => {
        console.log(`Step ${stepName} completed in ${duration}ms, success: ${success}`);
      },
    }),
);

// ===== USAGE EXAMPLES =====

async function demonstrateSimpleAPI() {
  console.log('=== Simple Step Factory API Demo ===\n');

  // Example 1: Basic usage
  console.log('1. Basic step execution:');
  const emailResult = await sendEmailStep.execute({
    email: 'user@example.com',
    name: 'John Doe',
  });
  console.log('Result:', emailResult);
  console.log();

  // Example 2: Step with validation
  console.log('2. Step with validation:');
  const paymentResult = await processPaymentStep.execute({
    amount: 100,
    currency: 'USD',
  });
  console.log('Result:', paymentResult);
  console.log();

  // Example 3: Enhanced step with monitoring
  console.log('3. Enhanced step with monitoring:');
  const monitoredResult = await monitoredStep.execute({
    email: 'monitored@example.com',
    name: 'Jane Smith',
  });
  console.log('Result:', monitoredResult);
  console.log();

  // Example 4: Robust step with multiple enhancers
  console.log('4. Robust step with multiple enhancers:');
  const robustResult = await robustEmailStep.execute({
    email: 'robust@example.com',
    name: 'Bob Wilson',
  });
  console.log('Result: ', robustResult);
}

// ===== COMPARISON WITH OLD API =====

/**
 * BEFORE (Complex): 1,099 lines of class-based complexity
 *
 * const factory = new StepFactory({
 *   enablePerformanceMonitoring: true,
 *   onStepComplete: (stepName: string, duration: number, success: boolean) => {},
 *   defaultExecutionConfig: { ... },
 *   defaultValidationConfig: { ... },
 *   errorHandlers: new Map(),
 * };
 *
 * const stepDefinition = factory.createStep(
 *   { name: 'send-email', description: '...', version: '1.0.0', category: 'notification' },
 *   async (context: any) => { ... },
 *   {
 *     executionConfig: {
 *       retryConfig: { maxAttempts: 3, backoff: 'exponential' },
 *       circuitBreakerConfig: { failureThreshold: 5 },
 *       timeout: { execution: 30000 }
 *     },
 *     validationConfig: { validateInput: true, input: schema }
 *   }
 * );
 *
 * const executableStep = factory.createExecutableStep(stepDefinition);
 */

/**
 * AFTER (Simple): Function-based with optional complexity
 *
 * // Simple case (80% of usage)
 * const step = createStep('send-email', async (input: any) => { ... });
 *
 * // Complex case (20% of usage) - opt-in enhancers
 * const enhancedStep = compose(
 *   step,
 *   (s: any) => withStepRetry(s, { maxAttempts: 3 }),
 *   (s: any) => withStepCircuitBreaker(s, { failureThreshold: 5 }),
 *   (s: any) => withStepTimeout(s, 30000)
 * );
 */

// Export for testing
export {
  demonstrateSimpleAPI,
  monitoredStep,
  processPaymentStep,
  resilientStep,
  robustEmailStep,
  sendEmailStep,
};
