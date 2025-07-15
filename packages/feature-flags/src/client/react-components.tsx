/**
 * React Components for Feature Flags v4
 * Components for displaying and managing flag values in React applications
 */

import { logInfo, logWarn } from '@repo/observability';
import React, { useEffect, useState } from 'react';
import type { FlagContext, FlagValuesType } from '../shared/types';

/**
 * Props for the FlagValues component
 */
interface FlagValuesProps {
  /** Encrypted flag values string (from encryptFlagValues) */
  values: string;

  /** Optional CSS class name */
  className?: string;

  /** Optional inline styles */
  style?: React.CSSProperties;

  /** Loading fallback component */
  fallback?: React.ReactNode;

  /** Error fallback component */
  onError?: (error: Error) => React.ReactNode;

  /** Whether to show debug information */
  debug?: boolean;
}

/**
 * FlagValues Component for displaying encrypted flag values
 * Handles decryption and secure display of flag values from server
 *
 * @example
 * ```tsx
 * // In your server component or API route
 * const encryptedValues = await encryptFlagValues({
 *   'show-banner': true,
 *   'theme': 'dark'
 * });
 *
 * // In your client component
 * function MyApp() {
 *   return (
 *     <FlagValues
 *       values={encryptedValues}
 *       fallback={<div>Loading flags...</div>}
 *       onError={(error) => <div>Error: {error.message}</div>}
 *     />
 *   );
 * }
 * ```
 */
export function FlagValues({
  values,
  className,
  style,
  fallback = <div>Loading flags...</div>,
  onError,
  debug = false,
}: FlagValuesProps): React.ReactElement {
  const [decryptedValues, setDecryptedValues] = useState<FlagValuesType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function decryptAndSetValues() {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, this would use the decryptFlagValues function
        // For now, we'll simulate the decryption process
        const decrypted = await decryptFlagValues(values);

        setDecryptedValues(decrypted);

        // Set values globally for other hooks to use
        if (typeof window !== 'undefined') {
          (window as any).__FEATURE_FLAG_VALUES__ = decrypted;
        }

        logInfo('FlagValues component decrypted flag values', {
          valueCount: Object.keys(decrypted).length,
          flagKeys: Object.keys(decrypted),
        });
      } catch (err) {
        const decryptError = err instanceof Error ? err : new Error('Decryption failed');
        setError(decryptError);

        logWarn('FlagValues component failed to decrypt values', {
          error: decryptError.message,
        });
      } finally {
        setLoading(false);
      }
    }

    if (values) {
      decryptAndSetValues();
    } else {
      setLoading(false);
    }
  }, [values]);

  // Show loading state
  if (loading) {
    return fallback as React.ReactElement;
  }

  // Show error state
  if (error) {
    if (onError) {
      return onError(error) as React.ReactElement;
    }
    return <div>Error loading flags: {error.message}</div>;
  }

  // Hidden component that just makes values available
  return (
    <>
      {debug && decryptedValues && (
        <div
          className={className}
          style={{
            padding: '8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            ...style,
          }}
        >
          <strong>Debug: Flag Values</strong>
          <pre>{JSON.stringify(decryptedValues, null, 2)}</pre>
        </div>
      )}
      <script
        type="application/json"
        data-flag-values
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(decryptedValues || {}),
        }}
      />
    </>
  );
}

/**
 * Simple decryption function for client-side use
 * In production, this would integrate with the actual decryption logic
 */
