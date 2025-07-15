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
  withObservability,
  // Types
  type ObservabilityProviderProps,
} from './ObservabilityProvider';

export {
  // Context
  ObservabilityContext,
  // Hooks
  useObservability,
  useObservabilityManager,
  usePerformanceTimer,
  useWorkflowObservability,
  type ErrorContext,
  // Types
  type ObservabilityEvent,
} from './use-observability';
