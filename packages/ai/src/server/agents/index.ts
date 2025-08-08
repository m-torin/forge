/**
 * AI SDK v5 Advanced Agent Framework - Complete Enterprise System
 * Comprehensive implementation with production-ready patterns
 *
 * Core Features:
 * - stopWhen controls for agent termination
 * - experimental_prepareStep for dynamic step control
 * - Multi-step execution patterns
 * - Agent orchestration utilities
 * - Error handling and recovery
 *
 * Advanced Features:
 * - Agent memory and state management
 * - Inter-agent communication and coordination
 * - Advanced tool management with dynamic loading
 * - Comprehensive observability and debugging
 * - Configuration templates and presets
 * - Production patterns and monitoring
 * - Performance monitoring and optimization
 * - Adaptive step conditions with machine learning
 */

// Core agent framework
// Convenience factories and utilities
import {
  AgentCommunicationManager,
  communicationUtils,
  type AgentCapability,
} from './agent-communication';
import {
  agentConfigurationTemplates,
  configurationUtils,
  type AgentConfigurationTemplate,
} from './agent-configuration-templates';
import { AgentMemoryManager, memoryUtils, type AgentMemoryConfig } from './agent-memory';
import {
  AgentObservabilityManager,
  debugUtils,
  type AgentMonitoringConfig,
} from './agent-observability';
import {
  ProductionAgentLifecycleManager,
  productionUtils,
  type ProductionLifecycleConfig,
} from './production-patterns';
import { DynamicToolManager, dynamicToolUtils } from './tool-management-dynamic';

export * from './agent-controls';
export * from './agent-orchestrator';
export * from './agent-patterns';
export * from './agent-utilities';
export * from './multi-step-execution';
export * from './step-conditions';

// Performance monitoring and optimization
export * from './optimized-conditions';
export * from './performance-monitoring';

// Advanced agent capabilities
export * from './agent-communication';
export * from './agent-configuration-templates';
export * from './agent-memory';
export * from './agent-observability';
export * from './tool-management-dynamic';

// Production patterns and monitoring
export * from './production-patterns';

/**
 * Configurable Agent Factory - One-stop creation of fully-featured agents
 */
export class ConfigurableAgentFactory {
  private static instance: ConfigurableAgentFactory;
  private lifecycleManager?: ProductionAgentLifecycleManager;

  private constructor() {}

  static getInstance(): ConfigurableAgentFactory {
    if (!ConfigurableAgentFactory.instance) {
      ConfigurableAgentFactory.instance = new ConfigurableAgentFactory();
    }
    return ConfigurableAgentFactory.instance;
  }

  /**
   * Initialize the factory with production lifecycle management
   */
  initializeProduction(config?: ProductionLifecycleConfig) {
    this.lifecycleManager = new ProductionAgentLifecycleManager(
      config || productionUtils.getDefaultProductionConfig(),
    );
    return this.lifecycleManager;
  }

  /**
   * Create a complete agent with all advanced features
   */
  async createAgent(options: {
    id: string;
    template: AgentConfigurationTemplate | string;
    capabilities?: AgentCapability[];
    production?: boolean;
    customization?: {
      memory?: Partial<AgentMemoryConfig>;
      monitoring?: Partial<AgentMonitoringConfig>;
      tools?: any[];
    };
  }) {
    const template =
      typeof options.template === 'string'
        ? this.getTemplateById(options.template)
        : options.template;

    if (!template) {
      throw new Error(`Template not found: ${options.template}`);
    }

    const capabilities = options.capabilities || this.getDefaultCapabilitiesForTemplate(template);

    if (options.production && this.lifecycleManager) {
      // Create production agent with full lifecycle management
      return await this.lifecycleManager.createAgent(options.id, template, capabilities, {
        initializeBuiltInTools: true,
        memoryBackend: 'memory', // Can be configured for Redis/PostgreSQL
        communicationBackend: 'memory', // Can be configured for Redis/RabbitMQ
      });
    } else {
      // Create development/testing agent
      return this.createDevelopmentAgent(options.id, template, capabilities, options.customization);
    }
  }

