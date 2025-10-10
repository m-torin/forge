/**
 * Vercel Analytics page view operations
 * Adapter-aware functions that actually track page events
 */

import type { MinimalAdapter } from '@repo/3p-core/adapters/minimal-adapter';
import type { PagePayload } from '@repo/3p-core/types';

// Adapter-aware tracking functions
export async function trackPageView(
  adapter: MinimalAdapter,
  page: {
    url?: string;
    path?: string;
    title?: string;
    referrer?: string;
    search?: string;
    hash?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.page({
    name: page.title,
    properties: {
      page_url: page.url,
      page_path: page.path,
      page_title: page.title,
      page_referrer: page.referrer,
      page_search: page.search,
      page_hash: page.hash,
    },
    context,
  });
}

// Payload factory functions (for manual usage)
export function createPageViewPayload(
  page: {
    url?: string;
    path?: string;
    title?: string;
    referrer?: string;
    search?: string;
    hash?: string;
  },
  context?: any,
): PagePayload {
  return {
    name: page.title,
    properties: {
      page_url: page.url,
      page_path: page.path,
      page_title: page.title,
      page_referrer: page.referrer,
      page_search: page.search,
      page_hash: page.hash,
    },
    context,
  };
}

export async function trackRouteChange(
  adapter: MinimalAdapter,
  route: {
    from_path: string;
    to_path: string;
    method?: 'push' | 'replace' | 'pop';
    duration?: number;
  },
  context?: any,
): Promise<boolean> {
  return adapter.page({
    name: 'Route Changed',
    properties: {
      route_from: route.from_path,
      route_to: route.to_path,
      route_method: route.method,
      route_duration: route.duration,
    },
    context,
  });
}

export function createRouteChangePayload(
  route: {
    from_path: string;
    to_path: string;
    method?: 'push' | 'replace' | 'pop';
    duration?: number;
  },
  context?: any,
): PagePayload {
  return {
    name: 'Route Changed',
    properties: {
      route_from: route.from_path,
      route_to: route.to_path,
      route_method: route.method,
      route_duration: route.duration,
    },
    context,
  };
}

export async function trackSPANavigation(
  adapter: MinimalAdapter,
  navigation: {
    from_url: string;
    to_url: string;
    trigger?: 'link' | 'browser' | 'programmatic';
    load_time?: number;
  },
  context?: any,
): Promise<boolean> {
  return adapter.page({
    name: 'SPA Navigation',
    properties: {
      navigation_from: navigation.from_url,
      navigation_to: navigation.to_url,
      navigation_trigger: navigation.trigger,
      navigation_load_time: navigation.load_time,
    },
    context,
  });
}

export function createSPANavigationPayload(
  navigation: {
    from_url: string;
    to_url: string;
    trigger?: 'link' | 'browser' | 'programmatic';
    load_time?: number;
  },
  context?: any,
): PagePayload {
  return {
    name: 'SPA Navigation',
    properties: {
      navigation_from: navigation.from_url,
      navigation_to: navigation.to_url,
      navigation_trigger: navigation.trigger,
      navigation_load_time: navigation.load_time,
    },
    context,
  };
}

export async function trackPageLoad(
  adapter: MinimalAdapter,
  load: {
    url: string;
    load_time: number;
    dom_ready_time?: number;
    first_paint?: number;
    largest_contentful_paint?: number;
    cumulative_layout_shift?: number;
  },
  context?: any,
): Promise<boolean> {
  return adapter.page({
    name: 'Page Loaded',
    properties: {
      page_url: load.url,
      page_load_time: load.load_time,
      page_dom_ready_time: load.dom_ready_time,
      page_first_paint: load.first_paint,
      page_lcp: load.largest_contentful_paint,
      page_cls: load.cumulative_layout_shift,
    },
    context,
  });
}

export function createPageLoadPayload(
  load: {
    url: string;
    load_time: number;
    dom_ready_time?: number;
    first_paint?: number;
    largest_contentful_paint?: number;
    cumulative_layout_shift?: number;
  },
  context?: any,
): PagePayload {
  return {
    name: 'Page Loaded',
    properties: {
      page_url: load.url,
      page_load_time: load.load_time,
      page_dom_ready_time: load.dom_ready_time,
      page_first_paint: load.first_paint,
      page_lcp: load.largest_contentful_paint,
      page_cls: load.cumulative_layout_shift,
    },
    context,
  };
}

export async function trackPageExit(
  adapter: MinimalAdapter,
  exit: {
    url: string;
    time_on_page: number;
    scroll_depth?: number;
    interactions_count?: number;
    bounce?: boolean;
  },
  context?: any,
): Promise<boolean> {
  return adapter.page({
    name: 'Page Exited',
    properties: {
      page_url: exit.url,
      page_time_on_page: exit.time_on_page,
      page_scroll_depth: exit.scroll_depth,
      page_interactions_count: exit.interactions_count,
      page_bounce: exit.bounce,
    },
    context,
  });
}

export function createPageExitPayload(
  exit: {
    url: string;
    time_on_page: number;
    scroll_depth?: number;
    interactions_count?: number;
    bounce?: boolean;
  },
  context?: any,
): PagePayload {
  return {
    name: 'Page Exited',
    properties: {
      page_url: exit.url,
      page_time_on_page: exit.time_on_page,
      page_scroll_depth: exit.scroll_depth,
      page_interactions_count: exit.interactions_count,
      page_bounce: exit.bounce,
    },
    context,
  };
}
