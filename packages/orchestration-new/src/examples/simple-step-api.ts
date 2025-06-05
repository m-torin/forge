/**
 * Example: Simple Step Factory API Usage
 *
 * Demonstrates the new function-based approach that handles 80% of use cases
 * with minimal complexity, while advanced features are available as opt-in enhancers.
 */

import {
  createStep,
  createStepWithValidation,
  withStepMonitoring,
  withStepRetry,
  withStepCircuitBreaker,
  withStepTimeout,
  compose,
  type SimpleWorkflowStep,
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
    return { transactionId: 'txn_456', amount: input.amount, status: 'completed' };
  },
  // Input validator
  (input) => input.amount > 0 && ['USD', 'EUR', 'GBP'].includes(input.currency),
  // Output validator
  (output) => output.status === 'completed',
);

// ===== ADVANCED FEATURES AS OPT-IN ENHANCERS (20% of use cases) =====

/**
 * Example 3: Adding monitoring to a step
 * Only when you need detailed logging and metrics
 */
const monitoredStep = withStepMonitoring(sendEmailStep, { enableDetailedLogging: true });

/**
 * Example 4: Adding retry capabilities
 * Only when you need resilience patterns
 */
const resilientStep = withStepRetry(processPaymentStep, {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  jitter: true,
});

/**
 * Example 5: Composing multiple enhancers
 * Chain together the patterns you need
 */
const robustEmailStep = compose(
  sendEmailStep,
  (step) => withStepTimeout(step, 30000),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
  (step) => withStepCircuitBreaker(step, { failureThreshold: 5 }),
  (step) => withStepMonitoring(step, { enableDetailedLogging: true }),
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
  console.log('Result:', robustResult);
}

// ===== COMPARISON WITH OLD API =====

/**
 * BEFORE (Complex): 1,099 lines of class-based complexity
 *
 * const factory = new StepFactory({
 *   enablePerformanceMonitoring: true,
 *   enableDetailedLogging: false,
 *   defaultExecutionConfig: { ... },
 *   defaultValidationConfig: { ... },
 *   errorHandlers: new Map(),
 * });
 *
 * const stepDefinition = factory.createStep(
 *   { name: 'send-email', description: '...', version: '1.0.0', category: 'notification' },
 *   async (context) => { ... },
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
 * const step = createStep('send-email', async (input) => { ... });
 *
 * // Complex case (20% of usage) - opt-in enhancers
 * const enhancedStep = compose(
 *   step,
 *   (s) => withStepRetry(s, { maxAttempts: 3 }),
 *   (s) => withStepCircuitBreaker(s, { failureThreshold: 5 }),
 *   (s) => withStepTimeout(s, 30000)
 * );
 */

// Export for testing
export {
  sendEmailStep,
  processPaymentStep,
  monitoredStep,
  resilientStep,
  robustEmailStep,
  demonstrateSimpleAPI,
};
