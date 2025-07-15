/**
 * Next.js client components for analytics
 */

'use client';

import { createClientObservability } from '@repo/observability/client/next';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import type { AnalyticsConfig } from '../../shared/types/types';
import { usePageTracking, useTrackEvent } from './hooks';
import { createNextJSClientAnalytics } from './manager';

// Global analytics instance
let globalAnalytics: any = null;

// Global logger instance
let logger: any = null;

/**
 * Analytics provider component for App Router
 */
export function AnalyticsProvider({
  autoPageTracking = true,
  children,
  config,
  pageTrackingOptions,
}: {
  children: React.ReactNode;
  config: AnalyticsConfig;
  autoPageTracking?: boolean;
  pageTrackingOptions?: Parameters<typeof usePageTracking>[0];
}) {
  // Initialize analytics
  useEffect(() => {
    if (!globalAnalytics) {
      const initAnalytics = async () => {
        try {
          // Initialize logger if not already initialized
          if (!logger) {
            logger = await createClientObservability();
          }

          const instance = await createNextJSClientAnalytics(config);
          globalAnalytics = instance;
        } catch (error) {
          if (logger) {
            await logger.log('error', 'Failed to initialize analytics', {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      };
      initAnalytics();
    }
  }, [config]);

  // Auto page tracking
  usePageTracking(autoPageTracking ? pageTrackingOptions : { skip: true });

  return children as React.ReactElement;
}

/**
 * Component for tracking clicks
 */
export function TrackedButton({
  children,
  eventName,
  onClick,
  properties,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  eventName: string;
  properties?: Record<string, any>;
}) {
  const track = useTrackEvent();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      track(eventName, properties);
      onClick?.(e);
    },
    [track, eventName, properties, onClick],
  );

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

/**
 * Component for tracking link clicks
 */
export function TrackedLink({
  children,
  eventName,
  href,
  onClick,
  properties,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  properties?: Record<string, any>;
}) {
  const track = useTrackEvent();
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Track the event
      const enhancedProperties = {
        ...properties,
        href,
        link_text: typeof children === 'string' ? children : undefined,
      };
      track(eventName, enhancedProperties);

      // Handle navigation
      if (onClick) {
        onClick(e);
      } else if (href && !props.target && href.startsWith('/')) {
        // Internal navigation
        e.preventDefault();
        router.push(href as Route);
      }
    },
    [track, eventName, properties, href, onClick, router, children, props.target],
  );

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

/**
 * Higher-order component for tracking component views
 */
export function withViewTracking<P extends object>(
  Component: React.ComponentType<P>,
  eventName: string,
  getProperties?: (props: P) => Record<string, any>,
) {
  return function TrackedComponent(props: P) {
    const track = useTrackEvent();
    const tracked = useRef(false);

    useEffect(() => {
      if (!tracked.current) {
        tracked.current = true;
        const properties = getProperties ? getProperties(props) : {};
        track(eventName, properties);
      }
    }, [track, props]);

    return <Component {...props} />;
  };
}
