/**
 * Core analytics emitter functions following Segment.io specification
 * These functions return event specifications that can be passed to analytics.track()
 * https://segment.com/docs/connections/spec/
 */

import type {
  EmitterAliasPayload,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterOptions,
  EmitterPagePayload,
  EmitterScreenPayload,
  EmitterTrackPayload,
} from './emitter-types';

/**
 * Identify - who is the customer?
 * Ties a user to their actions and records traits about them.
 * https://segment.com/docs/connections/spec/identify/
 *
 * Call this:
 * - After a user first registers
 * - After a user logs in
 * - When a user updates their info
 *
 * @param userId - Unique identifier for the user in your database (required unless anonymousId is set)
 * @param traits - Free-form dictionary of traits about the user, like email or name
 * @param options - Optional fields like timestamp, anonymousId, context, integrations
 * @param callback - Optional callback for client-side usage
 */
export function identify(
  userId: string,
  traits?: Record<string, any>,
  options?: EmitterOptions,
): EmitterIdentifyPayload {
  const payload: EmitterIdentifyPayload = {
    type: 'identify',
    userId,
    ...(traits && { traits }),
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
    ...(options?.integrations && { integrations: options.integrations }),
  };

  return payload;
}

/**
 * Track - what are they doing?
 * Records any actions your users perform, along with properties that describe the action.
 * https://segment.com/docs/connections/spec/track/
 *
 * @param event - Name of the action that a user has performed (required)
 * @param properties - Free-form dictionary of properties of the event, like revenue
 * @param options - Optional fields like timestamp, anonymousId, context, integrations
 * @param callback - Optional callback for client-side usage
 */
export function track(
  event: string,
  properties?: Record<string, any>,
  options?: EmitterOptions,
): EmitterTrackPayload {
  const payload: EmitterTrackPayload = {
    type: 'track',
    event,
    ...(properties && { properties }),
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
    ...(options?.integrations && { integrations: options.integrations }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
  };

  // userId should be passed through the main function params or via options

  return payload;
}

/**
 * Page - what web page are they on?
 * Records page views on your website, along with optional properties about the page.
 * https://segment.com/docs/connections/spec/page/
 *
 * @param category - Category of the page (optional)
 * @param name - Name of the page (optional)
 * @param properties - Free-form dictionary of properties of the page, like url and referrer
 * @param options - Optional fields like timestamp, anonymousId, context, integrations
 * @param callback - Optional callback for client-side usage
 */
export function page(
  category?: string,
  name?: string,
  properties?: Record<string, any>,
  options?: EmitterOptions,
): EmitterPagePayload {
  // Merge category into properties if provided
  const mergedProperties = {
    ...(properties || {}),
    ...(category && { category }),
  };

  const payload: EmitterPagePayload = {
    type: 'page',
    ...(name && { name }),
    ...(Object.keys(mergedProperties).length > 0 && { properties: mergedProperties }),
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
    ...(options?.integrations && { integrations: options.integrations }),
  };

  // userId should be passed through the main function params or via options

  return payload;
}

/**
 * Screen - what app screen are they on?
 * The mobile equivalent of page, records screen views in your mobile app.
 * https://segment.com/docs/connections/spec/screen/
 *
 * @param name - Name of the screen (optional)
 * @param properties - Free-form dictionary of properties of the screen
 * @param options - Optional fields like timestamp, anonymousId, context, integrations
 * @param callback - Optional callback for client-side usage
 */
export function screen(
  name?: string,
  properties?: Record<string, any>,
  options?: EmitterOptions,
): EmitterScreenPayload {
  const payload: EmitterScreenPayload = {
    type: 'screen',
    ...(name && { name }),
    ...(properties && { properties }),
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
    ...(options?.integrations && { integrations: options.integrations }),
  };

  // userId should be passed through the main function params or via options

  return payload;
}

/**
 * Group - what account or organization are they part of?
 * Associates an individual user with a group—a company, organization, account, project, or team.
 * https://segment.com/docs/connections/spec/group/
 *
 * @param groupId - Unique identifier for the group in your database (required)
 * @param traits - Free-form dictionary of traits of the group, like name or industry
 * @param options - Optional fields like timestamp, anonymousId, context, integrations
 * @param callback - Optional callback for client-side usage
 */
export function group(
  groupId: string,
  traits?: Record<string, any>,
  options?: EmitterOptions,
): EmitterGroupPayload {
  const payload: EmitterGroupPayload = {
    type: 'group',
    groupId,
    ...(traits && { traits }),
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
    ...(options?.integrations && { integrations: options.integrations }),
  };

  // userId should be passed through the main function params or via options

  return payload;
}

/**
 * Alias - what was their past identity?
 * Merges two user identities, effectively connecting two sets of user data in one profile.
 * https://segment.com/docs/connections/spec/alias/
 *
 * Advanced method: This should only be done when required for downstream destination compatibility.
 *
 * @param userId - The user's new identity, or an existing identity to merge with previousId (required)
 * @param previousId - The existing ID you've referred to the user by (optional, defaults to anonymousId)
 * @param options - Optional fields like timestamp, context, integrations
 * @param callback - Optional callback for client-side usage
 */
export function alias(
  userId: string,
  previousId: string,
  options?: EmitterOptions,
): EmitterAliasPayload {
  const payload: EmitterAliasPayload = {
    type: 'alias',
    previousId,
    userId,
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
    ...(options?.anonymousId && { anonymousId: options.anonymousId }),
    ...(options?.integrations && { integrations: options.integrations }),
  };

  return payload;
}
