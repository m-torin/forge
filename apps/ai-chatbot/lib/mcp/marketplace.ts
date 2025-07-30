/**
 * MCP Marketplace Integration Framework
 * Allows discovery, installation, and management of MCP tools and servers
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import type { FeatureFlagContext } from '../feature-flags/config';
import { mcpAnalytics } from './analytics';
import { mcpConfigManager, type McpConnectionProfile } from './config-manager';

/**
 * MCP Package Metadata
 */
export interface McpPackageMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  license: string;
  keywords: string[];
  categories: McpPackageCategory[];
  capabilities: string[];
  requirements: {
    node?: string;
    python?: string;
    system?: string[];
    dependencies?: Record<string, string>;
  };
  installation: {
    command: string;
    args: string[];
    postInstall?: string[];
  };
  configuration: {
    required: McpConfigField[];
    optional: McpConfigField[];
    examples: Record<string, any>;
  };
  pricing: {
    model: 'free' | 'freemium' | 'paid';
    cost?: {
      currency: string;
      amount: number;
      period: 'request' | 'month' | 'year';
    };
    limits?: {
      requestsPerMonth?: number;
      requestsPerMinute?: number;
      features?: string[];
    };
  };
  security: {
    permissions: string[];
    dataAccess: 'none' | 'read' | 'write' | 'full';
    networkAccess: boolean;
    fileSystemAccess: boolean;
    trustLevel: 'trusted' | 'verified' | 'community' | 'unverified';
  };
  metrics: {
    downloads: number;
    rating: number;
    reviews: number;
    lastUpdated: string;
    stability: 'experimental' | 'beta' | 'stable' | 'mature';
  };
  compatibility: {
    mcpVersion: string;
    platforms: string[];
    aiProviders?: string[];
  };
}

/**
 * Package categories
 */
export type McpPackageCategory =
  | 'search'
  | 'productivity'
  | 'development'
  | 'communication'
  | 'data-analysis'
  | 'content-generation'
  | 'automation'
  | 'integration'
  | 'utility'
  | 'documentation';

/**
 * Configuration field definition
 */
export interface McpConfigField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  default?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: any[];
  };
  sensitive?: boolean;
}

/**
 * Installation status
 */
export type McpInstallationStatus =
  | 'not-installed'
  | 'installing'
  | 'installed'
  | 'updating'
  | 'failed'
  | 'incompatible';

/**
 * Installed package information
 */
export interface McpInstalledPackage {
  metadata: McpPackageMetadata;
  installationStatus: McpInstallationStatus;
  installedVersion: string;
  installDate: string;
  lastUsed?: string;
  usageCount: number;
  configuration: Record<string, any>;
  connectionProfile?: McpConnectionProfile;
  errors: Array<{
    timestamp: string;
    error: string;
    context?: string;
  }>;
}

/**
 * Marketplace search filters
 */
export interface McpMarketplaceFilters {
  categories?: McpPackageCategory[];
  keywords?: string[];
  pricingModel?: ('free' | 'freemium' | 'paid')[];
  trustLevel?: ('trusted' | 'verified' | 'community' | 'unverified')[];
  stability?: ('experimental' | 'beta' | 'stable' | 'mature')[];
  minRating?: number;
  platforms?: string[];
  capabilities?: string[];
  sortBy?: 'relevance' | 'popularity' | 'rating' | 'updated' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Search results
 */
export interface McpMarketplaceSearchResult {
  packages: McpPackageMetadata[];
  total: number;
  offset: number;
  limit: number;
  filters: McpMarketplaceFilters;
  suggestions?: string[];
}

/**
 * Marketplace configuration
 */
export interface McpMarketplaceConfig {
  registryUrl: string;
  enableAutoUpdates: boolean;
  allowUntrustedPackages: boolean;
  installTimeout: number;
  maxConcurrentInstalls: number;
  cacheExpiry: number; // milliseconds
  enableTelemetry: boolean;
}

/**
 * Default marketplace configuration
 */
const DEFAULT_MARKETPLACE_CONFIG: McpMarketplaceConfig = {
  registryUrl: 'https://mcp-registry.ai/api/v1',
  enableAutoUpdates: false,
  allowUntrustedPackages: false,
  installTimeout: 300000, // 5 minutes
  maxConcurrentInstalls: 3,
  cacheExpiry: 3600000, // 1 hour
  enableTelemetry: true,
};

/**
 * MCP Marketplace Service
 */
export class McpMarketplaceService {
  private installedPackages = new Map<string, McpInstalledPackage>();
  private packageCache = new Map<string, { data: McpPackageMetadata[]; timestamp: number }>();
  private activeInstalls = new Set<string>();

