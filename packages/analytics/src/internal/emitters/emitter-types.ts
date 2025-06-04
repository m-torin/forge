/**
 * Type definitions for analytics emitters
 * Based on Segment.io specification
 * https://segment.com/docs/connections/spec/common/
 */

// Common context object that provides additional information about the environment
export interface EmitterContext {
  // Whether a user is active (usually used to flag an identify call to just update traits)
  active?: boolean
  
  // Dictionary of information about the current application
  app?: {
    name?: string
    version?: string
    build?: string
    namespace?: string
  }
  
  // Dictionary of information about the campaign that resulted in the API call
  campaign?: {
    name?: string
    source?: string
    medium?: string
    term?: string
    content?: string
    // Any other custom UTM parameters
    [key: string]: string | undefined
  }
  
  // Dictionary of information about the device
  device?: {
    id?: string
    advertisingId?: string
    adTrackingEnabled?: boolean
    manufacturer?: string
    model?: string // Note: iOS model values may not match device names exactly
    name?: string
    type?: string
    version?: string
    token?: string // Push notification token
  }
  
  // Current user's IP address
  ip?: string
  
  // Dictionary of information about the library making the requests
  library?: {
    name: string
    version: string
  }
  
  // Locale string for the current user (e.g., 'en-US')
  locale?: string
  
  // Dictionary of information about the current network connection
  network?: {
    bluetooth?: boolean
    carrier?: string
    cellular?: boolean
    wifi?: boolean
  }
  
  // Dictionary of information about the operating system
  os?: {
    name?: string
    version?: string
  }
  
  // Dictionary of information about the current page in the browser
  page?: {
    path?: string
    referrer?: string
    search?: string
    title?: string
    url?: string
  }
  
  // Dictionary of information about the way the user was referred
  referrer?: {
    id?: string
    type?: string
    name?: string
    url?: string
    link?: string
  }
  
  // Dictionary of information about the device's screen
  screen?: {
    density?: number
    height?: number
    width?: number
  }
  
  // Timezone as tzdata string (e.g., 'America/New_York')
  timezone?: string
  
  // Group/Account ID (useful in B2B use cases)
  groupId?: string
  
  // Dictionary of traits of the current user
  traits?: Record<string, any>
  
  // User agent of the device making the request
  userAgent?: string
  
  // User agent data from Client Hints API
  userAgentData?: {
    brands?: Array<{
      brand: string
      version: string
    }>
    mobile?: boolean
    platform?: string
    bitness?: string
    model?: string
    platformVersion?: string
    uaFullVersion?: string
    fullVersionList?: Array<{
      brand: string
      version: string
    }>
    wow64?: boolean
  }
  
  // Where the request originated from: 'server', 'browser', or 'mobile'
  channel?: string
  
  // Location context (less commonly used)
  location?: {
    city?: string
    country?: string
    latitude?: number
    longitude?: number
    region?: string
    speed?: number
  }
}

// Options that can be passed to any analytics method
export interface EmitterOptions {
  // Timestamp when the event occurred
  timestamp?: Date | string
  // Context information
  context?: EmitterContext
  // Anonymous ID if user is not identified
  anonymousId?: string
  // Integration specific options
  integrations?: Record<string, boolean | Record<string, any>>
  // Callback function (client-side only)
  callback?: Function
}

// Integrations configuration (destination control)
export interface EmitterIntegrations {
  // Special key that applies when no specific destination key is found
  All?: boolean
  // Individual destination settings
  [destination: string]: boolean | Record<string, any> | undefined
}

// Base payload that all events extend from (Common Fields)
export interface EmitterBasePayload {
  // Type of message, corresponding to the API method
  type: 'identify' | 'track' | 'page' | 'screen' | 'group' | 'alias'
  
  // Identity fields (at least one required)
  userId?: string // Unique identifier for the user in your database
  anonymousId?: string // Pseudo-unique substitute for userId
  
  // Timestamp fields
  timestamp?: Date | string // When the event actually occurred (ISO-8601)
  originalTimestamp?: Date | string // Client device time when call was invoked (ISO-8601)
  sentAt?: Date | string // Client device time when call was sent (ISO-8601)
  receivedAt?: Date | string // Server time when call was received (ISO-8601)
  
