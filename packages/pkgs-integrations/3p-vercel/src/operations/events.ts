/**
 * Vercel Analytics event operations
 * Adapter-aware functions that actually track events
 */

import type { MinimalAdapter } from '@repo/3p-core/adapters/minimal-adapter';
import type { AnalyticsEvent } from '@repo/3p-core/types';

// Adapter-aware tracking functions
export async function trackCustomEvent(
  adapter: MinimalAdapter,
  name: string,
  data?: Record<string, string | number | boolean>,
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name,
    properties: data,
    context,
  });
}

// Payload factory functions (for manual usage)
export function createCustomEvent(
  name: string,
  data?: Record<string, string | number | boolean>,
  context?: any,
): AnalyticsEvent {
  return {
    name,
    properties: data,
    context,
  };
}

export async function trackButtonClick(
  adapter: MinimalAdapter,
  button: {
    id?: string;
    text?: string;
    location?: string;
    category?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Button Clicked',
    properties: {
      button_id: button.id,
      button_text: button.text,
      button_location: button.location,
      button_category: button.category,
    },
    context,
  });
}

export function createButtonClickEvent(
  button: {
    id?: string;
    text?: string;
    location?: string;
    category?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Button Clicked',
    properties: {
      button_id: button.id,
      button_text: button.text,
      button_location: button.location,
      button_category: button.category,
    },
    context,
  };
}

export async function trackFormSubmission(
  adapter: MinimalAdapter,
  form: {
    id?: string;
    name?: string;
    type?: string;
    fields_count?: number;
    success?: boolean;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Form Submitted',
    properties: {
      form_id: form.id,
      form_name: form.name,
      form_type: form.type,
      form_fields_count: form.fields_count,
      form_success: form.success,
    },
    context,
  });
}

export function createFormSubmissionEvent(
  form: {
    id?: string;
    name?: string;
    type?: string;
    fields_count?: number;
    success?: boolean;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Form Submitted',
    properties: {
      form_id: form.id,
      form_name: form.name,
      form_type: form.type,
      form_fields_count: form.fields_count,
      form_success: form.success,
    },
    context,
  };
}

export async function trackFileDownload(
  adapter: MinimalAdapter,
  file: {
    name: string;
    type?: string;
    size?: number;
    url?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'File Downloaded',
    properties: {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: file.url,
    },
    context,
  });
}

export function createFileDownloadEvent(
  file: {
    name: string;
    type?: string;
    size?: number;
    url?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'File Downloaded',
    properties: {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: file.url,
    },
    context,
  };
}

export async function trackVideoPlay(
  adapter: MinimalAdapter,
  video: {
    id?: string;
    title?: string;
    duration?: number;
    position?: number;
    quality?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Video Played',
    properties: {
      video_id: video.id,
      video_title: video.title,
      video_duration: video.duration,
      video_position: video.position,
      video_quality: video.quality,
    },
    context,
  });
}

export function createVideoPlayEvent(
  video: {
    id?: string;
    title?: string;
    duration?: number;
    position?: number;
    quality?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Video Played',
    properties: {
      video_id: video.id,
      video_title: video.title,
      video_duration: video.duration,
      video_position: video.position,
      video_quality: video.quality,
    },
    context,
  };
}

export async function trackVideoComplete(
  adapter: MinimalAdapter,
  video: {
    id?: string;
    title?: string;
    duration?: number;
    completion_rate?: number;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Video Completed',
    properties: {
      video_id: video.id,
      video_title: video.title,
      video_duration: video.duration,
      video_completion_rate: video.completion_rate,
    },
    context,
  });
}

export function createVideoCompleteEvent(
  video: {
    id?: string;
    title?: string;
    duration?: number;
    completion_rate?: number;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Video Completed',
    properties: {
      video_id: video.id,
      video_title: video.title,
      video_duration: video.duration,
      video_completion_rate: video.completion_rate,
    },
    context,
  };
}

export async function trackSearch(
  adapter: MinimalAdapter,
  search: {
    query: string;
    results_count?: number;
    category?: string;
    filters?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Search Performed',
    properties: {
      search_query: search.query,
      search_results_count: search.results_count,
      search_category: search.category,
      search_filters: search.filters,
    },
    context,
  });
}

export function createSearchEvent(
  search: {
    query: string;
    results_count?: number;
    category?: string;
    filters?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Search Performed',
    properties: {
      search_query: search.query,
      search_results_count: search.results_count,
      search_category: search.category,
      search_filters: search.filters,
    },
    context,
  };
}

export async function trackError(
  adapter: MinimalAdapter,
  error: {
    message: string;
    type?: string;
    code?: string;
    page?: string;
    component?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Error Occurred',
    properties: {
      error_message: error.message,
      error_type: error.type,
      error_code: error.code,
      error_page: error.page,
      error_component: error.component,
    },
    context,
  });
}

export function createErrorEvent(
  error: {
    message: string;
    type?: string;
    code?: string;
    page?: string;
    component?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Error Occurred',
    properties: {
      error_message: error.message,
      error_type: error.type,
      error_code: error.code,
      error_page: error.page,
      error_component: error.component,
    },
    context,
  };
}

export async function trackPerformance(
  adapter: MinimalAdapter,
  performance: {
    metric_name: string;
    metric_value: number;
    metric_unit?: string;
    page?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Performance Metric',
    properties: {
      metric_name: performance.metric_name,
      metric_value: performance.metric_value,
      metric_unit: performance.metric_unit,
      performance_page: performance.page,
    },
    context,
  });
}

export function createPerformanceEvent(
  performance: {
    metric_name: string;
    metric_value: number;
    metric_unit?: string;
    page?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Performance Metric',
    properties: {
      metric_name: performance.metric_name,
      metric_value: performance.metric_value,
      metric_unit: performance.metric_unit,
      performance_page: performance.page,
    },
    context,
  };
}

export async function trackFeatureFlag(
  adapter: MinimalAdapter,
  flag: {
    name: string;
    value: boolean | string | number;
    variant?: string;
    experiment?: string;
  },
  context?: any,
): Promise<boolean> {
  return adapter.track({
    name: 'Feature Flag Evaluated',
    properties: {
      flag_name: flag.name,
      flag_value: typeof flag.value === 'boolean' ? flag.value : String(flag.value),
      flag_variant: flag.variant,
      flag_experiment: flag.experiment,
    },
    context,
  });
}

export function createFeatureFlagEvent(
  flag: {
    name: string;
    value: boolean | string | number;
    variant?: string;
    experiment?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Feature Flag Evaluated',
    properties: {
      flag_name: flag.name,
      flag_value: typeof flag.value === 'boolean' ? flag.value : String(flag.value),
      flag_variant: flag.variant,
      flag_experiment: flag.experiment,
    },
    context,
  };
}
