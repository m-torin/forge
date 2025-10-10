/**
 * Event validation utilities for 3rd party analytics integrations
 */

import { z } from 'zod/v4';
import type {
  AnalyticsEvent,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  ValidationResult,
} from '../types';

const EventContextSchema = z.object({
  page: z
    .object({
      url: z.string().url().optional(),
      path: z.string().optional(),
      referrer: z.string().url().optional(),
      title: z.string().optional(),
    })
    .optional(),
  user: z
    .object({
      id: z.string().optional(),
      email: z.string().email().optional(),
      name: z.string().optional(),
      traits: z.record(z.any()).optional(),
    })
    .optional(),
  device: z
    .object({
      type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
      userAgent: z.string().optional(),
      ip: z.string().ip().optional(),
      locale: z.string().optional(),
    })
    .optional(),
  campaign: z
    .object({
      name: z.string().optional(),
      source: z.string().optional(),
      medium: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
  session: z
    .object({
      id: z.string().optional(),
      startTime: z.union([z.date(), z.string()]).optional(),
      pageViews: z.number().int().min(0).optional(),
    })
    .optional(),
});

const AnalyticsEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  properties: z.record(z.any()).optional(),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  timestamp: z.union([z.date(), z.string()]).optional(),
  context: EventContextSchema.optional(),
});

const IdentifyPayloadSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  traits: z.record(z.any()).optional(),
  context: EventContextSchema.optional(),
});

const GroupPayloadSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  userId: z.string().optional(),
  traits: z.record(z.any()).optional(),
  context: EventContextSchema.optional(),
});

const PagePayloadSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  properties: z.record(z.any()).optional(),
  userId: z.string().optional(),
  context: EventContextSchema.optional(),
});

export function validateEvent(event: AnalyticsEvent): ValidationResult {
  try {
    const result = AnalyticsEventSchema.parse(event);
    return {
      valid: true,
      errors: [],
      sanitized: sanitizeEvent(result),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

export function validateIdentify(payload: IdentifyPayload): ValidationResult {
  try {
    const result = IdentifyPayloadSchema.parse(payload);
    return {
      valid: true,
      errors: [],
      sanitized: sanitizeIdentify(result),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

export function validateGroup(payload: GroupPayload): ValidationResult {
  try {
    const result = GroupPayloadSchema.parse(payload);
    return {
      valid: true,
      errors: [],
      sanitized: sanitizeGroup(result),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

export function validatePage(payload: PagePayload): ValidationResult {
  try {
    const result = PagePayloadSchema.parse(payload);
    return {
      valid: true,
      errors: [],
      sanitized: sanitizePage(result),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

function sanitizeEvent(event: AnalyticsEvent): AnalyticsEvent {
  return {
    ...event,
    name: sanitizeString(event.name),
    properties: sanitizeProperties(event.properties),
    userId: event.userId ? sanitizeString(event.userId) : undefined,
    anonymousId: event.anonymousId ? sanitizeString(event.anonymousId) : undefined,
    timestamp: event.timestamp || new Date(),
    context: event.context ? sanitizeContext(event.context) : undefined,
  };
}

function sanitizeIdentify(payload: IdentifyPayload): IdentifyPayload {
  return {
    ...payload,
    userId: sanitizeString(payload.userId),
    traits: sanitizeProperties(payload.traits),
    context: payload.context ? sanitizeContext(payload.context) : undefined,
  };
}

function sanitizeGroup(payload: GroupPayload): GroupPayload {
  return {
    ...payload,
    groupId: sanitizeString(payload.groupId),
    userId: payload.userId ? sanitizeString(payload.userId) : undefined,
    traits: sanitizeProperties(payload.traits),
    context: payload.context ? sanitizeContext(payload.context) : undefined,
  };
}

function sanitizePage(payload: PagePayload): PagePayload {
  return {
    ...payload,
    name: payload.name ? sanitizeString(payload.name) : undefined,
    category: payload.category ? sanitizeString(payload.category) : undefined,
    properties: sanitizeProperties(payload.properties),
    userId: payload.userId ? sanitizeString(payload.userId) : undefined,
    context: payload.context ? sanitizeContext(payload.context) : undefined,
  };
}

function sanitizeString(str: string): string {
  return str.trim().substring(0, 255); // Limit string length
}

function sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
  if (!properties) return undefined;

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (key.length > 40) continue; // Skip keys that are too long
    if (isPII(key, value)) continue; // Skip potential PII

    const sanitizedKey = sanitizeString(key);

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[sanitizedKey] = value;
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (value === null) {
      sanitized[sanitizedKey] = null;
    } else if (Array.isArray(value) && value.length <= 100) {
      sanitized[sanitizedKey] = value
        .slice(0, 100)
        .map(item => (typeof item === 'string' ? sanitizeString(item) : item));
    } else if (typeof value === 'object' && Object.keys(value).length <= 20) {
      sanitized[sanitizedKey] = sanitizeProperties(value);
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeContext(context: any): any {
  return {
    page: context.page
      ? {
          url: context.page.url ? sanitizeString(context.page.url) : undefined,
          path: context.page.path ? sanitizeString(context.page.path) : undefined,
          referrer: context.page.referrer ? sanitizeString(context.page.referrer) : undefined,
          title: context.page.title ? sanitizeString(context.page.title) : undefined,
        }
      : undefined,
    user: context.user
      ? {
          id: context.user.id ? sanitizeString(context.user.id) : undefined,
          email: context.user.email ? sanitizeEmail(context.user.email) : undefined,
          name: context.user.name ? sanitizeString(context.user.name) : undefined,
          traits: sanitizeProperties(context.user.traits),
        }
      : undefined,
    device: context.device
      ? {
          type: context.device.type,
          userAgent: context.device.userAgent
            ? sanitizeString(context.device.userAgent)
            : undefined,
          ip: context.device.ip ? anonymizeIP(context.device.ip) : undefined,
          locale: context.device.locale ? sanitizeString(context.device.locale) : undefined,
        }
      : undefined,
    campaign: context.campaign
      ? {
          name: context.campaign.name ? sanitizeString(context.campaign.name) : undefined,
          source: context.campaign.source ? sanitizeString(context.campaign.source) : undefined,
          medium: context.campaign.medium ? sanitizeString(context.campaign.medium) : undefined,
          term: context.campaign.term ? sanitizeString(context.campaign.term) : undefined,
          content: context.campaign.content ? sanitizeString(context.campaign.content) : undefined,
        }
      : undefined,
    session: context.session,
  };
}

function isPII(key: string, value: any): boolean {
  const piiPatterns = [
    'password',
    'pwd',
    'secret',
    'token',
    'key',
    'ssn',
    'social',
    'credit',
    'card',
    'cvv',
    'phone',
    'address',
    'street',
    'zip',
    'postal',
  ];

  const lowerKey = key.toLowerCase();
  if (piiPatterns.some(pattern => lowerKey.includes(pattern))) {
    return true;
  }

  if (typeof value === 'string') {
    // Check for email patterns
    if (value.includes('@') && value.includes('.')) {
      return true;
    }

    // Check for phone patterns
    if (/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
      return true;
    }
  }

  return false;
}

function sanitizeEmail(email: string): string {
  // For privacy, we might want to hash emails or just validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : '';
}

function anonymizeIP(ip: string): string {
  // IPv4: Remove last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  // IPv6: Remove last 64 bits
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(':') + '::';
    }
  }

  return '0.0.0.0'; // Default fallback
}
