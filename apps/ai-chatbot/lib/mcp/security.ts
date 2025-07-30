/**
 * MCP Security Layer
 * Provides secure credential management and access control for MCP connections
 */

import { env } from '#/root/env';
import { logInfo, logWarn } from '@repo/observability';

/**
 * MCP credential configuration
 */
export interface McpCredentialConfig {
  name: string;
  type: 'api_key' | 'oauth' | 'basic_auth' | 'none';
  required: boolean;
  envVar?: string;
  description?: string;
}

/**
 * Secure MCP credentials storage
 */
export interface SecureMcpCredentials {
  [key: string]: {
    value: string;
    type: 'api_key' | 'oauth' | 'basic_auth' | 'none';
    encrypted: boolean;
    lastUpdated: Date;
    expiresAt?: Date;
  };
}

/**
 * MCP access permissions
 */
export interface McpAccessPermissions {
  userId?: string;
  userRole?: string;
  allowedConnections: string[];
  allowedOperations: string[];
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  ipWhitelist?: string[];
}

/**
 * MCP credential manager
 * Handles secure storage and retrieval of MCP credentials
 */
export class McpCredentialManager {
  private static instance: McpCredentialManager;
  private credentials: SecureMcpCredentials = {};
  private permissions: Map<string, McpAccessPermissions> = new Map();

  private constructor() {
    this.initializeCredentials();
  }

  public static getInstance(): McpCredentialManager {
    if (!McpCredentialManager.instance) {
      McpCredentialManager.instance = new McpCredentialManager();
    }
    return McpCredentialManager.instance;
  }

  /**
   * Initialize credentials from environment variables
   */
  private initializeCredentials(): void {
    const credentialConfigs: McpCredentialConfig[] = [
      {
        name: 'perplexity',
        type: 'api_key',
        required: false,
        envVar: 'PERPLEXITY_API_KEY',
        description: 'Perplexity AI API key for web search',
      },
      {
        name: 'openai',
        type: 'api_key',
        required: false,
        envVar: 'OPENAI_API_KEY',
        description: 'OpenAI API key for enhanced tools',
      },
      {
        name: 'anthropic',
        type: 'api_key',
        required: false,
        envVar: 'ANTHROPIC_API_KEY',
        description: 'Anthropic API key for Claude integration',
      },
    ];

    credentialConfigs.forEach(config => {
      if (config.envVar && process.env[config.envVar]) {
        this.credentials[config.name] = {
          value: process.env[config.envVar] as string,
          type: config.type,
          encrypted: false, // Environment variables are not encrypted in this implementation
          lastUpdated: new Date(),
        };

        logInfo('MCP credential loaded', {
          operation: 'mcp_credential_load',
          metadata: {
            credentialName: config.name,
            type: config.type,
            hasValue: !!process.env[config.envVar],
          },
        });
      } else if (config.required) {
        logWarn('Required MCP credential missing', {
          operation: 'mcp_credential_missing',
          metadata: {
            credentialName: config.name,
            envVar: config.envVar,
            required: config.required,
          },
        });
      }
    });
  }

  /**
   * Get a credential value securely
   */
  public getCredential(name: string, userId?: string): string | null {
    if (!this.hasPermission(userId, name, 'read_credential')) {
      logWarn('MCP credential access denied', {
        operation: 'mcp_credential_access_denied',
        metadata: {
          credentialName: name,
          userId,
          operation: 'read_credential',
        },
      });
      return null;
    }

    const credential = this.credentials[name];
    if (!credential) {
      return null;
    }

    // Check if credential is expired
    if (credential.expiresAt && credential.expiresAt < new Date()) {
      logWarn('MCP credential expired', {
        operation: 'mcp_credential_expired',
        metadata: {
          credentialName: name,
          expiresAt: credential.expiresAt.toISOString(),
        },
      });
      return null;
    }

    return credential.value;
  }

  /**
   * Check if a credential exists and is valid
   */
  public hasValidCredential(name: string, userId?: string): boolean {
    return this.getCredential(name, userId) !== null;
  }

  /**
   * Set user permissions for MCP access
   */
  public setUserPermissions(userId: string, permissions: McpAccessPermissions): void {
    this.permissions.set(userId, {
      ...permissions,
      userId,
    });

    logInfo('MCP user permissions set', {
      operation: 'mcp_permissions_set',
      metadata: {
        userId,
        allowedConnections: permissions.allowedConnections,
        allowedOperations: permissions.allowedOperations,
        hasRateLimit: !!permissions.rateLimit,
      },
    });
  }

  /**
   * Check if user has permission for specific operation
   */
  public hasPermission(userId: string | undefined, resource: string, operation: string): boolean {
    // Allow access in development mode
    if (env.NODE_ENV === 'development') {
      return true;
    }

    if (!userId) {
      return false;
    }

    const userPermissions = this.permissions.get(userId);
    if (!userPermissions) {
      return false;
    }

    // Check connection permissions
    if (operation === 'connect' && !userPermissions.allowedConnections.includes(resource)) {
      return false;
    }

    // Check operation permissions
    if (!userPermissions.allowedOperations.includes(operation)) {
      return false;
    }

    return true;
  }

