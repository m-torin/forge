/**
 * Core analytics emitter functions following Segment.io specification
 * These are client/server agnostic and form the basis of all analytics actions
 * https://segment.com/docs/connections/spec/
 */

import type { 
  EmitterOptions, 
  EmitterIdentifyPayload,
  EmitterTrackPayload,
  EmitterPagePayload,
  EmitterScreenPayload,
  EmitterGroupPayload,
  EmitterAliasPayload,
  EmitterPayload
} from './emitter-types'

// Event emitter for handling the actual transport
// This will be injected by the transport layer (client/server specific)
let eventEmitter: (payload: EmitterPayload) => void | Promise<void> = () => {
  console.warn('[Analytics] No event emitter configured. Events will not be sent.')
}

/**
 * Configure the event emitter for transporting events
 * This should be called by the transport layer during initialization
 */
export function configureEmitter(emitter: (payload: EmitterPayload) => void | Promise<void>) {
  eventEmitter = emitter
}

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
  callback?: Function
): void {
  // TODO: Implement identify logic
  // Payload: { type: "identify", userId, traits, ...commonFields }
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
  callback?: Function
): void {
  // TODO: Implement track logic
  // Payload: { type: "track", event, properties, ...commonFields }
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
  callback?: Function
): void {
  // TODO: Implement page logic
  // If category is provided, it gets added to properties
  // Payload: { type: "page", name, properties: { ...properties, category }, ...commonFields }
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
  callback?: Function
): void {
  // TODO: Implement screen logic
  // Payload: { type: "screen", name, properties, ...commonFields }
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
  callback?: Function
): void {
  // TODO: Implement group logic
  // Payload: { type: "group", groupId, traits, ...commonFields }
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
  previousId?: string,
  options?: EmitterOptions,
  callback?: Function
): void {
  // TODO: Implement alias logic
  // Payload: { type: "alias", userId, previousId, ...commonFields }
}