  // Context and control fields
  context?: EmitterContext // Extra information providing context
  integrations?: EmitterIntegrations // Destination enable/disable control
  
  // System fields (set by Segment)
  messageId?: string // Unique identifier for the message (max 100 chars)
  version?: number // Version of the Tracking API
}

// Specific payload types for each method
export interface EmitterIdentifyPayload extends EmitterBasePayload {
  type: 'identify'
  userId: string
  traits?: Record<string, any>
}

export interface EmitterTrackPayload extends EmitterBasePayload {
  type: 'track'
  event: string
  properties?: Record<string, any>
}

export interface EmitterPagePayload extends EmitterBasePayload {
  type: 'page'
  name?: string
  category?: string
  properties?: Record<string, any>
}

export interface EmitterScreenPayload extends EmitterBasePayload {
  type: 'screen'
  name?: string
  properties?: Record<string, any>
}

export interface EmitterGroupPayload extends EmitterBasePayload {
  type: 'group'
  groupId: string
  traits?: Record<string, any>
}

export interface EmitterAliasPayload extends EmitterBasePayload {
  type: 'alias'
  userId: string
  previousId: string
}

// Union type for all possible payloads
export type EmitterPayload = 
  | EmitterIdentifyPayload 
  | EmitterTrackPayload 
  | EmitterPagePayload 
  | EmitterScreenPayload 
  | EmitterGroupPayload 
  | EmitterAliasPayload

// Common traits that are recognized by many destinations
export interface EmitterUserTraits {
  // Personal information
  firstName?: string
  lastName?: string
  name?: string
  username?: string
  email?: string
  phone?: string
  
  // Demographics
  age?: number
  birthday?: Date | string
  gender?: string
  
  // Address
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  
  // Company
  company?: {
    name?: string
    id?: string
    industry?: string
    employee_count?: number
    plan?: string
  }
  
  // Other common traits
  avatar?: string
  website?: string
  createdAt?: Date | string
  description?: string
  id?: string
  
  // Custom traits
  [key: string]: any
}

// Common properties for track events
export interface EmitterEventProperties {
  // Monetary
  revenue?: number
  value?: number
  currency?: string
  
  // E-commerce
  products?: Array<{
    id?: string
    sku?: string
    name?: string
    price?: number
    quantity?: number
    category?: string
    brand?: string
    variant?: string
    [key: string]: any
  }>
  
  // Content
  title?: string
  description?: string
  category?: string
  
  // Search
  query?: string
  
  // Sharing
  share_via?: string
  recipient?: string
  
  // Custom properties
  [key: string]: any
}

// Common group traits
export interface EmitterGroupTraits {
  name?: string
  industry?: string
  employees?: number
  plan?: string
  website?: string
  createdAt?: Date | string
  description?: string
  avatar?: string
  
  // Custom traits
  [key: string]: any
}

// Emitter interface that all analytics providers should implement
export interface AnalyticsEmitter {
  identify(userId: string, traits?: Record<string, any>, options?: EmitterOptions, callback?: Function): void | Promise<void>
  track(event: string, properties?: Record<string, any>, options?: EmitterOptions, callback?: Function): void | Promise<void>
  page(category?: string, name?: string, properties?: Record<string, any>, options?: EmitterOptions, callback?: Function): void | Promise<void>
  screen(name?: string, properties?: Record<string, any>, options?: EmitterOptions, callback?: Function): void | Promise<void>
  group(groupId: string, traits?: Record<string, any>, options?: EmitterOptions, callback?: Function): void | Promise<void>
  alias(userId: string, previousId?: string, options?: EmitterOptions, callback?: Function): void | Promise<void>
}

// Configuration for analytics emitters
export interface EmitterConfig {
  // Whether to batch events
  batching?: boolean
  // Maximum number of events to batch
  batchSize?: number
  // Time to wait before flushing batch (ms)
  flushInterval?: number
  // Whether to enable debug logging
  debug?: boolean
  // Default context to include with all events
  defaultContext?: Partial<EmitterContext>
  // Default integrations settings
  integrations?: Record<string, boolean | Record<string, any>>
  // Whether to track page views automatically
  trackPages?: boolean
  // Whether to track clicks automatically
  trackClicks?: boolean
  // Custom endpoint for sending events
  endpoint?: string
  // API key or write key
  apiKey?: string
}