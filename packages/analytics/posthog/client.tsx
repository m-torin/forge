"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogProviderRaw } from "posthog-js/react";
import { useEffect } from "react";

import { keys } from "../keys";

import type { ReactNode } from "react";

interface PostHogProviderProps {
  readonly children: ReactNode;
}

export const PostHogProvider = (
  properties: Omit<PostHogProviderProps, "client">,
) => {
  useEffect(() => {
    posthog.init(keys().NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      capture_pageleave: true, // Overrides the `capture_pageview` setting
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      person_profiles: "identified_only",
      ui_host: keys().NEXT_PUBLIC_POSTHOG_HOST,
    });
  }, []);

  return <PostHogProviderRaw client={posthog} {...properties} />;
};

export { usePostHog as useAnalytics } from "posthog-js/react";