  constructor(private config: McpMarketplaceConfig = DEFAULT_MARKETPLACE_CONFIG) {
    this.loadInstalledPackages();
    this.initializeDefaultPackages();
  }

  /**
   * Search for packages in the marketplace
   */
  async searchPackages(
    query: string,
    filters: McpMarketplaceFilters = {},
    context: FeatureFlagContext = {},
  ): Promise<McpMarketplaceSearchResult> {
    try {
      logInfo('MCP Marketplace: Searching packages', {
        operation: 'marketplace_search',
        metadata: {
          query: query.substring(0, 100),
          filters: JSON.stringify(filters),
          userId: context.user?.id,
        },
      });

      // Check cache first
      const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
      const cached = this.packageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
        return {
          packages: cached.data,
          total: cached.data.length,
          offset: filters.offset || 0,
          limit: filters.limit || 50,
          filters,
        };
      }

      // Make API request to marketplace registry
      const searchParams = new URLSearchParams({
        q: query,
        limit: String(filters.limit || 50),
        offset: String(filters.offset || 0),
        sort: filters.sortBy || 'relevance',
        order: filters.sortOrder || 'desc',
      });

      // Add filter parameters
      if (filters.categories?.length) {
        searchParams.append('categories', filters.categories.join(','));
      }
      if (filters.keywords?.length) {
        searchParams.append('keywords', filters.keywords.join(','));
      }
      if (filters.pricingModel?.length) {
        searchParams.append('pricing', filters.pricingModel.join(','));
      }
      if (filters.trustLevel?.length) {
        searchParams.append('trust', filters.trustLevel.join(','));
      }
      if (filters.stability?.length) {
        searchParams.append('stability', filters.stability.join(','));
      }
      if (filters.minRating !== undefined) {
        searchParams.append('min_rating', String(filters.minRating));
      }

      const response = await fetch(`${this.config.registryUrl}/packages/search?${searchParams}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'mcp-ai-chatbot/1.0.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Marketplace API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const packages: McpPackageMetadata[] = data.packages || [];

      // Cache the results
      this.packageCache.set(cacheKey, { data: packages, timestamp: Date.now() });

      // Track search analytics
      if (this.config.enableTelemetry) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'marketplace_search',
            success: true,
            executionTime: Date.now(),
            contextSize: packages.length,
            query: query.substring(0, 50),
            resultsCount: packages.length,
          },
        });
      }

      return {
        packages,
        total: data.total || packages.length,
        offset: filters.offset || 0,
        limit: filters.limit || 50,
        filters,
        suggestions: data.suggestions,
      };
    } catch (error) {
      const searchError = error instanceof Error ? error : new Error(String(error));

      logError('MCP Marketplace: Search failed', {
        operation: 'marketplace_search_failed',
        metadata: { query, filters: JSON.stringify(filters) },
        error: searchError,
      });

      // Track error
      if (this.config.enableTelemetry) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'marketplace_search',
            success: false,
            errorType: searchError.name,
            errorMessage: searchError.message,
          },
        });
      }

      throw searchError;
    }
  }

  /**
   * Get detailed package information
   */
  async getPackageDetails(packageId: string): Promise<McpPackageMetadata | null> {
    try {
      // Check cache first
      const cacheKey = `package:${packageId}`;
      const cached = this.packageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
        return cached.data[0] || null;
      }

      const response = await fetch(`${this.config.registryUrl}/packages/${packageId}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'mcp-ai-chatbot/1.0.0',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch package details: ${response.status}`);
      }

      const packageData: McpPackageMetadata = await response.json();

      // Cache the result
      this.packageCache.set(cacheKey, { data: [packageData], timestamp: Date.now() });

      return packageData;
    } catch (error) {
      logError('MCP Marketplace: Failed to get package details', {
        operation: 'marketplace_package_details_failed',
        metadata: { packageId },
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * Install a package
   */
  async installPackage(
    packageId: string,
    configuration: Record<string, any> = {},
    context: FeatureFlagContext = {},
  ): Promise<McpInstalledPackage> {
    if (this.activeInstalls.has(packageId)) {
      throw new Error(`Package ${packageId} is already being installed`);
    }

    if (this.activeInstalls.size >= this.config.maxConcurrentInstalls) {
      throw new Error('Maximum concurrent installations reached');
    }

    this.activeInstalls.add(packageId);

    try {
      logInfo('MCP Marketplace: Starting package installation', {
        operation: 'marketplace_install_start',
        metadata: {
          packageId,
          userId: context.user?.id,
          configKeys: Object.keys(configuration),
        },
      });

      // Get package metadata
      const packageMetadata = await this.getPackageDetails(packageId);
      if (!packageMetadata) {
        throw new Error(`Package ${packageId} not found`);
      }

      // Security checks
      await this.performSecurityChecks(packageMetadata);

      // Validate configuration
      const validatedConfig = await this.validateConfiguration(packageMetadata, configuration);

      // Create installation record
      const installedPackage: McpInstalledPackage = {
        metadata: packageMetadata,
        installationStatus: 'installing',
        installedVersion: packageMetadata.version,
        installDate: new Date().toISOString(),
        usageCount: 0,
        configuration: validatedConfig,
        errors: [],
      };

      this.installedPackages.set(packageId, installedPackage);

      // Perform actual installation
      await this.performInstallation(packageMetadata, validatedConfig);

      // Create connection profile
      const connectionProfile = await this.createConnectionProfile(
        packageMetadata,
        validatedConfig,
      );
      installedPackage.connectionProfile = connectionProfile;

      // Add to config manager
      mcpConfigManager.addCustomProfile(connectionProfile);

      // Update status
      installedPackage.installationStatus = 'installed';

      // Save to persistent storage
      await this.saveInstalledPackages();

      // Track installation
      if (this.config.enableTelemetry) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'marketplace_install',
            success: true,
            packageId,
            packageVersion: packageMetadata.version,
            configurationSize: Object.keys(validatedConfig).length,
          },
        });
      }

      logInfo('MCP Marketplace: Package installed successfully', {
        operation: 'marketplace_install_success',
        metadata: {
          packageId,
          version: packageMetadata.version,
          capabilities: packageMetadata.capabilities,
        },
      });

      return installedPackage;
    } catch (error) {
      const installError = error instanceof Error ? error : new Error(String(error));

      // Update installation status
      const installedPackage = this.installedPackages.get(packageId);
      if (installedPackage) {
        installedPackage.installationStatus = 'failed';
        installedPackage.errors.push({
          timestamp: new Date().toISOString(),
          error: installError.message,
          context: 'installation',
        });
        await this.saveInstalledPackages();
      }

      // Track error
      if (this.config.enableTelemetry) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'marketplace_install',
            success: false,
            packageId,
            errorType: installError.name,
            errorMessage: installError.message,
          },
        });
      }

      logError('MCP Marketplace: Package installation failed', {
        operation: 'marketplace_install_failed',
        metadata: { packageId },
        error: installError,
      });

      throw installError;
    } finally {
      this.activeInstalls.delete(packageId);
    }
  }

  /**
   * Uninstall a package
   */
  async uninstallPackage(packageId: string, context: FeatureFlagContext = {}): Promise<void> {
    const installedPackage = this.installedPackages.get(packageId);
    if (!installedPackage) {
      throw new Error(`Package ${packageId} is not installed`);
    }

    try {
      logInfo('MCP Marketplace: Uninstalling package', {
        operation: 'marketplace_uninstall_start',
        metadata: { packageId, userId: context.user?.id },
      });

      // Perform cleanup
      await this.performUninstallation(installedPackage);

      // Remove from collections
      this.installedPackages.delete(packageId);

      // Remove connection profile from config manager if it exists
      if (installedPackage.connectionProfile) {
        // Note: mcpConfigManager would need a remove method
        logInfo('Connection profile cleanup needed', {
          operation: 'marketplace_uninstall_profile_cleanup',
          metadata: { profileId: installedPackage.connectionProfile.id },
        });
      }

      // Save changes
      await this.saveInstalledPackages();

      // Track uninstallation
      if (this.config.enableTelemetry) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'marketplace_uninstall',
            success: true,
            packageId,
            usageCount: installedPackage.usageCount,
          },
        });
      }

      logInfo('MCP Marketplace: Package uninstalled successfully', {
        operation: 'marketplace_uninstall_success',
        metadata: { packageId },
      });
    } catch (error) {
      const uninstallError = error instanceof Error ? error : new Error(String(error));

      logError('MCP Marketplace: Package uninstallation failed', {
        operation: 'marketplace_uninstall_failed',
        metadata: { packageId },
        error: uninstallError,
      });

      throw uninstallError;
    }
  }

  /**
   * Get list of installed packages
   */
  getInstalledPackages(): McpInstalledPackage[] {
    return Array.from(this.installedPackages.values());
  }

  /**
   * Get installed package by ID
   */
  getInstalledPackage(packageId: string): McpInstalledPackage | null {
    return this.installedPackages.get(packageId) || null;
  }

  /**
   * Update package configuration
   */
  async updatePackageConfiguration(
    packageId: string,
    configuration: Record<string, any>,
    context: FeatureFlagContext = {},
  ): Promise<void> {
    const installedPackage = this.installedPackages.get(packageId);
    if (!installedPackage) {
      throw new Error(`Package ${packageId} is not installed`);
    }

    try {
      // Validate new configuration
      const validatedConfig = await this.validateConfiguration(
        installedPackage.metadata,
        configuration,
      );

      // Update configuration
      installedPackage.configuration = validatedConfig;

      // Update connection profile if needed
      if (installedPackage.connectionProfile) {
        installedPackage.connectionProfile = await this.createConnectionProfile(
          installedPackage.metadata,
          validatedConfig,
        );
      }

      // Save changes
      await this.saveInstalledPackages();

      logInfo('MCP Marketplace: Package configuration updated', {
        operation: 'marketplace_config_update',
        metadata: {
          packageId,
          userId: context.user?.id,
          configKeys: Object.keys(validatedConfig),
        },
      });
    } catch (error) {
      logError('MCP Marketplace: Failed to update package configuration', {
        operation: 'marketplace_config_update_failed',
        metadata: { packageId },
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Check for package updates
   */
  async checkForUpdates(): Promise<
    Array<{ packageId: string; currentVersion: string; latestVersion: string }>
  > {
    const updates: Array<{ packageId: string; currentVersion: string; latestVersion: string }> = [];

    for (const [packageId, installedPackage] of this.installedPackages) {
      try {
        const latestMetadata = await this.getPackageDetails(packageId);
        if (latestMetadata && latestMetadata.version !== installedPackage.installedVersion) {
          updates.push({
            packageId,
            currentVersion: installedPackage.installedVersion,
            latestVersion: latestMetadata.version,
          });
        }
      } catch (error) {
        logWarn('MCP Marketplace: Failed to check updates for package', {
          operation: 'marketplace_update_check_failed',
          metadata: { packageId },
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    return updates;
  }

  /**
   * Private helper methods
   */
  private async performSecurityChecks(packageMetadata: McpPackageMetadata): Promise<void> {
    // Check trust level
    if (
      !this.config.allowUntrustedPackages &&
      !['trusted', 'verified'].includes(packageMetadata.security.trustLevel)
    ) {
      throw new Error(
        `Package ${packageMetadata.id} has insufficient trust level: ${packageMetadata.security.trustLevel}`,
      );
    }

    // Check permissions
    const dangerousPermissions = ['file_system_write', 'network_admin', 'system_admin'];
    const hasDefaultPermissions = packageMetadata.security.permissions.some(p =>
      dangerousPermissions.includes(p),
    );

    if (hasDefaultPermissions) {
      logWarn('MCP Marketplace: Package requires dangerous permissions', {
        operation: 'marketplace_security_warning',
        metadata: {
          packageId: packageMetadata.id,
          permissions: packageMetadata.security.permissions,
        },
      });
    }
  }

  private async validateConfiguration(
    packageMetadata: McpPackageMetadata,
    configuration: Record<string, any>,
  ): Promise<Record<string, any>> {
    const validated: Record<string, any> = {};

    // Check required fields
    for (const field of packageMetadata.configuration.required) {
      if (!(field.name in configuration)) {
        throw new Error(`Required configuration field '${field.name}' is missing`);
      }
      validated[field.name] = configuration[field.name];
    }

    // Add optional fields
    for (const field of packageMetadata.configuration.optional) {
      if (field.name in configuration) {
        validated[field.name] = configuration[field.name];
      }
    }

    return validated;
  }

  private async performInstallation(
    packageMetadata: McpPackageMetadata,
    _configuration: Record<string, any>,
  ): Promise<void> {
    // This would perform the actual installation
    // For now, simulate installation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    logInfo('MCP Marketplace: Package installation simulation completed', {
      operation: 'marketplace_install_simulation',
      metadata: {
        packageId: packageMetadata.id,
        command: packageMetadata.installation.command,
        args: packageMetadata.installation.args,
      },
    });
  }

  private async performUninstallation(installedPackage: McpInstalledPackage): Promise<void> {
    // This would perform the actual uninstallation
    await new Promise(resolve => setTimeout(resolve, 1000));

    logInfo('MCP Marketplace: Package uninstallation simulation completed', {
      operation: 'marketplace_uninstall_simulation',
      metadata: { packageId: installedPackage.metadata.id },
    });
  }

  private async createConnectionProfile(
    packageMetadata: McpPackageMetadata,
    configuration: Record<string, any>,
  ): Promise<McpConnectionProfile> {
    return {
      id: `marketplace-${packageMetadata.id}`,
      name: packageMetadata.name,
      description: packageMetadata.description,
      enabled: true,
      serverType: 'custom',
      transport: {
        type: 'stdio',
        command: packageMetadata.installation.command,
        args: packageMetadata.installation.args,
      },
      credentials: {
        required: packageMetadata.configuration.required
          .filter(field => field.sensitive)
          .map(field => field.name),
        optional: packageMetadata.configuration.optional
          .filter(field => field.sensitive)
          .map(field => field.name),
      },
      capabilities: packageMetadata.capabilities,
      metadata: {
        source: 'marketplace',
        packageId: packageMetadata.id,
        version: packageMetadata.version,
        author: packageMetadata.author.name,
        configuration,
      },
    };
  }

  private async loadInstalledPackages(): Promise<void> {
    // This would load from persistent storage (database, file system, etc.)
    // For now, initialize empty
    logInfo('MCP Marketplace: Loaded installed packages', {
      operation: 'marketplace_load_packages',
      metadata: { count: this.installedPackages.size },
    });
  }

  private async saveInstalledPackages(): Promise<void> {
    // This would save to persistent storage
    logInfo('MCP Marketplace: Saved installed packages', {
      operation: 'marketplace_save_packages',
      metadata: { count: this.installedPackages.size },
    });
  }

  /**
   * Initialize default packages (auto-install on first run)
   */
  private async initializeDefaultPackages(): Promise<void> {
    try {
      for (const packageMetadata of DEFAULT_PACKAGES) {
        const isInstalled = this.installedPackages.has(packageMetadata.id);

        if (!isInstalled) {
          logInfo('MCP Marketplace: Auto-installing default package', {
            operation: 'marketplace_auto_install',
            metadata: {
              packageId: packageMetadata.id,
              packageName: packageMetadata.name,
            },
          });

          try {
            // Create installed package entry directly (simulating successful installation)
            const installedPackage: McpInstalledPackage = {
              metadata: packageMetadata,
              installationStatus: 'installed',
              installedVersion: packageMetadata.version,
              installDate: new Date().toISOString(),
              usageCount: 0,
              configuration: {},
              errors: [],
              connectionProfile: await this.createConnectionProfile(packageMetadata, {}),
            };

            this.installedPackages.set(packageMetadata.id, installedPackage);

            // Add to config manager
            if (installedPackage.connectionProfile) {
              mcpConfigManager.addCustomProfile(installedPackage.connectionProfile);
            }

            logInfo('MCP Marketplace: Default package auto-installed', {
              operation: 'marketplace_auto_install_success',
              metadata: {
                packageId: packageMetadata.id,
                capabilities: packageMetadata.capabilities,
              },
            });
          } catch (error) {
            logWarn('MCP Marketplace: Failed to auto-install default package', {
              operation: 'marketplace_auto_install_failed',
              metadata: { packageId: packageMetadata.id },
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        } else {
          logInfo('MCP Marketplace: Default package already installed', {
            operation: 'marketplace_default_already_installed',
            metadata: { packageId: packageMetadata.id },
          });
        }
      }

      // Save the updated installed packages
      await this.saveInstalledPackages();
    } catch (error) {
      logError('MCP Marketplace: Failed to initialize default packages', {
        operation: 'marketplace_default_init_failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

/**
 * Context7 MCP Package Definition
 */
export const CONTEXT7_PACKAGE: McpPackageMetadata = {
  id: 'context7-mcp',
  name: 'Context7 - Up-to-date Code Docs',
  version: 'latest',
  description:
    'Up-to-date, version-specific documentation and code examples straight from library sources. Eliminates hallucinated APIs and outdated code generation.',
  author: {
    name: 'Upstash',
    email: 'support@upstash.com',
    url: 'https://upstash.com',
  },
  homepage: 'https://context7.com',
  repository: {
    type: 'git',
    url: 'https://github.com/upstash/context7',
  },
  license: 'MIT',
  keywords: ['documentation', 'mcp', 'ai', 'coding', 'libraries', 'api-reference'],
  categories: ['documentation', 'development', 'productivity'],
  capabilities: [
    'library_documentation',
    'code_examples',
    'api_reference',
    'version_specific_docs',
    'up_to_date_info',
  ],
  requirements: {
    node: '>=18.0.0',
    system: [],
    dependencies: {},
  },
  installation: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
    postInstall: [],
  },
  configuration: {
    required: [],
    optional: [],
    examples: {
      basic: {
        description: 'Basic Context7 usage with library lookup',
        config: {},
      },
    },
  },
  pricing: {
    model: 'free',
    limits: {
      requestsPerMinute: 60,
      features: ['resolve-library-id', 'get-library-docs'],
    },
  },
  security: {
    permissions: ['network_access'],
    dataAccess: 'read',
    networkAccess: true,
    fileSystemAccess: false,
    trustLevel: 'verified',
  },
  metrics: {
    downloads: 50000,
    rating: 4.9,
    reviews: 127,
    lastUpdated: new Date().toISOString(),
    stability: 'stable',
  },
  compatibility: {
    mcpVersion: '0.5.0',
    platforms: ['linux', 'darwin', 'win32'],
    aiProviders: ['openai', 'anthropic', 'claude', 'cursor', 'vscode'],
  },
};

/**
 * Default packages that should be auto-installed
 */
export const DEFAULT_PACKAGES: McpPackageMetadata[] = [CONTEXT7_PACKAGE];

/**
 * Global marketplace service instance
 */
export const mcpMarketplace = new McpMarketplaceService();

/**
 * Utility functions for marketplace operations
 */
export const marketplaceUtils = {
  search: (query: string, filters?: McpMarketplaceFilters, context?: FeatureFlagContext) =>
    mcpMarketplace.searchPackages(query, filters, context),

  getPackageDetails: (packageId: string) => mcpMarketplace.getPackageDetails(packageId),

  install: (packageId: string, configuration?: Record<string, any>, context?: FeatureFlagContext) =>
    mcpMarketplace.installPackage(packageId, configuration, context),

  uninstall: (packageId: string, context?: FeatureFlagContext) =>
    mcpMarketplace.uninstallPackage(packageId, context),

  getInstalled: () => mcpMarketplace.getInstalledPackages(),

  updateConfig: (
    packageId: string,
    configuration: Record<string, any>,
    context?: FeatureFlagContext,
  ) => mcpMarketplace.updatePackageConfiguration(packageId, configuration, context),

  checkUpdates: () => mcpMarketplace.checkForUpdates(),
};
