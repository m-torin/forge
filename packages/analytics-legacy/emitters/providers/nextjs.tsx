'use client';

import Script from 'next/script';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { Analytics } from '../analytics';

import type { AnalyticsProviders } from '../analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  debug?: boolean;
  disabled?: boolean;
  googleAnalytics?: {
    measurementId: string;
  };
  posthog?: {
    apiKey: string;
    apiHost?: string;
  };
  segment?: {
    writeKey: string;
  };
}

interface AnalyticsContextValue {
  analytics: Analytics | null;
  isLoaded: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  analytics: null,
  isLoaded: false,
});

/**
 * Next.js 15 App Router compatible Analytics Provider
 * Handles script loading and initialization properly
 */
export function AnalyticsProvider({
  children,
  debug = false,
  disabled = false,
  googleAnalytics,
  posthog,
  segment,
}: AnalyticsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const analyticsRef = useRef<Analytics | null>(null);
  const scriptsLoadedRef = useRef({
    googleAnalytics: !googleAnalytics,
    posthog: !posthog,
    segment: !segment,
  });

  // Initialize analytics instance once all scripts are loaded
  useEffect(() => {
    const allScriptsLoaded = Object.values(scriptsLoadedRef.current).every((loaded) => loaded);

    if (allScriptsLoaded && !analyticsRef.current) {
      const providers: AnalyticsProviders = {};

      if (segment) {
        providers.segment = {
          writeKey: segment.writeKey,
        };
      }

      if (posthog) {
        providers.posthog = {
          apiKey: posthog.apiKey,
          config: {
            apiHost: posthog.apiHost,
          },
        };
      }

      if (googleAnalytics) {
        providers.googleAnalytics = {
          measurementId: googleAnalytics.measurementId,
        };
      }

      analyticsRef.current = new Analytics({
        providers,
        debug,
        disabled,
      });

      setIsLoaded(true);
    }
  }, [segment, posthog, googleAnalytics, debug, disabled]);

  const handleScriptLoad = (provider: keyof typeof scriptsLoadedRef.current) => {
    scriptsLoadedRef.current[provider] = true;

    // Check if all scripts are loaded
    const allLoaded = Object.values(scriptsLoadedRef.current).every((loaded) => loaded);
    if (allLoaded) {
      // Re-run the effect to initialize analytics
      setIsLoaded(false);
    }
  };

  return (
    <>
      {/* Segment Script */}
      {segment && (
        <Script
          id="segment-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${segment.writeKey}";analytics.SNIPPET_VERSION="4.15.3";
              analytics.load("${segment.writeKey}");
              }}();
            `,
          }}
          onLoad={() => handleScriptLoad('segment')}
          strategy="lazyOnload"
        />
      )}

      {/* PostHog Script */}
      {posthog && (
        <Script
          id="posthog-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${posthog.apiKey}', {api_host: '${posthog.apiHost || 'https://app.posthog.com'}'})
            `,
          }}
          onLoad={() => handleScriptLoad('posthog')}
          strategy="lazyOnload"
        />
      )}

      {/* Google Analytics Script */}
      {googleAnalytics && (
        <>
          <Script
            id="google-analytics"
            onLoad={() => handleScriptLoad('googleAnalytics')}
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics.measurementId}`}
            strategy="lazyOnload"
          />
          <Script
            id="google-analytics-init"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalytics.measurementId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
            strategy="lazyOnload"
          />
        </>
      )}

      <AnalyticsContext.Provider
        value={{
          analytics: analyticsRef.current,
          isLoaded,
        }}
      >
        {children}
      </AnalyticsContext.Provider>
    </>
  );
}

/**
 * Hook to use analytics in client components
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

/**
 * Higher-order component for pages that need analytics
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P & { analytics: Analytics }>,
) {
  return function WithAnalyticsComponent(props: P) {
    const { analytics } = useAnalytics();

    if (!analytics) {
      // Return component without analytics while loading
      return <Component {...props} analytics={null as any} />;
    }

    return <Component {...props} analytics={analytics} />;
  };
}
