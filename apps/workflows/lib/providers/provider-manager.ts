import { type BaseWorkflowProvider, type ExecutionOptions, type QueueStats, type ScheduleOptions } from './base-provider'
import { LocalProvider } from './local-provider'
import { QStashProvider } from './qstash-provider'

export type ProviderType = 'qstash' | 'local' | 'auto'

export interface ProviderConfig {
  default: ProviderType
  enabledProviders: ProviderType[]
  fallback?: ProviderType
  preferLocal?: boolean
}

export class WorkflowProviderManager {
  private providers = new Map<string, BaseWorkflowProvider>()
  private config: ProviderConfig
  private defaultProvider: BaseWorkflowProvider | null = null

  constructor(config: ProviderConfig) {
    this.config = config
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Initialize enabled providers
    this.config.enabledProviders.forEach(type => {
      if (type === 'auto') return // Skip auto, it's handled by selection logic
      
      try {
        let provider: BaseWorkflowProvider
        
        switch (type) {
          case 'qstash':
            provider = new QStashProvider()
            break
          case 'local':
            provider = new LocalProvider()
            break
          default:
            console.warn(`Unknown provider type: ${type}`)
            return
        }

        this.providers.set(type, provider)
        console.log(`Initialized ${type} provider`)
      } catch (error) {
        console.error(`Failed to initialize ${type} provider:`, error)
      }
    })

    // Set default provider
    this.setDefaultProvider()
  }

  private setDefaultProvider(): void {
    if (this.config.default === 'auto') {
      // Auto-select based on environment and available providers
      this.defaultProvider = this.selectAutoProvider()
    } else {
      this.defaultProvider = this.providers.get(this.config.default) || null
    }

    if (!this.defaultProvider && this.config.fallback) {
      this.defaultProvider = this.providers.get(this.config.fallback) || null
    }

    if (!this.defaultProvider) {
      throw new Error('No valid providers available')
    }

    console.log(`Default provider set to: ${this.defaultProvider.name}`)
  }

  private selectAutoProvider(): BaseWorkflowProvider | null {
    // Prefer local in development, QStash in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment && this.config.preferLocal && this.providers.has('local')) {
      return this.providers.get('local') || null
    }

    if (this.providers.has('qstash')) {
      return this.providers.get('qstash') || null
    }

    if (this.providers.has('local')) {
      return this.providers.get('local') || null
    }

