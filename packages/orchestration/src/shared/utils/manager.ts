/**
 * Orchestration Manager - Core orchestration for multi-provider workflow execution
 */

import type {
  WorkflowProvider,
  WorkflowDefinition,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
} from '../types/workflow';
import type {
  ProviderConfig,
  ProviderFactory,
  ProviderRegistryEntry,
  ProviderSelectionCriteria,
} from '../types/provider';
import {
  OrchestrationError,
  ProviderNotFoundError,
  ProviderInitializationError,
  ProviderNotAvailableError,
  ConfigurationError,
} from './errors';

export interface OrchestrationConfig {
  /**
   * Provider configurations
   */
  providers: Record<string, ProviderConfig>;
  
  /**
   * Default provider to use
   */
  defaultProvider?: string;
  
  /**
   * Provider selection strategy
   */
  selectionStrategy?: 'default' | 'round-robin' | 'least-loaded' | 'criteria-based';
  
  /**
   * Enable debug logging
   */
  debug?: boolean;
  
  /**
   * Error handler
   */
  onError?: (error: Error, context: any) => void;
  
  /**
   * Info logger
   */
  onInfo?: (message: string, data?: any) => void;
  
  /**
   * Warn logger
   */
  onWarn?: (message: string, data?: any) => void;
}

export class OrchestrationManager {
  private providers = new Map<string, WorkflowProvider>();
  private providerRegistry = new Map<string, ProviderRegistryEntry>();
  private isInitialized = false;
  private currentProviderIndex = 0;
  
  constructor(
    private config: OrchestrationConfig,
    availableProviders?: Record<string, ProviderRegistryEntry>
  ) {
    // Register available providers
    if (availableProviders) {
      for (const [name, entry] of Object.entries(availableProviders)) {
        this.providerRegistry.set(name, entry);
      }
    }
  }
  
  /**
   * Register a new provider factory
   */
  registerProvider(name: string, entry: ProviderRegistryEntry): void {
    this.providerRegistry.set(name, entry);
  }
  
