'use client';

import posthog, { type PostHog } from 'posthog-js';
import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react';
import { useEffect } from 'react';

import { keys } from '../keys';

import type { ReactNode } from 'react';

interface PostHogProviderProps {
  readonly children: ReactNode;
}

let hasLoggedWarning = false;

export const PostHogProvider = (properties: Omit<PostHogProviderProps, 'client'>) => {
  useEffect(() => {
    const { NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY } = keys();

    // Skip initialization if keys are not provided
    if (!NEXT_PUBLIC_POSTHOG_KEY || !NEXT_PUBLIC_POSTHOG_HOST) {
      if (!hasLoggedWarning) {
        console.warn(
          'PostHog analytics is disabled: Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST',
        );
        hasLoggedWarning = true;
      }
      return;
    }

    posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      capture_pageleave: true, // Overrides the `capture_pageview` setting
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      person_profiles: 'identified_only',
      ui_host: NEXT_PUBLIC_POSTHOG_HOST,
    }) as PostHog;
  }, []);

  return <PostHogProviderRaw client={posthog} {...properties} />;
};

export { usePostHog as useAnalytics } from 'posthog-js/react';
export { default as analytics } from 'posthog-js';