    return null
  }

  async initialize(): Promise<void> {
    // Initialize all providers
    const initPromises = Array.from(this.providers.values()).map(async provider => {
      if (provider.initialize) {
        try {
          await provider.initialize()
          console.log(`Provider ${provider.name} initialized successfully`)
        } catch (error) {
          console.error(`Failed to initialize provider ${provider.name}:`, error)
        }
      }
    })

    await Promise.all(initPromises)
    console.log('All providers initialized')
  }

  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.providers.values()).map(async provider => {
      if (provider.shutdown) {
        try {
          await provider.shutdown()
          console.log(`Provider ${provider.name} shutdown successfully`)
        } catch (error) {
          console.error(`Failed to shutdown provider ${provider.name}:`, error)
        }
      }
    })

    await Promise.all(shutdownPromises)
    console.log('All providers shutdown')
  }

  // Provider selection and execution
  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ExecutionOptions & { provider?: ProviderType } = {}
  ): Promise<{ executionId: string; messageId?: string; provider: string }> {
    const provider = this.selectProvider(options.provider, options)
    
    if (!provider) {
      throw new Error('No suitable provider available for execution')
    }

    try {
      const result = await provider.executeWorkflow(workflowId, input, options)
      return {
        ...result,
        provider: provider.name
      }
    } catch (error) {
      // Try fallback provider if available
      if (this.config.fallback && provider.name !== this.config.fallback) {
        const fallbackProvider = this.providers.get(this.config.fallback)
        if (fallbackProvider && fallbackProvider.isCapable('supportsRetries')) {
          console.log(`Falling back to ${this.config.fallback} provider`)
          const result = await fallbackProvider.executeWorkflow(workflowId, input, options)
          return {
            ...result,
            provider: fallbackProvider.name
          }
        }
      }
      throw error
    }
  }

  async scheduleWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ScheduleOptions & { provider?: ProviderType }
  ): Promise<{ scheduleId: string; provider: string }> {
    const provider = this.selectProvider(options.provider, options)
    
    if (!provider || !provider.scheduleWorkflow) {
      throw new Error('No suitable provider available for scheduling')
    }

    if (!provider.isCapable('supportsScheduling')) {
      throw new Error(`Provider ${provider.name} does not support scheduling`)
    }

    const result = await provider.scheduleWorkflow(workflowId, input, options)
    return {
      ...result,
      provider: provider.name
    }
  }

  async cancelWorkflow(executionId: string, providerHint?: ProviderType): Promise<void> {
    // Try specific provider first if hint provided
    if (providerHint) {
      const provider = this.providers.get(providerHint)
      if (provider) {
        try {
          await provider.cancelWorkflow(executionId)
          return
        } catch (error) {
          console.warn(`Failed to cancel with ${providerHint} provider, trying others`)
        }
      }
    }

    // Try all providers that support cancellation
    const errors: Error[] = []
    for (const provider of this.providers.values()) {
      if (provider.isCapable('supportsCancellation')) {
        try {
          await provider.cancelWorkflow(executionId)
          return
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error('Unknown error'))
        }
      }
    }

    throw new Error(`Failed to cancel execution ${executionId}. Errors: ${errors.map(e => e.message).join(', ')}`)
  }

  // Provider selection logic
  private selectProvider(
    requestedProvider?: ProviderType, 
    options?: ExecutionOptions
  ): BaseWorkflowProvider | null {
    // Use requested provider if specified and available
    if (requestedProvider && requestedProvider !== 'auto') {
      const provider = this.providers.get(requestedProvider)
      if (provider) {
        this.validateProviderCapabilities(provider, options)
        return provider
      }
    }

    // Auto-select based on requirements
    if (options) {
      // If scheduling is needed, filter providers that support it
      if ('cron' in options) {
        for (const provider of this.providers.values()) {
          if (provider.isCapable('supportsScheduling')) {
            this.validateProviderCapabilities(provider, options)
            return provider
          }
        }
      }

      // If priority is specified, prefer providers that support it
      if (options.priority) {
        for (const provider of this.providers.values()) {
          if (provider.isCapable('supportsPriority')) {
            this.validateProviderCapabilities(provider, options)
            return provider
          }
        }
      }
    }

    // Fall back to default provider
    if (this.defaultProvider) {
      this.validateProviderCapabilities(this.defaultProvider, options)
      return this.defaultProvider
    }

    return null
  }

  private validateProviderCapabilities(provider: BaseWorkflowProvider, options?: ExecutionOptions): void {
    if (options) {
      try {
        provider.validateOptions(options)
      } catch (error) {
        throw new Error(`Provider ${provider.name} validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // Monitoring and metrics
  async getAggregatedStats(): Promise<{
    byProvider: Record<string, QueueStats>
    total: QueueStats
  }> {
    const byProvider: Record<string, QueueStats> = {}
    let totalPending = 0
    let totalDlq = 0
    let totalProcessed = 0

    for (const [name, provider] of this.providers) {
      try {
        const stats = await provider.getQueueStats()
        byProvider[name] = stats
        totalPending += stats.pendingMessages
        totalDlq += stats.dlqMessages
        totalProcessed += stats.totalProcessed
      } catch (error) {
        console.error(`Failed to get stats from ${name} provider:`, error)
        byProvider[name] = { dlqMessages: 0, pendingMessages: 0, totalProcessed: 0 }
      }
    }

    return {
      byProvider,
      total: {
        dlqMessages: totalDlq,
        pendingMessages: totalPending,
        totalProcessed: totalProcessed
      }
    }
  }

  async healthCheck(): Promise<{
    overall: boolean
    providers: Record<string, boolean>
  }> {
    const providers: Record<string, boolean> = {}
    let overallHealthy = true

    for (const [name, provider] of this.providers) {
      try {
        providers[name] = await provider.healthCheck()
        if (!providers[name]) {
          overallHealthy = false
        }
      } catch (error) {
        console.error(`Health check failed for ${name} provider:`, error)
        providers[name] = false
        overallHealthy = false
      }
    }

    return { providers, overall: overallHealthy }
  }

  // Provider management
  getProvider(name: string): BaseWorkflowProvider | undefined {
    return this.providers.get(name)
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  getDefaultProvider(): BaseWorkflowProvider | null {
    return this.defaultProvider
  }

  getProviderCapabilities(): Record<string, any> {
    const capabilities: Record<string, any> = {}
    
    for (const [name, provider] of this.providers) {
      capabilities[name] = {
        ...provider.capabilities,
        name: provider.name
      }
    }

    return capabilities
  }
}

// Default configuration
export const defaultProviderConfig: ProviderConfig = {
  enabledProviders: ['qstash', 'local'],
  default: 'auto',
  fallback: 'local',
  preferLocal: true
}

// Singleton instance
export const providerManager = new WorkflowProviderManager(defaultProviderConfig)