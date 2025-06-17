/**
 * Export all observability hooks and components
 * Updated for React 19 and Next.js 15 compatibility
 */

export {
  // React 19 Error Boundary
  ObservabilityErrorBoundary,
  withObservabilityErrorBoundary,
} from './ObservabilityErrorBoundary';

export {
  // Provider component
  ObservabilityProvider,
  // Types
  type ObservabilityProviderProps,
  withObservability,
} from './ObservabilityProvider';

export {
  type ErrorContext,
  // Context
  ObservabilityContext,
  // Types
  type ObservabilityEvent,
  // Hooks
  useObservability,
  useObservabilityManager,
  usePerformanceTimer,
  useWorkflowObservability,
} from './use-observability';
