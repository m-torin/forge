/**
 * Helper functions for working with analytics emitters
 * These utilities make it easier to use the emitter-first approach
 */

import { alias, group, identify, page, track } from './emitters';

import type {
  EmitterAliasPayload,
  EmitterContext,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterOptions,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from './emitter-types';

/**
 * Create a context builder for consistent context across events
 */
export class ContextBuilder {
  private context: EmitterContext = {};

  constructor(initialContext?: Partial<EmitterContext>) {
    if (initialContext) {
      this.context = { ...initialContext };
    }
  }

  setUser(userId: string, traits?: Record<string, any>): this {
    this.context.traits = { ...this.context.traits, ...traits };
    return this;
  }

  setOrganization(groupId: string): this {
    this.context.groupId = groupId;
    return this;
  }

  setPage(pageInfo: { path?: string; url?: string; title?: string; referrer?: string }): this {
    this.context.page = { ...this.context.page, ...pageInfo };
    return this;
  }

  setCampaign(utmParams: Record<string, string>): this {
    this.context.campaign = { ...this.context.campaign, ...utmParams };
    return this;
  }

  setDevice(deviceInfo: Record<string, any>): this {
    this.context.device = { ...this.context.device, ...deviceInfo };
    return this;
  }

  build(): EmitterContext {
    return { ...this.context };
  }
}

/**
 * Create a payload builder for chaining emitter creation
 */
export class PayloadBuilder {
  private options: EmitterOptions = {};

  constructor(private context?: EmitterContext) {
    if (context) {
      this.options.context = context;
    }
  }

  withTimestamp(timestamp: Date | string): this {
    this.options.timestamp = timestamp;
    return this;
  }

  withAnonymousId(anonymousId: string): this {
    this.options.anonymousId = anonymousId;
    return this;
  }

  withIntegrations(integrations: Record<string, boolean | Record<string, any>>): this {
    this.options.integrations = integrations;
    return this;
  }

  track(event: string, properties?: Record<string, any>): EmitterTrackPayload {
    return track(event, properties, this.options);
  }

  identify(userId: string, traits?: Record<string, any>): EmitterIdentifyPayload {
    return identify(userId, traits, this.options);
  }

  page(name?: string, properties?: Record<string, any>): EmitterPagePayload {
    return page(undefined, name, properties, this.options);
  }

  group(groupId: string, traits?: Record<string, any>): EmitterGroupPayload {
    return group(groupId, traits, this.options);
  }

  alias(userId: string, previousId: string): EmitterAliasPayload {
    return alias(userId, previousId, this.options);
  }
}

/**
 * Create a batch of related events with shared context
 */
export class EventBatch {
  private events: EmitterPayload[] = [];
  private sharedContext: EmitterContext;

  constructor(context?: EmitterContext) {
    this.sharedContext = context || {};
  }

  add(payload: EmitterPayload): this {
    // Merge shared context with payload context
    const enrichedPayload = {
      ...payload,
      context: { ...this.sharedContext, ...payload.context },
    };
    this.events.push(enrichedPayload);
    return this;
  }

  addTrack(event: string, properties?: Record<string, any>): this {
    return this.add(track(event, properties, { context: this.sharedContext }));
  }

  addIdentify(userId: string, traits?: Record<string, any>): this {
    return this.add(identify(userId, traits, { context: this.sharedContext }));
  }

  addPage(name?: string, properties?: Record<string, any>): this {
    return this.add(page(undefined, name, properties, { context: this.sharedContext }));
  }

  addGroup(groupId: string, traits?: Record<string, any>): this {
    return this.add(group(groupId, traits, { context: this.sharedContext }));
  }

  getEvents(): EmitterPayload[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

/**
 * Helper to create a user session tracking flow
 */
export function createUserSession(userId: string, sessionId: string) {
  const context = new ContextBuilder().setUser(userId).build();

  return {
    // Identify the user
    identify: (traits?: Record<string, any>) =>
      identify(userId, { ...traits, sessionId }, { context }),

    // Track an event in this session
    track: (event: string, properties?: Record<string, any>) =>
      track(event, { ...properties, sessionId }, { context }),

    // Track a page view in this session
    page: (name?: string, properties?: Record<string, any>) =>
      page(undefined, name, { ...properties, sessionId }, { context }),

    // Associate with a group
    group: (groupId: string, traits?: Record<string, any>) =>
      group(groupId, { ...traits, sessionId }, { context }),
  };
}

/**
 * Helper to create an anonymous user tracking flow
 */
export function createAnonymousSession(anonymousId: string) {
  const options: EmitterOptions = { anonymousId };

  return {
    // Track an event
    track: (event: string, properties?: Record<string, any>) => track(event, properties, options),

    // Track a page view
    page: (name?: string, properties?: Record<string, any>) =>
      page(undefined, name, properties, options),

    // Convert to identified user
    identify: (userId: string, traits?: Record<string, any>) => identify(userId, traits, options),

    // Alias when user signs up
    alias: (userId: string) => alias(userId, anonymousId, options),
  };
}

/**
 * Type guard to check if a payload is a specific type
 */
export const isTrackPayload = (payload: EmitterPayload): payload is EmitterTrackPayload =>
  payload.type === 'track';

export const isIdentifyPayload = (payload: EmitterPayload): payload is EmitterIdentifyPayload =>
  payload.type === 'identify';

export const isPagePayload = (payload: EmitterPayload): payload is EmitterPagePayload =>
  payload.type === 'page';

export const isGroupPayload = (payload: EmitterPayload): payload is EmitterGroupPayload =>
  payload.type === 'group';

export const isAliasPayload = (payload: EmitterPayload): payload is EmitterAliasPayload =>
  payload.type === 'alias';

/**
 * Helper to add consistent metadata to events
 */
export function withMetadata<T extends EmitterPayload>(
  payload: T,
  metadata: { version?: string; source?: string; [key: string]: any },
): T {
  return {
    ...payload,
    context: {
      ...payload.context,
      app: {
        ...payload.context?.app,
        ...metadata,
      },
    },
  };
}

/**
 * Helper to add UTM parameters to events
 */
export function withUTM<T extends EmitterPayload>(
  payload: T,
  utm: { source?: string; medium?: string; campaign?: string; term?: string; content?: string },
): T {
  return {
    ...payload,
    context: {
      ...payload.context,
      campaign: {
        ...payload.context?.campaign,
        ...utm,
      },
    },
  };
}
