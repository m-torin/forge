/**
 * Vercel Analytics Web Vitals integration
 * Direct re-exports from @vercel/analytics package
 */

import type { VercelWebVitalsMetric } from './types';

// Main Web Vitals function - direct pass-through to official package
export async function onCLS(fn: (metric: VercelWebVitalsMetric) => void): Promise<void> {
  try {
    const { onCLS } = await import('@vercel/analytics');
    onCLS(fn);
  } catch (error) {
    console.warn('Failed to initialize CLS tracking:', error);
  }
}

export async function onFID(fn: (metric: VercelWebVitalsMetric) => void): Promise<void> {
  try {
    const { onFID } = await import('@vercel/analytics');
    onFID(fn);
  } catch (error) {
    console.warn('Failed to initialize FID tracking:', error);
  }
}

export async function onFCP(fn: (metric: VercelWebVitalsMetric) => void): Promise<void> {
  try {
    const { onFCP } = await import('@vercel/analytics');
    onFCP(fn);
  } catch (error) {
    console.warn('Failed to initialize FCP tracking:', error);
  }
}

export async function onLCP(fn: (metric: VercelWebVitalsMetric) => void): Promise<void> {
  try {
    const { onLCP } = await import('@vercel/analytics');
    onLCP(fn);
  } catch (error) {
    console.warn('Failed to initialize LCP tracking:', error);
  }
}

export async function onTTFB(fn: (metric: VercelWebVitalsMetric) => void): Promise<void> {
  try {
    const { onTTFB } = await import('@vercel/analytics');
    onTTFB(fn);
  } catch (error) {
    console.warn('Failed to initialize TTFB tracking:', error);
  }
}

export async function onINP(fn: (metric: VercelWebVitalsMetric) => void): Promise<void> {
  try {
    const { onINP } = await import('@vercel/analytics');
    onINP(fn);
  } catch (error) {
    console.warn('Failed to initialize INP tracking:', error);
  }
}

// Convenience function to set up all Web Vitals tracking
export async function trackWebVitals(
  onMetric?: (metric: VercelWebVitalsMetric) => void,
): Promise<void> {
  if (!onMetric) {
    // Default behavior: track to console in debug mode
    onMetric = metric => {
      console.log(`[Web Vital] ${metric.name}: ${metric.value} (${metric.rating})`);
    };
  }

  await Promise.all([
    onCLS(onMetric),
    onFID(onMetric),
    onFCP(onMetric),
    onLCP(onMetric),
    onTTFB(onMetric),
    onINP(onMetric),
  ]);
}
