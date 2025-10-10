/**
 * Custom integration system for Sentry Next.js
 */

// Use a generic type for Integration since it's not exported directly
type Integration = any;

/**
 * Custom integration definition
 */
export interface CustomIntegration {
  /**
   * Unique name for the integration
   */
  name: string;

  /**
   * Description of what the integration does
   */
  description?: string;

  /**
   * Setup function called when integration is added
   */
  setup: (client: any) => void;

  /**
   * Optional cleanup function
   */
  cleanup?: () => void;

  /**
   * Dependencies required by this integration
   */
  dependencies?: string[];

  /**
   * Configuration options
   */
  options?: Record<string, any>;
}

/**
 * Custom integration factory
 */
export function createCustomIntegration(
  config: CustomIntegration,
): Integration {
  return {
    name: config.name,
    setupOnce: () => {
      // This is called once globally
    },
    setup: (client: any) => {
      // Check dependencies
      if (config.dependencies) {
        for (const dep of config.dependencies) {
          if (!client.getIntegrationByName(dep)) {
            console.warn(
              `Custom integration "${config.name}" requires "${dep}" integration`,
            );
          }
        }
      }

      // Run setup
      config.setup(client);
    },
  } as Integration;
}

/**
 * Pre-built custom integrations
 */

/**
 * Performance Budget Integration
 * Tracks and alerts when performance metrics exceed budgets
 */
export const performanceBudgetIntegration = (budgets: {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  bundleSize?: number;
}) =>
  createCustomIntegration({
    name: "PerformanceBudget",
    description: "Monitors performance metrics against defined budgets",
    setup: (client) => {
      if (typeof window === "undefined") return;

      // Monitor Web Vitals
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const metric = entry.name;
            const value = (entry as any).value || (entry as any).duration;

            // Check against budgets
            let exceeded = false;
            let budget = 0;

            switch (metric) {
              case "LCP":
              case "largest-contentful-paint":
                if (budgets.lcp && value > budgets.lcp) {
                  exceeded = true;
                  budget = budgets.lcp;
                }
                break;
              case "FID":
              case "first-input-delay":
                if (budgets.fid && value > budgets.fid) {
                  exceeded = true;
                  budget = budgets.fid;
                }
                break;
              case "CLS":
              case "cumulative-layout-shift":
                if (budgets.cls && value > budgets.cls) {
                  exceeded = true;
                  budget = budgets.cls;
                }
                break;
            }

            if (exceeded) {
              client.captureMessage(
                `Performance budget exceeded: ${metric}`,
                "warning",
                {
                  tags: {
                    metric,
                    value,
                    budget,
                    exceeded: value - budget,
                  },
                  extra: {
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                  },
                },
              );
            }
          }
        });

        // Observe various performance metrics
        try {
          observer.observe({
            entryTypes: [
              "largest-contentful-paint",
              "layout-shift",
              "first-input",
            ],
          });
        } catch (_e) {
          // Some browsers don't support all entry types
        }
      }
    },
  });

/**
 * A/B Testing Integration
 * Tracks A/B test variants and adds them to Sentry context
 */
export const abTestingIntegration = (config: {
  getVariant: (testName: string) => string | null;
  tests: string[];
}) =>
  createCustomIntegration({
    name: "ABTesting",
    description: "Adds A/B test context to all events",
    setup: (client) => {
      // Add A/B test context to all events
      client.configureScope((scope: any) => {
        const variants: Record<string, string> = {};

        for (const testName of config.tests) {
          const variant = config.getVariant(testName);
          if (variant) {
            variants[testName] = variant;
          }
        }

        scope.setContext("ab_tests", variants);
        scope.setTag("has_ab_tests", Object.keys(variants).length > 0);
      });
    },
  });

/**
 * User Behavior Integration
 * Tracks user interactions and adds them as breadcrumbs
 */