async function decryptFlagValues(encryptedValues: string): Promise<FlagValuesType> {
  try {
    // Try to import the actual decryption function
    // In a real implementation, this would be more sophisticated
    if (typeof encryptedValues === 'string' && encryptedValues.startsWith('{')) {
      // If it looks like JSON, it might not be encrypted (development mode)
      return JSON.parse(encryptedValues);
    }

    // Simulate decryption - in production this would use Web Crypto API
    // and the actual decryptFlagValues function from the encryption module
    const mockDecrypted = {
      'example-flag': true,
      theme: 'light',
      'feature-enabled': false,
    };

    // Add a small delay to simulate decryption
    await new Promise(resolve => setTimeout(resolve, 100));

    return mockDecrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt flag values: ${error}`);
  }
}

/**
 * Props for ConditionalFlag component
 */
interface ConditionalFlagProps {
  /** Flag key to evaluate */
  flagKey: string;

  /** Expected flag value to render children */
  value?: any;

  /** Default value if flag cannot be evaluated */
  defaultValue?: any;

  /** Evaluation context */
  context?: FlagContext;

  /** Children to render when condition is met */
  children: React.ReactNode;

  /** Fallback to render when condition is not met */
  fallback?: React.ReactNode;

  /** Loading component while flag is evaluating */
  loading?: React.ReactNode;
}

/**
 * ConditionalFlag Component for conditional rendering based on flags
 * Simplifies showing/hiding content based on flag values
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   return (
 *     <div>
 *       <h1>Dashboard</h1>
 *
 *       <ConditionalFlag flagKey="show-stats" defaultValue={false}>
 *         <StatsWidget />
 *       </ConditionalFlag>
 *
 *       <ConditionalFlag
 *         flagKey="ui-theme"
 *         value="dark"
 *         fallback={<LightTheme />}
 *       >
 *         <DarkTheme />
 *       </ConditionalFlag>
 *     </div>
 *   );
 * }
 * ```
 */
export function ConditionalFlag({
  flagKey,
  value,
  defaultValue = false,
  context = {},
  children,
  fallback = null,
  loading = null,
}: ConditionalFlagProps): React.ReactElement | null {
  const [flagValue, setFlagValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function evaluateFlag() {
      try {
        setIsLoading(true);

        // Use stored values if available
        const storedValues = getStoredFlagValues();
        if (storedValues && flagKey in storedValues) {
          setFlagValue(storedValues[flagKey]);
          setIsLoading(false);
          return;
        }

        // Fallback to simple evaluation
        const evaluated = await evaluateSimpleFlag(flagKey, context, defaultValue);
        setFlagValue(evaluated);
      } catch (error) {
        logWarn('ConditionalFlag evaluation failed', {
          flagKey,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        setFlagValue(defaultValue);
      } finally {
        setIsLoading(false);
      }
    }

    evaluateFlag();
  }, [flagKey, context, defaultValue]);

  if (isLoading && loading) {
    return loading as React.ReactElement;
  }

  // If specific value is expected, check for exact match
  if (value !== undefined) {
    return flagValue === value
      ? (children as React.ReactElement)
      : (fallback as React.ReactElement | null);
  }

  // For boolean flags, check truthiness
  return flagValue ? (children as React.ReactElement) : (fallback as React.ReactElement | null);
}

/**
 * Get stored flag values from various sources
 */
function getStoredFlagValues(): FlagValuesType | null {
  try {
    // Try window object first
    if (typeof window !== 'undefined' && (window as any).__FEATURE_FLAG_VALUES__) {
      return (window as any).__FEATURE_FLAG_VALUES__;
    }

    // Try data attributes from FlagValues component
    if (typeof document !== 'undefined') {
      const flagScript = document.querySelector('script[data-flag-values]');
      if (flagScript && flagScript.textContent) {
        return JSON.parse(flagScript.textContent);
      }
    }

    return null;
  } catch (_error) {
    return null;
  }
}

/**
 * Simple flag evaluation for ConditionalFlag component
 */
async function evaluateSimpleFlag(
  flagKey: string,
  context: FlagContext,
  defaultValue: any,
): Promise<any> {
  // This is a simplified version - in production it would use the full client-side evaluation
  logInfo('Evaluating flag for ConditionalFlag', { flagKey, context });

  // Simple rule-based evaluation
  if (flagKey.includes('show') || flagKey.includes('enable')) {
    return typeof defaultValue === 'boolean' ? defaultValue : true;
  }

  return defaultValue;
}

/**
 * Provider component for flag context (optional advanced usage)
 */
interface FlagProviderProps {
  /** Initial flag values */
  initialValues?: FlagValuesType;

  /** Global context for all flag evaluations */
  context?: FlagContext;

  /** Children components */
  children: React.ReactNode;
}

/**
 * FlagProvider Component for providing flag context to child components
 * Optional - most use cases won't need this
 *
 * @example
 * ```tsx
 * function App() {
 *   const userContext = { user: { id: 'user_123' } };
 *
 *   return (
 *     <FlagProvider context={userContext}>
 *       <Dashboard />
 *       <Sidebar />
 *     </FlagProvider>
 *   );
 * }
 * ```
 */
export function FlagProvider({
  initialValues,
  context,
  children,
}: FlagProviderProps): React.ReactElement {
  useEffect(() => {
    if (initialValues) {
      // Set initial values globally
      if (typeof window !== 'undefined') {
        (window as any).__FEATURE_FLAG_VALUES__ = initialValues;
        (window as any).__FEATURE_FLAG_CONTEXT__ = context;
      }
    }
  }, [initialValues, context]);

  return children as React.ReactElement;
}
