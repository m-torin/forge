/**
 * MCP Configuration Manager
 * Provides centralized configuration management for MCP connections and tools
 */

import { env } from '#/root/env';
import { logInfo, logWarn } from '@repo/observability';
import type { FeatureFlagContext } from '../feature-flags/config';
import { isMcpFeatureEnabled } from '../feature-flags/config';
import { mcpSecurity } from './security';

/**
 * MCP connection profile configuration
 */
export interface McpConnectionProfile {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  serverType: 'perplexity' | 'filesystem' | 'custom';
  transport: {
    type: 'stdio' | 'sse' | 'http';
    command?: string;
    args?: string[];
    url?: string;
    headers?: Record<string, string>;
  };
  credentials?: {
    required: string[];
    optional: string[];
  };
  capabilities: string[];
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  healthCheck?: {
    enabled: boolean;
    intervalMs: number;
    timeoutMs: number;
  };
  metadata?: Record<string, any>;
}

/**
 * MCP configuration preset for different environments
 */
export interface McpConfigurationPreset {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  profiles: McpConnectionProfile[];
  globalSettings: {
    maxConcurrentConnections: number;
    defaultTimeout: number;
    retryPolicy: {
      maxAttempts: number;
      backoffMultiplier: number;
    };
    gracefulDegradation: boolean;
  };
}

/**
 * Default MCP connection profiles
 */
const DEFAULT_CONNECTION_PROFILES: McpConnectionProfile[] = [
  {
    id: 'perplexity-search',
    name: 'Perplexity Web Search',
    description: 'Real-time web search using Perplexity AI',
    enabled: true,
    serverType: 'perplexity',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'server-perplexity-ask'],
    },
    credentials: {
      required: ['perplexity'],
      optional: [],
    },
    capabilities: ['web_search', 'current_events', 'factual_lookup'],
    rateLimit: {
      requestsPerMinute: 60,
      burstLimit: 10,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 60000,
      timeoutMs: 5000,
    },
    metadata: {
      category: 'search',
      priority: 'high',
      tags: ['web', 'search', 'ai'],
    },
  },
  {
    id: 'filesystem-tools',
    name: 'Filesystem Operations',
    description: 'File system operations and management',
    enabled: true,
    serverType: 'filesystem',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    },
    credentials: {
      required: [],
      optional: [],
    },
    capabilities: ['file_read', 'file_write', 'directory_list', 'file_operations'],
    rateLimit: {
      requestsPerMinute: 120,
      burstLimit: 20,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 90000,
      timeoutMs: 3000,
    },
    metadata: {
      category: 'system',
      priority: 'medium',
      tags: ['filesystem', 'files', 'storage'],
    },
  },
  {
    id: 'context7-docs',
    name: 'Context7 - Up-to-date Code Docs',
    description:
      'Up-to-date, version-specific documentation and code examples from library sources',
    enabled: true,
    serverType: 'custom',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp'],
    },
    credentials: {
      required: [],
      optional: [],
    },
    capabilities: [
      'library_documentation',
      'code_examples',
      'api_reference',
      'version_specific_docs',
      'up_to_date_info',
    ],
    rateLimit: {
      requestsPerMinute: 60,
      burstLimit: 15,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 120000, // 2 minutes - less frequent since it's very stable
      timeoutMs: 10000, // 10 seconds - allow more time for doc fetching
    },
    metadata: {
      category: 'documentation',
      priority: 'high',
      tags: ['documentation', 'libraries', 'api-reference', 'development'],
      source: 'default',
      featured: true,
    },
  },
];

/**
 * Configuration presets for different environments
 */
const CONFIGURATION_PRESETS: McpConfigurationPreset[] = [
  {
    name: 'development',
    description: 'Development environment with full debugging',
    environment: 'development',
    profiles: DEFAULT_CONNECTION_PROFILES.map(profile => ({
      ...profile,
      healthCheck: {
        enabled: true,
        timeoutMs: 15000,
        ...(profile.healthCheck || {}),
        intervalMs: 30000, // More frequent in development
      },
    })),
    globalSettings: {
      maxConcurrentConnections: 5,
      defaultTimeout: 30000,
      retryPolicy: {
        maxAttempts: 2,
        backoffMultiplier: 1.5,
      },
      gracefulDegradation: true,
    },
  },
  {
    name: 'production',
    description: 'Production environment with optimized settings',
    environment: 'production',
    profiles: DEFAULT_CONNECTION_PROFILES,
    globalSettings: {
      maxConcurrentConnections: 10,
      defaultTimeout: 15000,
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
      },
      gracefulDegradation: true,
    },
  },
];