  /**
   * Create a simple agent for development and testing
   */
  private createDevelopmentAgent(
    id: string,
    template: AgentConfigurationTemplate,
    capabilities: AgentCapability[],
    customization?: any,
  ) {
    // Apply customizations to template
    const customizedTemplate = customization
      ? {
          ...template,
          memoryConfig: { ...template.memoryConfig, ...customization.memory },
          monitoringConfig: { ...template.monitoringConfig, ...customization.monitoring },
        }
      : template;

    // Initialize components
    const memory = new AgentMemoryManager(id, customizedTemplate.memoryConfig);
    const communication = new AgentCommunicationManager();
    const tools = new DynamicToolManager({
      cacheEnabled: true,
      cacheTtl: 3600000,
      maxCacheSize: 100,
      performanceTracking: true,
      autoOptimization: true,
    });
    const observability = new AgentObservabilityManager(customizedTemplate.monitoringConfig);

    // Register agent
    communication.registerAgent(id, capabilities);

    // Initialize built-in tools
    dynamicToolUtils.initializeBuiltInTools(tools);

    // Add custom tools if provided
    if (customization?.tools) {
      customization.tools.forEach((tool: any) => {
        tools.registerTool(tool.implementation, tool.metadata);
      });
    }

    return {
      id,
      template: customizedTemplate,
      memory,
      communication,
      tools,
      observability,
      capabilities,

      // Convenience methods
      async processMessage(message: any, context?: any) {
        const sessionId = `session_${Date.now()}`;
        const traceId = observability.startTrace(id, sessionId);

        try {
          memory.addMessage(message);
          if (context) memory.pushContext(context);

          const relevantContext = memory.getRelevantContext(
            message.content,
            Math.floor(customizedTemplate.memoryConfig.maxEntries / 10),
          );

          // Mock response generation - integrate with your AI model
          const response = {
            role: 'assistant' as const,
            content: `Processed message: "${message.content}" with ${relevantContext.length} context items.`,
          };

          memory.addMessage(response);

          observability.stopTrace(traceId, {
            steps: [{ stepNumber: 1, result: 'Message processed' }],
            finalResult: { text: response.content, finishReason: 'stop' },
            totalTokensUsed: 100,
            executionTime: 1000,
            stoppedBy: 'completed',
            metadata: {},
          });

          return response;
        } catch (error) {
          observability.recordEvent({
            agentId: id,
            sessionId,
            type: 'error',
            level: 'error',
            message: 'Error processing message',
            data: { error: error instanceof Error ? error.message : 'Unknown error' },
            tags: ['processing', 'error'],
          });
          throw error;
        }
      },

      getMetrics() {
        return {
          memory: memory.getMemoryMetrics(),
          communication: communication.getCommunicationMetrics(),
          tools: tools.generateUsageReport(),
          observability: observability.getPerformanceMetrics(id),
        };
      },

      exportState() {
        return {
          snapshot: memory.createSnapshot(`export_${Date.now()}`),
          debugData: observability.exportDebugData(id),
          toolMetrics: tools.generateUsageReport(),
        };
      },
    };
  }

