/**
 * Input validation utilities for MCP tools
 * Provides path sanitization and input validation to prevent security vulnerabilities
 * Uses Zod v4 for high-performance schema validation with TypeScript inference
 */

import { isAbsolute, normalize, relative, resolve } from 'node:path';
import { quote } from 'shell-quote';
import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  sanitized?: string;
  error?: string;
  securityLevel?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    contentType?: string;
    encoding?: string;
    size?: number;
    hash?: string;
    riskFactors?: string[];
  };
}

// Enhanced validation result with Zod schema support and security analysis
export interface ZodValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
  securityAnalysis?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: string[];
    recommendations: string[];
  };
}

// Security: Enhanced threat detection and rate limiting
class SecurityValidator {
  private static requestCounts = new Map<string, { count: number; window: number }>();
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly RATE_LIMIT_MAX = 100;

  private static readonly THREAT_PATTERNS = [
    {
      pattern: /<script[^>]*>.*?<\/script>/gis,
      threat: 'XSS Script Injection',
      level: 'critical' as const,
    },
    {
      pattern: /javascript:|vbscript:|data:text\/html/gi,
      threat: 'Script URI Injection',
      level: 'critical' as const,
    },
    { pattern: /[;&|`${}()]/g, threat: 'Command Injection Characters', level: 'high' as const },
    { pattern: /\.\.\/|\.\.\\/g, threat: 'Path Traversal', level: 'high' as const },
    {
      pattern: /(?:union|select|insert|update|delete|drop)\s+/gi,
      threat: 'SQL Injection',
      level: 'high' as const,
    },
    {
      pattern: /eval\s*\(|Function\s*\(|setTimeout\s*\(/gi,
      threat: 'Code Execution',
      level: 'medium' as const,
    },
    {
      pattern: /__proto__|constructor|prototype/gi,
      threat: 'Prototype Pollution',
      level: 'medium' as const,
    },
  ];

  static checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const current = this.requestCounts.get(clientId);

    if (!current) {
      this.requestCounts.set(clientId, { count: 1, window: now });
      return true;
    }

    // Reset window if expired
    if (now - current.window > this.RATE_LIMIT_WINDOW) {
      current.count = 1;
      current.window = now;
      return true;
    }

    current.count++;
    return current.count <= this.RATE_LIMIT_MAX;
  }

  static analyzeThreat(content: string): {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    let maxRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    for (const { pattern, threat, level } of this.THREAT_PATTERNS) {
      if (pattern.test(content)) {
        threats.push(threat);
        if (
          level === 'critical' ||
          (level === 'high' && maxRisk !== 'critical') ||
          (level === 'medium' && maxRisk === 'low')
        ) {
          maxRisk = level;
        }
      }
    }

    const recommendations: string[] = [];
    if (maxRisk === 'critical') {
      recommendations.push(
        'Reject input immediately',
        'Log security incident',
        'Consider blocking source',
      );
    } else if (maxRisk === 'high') {
      recommendations.push('Sanitize input', 'Apply strict validation', 'Monitor closely');
    } else if (maxRisk === 'medium') {
      recommendations.push('Apply input sanitization', 'Validate against whitelist');
    } else {
      recommendations.push('Input appears safe for processing');
    }

    return { riskLevel: maxRisk, threats, recommendations };
  }

  static generateContentHash(content: string): string {
    // Simple hash for content identification (not cryptographic)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// Zod schemas for common validation patterns
export const sessionIdSchema = z
  .string()
  .min(3, 'Session ID must be at least 3 characters')
  .max(128, 'Session ID must not exceed 128 characters')
  .regex(
    /^[a-z0-9_-]+$/i,
    'Session ID contains invalid characters - only alphanumeric, hyphens, and underscores allowed',
  );

export const contentSizeSchema = z
  .string()
  .max(10 * 1024 * 1024, 'Content exceeds maximum size of 10MB');

export const packageNameSchema = z
  .string()
  .min(1, 'Package name cannot be empty')
  .max(214, 'Package name exceeds maximum length')
  .refine(name => {
    // NPM package name validation with safe character checking
    if (name.startsWith('@')) {
      const parts = name.split('/');
      if (parts.length !== 2) return false;
      const scope = parts[0].slice(1);
      const packagePart = parts[1];
      return isValidNamePart(scope) && isValidNamePart(packagePart);
    }
    return isValidNamePart(name);
  }, 'Invalid package name format');

export const filePathSchema = z
  .string()
  .min(1, 'Path cannot be empty')
  .max(1000, 'Path exceeds maximum length of 1000 characters')
  .refine(path => {
    // Check for dangerous patterns with enhanced protection
    const dangerousPatterns = [
      /\.\.\//, // Parent directory traversal
      /\.\.[\\\/]/, // Windows/Unix parent directory traversal
      /\.\.$/, // Relative path ending with ..
      /^\.\.$/, // Just ..
      /\/\.\./, // Any occurrence of /..
      /\\\.\./, // Windows backslash version
      /^\/proc\//, // Linux proc filesystem
      /^\/sys\//, // Linux sys filesystem
      /^\/dev\//, // Device files
      /^\/tmp\/\.\./, // Attempt to escape tmp
      /^[A-Z]:\\/i, // Windows absolute paths (if not running on Windows)
      /\0/, // Null bytes
      /[<>:"|?*]/, // Windows reserved characters
      /^\s+|\s+$/, // Leading/trailing whitespace
      /\/{2,}/, // Multiple consecutive slashes
    ];

    // Recursive URL decoding to handle multiple encoding levels
    function decodeRecursively(input: string, maxDepth: number = 5): string {
      let current = input;
      let previous = '';
      let depth = 0;

      while (current !== previous && depth < maxDepth) {
        previous = current;
        try {
          current = decodeURIComponent(current);
          depth++;
        } catch (error) {
          // If decoding fails, break to prevent infinite loops
          break;
        }
      }

      return current.toLowerCase();
    }

    const fullyDecodedPath = decodeRecursively(path);

    // Enhanced traversal pattern detection
    const encodedTraversalPatterns = [
      /%2e%2e/gi, // URL encoded .. (case insensitive)
      /%252e%252e/gi, // Double URL encoded ..
      /%25252e%25252e/gi, // Triple URL encoded ..
      /\.\./, // Basic traversal after decoding
      /\.%2e/gi, // Mixed encoding
      /%2e\./gi, // Mixed encoding reverse
      /\u002e\u002e/, // Unicode encoded ..
      /\u00252e\u00252e/, // Unicode + URL encoded
    ];

    // Check both original path and fully decoded path
    const hasEncodedTraversal = encodedTraversalPatterns.some(
      pattern => pattern.test(path) || pattern.test(fullyDecodedPath),
    );
    const hasDangerousPattern = dangerousPatterns.some(
      pattern => pattern.test(path) || pattern.test(fullyDecodedPath),
    );

    // Additional Unicode normalization check
    let hasUnicodeTraversal = false;
    try {
      const normalizedPath = fullyDecodedPath.normalize('NFC');
      hasUnicodeTraversal = normalizedPath.includes('..') || /\u002e\u002e/.test(normalizedPath);
    } catch (error) {
      // If normalization fails, assume it's suspicious
      hasUnicodeTraversal = true;
    }

    return !hasEncodedTraversal && !hasDangerousPattern && !hasUnicodeTraversal;
  }, 'Path contains dangerous patterns or traversal attempts');

// Helper function for NPM package name validation
function isValidNamePart(part: string): boolean {
  if (!part || part.length === 0) return false;

  // Must start with allowed characters
  const firstChar = part[0];
  if (!/[a-z0-9~-]/.test(firstChar)) return false;

  // All characters must be valid
  for (let i = 0; i < part.length; i++) {
    const char = part[i];
    if (!/[a-z0-9._~-]/.test(char)) return false;
  }

  return true;
}

/**
 * Validates and sanitizes file paths using Zod schema with path traversal security checks
 * @param inputPath - The path to validate
 * @param allowedBasePaths - Array of allowed base paths (defaults to cwd)
 * @param maxLength - Maximum allowed path length (default: 1000)
 */
export function validateFilePath(
  inputPath: string,
  allowedBasePaths: string[],
  maxLength: number = 1000,
): ValidationResult {
  if (!allowedBasePaths || allowedBasePaths.length === 0) {
    return {
      isValid: false,
      error: 'No allowed base paths provided - explicit allow-list required for security',
    };
  }
  // First, validate basic path format and dangerous patterns with Zod
  const dynamicFilePathSchema = filePathSchema.max(
    maxLength,
    `Path exceeds maximum length of ${maxLength}`,
  );
  const basicValidation = dynamicFilePathSchema.safeParse(inputPath);

  if (!basicValidation.success) {
    const errorMessage = basicValidation.error.issues.map(issue => issue.message).join('; ');
    return { isValid: false, error: errorMessage };
  }

  const validatedPath = basicValidation.data;

  try {
    // Normalize and resolve the path
    const normalizedPath = normalize(validatedPath);
    const resolvedPath = resolve(normalizedPath);

    // Check if resolved path is within any allowed base paths
    let isWithinAllowed = false;
    for (const basePath of allowedBasePaths) {
      const resolvedBase = resolve(basePath);
      const relativePath = relative(resolvedBase, resolvedPath);

      // Path is safe if it doesn't start with '..' (no traversal outside base)
      if (!relativePath.startsWith('..') && !isAbsolute(relativePath)) {
        isWithinAllowed = true;
        break;
      }
    }

    if (!isWithinAllowed) {
      return {
        isValid: false,
        error: `Path ${resolvedPath} is not within allowed directories: ${allowedBasePaths.join(', ')}`,
      };
    }

    return { isValid: true, sanitized: resolvedPath };
  } catch (error) {
    return {
      isValid: false,
      error: `Path resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Enhanced Zod-based file path validation with detailed error reporting
 * @param inputPath - The path to validate
 * @param allowedBasePaths - Array of allowed base paths (defaults to cwd)
 * @param maxLength - Maximum allowed path length (default: 1000)
 */
export function validateFilePathZod(
  inputPath: string,
  allowedBasePaths: string[],
  maxLength: number = 1000,
): ZodValidationResult<string> {
  if (!allowedBasePaths || allowedBasePaths.length === 0) {
    return {
      success: false,
      error: 'No allowed base paths provided - explicit allow-list required for security',
      data: undefined,
    };
  }
  // Create dynamic schema with custom length limit
  const dynamicFilePathSchema = filePathSchema.max(
    maxLength,
    `Path exceeds maximum length of ${maxLength}`,
  );
  const basicValidation = dynamicFilePathSchema.safeParse(inputPath);

  if (!basicValidation.success) {
    const issues = basicValidation.error.issues.map(issue => issue.message);
    return {
      success: false,
      error: issues.join('; '),
      issues,
    };
  }

  const validatedPath = basicValidation.data;

  try {
    // Normalize and resolve the path
    const normalizedPath = normalize(validatedPath);
    const resolvedPath = resolve(normalizedPath);

    // Check if resolved path is within any allowed base paths
    let isWithinAllowed = false;
    for (const basePath of allowedBasePaths) {
      const resolvedBase = resolve(basePath);
      const relativePath = relative(resolvedBase, resolvedPath);

      // Path is safe if it doesn't start with '..' (no traversal outside base)
      if (!relativePath.startsWith('..') && !isAbsolute(relativePath)) {
        isWithinAllowed = true;
        break;
      }
    }

    if (!isWithinAllowed) {
      return {
        success: false,
        error: `Path ${resolvedPath} is not within allowed directories: ${allowedBasePaths.join(', ')}`,
      };
    }

    return { success: true, data: resolvedPath };
  } catch (error) {
    return {
      success: false,
      error: `Path resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validates content size using Zod schema with custom size checking
 * @param content - Content to validate
 * @param maxSize - Maximum size in bytes (default: 10MB)
 */
export function validateContentSize(
  content: string,
  maxSize: number = 10 * 1024 * 1024,
): ValidationResult {
  if (typeof content !== 'string') {
    return {
      isValid: false,
      error: 'Content must be a string',
      securityLevel: 'high',
    };
  }

  // Security: Perform threat analysis before size validation
  const threatAnalysis = SecurityValidator.analyzeThreat(content);
  const hash = SecurityValidator.generateContentHash(content);
  const sizeBytes = Buffer.byteLength(content, 'utf8');

  // Block critical threats immediately
  if (threatAnalysis.riskLevel === 'critical') {
    return {
      isValid: false,
      error: 'Content contains critical security threats',
      securityLevel: 'critical',
      metadata: {
        contentType: 'malicious',
        size: sizeBytes,
        hash,
        riskFactors: threatAnalysis.threats,
      },
    };
  }

  // Create dynamic schema with custom size limit
  const dynamicContentSchema = z
    .string()
    .refine((str: string) => Buffer.byteLength(str, 'utf8') <= maxSize, {
      message: `Content exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    });

  const result = dynamicContentSchema.safeParse(content);

  if (!result.success) {
    const errorMessage = result.error.issues.map(issue => issue.message).join('; ');
    return {
      isValid: false,
      error: errorMessage,
      securityLevel: sizeBytes > maxSize * 2 ? 'critical' : 'high',
      metadata: {
        size: sizeBytes,
        hash,
      },
    };
  }

  // Sanitize high-risk content
  let sanitized = result.data;
  if (threatAnalysis.riskLevel === 'high') {
    sanitized = content.replace(/[<>"'&]/g, char => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return escapeMap[char] || char;
    });
  }

  return {
    isValid: true,
    sanitized,
    securityLevel: threatAnalysis.riskLevel,
    metadata: {
      contentType: threatAnalysis.riskLevel === 'low' ? 'safe' : 'suspicious',
      encoding: 'utf8',
      size: sizeBytes,
      hash,
      riskFactors: threatAnalysis.threats.length > 0 ? threatAnalysis.threats : undefined,
    },
  };
}

/**
 * Enhanced Zod-based content size validation
 * @param content - Content to validate
 * @param maxSize - Maximum size in bytes (default: 10MB)
 */
export function validateContentSizeZod(
  content: string,
  maxSize: number = 10 * 1024 * 1024,
): ZodValidationResult<string> {
  // Security: Perform threat analysis
  const threatAnalysis = SecurityValidator.analyzeThreat(content);

  // Block critical threats immediately
  if (threatAnalysis.riskLevel === 'critical') {
    return {
      success: false,
      error: 'Content contains critical security threats',
      issues: threatAnalysis.threats,
      securityAnalysis: threatAnalysis,
    };
  }

  const dynamicContentSchema = z
    .string()
    .refine((str: string) => Buffer.byteLength(str, 'utf8') <= maxSize, {
      message: `Content exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    });

  const result = dynamicContentSchema.safeParse(content);

  if (result.success) {
    // Sanitize high-risk content
    let sanitizedData = result.data;
    if (threatAnalysis.riskLevel === 'high') {
      sanitizedData = content.replace(/[<>"'&]/g, char => {
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return escapeMap[char] || char;
      });
    }

    return {
      success: true,
      data: sanitizedData,
      securityAnalysis: threatAnalysis,
    };
  }

  const issues = result.error.issues.map(issue => issue.message);
  return {
    success: false,
    error: issues.join('; '),
    issues,
    securityAnalysis: threatAnalysis,
  };
}

/**
 * Validates session IDs using Zod schema for high performance and type safety
 * @param sessionId - Session ID to validate
 */
export function validateSessionId(sessionId: string): ValidationResult {
  const result = sessionIdSchema.safeParse(sessionId);

  if (result.success) {
    return { isValid: true, sanitized: result.data };
  }

  const errorMessage = result.error.issues.map(issue => issue.message).join('; ');
  return { isValid: false, error: errorMessage };
}

/**
 * Enhanced Zod-based session ID validation with detailed error reporting
 * @param sessionId - Session ID to validate
 */
export function validateSessionIdZod(sessionId: string): ZodValidationResult<string> {
  const result = sessionIdSchema.safeParse(sessionId);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues.map(issue => issue.message);
  return {
    success: false,
    error: issues.join('; '),
    issues,
  };
}

/**
 * Escapes shell command arguments to prevent injection using shell-quote library
 * @param arg - Argument to escape
 * @param options - Quote options (shell: platform detection)
 */
export function escapeShellArg(
  arg: string | string[],
  options?: { shell?: 'sh' | 'cmd' | 'auto' },
): string {
  if (typeof arg !== 'string' && !Array.isArray(arg)) {
    throw new Error('Argument must be a string or array of strings');
  }

  const shell = options?.shell || 'auto';
  let detectedShell: 'sh' | 'cmd' = 'sh';

  if (shell === 'auto') {
    // Auto-detect shell based on platform
    detectedShell = process.platform === 'win32' ? 'cmd' : 'sh';
  } else {
    detectedShell = shell === 'cmd' ? 'cmd' : 'sh';
  }

  try {
    if (Array.isArray(arg)) {
      // Quote array of arguments
      return quote(arg);
    } else {
      // Quote single argument
      return quote([arg]);
    }
  } catch (error) {
    // Fallback to basic implementation if shell-quote fails
    if (typeof arg === 'string') {
      return detectedShell === 'cmd'
        ? `"${arg.replace(/"/g, '""')}"` // Windows CMD style
        : `'${arg.replace(/'/g, "'\"'\"'")}'`; // POSIX shell style
    }
    throw error;
  }
}

/**
 * Safely builds shell command strings by properly quoting arguments
 * @param command - Base command
 * @param args - Arguments to append
 * @param options - Shell options
 */
export function buildSafeShellCommand(
  command: string,
  args: string[] = [],
  options?: { shell?: 'sh' | 'cmd' | 'auto' },
): string {
  if (!command || typeof command !== 'string') {
    throw new Error('Command must be a non-empty string');
  }

  // Comprehensive validation for dangerous patterns that could allow command injection
  const dangerousPatterns = [
    /[;&|`$()<>]/, // Basic shell metacharacters
    /\$\([^)]*\)/, // Command substitution $(...)
    /`[^`]*`/, // Backtick command substitution
    /\$\{[^}]*\}/, // Variable expansion ${...}
    /\\\\/, // Backslash escaping
    /\|\|/, // Logical OR
    /&&/, // Logical AND
    /\n|\r/, // Line breaks
    /\t/, // Tabs
    /\x00-\x1F/, // Control characters
    /%[0-9a-f]{2}/i, // URL encoded characters
    /\\x[0-9a-fA-F]{2}/, // Hex encoded characters
    /eval\s*\(/i, // eval function calls
    /exec\s*\(/i, // exec function calls
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      throw new Error(`Command contains potentially dangerous pattern: ${pattern.source}`);
    }
  }

  // Additional length and character validation
  if (command.length > 1000) {
    throw new Error('Command exceeds maximum safe length of 1000 characters');
  }

  // Ensure command only contains alphanumeric, hyphens, underscores, dots, and forward slashes
  if (!/^[a-z0-9._/-]+$/i.test(command)) {
    throw new Error(
      'Command contains invalid characters - only alphanumeric, dots, hyphens, underscores, and forward slashes allowed',
    );
  }

  const quotedArgs = args.map(arg => escapeShellArg(arg, options));
  return `${command} ${quotedArgs.join(' ')}`.trim();
}

/**
 * Validates that a shell command is safe to execute
 * @param command - Command to validate
 */
export function validateShellCommand(command: string): ValidationResult {
  if (typeof command !== 'string') {
    return { isValid: false, error: 'Command must be a string' };
  }

  if (command.length === 0) {
    return { isValid: false, error: 'Command cannot be empty' };
  }

  if (command.length > 8192) {
    return { isValid: false, error: 'Command exceeds maximum length of 8192 characters' };
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /\$\([^)]*\)/, // Command substitution
    /`[^`]*`/, // Backticks
    /;\s*rm\s+/i, // rm commands
    /\|\s*sh\b/i, // Pipe to shell
    />\s*\/dev\/null/, // Redirect (could hide output)
    /\b(curl|wget)\s[^|]*\|\s*(sh|bash)/i, // Download and execute - fixed ReDoS
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return {
        isValid: false,
        error: `Command contains potentially dangerous pattern: ${pattern.source}`,
      };
    }
  }

  return { isValid: true, sanitized: command };
}

/**
 * Validates package names using Zod schema for dependency operations
 * @param packageName - Package name to validate
 */
export function validatePackageName(packageName: string): ValidationResult {
  const result = packageNameSchema.safeParse(packageName);

  if (result.success) {
    return { isValid: true, sanitized: result.data };
  }

  const errorMessage = result.error.issues.map(issue => issue.message).join('; ');
  return { isValid: false, error: errorMessage };
}

/**
 * Enhanced Zod-based package name validation
 * @param packageName - Package name to validate
 */
export function validatePackageNameZod(packageName: string): ZodValidationResult<string> {
  const result = packageNameSchema.safeParse(packageName);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues.map(issue => issue.message);
  return {
    success: false,
    error: issues.join('; '),
    issues,
  };
}

/**
 * Comprehensive input validation for MCP tool arguments
 * @param args - Arguments object to validate
 * @param schema - Validation schema
 */
export function validateToolArgs(args: any, schema: ValidationSchema): ValidationResult {
  if (!args || typeof args !== 'object') {
    return { isValid: false, error: 'Arguments must be an object' };
  }

  const sanitized: any = {};
  const errors: string[] = [];

  for (const [key, validator] of Object.entries(schema)) {
    const value = args[key];

    if (validator.required && (value === undefined || value === null)) {
      errors.push(`${key} is required`);
      continue;
    }

    if (value !== undefined && value !== null) {
      const result = validator.validate(value);
      if (!result.isValid) {
        errors.push(`${key}: ${result.error}`);
      } else {
        sanitized[key] = result.sanitized || value;
      }
    }
  }

  if (errors.length > 0) {
    return { isValid: false, error: errors.join('; ') };
  }

  return { isValid: true, sanitized };
}

export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    validate: (value: any) => ValidationResult;
  };
}

// Enhanced MCP tool validation utilities using Zod schemas
export const McpValidation = {
  /**
   * Validate MCP tool arguments with detailed Zod error reporting
   */
  validateArgs<T extends Record<string, unknown>>(
    args: unknown,
    validationRules: Record<keyof T, z.ZodSchema>,
  ): ZodValidationResult<T> {
    const schema = z.object(validationRules);
    const result = schema.safeParse(args);

    if (result.success) {
      return { success: true, data: result.data as T };
    }

    const issues = result.error.issues.map(
      (issue: any) => `${issue.path.join('.')}: ${issue.message}`,
    );
    return {
      success: false,
      error: issues.join('; '),
      issues,
    };
  },

  /**
   * Common validation patterns for MCP tools
   */
  schemas: {
    sessionId: sessionIdSchema,
    filePath: filePathSchema,
    packageName: packageNameSchema,
    contentSize: contentSizeSchema,

    // Additional common patterns
    action: z.string().min(1, 'Action cannot be empty'),
    packagePath: filePathSchema,
    scanDepth: z.enum(['standard', 'deep']).default('standard'),
    boolean: z.boolean(),
    positiveInteger: z.number().int().positive(),
    nonEmptyString: z.string().min(1),
    optionalString: z.string().optional(),
    stringArray: z.array(z.string()),
  },

  /**
   * Quick validation helper for common MCP patterns
   */
  quickValidate: {
    sessionId: (value: unknown) => sessionIdSchema.safeParse(value),
    filePath: (value: unknown) => filePathSchema.safeParse(value),
    packageName: (value: unknown) => packageNameSchema.safeParse(value),
    contentSize: (value: unknown) => contentSizeSchema.safeParse(value),
  },

  /**
   * Convert Zod validation result to legacy ValidationResult format
   */
  toLegacyResult<T>(zodResult: any): ValidationResult {
    if (zodResult.success) {
      return {
        isValid: true,
        sanitized:
          typeof zodResult.data === 'string' ? zodResult.data : JSON.stringify(zodResult.data),
      };
    }

    const errorMessage = zodResult.error.issues.map((issue: any) => issue.message).join('; ');
    return { isValid: false, error: errorMessage };
  },
};