export const userBehaviorIntegration = (config: {
  trackClicks?: boolean;
  trackScrolls?: boolean;
  trackForms?: boolean;
  trackRageClicks?: boolean;
  sensitiveSelectors?: string[];
}) =>
  createCustomIntegration({
    name: "UserBehavior",
    description: "Enhanced user behavior tracking",
    setup: (client) => {
      if (typeof window === "undefined") return;

      const sensitiveSelectors = config.sensitiveSelectors || [
        'input[type="password"]',
        "[data-sensitive]",
        ".private",
      ];

      // Track clicks
      if (config.trackClicks) {
        let lastClickTime = 0;
        let clickCount = 0;
        const rageClickThreshold = 3;
        const rageClickWindow = 1000; // 1 second

        document.addEventListener("click", (event) => {
          const target = event.target as HTMLElement;

          // Skip sensitive elements
          if (sensitiveSelectors.some((selector) => target.matches(selector))) {
            return;
          }

          const now = Date.now();
          const selector = getElementSelector(target);

          // Detect rage clicks
          if (config.trackRageClicks && now - lastClickTime < rageClickWindow) {
            clickCount++;
            if (clickCount >= rageClickThreshold) {
              client.addBreadcrumb({
                category: "ui.rageClick",
                message: `Rage click detected on ${selector}`,
                level: "warning",
                data: {
                  selector,
                  clickCount,
                },
              });
              clickCount = 0;
            }
          } else {
            clickCount = 1;
          }
          lastClickTime = now;

          // Normal click tracking
          client.addBreadcrumb({
            category: "ui.click",
            message: `Clicked on ${selector}`,
            data: {
              selector,
              text: target.textContent?.substring(0, 100),
            },
          });
        });
      }

      // Track scrolls
      if (config.trackScrolls) {
        let scrollTimer: NodeJS.Timeout;
        let lastScrollPosition = 0;

        window.addEventListener("scroll", () => {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            const scrollPosition = window.scrollY;
            const scrollPercentage = Math.round(
              (scrollPosition /
                (document.documentElement.scrollHeight - window.innerHeight)) *
                100,
            );

            client.addBreadcrumb({
              category: "ui.scroll",
              message: `Scrolled to ${scrollPercentage}%`,
              data: {
                from: lastScrollPosition,
                to: scrollPosition,
                percentage: scrollPercentage,
              },
            });

            lastScrollPosition = scrollPosition;
          }, 500);
        });
      }

      // Track form interactions
      if (config.trackForms) {
        document.addEventListener("submit", (event) => {
          const form = event.target as HTMLFormElement;

          client.addBreadcrumb({
            category: "ui.form.submit",
            message: `Form submitted: ${form.name || form.id || "unnamed"}`,
            data: {
              action: form.action,
              method: form.method,
            },
          });
        });

        document.addEventListener("change", (event) => {
          const target = event.target as HTMLInputElement;

          // Skip sensitive fields
          if (sensitiveSelectors.some((selector) => target.matches(selector))) {
            return;
          }

          client.addBreadcrumb({
            category: "ui.form.change",
            message: `Field changed: ${target.name || target.id}`,
            data: {
              type: target.type,
              name: target.name,
              // Don't log the actual value for privacy
            },
          });
        });
      }
    },
  });

/**
 * Helper function to get a readable selector for an element
 */
function getElementSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className) {
    return `.${element.className.split(" ").join(".")}`;
  }

  return element.tagName.toLowerCase();
}

/**
 * API Monitoring Integration
 * Enhanced API call tracking with performance metrics
 */
export const apiMonitoringIntegration = (config: {
  endpoints?: string[];
  slowThreshold?: number;
  trackPayloads?: boolean;
  trackHeaders?: boolean;
}) =>
  createCustomIntegration({
    name: "APIMonitoring",
    description: "Enhanced API monitoring with performance tracking",
    setup: (client) => {
      if (typeof window === "undefined") return;

      const slowThreshold = config.slowThreshold || 3000;

      // Intercept fetch
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        const [url, options] = args;
        const startTime = performance.now();

        try {
          const response = await originalFetch.apply(this, args);
          const duration = performance.now() - startTime;

          const urlString = typeof url === "string" ? url : url.toString();

          // Check if we should track this endpoint
          if (
            config.endpoints &&
            !config.endpoints.some((ep) => urlString.includes(ep))
          ) {
            return response;
          }

          // Track slow requests
          if (duration > slowThreshold) {
            client.captureMessage(`Slow API request: ${urlString}`, "warning", {
              tags: {
                api_endpoint: urlString,
                api_method: options?.method || "GET",
                api_slow: true,
              },
              extra: {
                duration,
                status: response.status,
                ...(config.trackHeaders && { headers: response.headers }),
              },
            });
          }

          // Add breadcrumb for all API calls
          client.addBreadcrumb({
            category: "api",
            message: `${options?.method || "GET"} ${urlString}`,
            data: {
              status: response.status,
              duration,
              ...(config.trackPayloads &&
                options?.body && {
                  requestBody:
                    typeof options.body === "string"
                      ? options.body.substring(0, 1000)
                      : "[Binary Data]",
                }),
            },
          });

          return response;
        } catch (error) {
          const duration = performance.now() - startTime;

          client.addBreadcrumb({
            category: "api",
            message: `Failed: ${options?.method || "GET"} ${url}`,
            level: "error",
            data: {
              error: error instanceof Error ? error.message : String(error),
              duration,
            },
          });

          throw error;
        }
      };
    },
  });

/**
 * Integration registry for managing custom integrations
 */
export class IntegrationRegistry {
  private integrations: Map<string, CustomIntegration> = new Map();

  /**
   * Register a custom integration
   */
  register(integration: CustomIntegration): void {
    this.integrations.set(integration.name, integration);
  }

  /**
   * Get all registered integrations
   */
  getAll(): CustomIntegration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get integration by name
   */
  get(name: string): CustomIntegration | undefined {
    return this.integrations.get(name);
  }

  /**
   * Create Sentry integrations from registered custom integrations
   */
  createSentryIntegrations(): Integration[] {
    return this.getAll().map((config) => createCustomIntegration(config));
  }
}

// Global registry instance
export const integrationRegistry = new IntegrationRegistry();