  /**
   * Get template by ID
   */
  private getTemplateById(templateId: string): AgentConfigurationTemplate | null {
    const templates = Object.values(agentConfigurationTemplates);
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * Get default capabilities for a template
   */
  private getDefaultCapabilitiesForTemplate(
    template: AgentConfigurationTemplate,
  ): AgentCapability[] {
    const capabilityMap: Record<string, AgentCapability[]> = {
      customer_support_agent: [
        communicationUtils.createCapability('customer_interaction', 'Handle customer inquiries', {
          quality: 0.9,
        }),
        communicationUtils.createCapability('knowledge_search', 'Search knowledge base', {
          quality: 0.85,
        }),
      ],
      research_assistant_agent: [
        communicationUtils.createCapability('research_analysis', 'Conduct research analysis', {
          quality: 0.95,
        }),
        communicationUtils.createCapability('data_synthesis', 'Synthesize research data', {
          quality: 0.9,
        }),
      ],
      code_development_agent: [
        communicationUtils.createCapability('code_generation', 'Generate code implementations', {
          quality: 0.9,
        }),
        communicationUtils.createCapability('code_review', 'Review code quality', {
          quality: 0.95,
        }),
      ],
      content_creation_agent: [
        communicationUtils.createCapability('content_writing', 'Create written content', {
          quality: 0.85,
        }),
        communicationUtils.createCapability(
          'content_optimization',
          'Optimize content for engagement',
          { quality: 0.8 },
        ),
      ],
      data_analysis_agent: [
        communicationUtils.createCapability(
          'statistical_analysis',
          'Perform statistical analysis',
          { quality: 0.95 },
        ),
        communicationUtils.createCapability('data_visualization', 'Create data visualizations', {
          quality: 0.85,
        }),
      ],
    };

    return capabilityMap[template.id] || [];
  }

  /**
   * Get production lifecycle manager
   */
  getLifecycleManager(): ProductionAgentLifecycleManager | undefined {
    return this.lifecycleManager;
  }

  /**
   * Shutdown factory and all managed resources
   */
  async shutdown() {
    if (this.lifecycleManager) {
      await this.lifecycleManager.destroy();
    }
  }
}

/**
 * Agent Framework Utilities - Helper functions for common operations
 */
export const agentFrameworkUtils = {
  // Quick agent creation
  createQuickAgent: async (
    type: 'support' | 'research' | 'development' | 'content' | 'analysis',
  ) => {
    const factory = ConfigurableAgentFactory.getInstance();
    const templateMap = {
      support: 'customer_support_agent',
      research: 'research_assistant_agent',
      development: 'code_development_agent',
      content: 'content_creation_agent',
      analysis: 'data_analysis_agent',
    };

    return await factory.createAgent({
      id: `${type}-agent-${Date.now()}`,
      template: templateMap[type],
      production: false,
    });
  },

  // Validation utilities
  validateAgentConfiguration: (template: AgentConfigurationTemplate) => {
    return configurationUtils.validateTemplate(template);
  },

  // Memory utilities
  createOptimizedMemoryConfig: (type: 'chat' | 'research' | 'longRunning') => {
    return memoryUtils.createMemoryConfig(type);
  },

  // Debug utilities
  createDebugSession: (agentId: string, observability: AgentObservabilityManager) => {
    return debugUtils.formatDebugContext(
      observability.createDebugContext(agentId, `debug_${Date.now()}`),
    );
  },

  // Performance analysis
  analyzeAgentPerformance: (snapshots: any[]) => {
    return debugUtils.generatePerformanceInsights(snapshots);
  },

  // Error analysis
  analyzeErrors: (events: any[]) => {
    return debugUtils.analyzeErrorPatterns(events);
  },

  // Configuration helpers
  applyEnvironmentOverrides: (
    template: AgentConfigurationTemplate,
    environment: 'development' | 'staging' | 'production',
  ) => {
    return configurationUtils.applyEnvironmentOverrides(template, environment);
  },

  // Documentation generation
  generateAgentDocumentation: (template: AgentConfigurationTemplate) => {
    return configurationUtils.generateTemplateDocumentation(template);
  },

  // System health checks
  performSystemHealthCheck: (lifecycleManager: ProductionAgentLifecycleManager) => {
    return lifecycleManager.getSystemHealth();
  },

  // Export/import utilities
  exportAgentState: (agent: any) => {
    return agent.exportState ? agent.exportState() : null;
  },

  // Built-in tool management
  initializeBuiltInTools: (toolManager: DynamicToolManager) => {
    return dynamicToolUtils.initializeBuiltInTools(toolManager);
  },

  // Communication setup
  setupMultiAgentCommunication: (agents: any[]) => {
    const communicationManager = new AgentCommunicationManager();

    agents.forEach(agent => {
      if (agent.capabilities) {
        communicationManager.registerAgent(agent.id, agent.capabilities);
      }
    });

    return communicationManager;
  },
};

/**
 * Global agent registry for singleton access patterns
 */
export class GlobalAgentRegistry {
  private static instance: GlobalAgentRegistry;
  private agents = new Map<string, any>();
  private factory: ConfigurableAgentFactory;

  private constructor() {
    this.factory = ConfigurableAgentFactory.getInstance();
  }

  static getInstance(): GlobalAgentRegistry {
    if (!GlobalAgentRegistry.instance) {
      GlobalAgentRegistry.instance = new GlobalAgentRegistry();
    }
    return GlobalAgentRegistry.instance;
  }

  async registerAgent(id: string, template: AgentConfigurationTemplate | string, options?: any) {
    const agent = await this.factory.createAgent({
      id,
      template,
      ...options,
    });

    this.agents.set(id, agent);
    return agent;
  }

  getAgent(id: string) {
    return this.agents.get(id);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  async removeAgent(id: string) {
    const agent = this.agents.get(id);
    if (agent && agent.shutdown) {
      await agent.shutdown();
    }
    this.agents.delete(id);
  }

  async shutdown() {
    const shutdownPromises = Array.from(this.agents.values()).map(agent =>
      agent.shutdown ? agent.shutdown() : Promise.resolve(),
    );
    await Promise.all(shutdownPromises);
    this.agents.clear();
    await this.factory.shutdown();
  }
}

// Export convenience instances
export const agentFactory = ConfigurableAgentFactory.getInstance();
export const globalAgentRegistry = GlobalAgentRegistry.getInstance();

// Export built-in templates for easy access
export { agentConfigurationTemplates as templates };

// Export production utilities
export { productionUtils };

/**
 * Framework version and metadata
 */
export const frameworkMetadata = {
  version: '1.0.0',
  features: [
    'Advanced Memory Management',
    'Inter-Agent Communication',
    'Dynamic Tool Management',
    'Comprehensive Observability',
    'Configuration Templates',
    'Production Patterns',
    'Multi-Step Execution',
    'Performance Monitoring & Optimization',
    'Adaptive Machine Learning Conditions',
  ],
  supportedEnvironments: ['development', 'staging', 'production'],
  compatibility: {
    aiSdk: '>=5.0.0',
    typescript: '>=5.0.0',
    node: '>=18.0.0',
  },
};
