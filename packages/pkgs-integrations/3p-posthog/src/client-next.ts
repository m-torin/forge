/**
 * PostHog Next.js client-side integration
 */

'use client';

import { PostHogAdapter } from './client';
import type { PostHogConfig } from './types';

export class PostHogNextClientAnalytics extends PostHogAdapter {
  constructor(config: PostHogConfig) {
    // Next.js client-specific configuration
    super({
      ...config,
      // Enable features useful for Next.js apps
      autocapture: config.autocapture !== false,
      capture_pageview: false, // We'll handle this manually for better control
      capture_pageleave: config.capture_pageleave !== false,
      cross_subdomain_cookie: config.cross_subdomain_cookie || true,
      session_recording: {
        recordHeaders: false,
        recordBody: false,
        maskAllInputs: true,
        blockClass: 'ph-no-capture',
        ignoreClass: 'ph-ignore-input',
        maskTextClass: 'ph-mask',
        ...config.session_recording,
      },
    });
  }

  protected async doInitialize(): Promise<void> {
    // Initialize the base PostHog client
    await super.doInitialize();

    // Set up Next.js specific integrations
    this.setupNextRouterIntegration();
    this.setupNextErrorBoundary();
  }

  private setupNextRouterIntegration(): void {
    if (typeof window === 'undefined') return;

    try {
      // Listen for Next.js navigation events
      const handleRouteChange = (url: string, { shallow }: { shallow?: boolean } = {}) => {
        this.track({
          name: 'Page Viewed',
          properties: {
            $current_url: url,
            $pathname: new URL(url, window.location.origin).pathname,
            $search: new URL(url, window.location.origin).search,
            $hash: new URL(url, window.location.origin).hash,
            navigation_type: shallow ? 'shallow' : 'full',
            framework: 'nextjs',
          },
          timestamp: new Date().toISOString(),
        });
      };

      // Next.js App Router navigation events
      if ('navigation' in window && 'addEventListener' in (window as any).navigation) {
        (window as any).navigation.addEventListener('navigate', (event: any) => {
          if (event.destination?.url) {
            handleRouteChange(event.destination.url, { shallow: false });
          }
        });
      }

      // Fallback for Pages Router or manual navigation tracking
      let lastUrl = window.location.href;
      const observer = new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          handleRouteChange(currentUrl);
          lastUrl = currentUrl;
        }
      });

      observer.observe(document, { subtree: true, childList: true });

      this.log('debug', 'Next.js router integration setup complete');
    } catch (error) {
      this.log('warn', 'Failed to setup Next.js router integration', error);
    }
  }

  private setupNextErrorBoundary(): void {
    if (typeof window === 'undefined') return;

    try {
      // Listen for unhandled errors
      window.addEventListener('error', event => {
        this.track({
          name: 'JavaScript Error',
          properties: {
            error_message: event.message,
            error_filename: event.filename,
            error_lineno: event.lineno,
            error_colno: event.colno,
            error_stack: event.error?.stack,
            framework: 'nextjs',
            $current_url: window.location.href,
          },
          timestamp: new Date().toISOString(),
        });
      });

      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', event => {
        this.track({
          name: 'Unhandled Promise Rejection',
          properties: {
            error_message: event.reason?.message || String(event.reason),
            error_stack: event.reason?.stack,
            framework: 'nextjs',
            $current_url: window.location.href,
          },
          timestamp: new Date().toISOString(),
        });
      });

      this.log('debug', 'Next.js error boundary setup complete');
    } catch (error) {
      this.log('warn', 'Failed to setup Next.js error boundary', error);
    }
  }

  // Next.js specific client methods
  public trackNextNavigation(
    from: string,
    to: string,
    type: 'push' | 'replace' | 'back' | 'forward' = 'push',
    shallow = false,
  ): Promise<boolean> {
    return this.track({
      name: 'Next.js Navigation',
      properties: {
        navigation_from: from,
        navigation_to: to,
        navigation_type: type,
        navigation_shallow: shallow,
        framework: 'nextjs',
      },
      timestamp: new Date().toISOString(),
    });
  }

  public trackNextHydration(componentName?: string, hydrationTime?: number): Promise<boolean> {
    return this.track({
      name: 'Next.js Hydration',
      properties: {
        component_name: componentName,
        hydration_time: hydrationTime,
        framework: 'nextjs',
      },
      timestamp: new Date().toISOString(),
    });
  }

  public trackNextImageLoad(
    src: string,
    loadTime: number,
    isBlurred = false,
    isPriority = false,
  ): Promise<boolean> {
    return this.track({
      name: 'Next.js Image Load',
      properties: {
        image_src: src,
        load_time: loadTime,
        image_blurred: isBlurred,
        image_priority: isPriority,
        framework: 'nextjs',
      },
      timestamp: new Date().toISOString(),
    });
  }

  public trackNextStaticGeneration(
    page: string,
    generationType: 'ssg' | 'isr' | 'ssr',
    generationTime?: number,
  ): Promise<boolean> {
    return this.track({
      name: 'Next.js Static Generation',
      properties: {
        page_path: page,
        generation_type: generationType,
        generation_time: generationTime,
        framework: 'nextjs',
      },
      timestamp: new Date().toISOString(),
    });
  }

  public trackNextWebVitals(
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor',
    id?: string,
  ): Promise<boolean> {
    return this.track({
      name: 'Next.js Web Vital',
      properties: {
        web_vital_name: name,
        web_vital_value: value,
        web_vital_rating: rating,
        web_vital_id: id,
        framework: 'nextjs',
      },
      timestamp: new Date().toISOString(),
    });
  }

  public trackNextFeatureFlag(
    flagName: string,
    flagValue: boolean | string,
    source: 'middleware' | 'component' | 'api' = 'component',
  ): Promise<boolean> {
    return this.track({
      name: 'Next.js Feature Flag',
      properties: {
        feature_flag_name: flagName,
        feature_flag_value: flagValue,
        feature_flag_source: source,
        framework: 'nextjs',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

export function createNextClientAnalytics(config: PostHogConfig) {
  return new PostHogNextClientAnalytics(config);
}