  /**
   * Initialize all configured providers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    const initPromises: Promise<void>[] = [];
    
    for (const [providerName, providerConfig] of Object.entries(this.config.providers)) {
      const registryEntry = this.providerRegistry.get(providerConfig.name);
      
      if (!registryEntry) {
        const error = new ProviderNotFoundError(providerConfig.name);
        if (this.config.onError) {
          this.config.onError(error, { provider: providerConfig.name });
        }
        continue;
      }
      
      try {
        // Validate configuration if schema provided
        if (registryEntry.configSchema) {
          const result = registryEntry.configSchema.safeParse(providerConfig);
          if (!result.success) {
            throw new ConfigurationError(
              providerConfig.name,
              'Invalid provider configuration',
              { errors: result.error.errors }
            );
          }
        }
        
        // Create provider instance
        const provider = await registryEntry.factory(providerConfig);
        this.providers.set(providerName, provider);
        
        // Initialize provider with error boundary
        initPromises.push(
          provider.initialize(providerConfig).catch(error => {
            const wrappedError = new ProviderInitializationError(
              providerConfig.name,
              error.message,
              { originalError: error }
            );
            
            if (this.config.onError) {
              this.config.onError(wrappedError, { 
                provider: providerName, 
                method: 'initialize' 
              });
            }
            
            // Remove failed provider
            this.providers.delete(providerName);
          })
        );
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        const wrappedError = error instanceof OrchestrationError
          ? error
          : new ProviderInitializationError(
              providerConfig.name,
              errorObj.message,
              { originalError: errorObj }
            );
        
        if (this.config.onError) {
          this.config.onError(wrappedError, { 
            provider: providerName, 
            method: 'create' 
          });
        }
      }
    }
    
    // Wait for all providers to initialize
    await Promise.allSettled(initPromises);
    
    // Check if at least one provider is available
    const availableProviders = [];
    for (const [name, provider] of this.providers.entries()) {
      if (await provider.isAvailable()) {
        availableProviders.push(name);
      } else {
        this.providers.delete(name);
        if (this.config.onWarn) {
          this.config.onWarn(`Provider "${name}" is not available`);
        }
      }
    }
    
    if (availableProviders.length === 0) {
      throw new OrchestrationError(
        'No providers available after initialization',
        'NO_PROVIDERS_AVAILABLE'
      );
    }
    
    this.isInitialized = true;
    
    if (this.config.debug && this.config.onInfo) {
      this.config.onInfo(
        `Orchestration initialized with providers: ${availableProviders.join(', ')}`
      );
    }
  }
  
  /**
   * Execute a workflow using the selected provider
   */
  async run<TParams = any, TResult = any>(
    workflow: WorkflowDefinition<TParams, TResult>,
    params: TParams,
    options?: WorkflowExecutionOptions & { provider?: string }
  ): Promise<WorkflowExecutionResult<TResult>> {
    if (!this.isInitialized) {
      throw new OrchestrationError(
        'Orchestration manager not initialized',
        'NOT_INITIALIZED'
      );
    }
    
    // Select provider
    const provider = await this.selectProvider(options?.provider);
    
    if (!provider) {
      throw new ProviderNotAvailableError('No available provider found');
    }
    
    try {
      // Execute workflow
      const result = await provider.run(workflow, params, options);
      
      if (this.config.debug && this.config.onInfo) {
        this.config.onInfo(`Workflow "${workflow.id}" executed successfully`, {
          provider: provider.name,
          runId: result.runId,
          status: result.status,
        });
      }
      
      return result;
    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error instanceof Error ? error : new Error(String(error)), {
          provider: provider.name,
          workflow: workflow.id,
          method: 'run',
        });
      }
      throw error;
    }
  }
  
  /**
   * Create a workflow handler for serving
   */
  serve<TParams = any, TResult = any>(
    workflow: WorkflowDefinition<TParams, TResult>,
    providerName?: string
  ): (req: Request) => Promise<Response> {
    return async (req: Request) => {
      if (!this.isInitialized) {
        return new Response(
          JSON.stringify({ error: 'Orchestration manager not initialized' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        const provider = await this.selectProvider(providerName);
        
        if (!provider) {
          return new Response(
            JSON.stringify({ error: 'No available provider found' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const handler = provider.serve(workflow);
        return handler(req);
      } catch (error) {
        if (this.config.onError) {
          this.config.onError(error instanceof Error ? error : new Error(String(error)), {
            workflow: workflow.id,
            method: 'serve',
          });
        }
        
        return new Response(
          JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    };
  }
  
  /**
   * Get workflow execution status
   */
  async getStatus(
    runId: string,
    providerName?: string
  ): Promise<WorkflowExecutionResult> {
    if (!this.isInitialized) {
      throw new OrchestrationError(
        'Orchestration manager not initialized',
        'NOT_INITIALIZED'
      );
    }
    
    // If provider specified, use it
    if (providerName) {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new ProviderNotFoundError(providerName);
      }
      return provider.getStatus(runId);
    }
    
    // Otherwise, try all providers
    const errors: Error[] = [];
    
    for (const [name, provider] of this.providers.entries()) {
      try {
        const result = await provider.getStatus(runId);
        return result;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
        // Continue trying other providers
      }
    }
    
    throw new OrchestrationError(
      `Workflow run "${runId}" not found in any provider`,
      'RUN_NOT_FOUND',
      { errors }
    );
  }
  
  /**
   * Cancel a running workflow
   */
  async cancel(runId: string, providerName?: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new OrchestrationError(
        'Orchestration manager not initialized',
        'NOT_INITIALIZED'
      );
    }
    
    // If provider specified, use it
    if (providerName) {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new ProviderNotFoundError(providerName);
      }
      return provider.cancel(runId);
    }
    
    // Otherwise, try all providers
    for (const [name, provider] of this.providers.entries()) {
      try {
        const result = await provider.cancel(runId);
        if (result) return true;
      } catch (error) {
        // Continue trying other providers
      }
    }
    
    return false;
  }
  
  /**
   * List workflow executions
   */
  async list(
    options?: {
      workflowId?: string;
      status?: WorkflowExecutionResult['status'];
      limit?: number;
      offset?: number;
      provider?: string;
    }
  ): Promise<WorkflowExecutionResult[]> {
    if (!this.isInitialized) {
      throw new OrchestrationError(
        'Orchestration manager not initialized',
        'NOT_INITIALIZED'
      );
    }
    
    // If provider specified, use it
    if (options?.provider) {
      const provider = this.providers.get(options.provider);
      if (!provider) {
        throw new ProviderNotFoundError(options.provider);
      }
      return provider.list(options);
    }
    
    // Otherwise, aggregate from all providers
    const allResults: WorkflowExecutionResult[] = [];
    
    for (const [name, provider] of this.providers.entries()) {
      try {
        const results = await provider.list(options);
        allResults.push(...results);
      } catch (error) {
        if (this.config.onWarn) {
          this.config.onWarn(`Failed to list workflows from provider "${name}"`, error);
        }
      }
    }
    
    // Sort by start time (newest first)
    allResults.sort((a, b) => {
      const aTime = a.timing.startedAt?.getTime() || 0;
      const bTime = b.timing.startedAt?.getTime() || 0;
      return bTime - aTime;
    });
    
    // Apply limit and offset
    const start = options?.offset || 0;
    const end = options?.limit ? start + options.limit : undefined;
    
    return allResults.slice(start, end);
  }
  
  /**
   * Get active providers
   */
  getActiveProviders(): string[] {
    return Array.from(this.providers.keys());
  }
  
  /**
   * Get a specific provider
   */
  getProvider(name: string): WorkflowProvider | undefined {
    return this.providers.get(name);
  }
  
  /**
   * Clean up all providers
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];
    
    for (const [name, provider] of this.providers.entries()) {
      cleanupPromises.push(
        provider.cleanup().catch(error => {
          if (this.config.onError) {
            this.config.onError(error instanceof Error ? error : new Error(String(error)), { provider: name, method: 'cleanup' });
          }
        })
      );
    }
    
    await Promise.allSettled(cleanupPromises);
    this.providers.clear();
    this.isInitialized = false;
  }
  
  /**
   * Select a provider based on strategy
   */
  private async selectProvider(
    requestedProvider?: string,
    criteria?: ProviderSelectionCriteria
  ): Promise<WorkflowProvider | null> {
    // If specific provider requested, use it
    if (requestedProvider) {
      const provider = this.providers.get(requestedProvider);
      if (!provider) {
        throw new ProviderNotFoundError(requestedProvider);
      }
      
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new ProviderNotAvailableError(requestedProvider);
      }
      
      return provider;
    }
    
    // Get all available providers
    const availableProviders: Array<[string, WorkflowProvider]> = [];
    
    for (const [name, provider] of this.providers.entries()) {
      if (await provider.isAvailable()) {
        availableProviders.push([name, provider]);
      }
    }
    
    if (availableProviders.length === 0) {
      return null;
    }
    
    // Apply selection strategy
    const strategy = this.config.selectionStrategy || 'default';
    
    switch (strategy) {
      case 'default':
        // Use default provider if specified
        if (this.config.defaultProvider) {
          const defaultEntry = availableProviders.find(
            ([name]) => name === this.config.defaultProvider
          );
          if (defaultEntry) return defaultEntry[1];
        }
        // Otherwise use first available
        return availableProviders[0][1];
      
      case 'round-robin':
        // Rotate through providers
        const selected = availableProviders[this.currentProviderIndex % availableProviders.length];
        this.currentProviderIndex++;
        return selected[1];
      
      case 'least-loaded':
        // TODO: Implement load tracking
        return availableProviders[0][1];
      
      case 'criteria-based':
        // TODO: Implement criteria matching
        if (criteria) {
          // Match providers based on criteria
          // For now, just return first available
        }
        return availableProviders[0][1];
      
      default:
        return availableProviders[0][1];
    }
  }
}

/**
 * Factory function to create orchestration manager
 */
export function createOrchestrationManager(
  config: OrchestrationConfig,
  providers?: Record<string, ProviderRegistryEntry>
): OrchestrationManager {
  return new OrchestrationManager(config, providers);
}