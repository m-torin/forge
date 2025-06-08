/**
 * Security configuration for sensitive data handling in the admin interface
 */

export interface SecurityRule {
  fieldName: string;
  sensitivity: 'high' | 'medium' | 'low';
  maskingStrategy: 'partial' | 'full' | 'hash' | 'none';
  requiresPermission?: string;
  auditLog?: boolean;
  description?: string;
}

export interface ModelSecurityConfig {
  modelName: string;
  rules: SecurityRule[];
  requiresPermission?: string;
  auditAllChanges?: boolean;
}

/**
 * Comprehensive security rules for all models with sensitive data
 */
export const securityConfigs: ModelSecurityConfig[] = [
  // API Key Security
  {
    modelName: 'apiKey',
    rules: [
      {
        fieldName: 'key',
        sensitivity: 'high',
        maskingStrategy: 'partial',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'Full API key - extremely sensitive',
      },
      {
        fieldName: 'keyHash',
        sensitivity: 'high', 
        maskingStrategy: 'hash',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'API key hash - for verification only',
      },
      {
        fieldName: 'start',
        sensitivity: 'low',
        maskingStrategy: 'none',
        description: 'API key prefix - safe to display',
      },
      {
        fieldName: 'prefix',
        sensitivity: 'low',
        maskingStrategy: 'none',
        description: 'API key identifier prefix',
      },
    ],
    requiresPermission: 'manage_api_keys',
    auditAllChanges: true,
  },

  // Two-Factor Authentication Security
  {
    modelName: 'twoFactor',
    rules: [
      {
        fieldName: 'secret',
        sensitivity: 'high',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'TOTP secret - must never be exposed',
      },
      {
        fieldName: 'secretHash',
        sensitivity: 'high',
        maskingStrategy: 'hash',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'Secret hash for verification',
      },
    ],
    requiresPermission: 'manage_security',
    auditAllChanges: true,
  },

  // Backup Codes Security
  {
    modelName: 'backupCode',
    rules: [
      {
        fieldName: 'code',
        sensitivity: 'high',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'Backup recovery code - single use',
      },
      {
        fieldName: 'codeHash',
        sensitivity: 'high',
        maskingStrategy: 'hash',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'Code hash for verification',
      },
    ],
    requiresPermission: 'manage_security',
    auditAllChanges: true,
  },

  // Passkey Security
  {
    modelName: 'passkey',
    rules: [
      {
        fieldName: 'publicKey',
        sensitivity: 'medium',
        maskingStrategy: 'partial',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'WebAuthn public key data',
      },
      {
        fieldName: 'credentialId',
        sensitivity: 'medium',
        maskingStrategy: 'partial',
        auditLog: true,
        description: 'Credential identifier',
      },
    ],
    requiresPermission: 'manage_security',
    auditAllChanges: true,
  },

  // Account Security (OAuth tokens)
  {
    modelName: 'account',
    rules: [
      {
        fieldName: 'accessToken',
        sensitivity: 'high',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'OAuth access token',
      },
      {
        fieldName: 'refreshToken',
        sensitivity: 'high',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'OAuth refresh token',
      },
      {
        fieldName: 'idToken',
        sensitivity: 'high',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'OAuth ID token',
      },
      {
        fieldName: 'password',
        sensitivity: 'high',
        maskingStrategy: 'full',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'User password hash',
      },
    ],
    requiresPermission: 'manage_accounts',
    auditAllChanges: true,
  },

  // Session Security
  {
    modelName: 'session',
    rules: [
      {
        fieldName: 'token',
        sensitivity: 'high',
        maskingStrategy: 'partial',
        requiresPermission: 'admin',
        auditLog: true,
        description: 'Session token',
      },
      {
        fieldName: 'ipAddress',
        sensitivity: 'medium',
        maskingStrategy: 'partial',
        description: 'User IP address - privacy sensitive',
      },
      {
        fieldName: 'userAgent',
        sensitivity: 'low',
        maskingStrategy: 'none',
        description: 'Browser user agent string',
      },
    ],
    auditAllChanges: true,
  },

  // User Security
  {
    modelName: 'user',
    rules: [
      {
        fieldName: 'email',
        sensitivity: 'medium',
        maskingStrategy: 'partial',
        description: 'User email address - PII',
      },
      {
        fieldName: 'phoneNumber',
        sensitivity: 'medium',
        maskingStrategy: 'partial',
        description: 'User phone number - PII',
      },
      {
        fieldName: 'suspensionDetails',
        sensitivity: 'medium',
        maskingStrategy: 'none',
        requiresPermission: 'admin',
        description: 'User suspension information',
      },
    ],
  },

  // Organization Security
  {
    modelName: 'organization',
    rules: [
      {
        fieldName: 'metadata',
        sensitivity: 'low',
        maskingStrategy: 'none',
        description: 'Organization metadata - may contain sensitive info',
      },
    ],
  },

  // Workflow Configuration Security
  {
    modelName: 'workflowConfig',
    rules: [
      {
        fieldName: 'customPayload',
        sensitivity: 'medium',
        maskingStrategy: 'none',
        requiresPermission: 'admin',
        description: 'Workflow configuration data',
      },
      {
        fieldName: 'metadata',
        sensitivity: 'medium',
        maskingStrategy: 'none',
        requiresPermission: 'admin',
        description: 'Workflow metadata',
      },
    ],
  },
];

/**
 * Get security rules for a specific model
 */
export function getModelSecurityConfig(modelName: string): ModelSecurityConfig | null {
  return securityConfigs.find(config => config.modelName === modelName) || null;
}

/**
 * Get security rule for a specific field
 */
export function getFieldSecurityRule(modelName: string, fieldName: string): SecurityRule | null {
  const modelConfig = getModelSecurityConfig(modelName);
  if (!modelConfig) return null;
  
  return modelConfig.rules.find(rule => rule.fieldName === fieldName) || null;
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
  userPermissions: string[]
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
  maskingStrategy: SecurityRule['maskingStrategy']
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
  
  return (rule?.auditLog === true) || (modelConfig?.auditAllChanges === true);
}

/**
 * Get field sensitivity level
 */
export function getFieldSensitivity(modelName: string, fieldName: string): SecurityRule['sensitivity'] | null {
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
      { pattern: /sk_[a-zA-Z0-9]{24,}/, type: 'API Key (Stripe)' },
      { pattern: /pk_[a-zA-Z0-9]{24,}/, type: 'Public Key (Stripe)' },
      { pattern: /[A-Za-z0-9]{32,}/, type: 'Potential Token' },
      { pattern: /-----BEGIN.*PRIVATE KEY-----/, type: 'Private Key' },
      { pattern: /[a-f0-9]{40,}/, type: 'Hash/Token' },
      { pattern: /Bearer\s+[A-Za-z0-9\-._~+\/]+/, type: 'Bearer Token' },
    ];
    
    const detected: string[] = [];
    patterns.forEach(({ pattern, type }) => {
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
      modelConfig.rules.forEach(rule => {
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
    operation: 'read' | 'write'
  ): { allowed: boolean; reason?: string } {
    const rule = getFieldSecurityRule(modelName, fieldName);
    
    if (!rule) return { allowed: true };
    
    if (rule.requiresPermission && !userPermissions.includes(rule.requiresPermission)) {
      return {
        allowed: false,
        reason: `Missing required permission: ${rule.requiresPermission}`,
      };
    }
    
    if (rule.sensitivity === 'high' && operation === 'write' && !userPermissions.includes('admin')) {
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
  return SENSITIVE_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
}