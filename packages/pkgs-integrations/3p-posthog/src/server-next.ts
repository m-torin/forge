/**
 * PostHog Next.js server-side integration
 */

import { PostHogServerAnalytics } from './server';
import type { PostHogConfig } from './types';

export class PostHogNextServerAnalytics extends PostHogServerAnalytics {
  constructor(config: PostHogConfig) {
    super({
      ...config,
      // Next.js server optimizations
      flushAt: config.flushAt || 10, // Smaller batch size for faster response
      flushInterval: config.flushInterval || 5000, // More frequent flushes
    });
  }

  // Next.js specific server methods
  public trackServerAction(
    actionName: string,
    distinctId: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.track({
      name: 'Server Action',
      properties: {
        action_name: actionName,
        runtime: 'nextjs-server',
        ...properties,
      },
      userId: distinctId,
      timestamp: new Date().toISOString(),
    });
  }

  public trackApiRoute(
    route: string,
    method: string,
    statusCode: number,
    duration?: number,
    distinctId?: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.track({
      name: 'API Route Called',
      properties: {
        api_route: route,
        http_method: method,
        status_code: statusCode,
        response_time: duration,
        runtime: 'nextjs-server',
        ...properties,
      },
      userId: distinctId,
      timestamp: new Date().toISOString(),
    });
  }

  public trackMiddleware(
    path: string,
    action: 'allow' | 'redirect' | 'rewrite' | 'block',
    distinctId?: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.track({
      name: 'Middleware Executed',
      properties: {
        middleware_path: path,
        middleware_action: action,
        runtime: 'nextjs-server',
        ...properties,
      },
      userId: distinctId,
      timestamp: new Date().toISOString(),
    });
  }

  public trackRSC(
    componentName: string,
    renderTime?: number,
    distinctId?: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.track({
      name: 'React Server Component Rendered',
      properties: {
        component_name: componentName,
        render_time: renderTime,
        runtime: 'nextjs-rsc',
        ...properties,
      },
      userId: distinctId,
      timestamp: new Date().toISOString(),
    });
  }
}

export function createNextServerAnalytics(config: PostHogConfig) {
  return new PostHogNextServerAnalytics(config);
}