  /**
   * Get available MCP connections for a user
   */
  public getAvailableConnections(userId?: string): string[] {
    if (env.NODE_ENV === 'development') {
      return Object.keys(this.credentials);
    }

    if (!userId) {
      return [];
    }

    const userPermissions = this.permissions.get(userId);
    if (!userPermissions) {
      return [];
    }

    // Return intersection of allowed connections and available credentials
    return userPermissions.allowedConnections.filter(connection =>
      this.hasValidCredential(connection, userId),
    );
  }

  /**
   * Sanitize credentials for logging (remove sensitive data)
   */
  public getCredentialsSummary(): Record<
    string,
    {
      available: boolean;
      type: string;
      lastUpdated: string;
      expiresAt?: string;
    }
  > {
    const summary: Record<string, any> = {};

    Object.entries(this.credentials).forEach(([name, credential]) => {
      summary[name] = {
        available: !!credential.value,
        type: credential.type,
        lastUpdated: credential.lastUpdated.toISOString(),
        ...(credential.expiresAt && { expiresAt: credential.expiresAt.toISOString() }),
      };
    });

    return summary;
  }
}

/**
 * MCP security validator
 * Validates and sanitizes MCP configurations for security
 */
export class McpSecurityValidator {
  /**
   * Validate MCP client configuration for security issues
   */
  public static validateMcpConfig(
    config: any,
    userId?: string,
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedConfig: any;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedConfig = { ...config };

    // Validate transport security
    if (config.transport?.type === 'stdio') {
      // Validate command safety
      const command = config.transport.command;
      const allowedCommands = ['npx', 'node', 'python', 'python3'];

      if (!allowedCommands.includes(command)) {
        errors.push(`Unsafe command in stdio transport: ${command}`);
      }

      // Validate arguments
      const args = config.transport.args || [];
      const dangerousPatterns = ['&&', '||', ';', '|', '>', '<', '$', '`'];

      args.forEach((arg: string, index: number) => {
        if (dangerousPatterns.some(pattern => arg.includes(pattern))) {
          errors.push(`Potentially dangerous argument at index ${index}: ${arg}`);
        }
      });
    }

    // Validate timeouts (prevent DoS)
    if (config.timeoutMs && config.timeoutMs > 300000) {
      // 5 minutes max
      warnings.push('Timeout exceeds recommended maximum of 5 minutes');
      sanitizedConfig.timeoutMs = 300000;
    }

    // Validate retry configuration
    if (config.retry?.maxAttempts && config.retry.maxAttempts > 10) {
      warnings.push('Retry attempts exceed recommended maximum of 10');
      sanitizedConfig.retry.maxAttempts = 10;
    }

    // Ensure graceful degradation is enabled for production
    if (env.NODE_ENV === 'production' && !config.gracefulDegradation) {
      warnings.push('Graceful degradation should be enabled in production');
      sanitizedConfig.gracefulDegradation = true;
    }

    // Validate user permissions
    const credentialManager = McpCredentialManager.getInstance();
    if (!credentialManager.hasPermission(userId, config.name, 'connect')) {
      errors.push(`User does not have permission to connect to ${config.name}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedConfig,
    };
  }

  /**
   * Sanitize environment variables before passing to MCP processes
   */
  public static sanitizeEnvironment(
    baseEnv: Record<string, string | undefined>,
  ): Record<string, string> {
    const allowedEnvVars = [
      'NODE_ENV',
      'PATH',
      'HOME',
      'USER',
      'PERPLEXITY_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
    ];

    const sanitizedEnv: Record<string, string> = {};

    allowedEnvVars.forEach(varName => {
      if (baseEnv[varName]) {
        sanitizedEnv[varName] = baseEnv[varName] as string;
      }
    });

    return sanitizedEnv;
  }
}

/**
 * Export singleton instance for easy access
 */
export const mcpCredentialManager = McpCredentialManager.getInstance();

/**
 * Utility functions for MCP security
 */
export const mcpSecurity = {
  getCredential: (name: string, userId?: string) =>
    mcpCredentialManager.getCredential(name, userId),

  hasValidCredential: (name: string, userId?: string) =>
    mcpCredentialManager.hasValidCredential(name, userId),

  hasPermission: (userId: string | undefined, resource: string, operation: string) =>
    mcpCredentialManager.hasPermission(userId, resource, operation),

  getAvailableConnections: (userId?: string) =>
    mcpCredentialManager.getAvailableConnections(userId),

  validateConfig: (config: any, userId?: string) =>
    McpSecurityValidator.validateMcpConfig(config, userId),

  sanitizeEnvironment: (env: Record<string, string | undefined>) =>
    McpSecurityValidator.sanitizeEnvironment(env),

  getCredentialsSummary: () => mcpCredentialManager.getCredentialsSummary(),
};
