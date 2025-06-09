/**
 * Security configuration for sensitive data handling in the admin interface
 */

export interface SecurityRule {
  auditLog?: boolean;
  description?: string;
  fieldName: string;
  maskingStrategy: 'partial' | 'full' | 'hash' | 'none';
  requiresPermission?: string;
  sensitivity: 'high' | 'medium' | 'low';
}

export interface ModelSecurityConfig {
  auditAllChanges?: boolean;
  modelName: string;
  requiresPermission?: string;
  rules: SecurityRule[];
}

/**
 * Comprehensive security rules for all models with sensitive data
 */
export const securityConfigs: ModelSecurityConfig[] = [
  // API Key Security
  {
    auditAllChanges: true,
    modelName: 'apiKey',
    requiresPermission: 'manage_api_keys',
    rules: [
      {
        auditLog: true,
        description: 'Full API key - extremely sensitive',
        fieldName: 'key',
        maskingStrategy: 'partial',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        auditLog: true,
        description: 'API key hash - for verification only',
        fieldName: 'keyHash',
        maskingStrategy: 'hash',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        description: 'API key prefix - safe to display',
        fieldName: 'start',
        maskingStrategy: 'none',
        sensitivity: 'low',
      },
      {
        description: 'API key identifier prefix',
        fieldName: 'prefix',
        maskingStrategy: 'none',
        sensitivity: 'low',
      },
    ],
  },

  // Two-Factor Authentication Security
  {
    auditAllChanges: true,
    modelName: 'twoFactor',
    requiresPermission: 'manage_security',
    rules: [
      {
        auditLog: true,
        description: 'TOTP secret - must never be exposed',
        fieldName: 'secret',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        auditLog: true,
        description: 'Secret hash for verification',
        fieldName: 'secretHash',
        maskingStrategy: 'hash',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
    ],
  },

  // Backup Codes Security
  {
    auditAllChanges: true,
    modelName: 'backupCode',
    requiresPermission: 'manage_security',
    rules: [
      {
        auditLog: true,
        description: 'Backup recovery code - single use',
        fieldName: 'code',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        auditLog: true,
        description: 'Code hash for verification',
        fieldName: 'codeHash',
        maskingStrategy: 'hash',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
    ],
  },

  // Passkey Security
  {
    auditAllChanges: true,
    modelName: 'passkey',
    requiresPermission: 'manage_security',
    rules: [
      {
        auditLog: true,
        description: 'WebAuthn public key data',
        fieldName: 'publicKey',
        maskingStrategy: 'partial',
        requiresPermission: 'admin',
        sensitivity: 'medium',
      },
      {
        auditLog: true,
        description: 'Credential identifier',
        fieldName: 'credentialId',
        maskingStrategy: 'partial',
        sensitivity: 'medium',
      },
    ],
  },

  // Account Security (OAuth tokens)
  {
    auditAllChanges: true,
    modelName: 'account',
    requiresPermission: 'manage_accounts',
    rules: [
      {
        auditLog: true,
        description: 'OAuth access token',
        fieldName: 'accessToken',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        auditLog: true,
        description: 'OAuth refresh token',
        fieldName: 'refreshToken',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        auditLog: true,
        description: 'OAuth ID token',
        fieldName: 'idToken',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        auditLog: true,
        description: 'User password hash',
        fieldName: 'password',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
    ],
  },

  // Session Security
  {
    auditAllChanges: true,
    modelName: 'session',
    rules: [
      {
        auditLog: true,
        description: 'Session token',
        fieldName: 'token',
        maskingStrategy: 'partial',
        requiresPermission: 'admin',
        sensitivity: 'high',
      },
      {
        description: 'User IP address - privacy sensitive',
        fieldName: 'ipAddress',
        maskingStrategy: 'partial',
        sensitivity: 'medium',
      },
      {
        description: 'Browser user agent string',
        fieldName: 'userAgent',
        maskingStrategy: 'none',
        sensitivity: 'low',
      },
    ],
  },

  // User Security
  {
    modelName: 'user',
    rules: [
      {
        description: 'User email address - PII',
        fieldName: 'email',
        maskingStrategy: 'partial',
        sensitivity: 'medium',
      },
      {
        description: 'User phone number - PII',
        fieldName: 'phoneNumber',
        maskingStrategy: 'partial',
        sensitivity: 'medium',
      },
      {
        description: 'User suspension information',
        fieldName: 'suspensionDetails',
        maskingStrategy: 'none',
        requiresPermission: 'admin',
        sensitivity: 'medium',
      },
    ],
  },

  // Organization Security
  {
    modelName: 'organization',
    rules: [
      {
        description: 'Organization metadata - may contain sensitive info',
        fieldName: 'metadata',
        maskingStrategy: 'none',
        sensitivity: 'low',
      },
    ],
  },

  // Workflow Configuration Security
  {
    modelName: 'workflowConfig',
    rules: [
      {
        description: 'Workflow configuration data',
        fieldName: 'customPayload',
        maskingStrategy: 'none',
        requiresPermission: 'admin',
        sensitivity: 'medium',
      },
      {
        description: 'Workflow metadata',
        fieldName: 'metadata',
        maskingStrategy: 'none',
        requiresPermission: 'admin',
        sensitivity: 'medium',
      },
    ],
  },
];

/**
 * Get security rules for a specific model
 */
export function getModelSecurityConfig(modelName: string): ModelSecurityConfig | null {
  return securityConfigs.find((config) => config.modelName === modelName) || null;
}

/**
 * Get security rule for a specific field
 */
export function getFieldSecurityRule(modelName: string, fieldName: string): SecurityRule | null {
  const modelConfig = getModelSecurityConfig(modelName);
  if (!modelConfig) return null;

  return modelConfig.rules.find((rule) => rule.fieldName === fieldName) || null;
}

/**
 * Check if a field is sensitive
 */
export function isFieldSensitive(modelName: string, fieldName: string): boolean {
  const rule = getFieldSecurityRule(modelName, fieldName);
  return rule !== null && rule.sensitivity !== 'low';
}

/**
 * Check if user has permission to view a field
 */
export function hasFieldPermission(
  modelName: string,
  fieldName: string,
  userPermissions: string[],
): boolean {
  const rule = getFieldSecurityRule(modelName, fieldName);
  if (!rule || !rule.requiresPermission) return true;

  return userPermissions.includes(rule.requiresPermission);
}

/**
 * Mask sensitive data based on masking strategy
 */
export function maskSensitiveData(
  value: any,
  maskingStrategy: SecurityRule['maskingStrategy'],
): string {
  if (!value) return '';

  const stringValue = String(value);

  switch (maskingStrategy) {
    case 'full':
      return '••••••••••••••••';

    case 'partial':
      if (stringValue.length <= 4) return '••••';
      const start = stringValue.substring(0, 2);
      const end = stringValue.substring(stringValue.length - 2);
      const middle = '•'.repeat(Math.max(4, stringValue.length - 4));
      return `${start}${middle}${end}`;

    case 'hash':
      return `[HASH:${stringValue.substring(0, 8)}...]`;

    case 'none':
    default:
      return stringValue;
  }
}

/**
 * Determine if field should be audited
 */
export function shouldAuditField(modelName: string, fieldName: string): boolean {
  const rule = getFieldSecurityRule(modelName, fieldName);
  const modelConfig = getModelSecurityConfig(modelName);

  return rule?.auditLog === true || modelConfig?.auditAllChanges === true;
}

/**
 * Get field sensitivity level
 */
export function getFieldSensitivity(
  modelName: string,
  fieldName: string,
): SecurityRule['sensitivity'] | null {
  const rule = getFieldSecurityRule(modelName, fieldName);
  return rule?.sensitivity || null;
}

/**
 * Security validation helpers
 */
export const SecurityHelpers = {
  /**
   * Check if value contains potentially sensitive data patterns
   */
  detectSensitivePatterns(value: string): string[] {
    const patterns = [
      { type: 'API Key (Stripe)', pattern: /sk_[a-zA-Z0-9]{24,}/ },
      { type: 'Public Key (Stripe)', pattern: /pk_[a-zA-Z0-9]{24,}/ },
      { type: 'Potential Token', pattern: /[A-Za-z0-9]{32,}/ },
      { type: 'Private Key', pattern: /-----BEGIN.*PRIVATE KEY-----/ },
      { type: 'Hash/Token', pattern: /[a-f0-9]{40,}/ },
      { type: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9\-._~+\/]+/ },
    ];

    const detected: string[] = [];
    patterns.forEach(({ type, pattern }) => {
      if (pattern.test(value)) {
        detected.push(type);
      }
    });

    return detected;
  },

  /**
   * Sanitize data for logs (remove sensitive information)
   */
  sanitizeForLogging(data: Record<string, any>, modelName: string): Record<string, any> {
    const sanitized = { ...data };
    const modelConfig = getModelSecurityConfig(modelName);

    if (modelConfig) {
      modelConfig.rules.forEach((rule) => {
        if (rule.sensitivity === 'high' && sanitized[rule.fieldName]) {
          sanitized[rule.fieldName] = maskSensitiveData(sanitized[rule.fieldName], 'full');
        }
      });
    }

    return sanitized;
  },

  /**
   * Validate field access permissions
   */
  validateFieldAccess(
    modelName: string,
    fieldName: string,
    userPermissions: string[],
    operation: 'read' | 'write',
  ): { allowed: boolean; reason?: string } {
    const rule = getFieldSecurityRule(modelName, fieldName);

    if (!rule) return { allowed: true };

    if (rule.requiresPermission && !userPermissions.includes(rule.requiresPermission)) {
      return {
        allowed: false,
        reason: `Missing required permission: ${rule.requiresPermission}`,
      };
    }

    if (
      rule.sensitivity === 'high' &&
      operation === 'write' &&
      !userPermissions.includes('admin')
    ) {
      return {
        allowed: false,
        reason: 'High-sensitivity field requires admin permission',
      };
    }

    return { allowed: true };
  },
};

/**
 * Common sensitive field patterns for auto-detection
 */
export const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key$/i,
  /hash$/i,
  /backup/i,
  /code$/i,
  /pin$/i,
  /credential/i,
  /private/i,
  /access/i,
  /refresh/i,
  /id.*token/i,
];

/**
 * Check if field name matches sensitive patterns
 */
export function matchesSensitivePattern(fieldName: string): boolean {
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
}
