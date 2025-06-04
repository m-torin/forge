'use client';

import Script from 'next/script';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { SegmentEmitter } from './segment';

import type { AnalyticsEmitter } from './types';

interface SegmentProviderProps {
  children: React.ReactNode;
  debug?: boolean;
  loadOptions?: any;
  writeKey: string;
}

interface SegmentContextValue {
  analytics: AnalyticsEmitter | null;
  isLoaded: boolean;
}

const SegmentContext = createContext<SegmentContextValue>({
  analytics: null,
  isLoaded: false,
});

/**
 * Next.js 15 compatible Segment Provider
 * Uses Next.js Script component for proper loading
 */
export function SegmentProvider({
  children,
  debug = false,
  loadOptions = {},
  writeKey,
}: SegmentProviderProps) {
  const [analytics, setAnalytics] = useState<AnalyticsEmitter | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the analytics queue before script loads
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize the global analytics queue
    const analytics = ((window as any).analytics = (window as any).analytics || []);

    if (!analytics.initialize) {
      if (analytics.invoked) {
        console.error('[Segment] Analytics.js snippet included twice.');
        return;
      }

      analytics.invoked = true;
      analytics.methods = [
        'trackSubmit',
        'trackClick',
        'trackLink',
        'trackForm',
        'pageview',
        'identify',
        'reset',
        'group',
        'track',
        'ready',
        'alias',
        'debug',
        'page',
        'once',
        'off',
        'on',
        'addSourceMiddleware',
        'addIntegrationMiddleware',
        'setAnonymousId',
        'addDestinationMiddleware',
      ];

      analytics.factory = function (method: string) {
        return function (...args: any[]) {
          args.unshift(method);
          analytics.push(args);
          return analytics;
        };
      };

      for (const method of analytics.methods) {
        analytics[method] = analytics.factory(method);
      }

      analytics.load = function (key: string, options: any) {
        analytics._writeKey = key;
        analytics._loadOptions = options;
      };

      analytics.SNIPPET_VERSION = '4.13.1';
      analytics.load(writeKey, loadOptions);
    }
  }, [writeKey, loadOptions]);

  const handleScriptLoad = () => {
    if (debug) {
      console.log('[Segment] Script loaded successfully');
    }

    // Create the emitter instance
    const emitter = new SegmentEmitter({
      debug,
      writeKey,
    });

    setAnalytics(emitter);
    setIsLoaded(true);
  };

  const handleScriptError = () => {
    console.error('[Segment] Failed to load analytics.js');
    setIsLoaded(true); // Still set as loaded to prevent indefinite waiting
  };

  return (
    <>
      <Script
        id="segment-analytics"
        onError={handleScriptError}
        onLoad={handleScriptLoad}
        src={`https://cdn.segment.com/analytics.js/v1/${writeKey}/analytics.min.js`}
        strategy="lazyOnload"
      />
      <SegmentContext.Provider value={{ analytics, isLoaded }}>{children}</SegmentContext.Provider>
    </>
  );
}

/**
 * Hook to use Segment analytics
 */
export function useSegment() {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegment must be used within a SegmentProvider');
  }
  return context;
}

/**
 * Next.js 15 App Router compatible Segment script tag
 * Alternative approach using a separate component
 */
export function SegmentScript({ writeKey }: { writeKey: string }) {
  return (
    <>
      <Script id="segment-analytics-init" strategy="afterInteractive">
        {`
          !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${writeKey}";analytics.SNIPPET_VERSION="4.15.3";
          analytics.load("${writeKey}");
          }}();
        `}
      </Script>
    </>
  );
}
