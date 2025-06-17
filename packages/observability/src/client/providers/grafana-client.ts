/**
 * Grafana Monitoring Client Provider
 * Client-side integration with RUM and browser-specific monitoring
 */

import { GrafanaMonitoringProvider } from '../../shared/providers/grafana-monitoring-provider';

export class GrafanaClientProvider extends GrafanaMonitoringProvider {
  private performanceObserver?: PerformanceObserver;
  private navigationObserver?: PerformanceObserver;
  private userInteractionHandler?: (event: Event) => void;

  async initialize(config: any): Promise<void> {
    await super.initialize(config);

    if (!this.isClientEnabled()) return;

    // Initialize client-specific monitoring
    this.initializeRUM();
    this.initializePerformanceMonitoring();
    this.initializeUserInteractionTracking();
    this.initializeErrorTracking();
    this.initializeNavigationTracking();

    console.debug('[GrafanaClient] Client-side monitoring initialized');
  }

  private isClientEnabled(): boolean {
    return (
      typeof window !== 'undefined' &&
      this.config?.enabled === true &&
      this.config?.monitoring?.features?.rum === true
    );
  }

  private initializeRUM(): void {
    if (!this.isClientEnabled()) return;

    // Track initial page view
    this.trackPageView();

    // Track Web Vitals
    this.trackWebVitals();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackRUMEvent({
        type: 'custom',
        sessionId: this.getSessionId(),
        properties: {
          action: 'visibility_change',
          visible: !document.hidden,
        },
      });
    });
  }

  private initializePerformanceMonitoring(): void {
    if (!this.isClientEnabled() || !('PerformanceObserver' in window)) return;

    // Monitor Long Tasks
    try {
      this.performanceObserver = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.trackRUMEvent({
              type: 'performance',
              sessionId: this.getSessionId(),
              performance: {
                custom: {
                  long_task_duration: entry.duration,
                  long_task_start_time: entry.startTime,
                },
              },
            });
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['longtask'] });
    } catch (error: any) {
      console.warn('[GrafanaClient] Performance observer not supported: ', error);
    }

    // Monitor Navigation Timing
    try {
      this.navigationObserver = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;

            this.trackRUMEvent({
              type: 'performance',
              sessionId: this.getSessionId(),
              performance: {
                navigationTiming: {
                  dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                  tcp_connect: navEntry.connectEnd - navEntry.connectStart,
                  request_time: navEntry.responseEnd - navEntry.requestStart,
                  dom_processing:
                    navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                  load_complete: navEntry.loadEventEnd - navEntry.loadEventStart,
                  total_time: navEntry.loadEventEnd - navEntry.fetchStart,
                },
              },
            });
          }
        }
      });

      this.navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error: any) {
      console.warn('[GrafanaClient] Navigation observer not supported: ', error);
    }
  }

  private initializeUserInteractionTracking(): void {
    if (!this.isClientEnabled()) return;

    this.userInteractionHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      const elementId = target?.id;
      const className = target?.className;

      // Track clicks on important elements
      if (event.type === 'click' && ['button', 'a', 'input'].includes(tagName)) {
        this.trackRUMEvent({
          type: 'user_action',
          sessionId: this.getSessionId(),
          action: 'click',
          properties: {
            element: tagName,
            element_id: elementId,
            element_class: className,
            page: window.location.pathname,
            timestamp: Date.now(),
          },
        });
      }

      // Track form submissions
      if (event.type === 'submit' && tagName === 'form') {
        this.trackRUMEvent({
          type: 'user_action',
          sessionId: this.getSessionId(),
          action: 'form_submit',
          properties: {
            form_id: elementId,
            form_class: className,
            page: window.location.pathname,
          },
        });
      }
    };

    // Add event listeners
    document.addEventListener('click', this.userInteractionHandler, { passive: true });
    document.addEventListener('submit', this.userInteractionHandler, { passive: true });
  }

  private initializeErrorTracking(): void {
    if (!this.isClientEnabled()) return;

    // Track JavaScript errors
    window.addEventListener('error', (event: any) => {
      this.trackRUMEvent({
        type: 'error',
        sessionId: this.getSessionId(),
        error: {
          message: event.message,
          stack: event.error?.stack,
          type: 'javascript_error',
        },
        properties: {
          filename: event.filename,
          line_number: event.lineno,
          column_number: event.colno,
          page: window.location.pathname,
        },
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: any) => {
      this.trackRUMEvent({
        type: 'error',
        sessionId: this.getSessionId(),
        error: {
          message: String(event.reason),
          type: 'unhandled_promise_rejection',
        },
        properties: {
          page: window.location.pathname,
        },
      });
    });
  }

  private initializeNavigationTracking(): void {
    if (!this.isClientEnabled()) return;

    // Track SPA navigation (if using history API)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        if (window.grafanaClient) {
          window.grafanaClient.trackPageView();
        }
      }, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        if (window.grafanaClient) {
          window.grafanaClient.trackPageView();
        }
      }, 0);
    };

    // Track popstate events (back/forward button)
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }

  private trackPageView(): void {
    if (!this.isClientEnabled()) return;

    this.trackRUMEvent({
      type: 'page_view',
      sessionId: this.getSessionId(),
      page: window.location.pathname,
      properties: {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        screen_width: screen.width,
        screen_height: screen.height,
        timestamp: Date.now(),
      },
    });
  }

  private trackWebVitals(): void {
    if (!this.isClientEnabled()) return;

    // Track Core Web Vitals using PerformanceObserver
    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackRUMEvent({
              type: 'performance',
              sessionId: this.getSessionId(),
              performance: {
                vitals: {
                  lcp: entry.startTime,
                },
              },
            });
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any; // Type assertion for processingStart
            this.trackRUMEvent({
              type: 'performance',
              sessionId: this.getSessionId(),
              performance: {
                vitals: {
                  fid: fidEntry.processingStart - entry.startTime,
                },
              },
            });
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        // Report CLS on page unload
        window.addEventListener('beforeunload', () => {
          this.trackRUMEvent({
            type: 'performance',
            sessionId: this.getSessionId(),
            performance: {
              vitals: {
                cls: clsValue,
              },
            },
          });
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error: any) {
      console.warn('[GrafanaClient] Web Vitals tracking not supported: ', error);
    }
  }

  // Public methods for manual tracking
  public trackCustomEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isClientEnabled()) return;

    this.trackRUMEvent({
      type: 'custom',
      sessionId: this.getSessionId(),
      action: eventName,
      properties: {
        ...properties,
        page: window.location.pathname,
      },
    });
  }

  public trackUserAction(action: string, element?: string, properties?: Record<string, any>): void {
    if (!this.isClientEnabled()) return;

    this.trackRUMEvent({
      type: 'user_action',
      sessionId: this.getSessionId(),
      action,
      properties: {
        element,
        page: window.location.pathname,
        ...properties,
      },
    });
  }

  public trackPerformanceMark(name: string, detail?: any): void {
    if (!this.isClientEnabled()) return;

    // Create performance mark
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name, { detail });
    }

    // Track in RUM
    this.trackRUMEvent({
      type: 'performance',
      sessionId: this.getSessionId(),
      performance: {
        custom: {
          mark_name: name,
          mark_time: Date.now(),
          detail,
        },
      },
    });
  }

  // Cleanup method
  public destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.navigationObserver) {
      this.navigationObserver.disconnect();
    }

    if (this.userInteractionHandler) {
      document.removeEventListener('click', this.userInteractionHandler);
      document.removeEventListener('submit', this.userInteractionHandler);
    }
  }
}

// Global type augmentation for manual tracking
declare global {
  interface Window {
    grafanaClient?: GrafanaClientProvider;
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.grafanaClient = window.grafanaClient || new GrafanaClientProvider();
}