/**
 * MCP Configuration Manager
 * Handles loading, validation, and management of MCP configurations
 */
export class McpConfigManager {
  private static instance: McpConfigManager;
  private currentPreset: McpConfigurationPreset;
  private customProfiles: Map<string, McpConnectionProfile> = new Map();
  private userOverrides: Map<string, Partial<McpConnectionProfile>> = new Map();

  private constructor() {
    this.currentPreset = this.loadPresetForEnvironment();
    this.loadCustomProfiles();
  }

  public static getInstance(): McpConfigManager {
    if (!McpConfigManager.instance) {
      McpConfigManager.instance = new McpConfigManager();
    }
    return McpConfigManager.instance;
  }

  /**
   * Load the appropriate configuration preset for the current environment
   */
  private loadPresetForEnvironment(): McpConfigurationPreset {
    const envName = env.NODE_ENV as 'development' | 'staging' | 'production';
    const preset = CONFIGURATION_PRESETS.find(p => p.environment === envName);

    if (!preset) {
      logWarn('No configuration preset found for environment, using development preset', {
        operation: 'mcp_config_preset_fallback',
        metadata: { environment: envName },
      });
      return CONFIGURATION_PRESETS[0]; // Fallback to development
    }

    logInfo('Loaded MCP configuration preset', {
      operation: 'mcp_config_preset_loaded',
      metadata: {
        presetName: preset.name,
        environment: preset.environment,
        profileCount: preset.profiles.length,
      },
    });

    return preset;
  }

  /**
   * Load custom profiles (placeholder for future database integration)
   */
  private loadCustomProfiles(): void {
    // In the future, this would load from database or external configuration
    logInfo('Custom MCP profiles loaded', {
      operation: 'mcp_custom_profiles_loaded',
      metadata: { customProfileCount: this.customProfiles.size },
    });
  }

  /**
   * Get all available connection profiles for a user
   */
  public getAvailableProfiles(context: FeatureFlagContext = {}): McpConnectionProfile[] {
    const userId = context.user?.id;
    const profiles: McpConnectionProfile[] = [];

    // Combine preset profiles with custom profiles
    const allProfiles = [
      ...this.currentPreset.profiles,
      ...Array.from(this.customProfiles.values()),
    ];

    for (const profile of allProfiles) {
      // Check if profile is enabled
      if (!profile.enabled) {
        continue;
      }

      // Check user permissions
      if (!mcpSecurity.hasPermission(userId, profile.id, 'connect')) {
        continue;
      }

      // Check credential requirements
      const hasRequiredCredentials =
        profile.credentials?.required.every(credName =>
          mcpSecurity.hasValidCredential(credName, userId),
        ) ?? true;

      if (!hasRequiredCredentials) {
        logWarn('MCP profile skipped due to missing credentials', {
          operation: 'mcp_profile_credentials_missing',
          metadata: {
            profileId: profile.id,
            userId,
            requiredCredentials: profile.credentials?.required,
          },
        });
        continue;
      }

      // Apply user overrides if any
      const userOverride = this.userOverrides.get(`${userId}-${profile.id}`);
      const finalProfile = userOverride ? { ...profile, ...userOverride } : profile;

      profiles.push(finalProfile);
    }

    logInfo('Available MCP profiles retrieved', {
      operation: 'mcp_profiles_retrieved',
      metadata: {
        userId,
        totalProfiles: allProfiles.length,
        availableProfiles: profiles.length,
        profileIds: profiles.map(p => p.id),
      },
    });

    return profiles;
  }

  /**
   * Get a specific connection profile by ID
   */
  public getProfile(
    profileId: string,
    context: FeatureFlagContext = {},
  ): McpConnectionProfile | null {
    const availableProfiles = this.getAvailableProfiles(context);
    return availableProfiles.find(p => p.id === profileId) || null;
  }

  /**
   * Convert profiles to MCP client configurations compatible with @repo/ai
   */
  public createClientConfigurations(context: FeatureFlagContext = {}): Promise<any[]> {
    return new Promise(resolve => {
      const profiles = this.getAvailableProfiles(context);
      const userId = context.user?.id;

      const configurations = profiles.map(profile => ({
        name: profile.id,
        transport: {
          ...profile.transport,
          env: mcpSecurity.sanitizeEnvironment({
            ...process.env,
            // Add credential environment variables
            ...this.getCredentialEnvironmentVars(profile, userId),
          }),
        },
        retry: {
          maxAttempts: this.currentPreset.globalSettings.retryPolicy.maxAttempts,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          backoffMultiplier: this.currentPreset.globalSettings.retryPolicy.backoffMultiplier,
          retryableErrors: ['ECONNREFUSED', 'ENOTFOUND', 'TIMEOUT', 'NETWORK_ERROR'],
        },
        timeoutMs: this.currentPreset.globalSettings.defaultTimeout,
        gracefulDegradation: isMcpFeatureEnabled('mcpGracefulDegradationEnabled', context),
        healthCheck:
          profile.healthCheck?.enabled && isMcpFeatureEnabled('mcpHealthMonitoringEnabled', context)
            ? {
                enabled: true,
                intervalMs: profile.healthCheck.intervalMs,
                timeoutMs: profile.healthCheck.timeoutMs,
                failureThreshold: 3,
                recoveryThreshold: 2,
              }
            : { enabled: false },
        metadata: {
          ...profile.metadata,
          capabilities: profile.capabilities,
          rateLimit: profile.rateLimit,
        },
      }));

      resolve(configurations);
    });
  }

