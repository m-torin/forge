/**
 * Input validation and sanitization utilities for authentication
 */

import { z } from 'zod/v4';

/**
 * Email validation schema with enhanced security
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(254, 'Email must be less than 254 characters') // RFC 5321 limit
  .email('Invalid email format')
  .transform(email => email.toLowerCase().trim())
  .refine(
    email => {
      // Additional security checks
      const localPart = email.split('@')[0];
      const domain = email.split('@')[1];

      // Check for suspicious patterns
      if (localPart.includes('..') || domain.includes('..')) {
        return false;
      }

      // Prevent obvious SQL injection attempts using safer approach
      const sqlKeywords = ['select', 'union', 'insert', 'delete', 'drop', 'update'];
      const lowerEmail = email.toLowerCase();
      if (sqlKeywords.some(keyword => lowerEmail.includes(keyword))) {
        return false;
      }

      return true;
    },
    { message: 'Invalid email format' },
  );

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .max(20, 'Phone number must be less than 20 characters')
  .transform(phone => phone.replace(/\s+/g, '').trim()) // Remove whitespace
  .refine(
    phone => {
      // E.164 format validation (international format)
      const e164Pattern = /^\+[1-9]\d{1,14}$/;
      return e164Pattern.test(phone);
    },
    { message: 'Phone number must be in international format (e.g., +1234567890)' },
  );

/**
 * Password validation schema with security requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .refine(
    password => {
      // Check for at least one lowercase letter
      return /[a-z]/.test(password);
    },
    { message: 'Password must contain at least one lowercase letter' },
  )
  .refine(
    password => {
      // Check for at least one uppercase letter
      return /[A-Z]/.test(password);
    },
    { message: 'Password must contain at least one uppercase letter' },
  )
  .refine(
    password => {
      // Check for at least one number
      return /\d/.test(password);
    },
    { message: 'Password must contain at least one number' },
  )
  .refine(
    password => {
      // Check for at least one special character
      return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    },
    { message: 'Password must contain at least one special character' },
  )
  .refine(
    password => {
      // Check for common weak passwords
      const commonPasswords = [
        'password',
        '123456',
        '123456789',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
        'welcome',
        'monkey',
      ];
      return !commonPasswords.includes(password.toLowerCase());
    },
    { message: 'Password is too common. Please choose a stronger password.' },
  );

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .transform(name => name.trim())
  .refine(
    name => {
      // Allow letters, spaces, hyphens, apostrophes, and some unicode characters
      const namePattern = /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\s'-]+$/;
      return namePattern.test(name);
    },
    { message: 'Name contains invalid characters' },
  )
  .refine(
    name => {
      // Prevent XSS attempts
      // Check for basic XSS patterns using safer approach
      const xssKeywords = ['<script', 'javascript:', 'onload=', 'onerror=', 'onclick='];
      const lowerName = name.toLowerCase();
      return !xssKeywords.some(pattern => lowerName.includes(pattern));
    },
    { message: 'Invalid name format' },
  );

/**
 * Organization slug validation schema
 */
