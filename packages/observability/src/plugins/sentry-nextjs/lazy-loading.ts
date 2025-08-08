/**
 * Lazy loading utilities for Sentry Next.js integration
 * Supports dynamic import patterns for reduced bundle size
 */

/**
 * Lazy load and add an integration
 * @example
 * await lazyLoadSentryIntegration('replayIntegration');
 */
export async function lazyLoadSentryIntegration(
  integrationName:
    | 'replayIntegration'
    | 'replayCanvasIntegration'
    | 'feedbackIntegration'
    | 'browserTracingIntegration'
    | 'browserProfilingIntegration'
    | 'httpClientIntegration'
    | 'contextLinesIntegration'
    | 'reportingObserverIntegration'
    | 'captureConsoleIntegration'
    | 'extraErrorDataIntegration'
    | 'sessionTimingIntegration'
    | 'debugIntegration',
  options?: any,
): Promise<void> {
  try {
    // Dynamically import @sentry/nextjs
    const Sentry = await import('@sentry/nextjs');

    // Get the main Sentry instance
    const mainSentry = (window as any).Sentry || Sentry;

    // Check if integration function exists
    if (typeof (Sentry as any)[integrationName] !== 'function') {
      console.warn(`Integration ${integrationName} not found in @sentry/nextjs`);
      return;
    }

    // Create and add the integration
    const integration = options
      ? (Sentry as any)[integrationName](options)
      : (Sentry as any)[integrationName]();

    mainSentry.addIntegration(integration);

    console.log(`✓ Lazy loaded ${integrationName}`);
  } catch (error) {
    console.error(`Failed to lazy load ${integrationName}:`, error);
  }
}

/**
 * Lazy load multiple integrations
 */
export async function lazyLoadIntegrations(
  integrations: Array<{
    name: Parameters<typeof lazyLoadSentryIntegration>[0];
    options?: any;
  }>,
): Promise<void> {
  await Promise.all(
    integrations.map(({ name, options }) => lazyLoadSentryIntegration(name, options)),
  );
}

/**
 * Conditionally lazy load integrations based on user interaction
 * @example
 * // Load replay when user consents to recording
 * await conditionalLazyLoad('user-consent-recording', async () => {
 *   await lazyLoadSentryIntegration('replayIntegration', {
 *     maskAllText: false,
 *     blockAllMedia: false,
 *   });
 * });
 */
export async function conditionalLazyLoad(
  condition: string | (() => boolean | Promise<boolean>),
  loader: () => Promise<void>,
): Promise<void> {
  // Check if already loaded
  const loadedKey = `sentry_lazy_loaded_${typeof condition === 'string' ? condition : 'custom'}`;
  if ((window as any)[loadedKey]) {
    return;
  }

  // Evaluate condition
  const shouldLoad =
    typeof condition === 'string'
      ? true // String conditions are assumed to be event names
      : await condition();

  if (shouldLoad) {
    await loader();
    (window as any)[loadedKey] = true;
  }
}

/**
 * Create a lazy loading configuration for client-side Sentry
 */
export function createLazyLoadingConfig() {
  return {
    // Start with minimal integrations
    integrations: [],

    // Set up lazy loading after initial load
    beforeSend: async (event: any, _hint: any) => {
      // Auto-load replay on error
      if (event.exception && !(window as any).sentry_lazy_loaded_replay_on_error) {
        try {
          await lazyLoadSentryIntegration('replayIntegration', {
            replaysOnErrorSampleRate: 1.0,
          });
          (window as any).sentry_lazy_loaded_replay_on_error = true;
        } catch (error) {
          console.warn('Failed to lazy load replay integration:', error);
        }
      }

      return event;
    },
  };
}

/**
 * Generate lazy loading code for instrumentation
 */
export function generateLazyLoadingCode(
  integrations: Array<{
    name: string;
    condition?: string;
    options?: any;
  }> = [],
): string {
  const imports = `
// Lazy loading utilities
async function lazyLoadSentryIntegration(name, options) {
  try {
    const Sentry = await import('@sentry/nextjs');
    const integration = options ? Sentry[name](options) : Sentry[name]();
    Sentry.addIntegration(integration);
    console.log(\`✓ Lazy loaded \${name}\`);
  } catch (error) {
    console.error(\`Failed to lazy load \${name}:\`, error);
  }
}
`;

  const loaders = integrations
    .map(({ name, condition, options }) => {
      const optionsStr = options ? JSON.stringify(options, null, 2) : undefined;

      if (condition) {
        return `
// Conditionally load ${name}
if (${condition}) {
  lazyLoadSentryIntegration('${name}'${optionsStr ? `, ${optionsStr}` : ''});
}`;
      }

      return `
// Load ${name} on demand
setTimeout(() => {
  lazyLoadSentryIntegration('${name}'${optionsStr ? `, ${optionsStr}` : ''});
}, 1000);`;
    })
    .join('\n');

  return `${imports}\n${loaders}`;
}

/**
 * React hook for lazy loading Sentry integrations
 */
export function useLazyLoadIntegration() {
  return {
    loadReplay: (options?: any) => lazyLoadSentryIntegration('replayIntegration', options),
    loadFeedback: (options?: any) => lazyLoadSentryIntegration('feedbackIntegration', options),
    loadProfiling: (options?: any) =>
      lazyLoadSentryIntegration('browserProfilingIntegration', options),
    loadAll: (integrations: Parameters<typeof lazyLoadIntegrations>[0]) =>
      lazyLoadIntegrations(integrations),
  };
}