  /**
   * Get credential environment variables for a profile
   */
  private getCredentialEnvironmentVars(
    profile: McpConnectionProfile,
    userId?: string,
  ): Record<string, string> {
    const envVars: Record<string, string> = {};

    profile.credentials?.required.forEach(credName => {
      const credValue = mcpSecurity.getCredential(credName, userId);
      if (credValue) {
        // Map credential names to environment variable names
        const envVarName = this.getCredentialEnvVarName(credName);
        if (envVarName) {
          envVars[envVarName] = credValue;
        }
      }
    });

    profile.credentials?.optional.forEach(credName => {
      const credValue = mcpSecurity.getCredential(credName, userId);
      if (credValue) {
        const envVarName = this.getCredentialEnvVarName(credName);
        if (envVarName) {
          envVars[envVarName] = credValue;
        }
      }
    });

    return envVars;
  }

  /**
   * Map credential names to environment variable names
   */
  private getCredentialEnvVarName(credName: string): string | null {
    const mapping: Record<string, string> = {
      perplexity: 'PERPLEXITY_API_KEY',
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
    };

    return mapping[credName] || null;
  }

  /**
   * Set user-specific override for a profile
   */
  public setUserOverride(
    userId: string,
    profileId: string,
    overrides: Partial<McpConnectionProfile>,
  ): void {
    const key = `${userId}-${profileId}`;
    this.userOverrides.set(key, overrides);

    logInfo('User MCP profile override set', {
      operation: 'mcp_user_override_set',
      metadata: {
        userId,
        profileId,
        overrideKeys: Object.keys(overrides),
      },
    });
  }

  /**
   * Add a custom connection profile
   */
  public addCustomProfile(profile: McpConnectionProfile): void {
    // Validate profile
    if (!profile.id || !profile.name || !profile.transport) {
      throw new Error('Invalid MCP profile: missing required fields');
    }

    this.customProfiles.set(profile.id, profile);

    logInfo('Custom MCP profile added', {
      operation: 'mcp_custom_profile_added',
      metadata: {
        profileId: profile.id,
        profileName: profile.name,
        serverType: profile.serverType,
      },
    });
  }

  /**
   * Get current configuration summary
   */
  public getConfigurationSummary(): {
    preset: string;
    environment: string;
    totalProfiles: number;
    enabledProfiles: number;
    customProfiles: number;
    globalSettings: any;
  } {
    const totalProfiles = this.currentPreset.profiles.length + this.customProfiles.size;
    const enabledProfiles = [
      ...this.currentPreset.profiles,
      ...Array.from(this.customProfiles.values()),
    ].filter(p => p.enabled).length;

    return {
      preset: this.currentPreset.name,
      environment: this.currentPreset.environment,
      totalProfiles,
      enabledProfiles,
      customProfiles: this.customProfiles.size,
      globalSettings: this.currentPreset.globalSettings,
    };
  }
}

/**
 * Export singleton instance
 */
export const mcpConfigManager = McpConfigManager.getInstance();

/**
 * Utility functions for MCP configuration management
 */
export const mcpConfig = {
  getAvailableProfiles: (context?: FeatureFlagContext) =>
    mcpConfigManager.getAvailableProfiles(context),

  getProfile: (profileId: string, context?: FeatureFlagContext) =>
    mcpConfigManager.getProfile(profileId, context),

  createClientConfigurations: (context?: FeatureFlagContext) =>
    mcpConfigManager.createClientConfigurations(context),

  setUserOverride: (userId: string, profileId: string, overrides: Partial<McpConnectionProfile>) =>
    mcpConfigManager.setUserOverride(userId, profileId, overrides),

  addCustomProfile: (profile: McpConnectionProfile) => mcpConfigManager.addCustomProfile(profile),

  getConfigurationSummary: () => mcpConfigManager.getConfigurationSummary(),
};