export const organizationSlugSchema = z
  .string()
  .min(2, 'Organization slug must be at least 2 characters')
  .max(50, 'Organization slug must be less than 50 characters')
  .transform(slug => slug.toLowerCase().trim())
  .refine(
    slug => {
      // Allow only lowercase letters, numbers, and hyphens
      const slugPattern = /^[a-z0-9-]+$/;
      return slugPattern.test(slug);
    },
    { message: 'Organization slug can only contain lowercase letters, numbers, and hyphens' },
  )
  .refine(
    slug => {
      // Cannot start or end with hyphen
      return !slug.startsWith('-') && !slug.endsWith('-');
    },
    { message: 'Organization slug cannot start or end with a hyphen' },
  )
  .refine(
    slug => {
      // Reserved slugs
      const reserved = [
        'admin',
        'api',
        'app',
        'www',
        'mail',
        'ftp',
        'localhost',
        'auth',
        'login',
        'signup',
        'dashboard',
        'settings',
        'help',
        'support',
        'docs',
        'blog',
        'status',
        'terms',
        'privacy',
      ];
      return !reserved.includes(slug);
    },
    { message: 'This organization slug is reserved' },
  );

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL must be less than 2048 characters')
  .refine(
    url => {
      try {
        const parsedUrl = new URL(url);
        // Only allow http and https protocols
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP and HTTPS URLs are allowed' },
  )
  .refine(
    url => {
      // Prevent localhost URLs in production
      if (process.env.NODE_ENV === 'production') {
        const parsedUrl = new URL(url);
        return !['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname);
      }
      return true;
    },
    { message: 'Localhost URLs are not allowed in production' },
  );

/**
 * OTP validation schema
 */
export const otpSchema = z
  .string()
  .min(4, 'OTP must be at least 4 digits')
  .max(8, 'OTP must be at most 8 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

/**
 * API Key validation schema
 */
export const apiKeySchema = z
  .string()
  .min(32, 'API key must be at least 32 characters')
  .max(128, 'API key must be less than 128 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'API key contains invalid characters');

/**
 * IP Address validation schema
 */
export const ipAddressSchema = z.string().refine(
  ip => {
    // Basic IP address validation using safer approach
    // IPv4 check
    const parts = ip.split('.');
    if (parts.length === 4) {
      return parts.every(part => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
      });
    }

    // IPv6 or special cases
    if (ip === '::1' || ip === '127.0.0.1') {
      return true;
    }

    // Basic IPv6 check (contains colons and valid hex chars)
    if (ip.includes(':')) {
      const validChars = '0123456789abcdefABCDEF:';
      const isValidChars = ip.split('').every(char => validChars.includes(char));
      return isValidChars && ip.split(':').length >= 3;
    }

    return false;
  },
  { message: 'Invalid IP address format' },
);

/**
 * User Agent validation schema
 */
export const userAgentSchema = z
  .string()
  .max(500, 'User agent must be less than 500 characters')
  .refine(
    userAgent => {
      // Basic user agent format check
      return userAgent.length > 0 && !userAgent.includes('<script');
    },
    { message: 'Invalid user agent format' },
  );

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if string contains potential injection patterns
 */
export function containsInjectionPatterns(input: string): boolean {
  const patterns = [
    // SQL injection patterns
    /(\bselect\b|\bunion\b|\binsert\b|\bdelete\b|\bdrop\b|\bupdate\b|\bexec\b)/i,
    // XSS patterns
    /<script|javascript:|on\w+=/i,
    // Command injection patterns
    /[;&|`$(){}[\]]/,
    // Path traversal patterns
    /\.\.\//,
  ];

  return patterns.some(pattern => pattern.test(input));
}

/**
 * Validate request rate limiting key
 */
export const rateLimitKeySchema = z
  .string()
  .min(1, 'Rate limit key is required')
  .max(200, 'Rate limit key must be less than 200 characters')
  .refine(
    key => {
      // Allow alphanumeric, colons, dashes, and underscores
      const keyPattern = /^[a-zA-Z0-9:_-]+$/;
      return keyPattern.test(key);
    },
    { message: 'Rate limit key contains invalid characters' },
  );

/**
 * Comprehensive validation schemas
 */
export const AuthValidation = {
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  name: nameSchema,
  organizationSlug: organizationSlugSchema,
  url: urlSchema,
  otp: otpSchema,
  apiKey: apiKeySchema,
  ipAddress: ipAddressSchema,
  userAgent: userAgentSchema,
  rateLimitKey: rateLimitKeySchema,
} as const;

/**
 * Validation error types
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validate multiple fields at once
 */
export function validateFields<T extends Record<string, unknown>>(
  data: T,
  schemas: Record<string, z.ZodSchema>,
): { success: boolean; errors: ValidationError[]; data?: T } {
  const errors: ValidationError[] = [];
  const validatedData: Record<string, unknown> = {};

  for (const [field, schema] of Object.entries(schemas)) {
    try {
      validatedData[field] = schema.parse(data[field]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        errors.push({
          field,
          message: firstError?.message || 'Validation failed',
          code: firstError?.code || 'invalid',
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? (validatedData as T) : undefined,
  };
}
