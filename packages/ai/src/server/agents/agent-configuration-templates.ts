/**
 * AI SDK v5 Agent Configuration Templates and Presets
 * Pre-built configuration templates for common agent patterns and use cases
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { agentControlPresets } from './agent-controls';
import type { AgentMemoryConfig } from './agent-memory';
import { memoryUtils } from './agent-memory';
import type { AgentMonitoringConfig } from './agent-observability';
import type { AgentDefinition } from './agent-orchestrator';
import type { MultiStepConfig } from './multi-step-execution';
import { hasToolCall, stepCountAtMost, stopWhenPresets, textContains } from './step-conditions';

/**
 * Agent use case categories
 */
export type AgentUseCase =
  | 'customer_support'
  | 'content_creation'
  | 'data_analysis'
  | 'research_assistant'
  | 'code_development'
  | 'project_management'
  | 'quality_assurance'
  | 'educational_tutor'
  | 'sales_assistant'
  | 'workflow_automation'
  | 'decision_support'
  | 'creative_writing'
  | 'technical_documentation'
  | 'competitive_analysis'
  | 'risk_assessment';

/**
 * Agent complexity levels
 */
export type AgentComplexity = 'simple' | 'intermediate' | 'advanced' | 'expert';

/**
 * Agent deployment environment
 */
export type DeploymentEnvironment = 'development' | 'staging' | 'production';

/**
 * Complete agent configuration template
 */
export interface AgentConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  useCase: AgentUseCase;
  complexity: AgentComplexity;
  version: string;
  author: string;
  tags: string[];

  // Core configuration
  coreConfig: MultiStepConfig;

  // Extended configuration
  memoryConfig: AgentMemoryConfig;
  monitoringConfig: AgentMonitoringConfig;

  // Recommended tools
  recommendedTools: string[];
  requiredCapabilities: string[];

  // Environment-specific overrides
  environmentOverrides: {
    [K in DeploymentEnvironment]?: Partial<MultiStepConfig>;
  };

  // Usage guidelines
  usageGuidelines: {
    bestPractices: string[];
    commonPitfalls: string[];
    scalingConsiderations: string[];
  };

  // Performance expectations
  performanceBaseline: {
    averageExecutionTime: number;
    averageTokenUsage: number;
    expectedSuccessRate: number;
    resourceRequirements: {
      cpu: 'low' | 'medium' | 'high';
      memory: 'low' | 'medium' | 'high';
      network: 'low' | 'medium' | 'high';
    };
  };
}

/**
 * Configuration template builder
 */
export class AgentConfigurationBuilder {
  private template: Partial<AgentConfigurationTemplate> = {};

  /**
   * Set basic template information
   */
  setBasicInfo(info: {
    id: string;
    name: string;
    description: string;
    useCase: AgentUseCase;
    complexity: AgentComplexity;
  }): this {
    Object.assign(this.template, info);
    return this;
  }

  /**
   * Configure core agent settings
   */
  setCoreConfig(config: Partial<MultiStepConfig>): this {
    this.template.coreConfig = {
      maxSteps: 10,
      temperature: 0.7,
      ...config,
    } as MultiStepConfig;
    return this;
  }

  /**
   * Configure memory settings
   */
  setMemoryConfig(config: Partial<AgentMemoryConfig>): this {
    this.template.memoryConfig = {
      maxEntries: 1000,
      retentionDays: 7,
      compressionThreshold: 200,
      indexingEnabled: true,
      persistenceEnabled: false,
      searchEnabled: true,
      ...config,
    };
    return this;
  }

  /**
   * Configure monitoring settings
   */
  setMonitoringConfig(config: Partial<AgentMonitoringConfig>): this {
    this.template.monitoringConfig = {
      enableTracing: true,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      traceLevel: 'info',
      retentionDays: 7,
      maxTraceEvents: 1000,
      performanceSnapshotInterval: 60000,
      healthCheckInterval: 300000,
      alertThresholds: {
        maxExecutionTime: 300000,
        maxTokenUsage: 50000,
        minSuccessRate: 0.8,
        maxErrorRate: 0.2,
      },
      ...config,
    };
    return this;
  }

  /**
   * Set recommended tools and capabilities
   */
  setRecommendations(recommendations: { tools?: string[]; capabilities?: string[] }): this {
    this.template.recommendedTools = recommendations.tools || [];
    this.template.requiredCapabilities = recommendations.capabilities || [];
    return this;
  }

  /**
   * Set environment-specific overrides
   */
  setEnvironmentOverrides(overrides: AgentConfigurationTemplate['environmentOverrides']): this {
    this.template.environmentOverrides = overrides;
    return this;
  }

  /**
   * Set usage guidelines
   */
  setUsageGuidelines(guidelines: AgentConfigurationTemplate['usageGuidelines']): this {
    this.template.usageGuidelines = guidelines;
    return this;
  }

  /**
   * Set performance baseline
   */
  setPerformanceBaseline(baseline: AgentConfigurationTemplate['performanceBaseline']): this {
    this.template.performanceBaseline = baseline;
    return this;
  }

  /**
   * Build the configuration template
   */
  build(): AgentConfigurationTemplate {
    if (!this.template.id || !this.template.name || !this.template.coreConfig) {
      throw new Error('Missing required template configuration');
    }

    return {
      version: '1.0.0',
      author: 'system',
      tags: [],
      memoryConfig: memoryUtils.createMemoryConfig('chat'),
      monitoringConfig: {
        enableTracing: true,
        enablePerformanceTracking: true,
        enableHealthChecks: true,
        traceLevel: 'info',
        retentionDays: 7,
        maxTraceEvents: 1000,
        performanceSnapshotInterval: 60000,
        healthCheckInterval: 300000,
        alertThresholds: {
          maxExecutionTime: 300000,
          maxTokenUsage: 50000,
          minSuccessRate: 0.8,
          maxErrorRate: 0.2,
        },
      },
      recommendedTools: [],
      requiredCapabilities: [],
      environmentOverrides: {},
      usageGuidelines: {
        bestPractices: [],
        commonPitfalls: [],
        scalingConsiderations: [],
      },
      performanceBaseline: {
        averageExecutionTime: 30000,
        averageTokenUsage: 5000,
        expectedSuccessRate: 0.9,
        resourceRequirements: {
          cpu: 'medium',
          memory: 'medium',
          network: 'low',
        },
      },
      ...this.template,
    } as AgentConfigurationTemplate;
  }
}

/**
 * Pre-built configuration templates
 */
export const agentConfigurationTemplates = {
  /**
   * Customer Support Agent Template
   */
  customerSupport: new AgentConfigurationBuilder()
    .setBasicInfo({
      id: 'customer_support_agent',
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries with empathy and efficiency',
      useCase: 'customer_support',
      complexity: 'intermediate',
    })
    .setCoreConfig({
      model: openai('gpt-4o'),
      maxSteps: 8,
      temperature: 0.6,
      system: `You are a professional customer support agent. Your goals are to:
1. Listen actively and understand customer concerns
2. Provide accurate and helpful information
3. Resolve issues efficiently while maintaining a positive tone
4. Escalate complex issues when necessary
5. Follow up to ensure customer satisfaction

Always be empathetic, professional, and solution-focused.`,
      stopWhen: [
        stepCountAtMost(8),
        hasToolCall('create_ticket'),
        hasToolCall('escalate_to_human'),
        textContains('issue resolved'),
      ],
    })
    .setMemoryConfig(memoryUtils.createMemoryConfig('chat'))
    .setRecommendations({
      tools: ['knowledge_base_search', 'create_ticket', 'escalate_to_human', 'customer_history'],
      capabilities: ['empathy', 'problem_solving', 'communication'],
    })
    .setUsageGuidelines({
      bestPractices: [
        'Always acknowledge customer emotions',
        'Use clear, non-technical language',
        'Provide step-by-step solutions',
        'Follow up on resolutions',
      ],
      commonPitfalls: [
        'Being too robotic or formal',
        'Not asking clarifying questions',
        'Escalating too quickly or too late',
      ],
      scalingConsiderations: [
        'Monitor response times during peak hours',
        'Implement auto-categorization for common issues',
        'Regular training on new products/policies',
      ],
    })
    .setPerformanceBaseline({
      averageExecutionTime: 45000,
      averageTokenUsage: 3000,
      expectedSuccessRate: 0.85,
      resourceRequirements: { cpu: 'medium', memory: 'low', network: 'medium' },
    })
    .build(),

  /**
   * Research Assistant Agent Template
   */
  researchAssistant: new AgentConfigurationBuilder()
    .setBasicInfo({
      id: 'research_assistant_agent',
      name: 'Research Assistant Agent',
      description: 'Conducts comprehensive research and analysis',
      useCase: 'research_assistant',
      complexity: 'advanced',
    })
    .setCoreConfig({
      model: anthropic('claude-3-5-sonnet-20241022'),
      maxSteps: 20,
      temperature: 0.3,
      system: `You are a professional research assistant. Your methodology:
1. Understand the research question thoroughly
2. Plan a comprehensive research strategy
3. Gather information from multiple reliable sources
4. Analyze and synthesize findings critically
5. Verify facts and cross-reference claims
6. Present findings with proper citations
7. Provide actionable insights and recommendations

Always be thorough, objective, and evidence-based.`,
      stopWhen: stopWhenPresets.research,
      prepareStep: agentControlPresets.researchAgent,
    })
    .setMemoryConfig(memoryUtils.createMemoryConfig('research'))
    .setRecommendations({
      tools: [
        'web_search',
        'document_analysis',
        'citation_formatter',
        'fact_checker',
        'data_visualizer',
      ],
      capabilities: ['critical_thinking', 'synthesis', 'fact_verification', 'citation'],
    })
    .setUsageGuidelines({
      bestPractices: [
        'Always verify information from multiple sources',
        'Cite all sources properly',
        'Distinguish between facts and opinions',
        'Consider potential biases in sources',
      ],
      commonPitfalls: [
        'Relying on single sources',
        'Not checking publication dates',
        'Mixing correlation with causation',
      ],
      scalingConsiderations: [
        'Implement source reliability scoring',
        'Cache frequently accessed information',
        'Use parallel research for complex topics',
      ],
    })
    .setPerformanceBaseline({
      averageExecutionTime: 120000,
      averageTokenUsage: 15000,
      expectedSuccessRate: 0.9,
      resourceRequirements: { cpu: 'high', memory: 'high', network: 'high' },
    })
    .build(),

  /**
   * Code Development Agent Template
   */
  codeDevelopment: new AgentConfigurationBuilder()
    .setBasicInfo({
      id: 'code_development_agent',
      name: 'Code Development Agent',
      description: 'Assists with software development tasks',
      useCase: 'code_development',
      complexity: 'expert',
    })
    .setCoreConfig({
      model: anthropic('claude-3-5-sonnet-20241022'),
      maxSteps: 25,
      temperature: 0.2,
      system: `You are an expert software developer. Your approach:
1. Understand requirements and constraints clearly
2. Design clean, maintainable architecture
3. Write efficient, well-documented code
4. Follow best practices and coding standards
5. Implement comprehensive error handling
6. Create thorough tests
7. Consider security implications
8. Optimize for performance when needed

Always prioritize code quality, security, and maintainability.`,
      stopWhen: [
        stepCountAtMost(25),
        hasToolCall('run_tests'),
        hasToolCall('code_review'),
        textContains('implementation complete'),
      ],
      prepareStep: agentControlPresets.codeAgent,
    })
    .setMemoryConfig(memoryUtils.createMemoryConfig('longRunning'))
    .setRecommendations({
      tools: [
        'code_analyzer',
        'test_runner',
        'linter',
        'security_scanner',
        'documentation_generator',
      ],
      capabilities: ['programming', 'debugging', 'testing', 'architecture_design'],
    })
    .setUsageGuidelines({
      bestPractices: [
        'Write self-documenting code',
        'Use meaningful variable names',
        'Keep functions small and focused',
        'Handle edge cases explicitly',
      ],
      commonPitfalls: [
        'Over-engineering solutions',
        'Ignoring error handling',
        'Not writing tests',
        'Poor variable naming',
      ],
      scalingConsiderations: [
        'Use modular architecture',
        'Implement proper logging',
        'Consider performance implications',
        'Plan for future maintainability',
      ],
    })
    .setPerformanceBaseline({
      averageExecutionTime: 180000,
      averageTokenUsage: 20000,
      expectedSuccessRate: 0.85,
      resourceRequirements: { cpu: 'high', memory: 'high', network: 'medium' },
    })
    .build(),

  /**
   * Content Creation Agent Template
   */
  contentCreation: new AgentConfigurationBuilder()
    .setBasicInfo({
      id: 'content_creation_agent',
      name: 'Content Creation Agent',
      description: 'Creates engaging and high-quality content',
      useCase: 'content_creation',
      complexity: 'intermediate',
    })
    .setCoreConfig({
      model: openai('gpt-4o'),
      maxSteps: 12,
      temperature: 0.8,
      system: `You are a professional content creator. Your process:
1. Understand the target audience and objectives
2. Research the topic thoroughly
3. Create compelling and engaging content
4. Ensure proper structure and flow
5. Optimize for the intended platform/medium
6. Review and refine for clarity and impact
7. Include relevant calls-to-action when appropriate

Always prioritize audience value, engagement, and authenticity.`,
      stopWhen: [
        stepCountAtMost(12),
        hasToolCall('content_review'),
        hasToolCall('seo_optimization'),
        textContains('content finalized'),
      ],
    })
    .setMemoryConfig(memoryUtils.createMemoryConfig('task'))
    .setRecommendations({
      tools: ['content_planner', 'seo_optimizer', 'readability_checker', 'plagiarism_detector'],
      capabilities: ['writing', 'creativity', 'audience_analysis', 'seo_knowledge'],
    })
    .setUsageGuidelines({
      bestPractices: [
        'Know your audience intimately',
        'Use clear, compelling headlines',
        'Include actionable insights',
        'Maintain consistent brand voice',
      ],
      commonPitfalls: [
        'Creating content without audience research',
        'Overusing jargon or complex language',
        'Neglecting SEO considerations',
      ],
      scalingConsiderations: [
        'Develop content templates',
        'Create content calendars',
        'Implement approval workflows',
        'Track performance metrics',
      ],
    })
    .setPerformanceBaseline({
      averageExecutionTime: 90000,
      averageTokenUsage: 8000,
      expectedSuccessRate: 0.88,
      resourceRequirements: { cpu: 'medium', memory: 'medium', network: 'low' },
    })
    .build(),

  /**
   * Data Analysis Agent Template
   */
  dataAnalysis: new AgentConfigurationBuilder()
    .setBasicInfo({
      id: 'data_analysis_agent',
      name: 'Data Analysis Agent',
      description: 'Performs comprehensive data analysis and insights',
      useCase: 'data_analysis',
      complexity: 'advanced',
    })
    .setCoreConfig({
      model: anthropic('claude-3-5-sonnet-20241022'),
      maxSteps: 15,
      temperature: 0.3,
      system: `You are a professional data analyst. Your methodology:
1. Understand the business context and questions
2. Examine data quality and completeness
3. Apply appropriate analytical techniques
4. Identify patterns, trends, and anomalies
5. Validate findings with statistical rigor
6. Create clear visualizations
7. Provide actionable insights and recommendations
8. Consider limitations and confidence levels

Always be objective, thorough, and evidence-based.`,
      stopWhen: [
        stepCountAtMost(15),
        hasToolCall('generate_report'),
        hasToolCall('create_visualization'),
        textContains('analysis complete'),
      ],
    })
    .setMemoryConfig(memoryUtils.createMemoryConfig('research'))
    .setRecommendations({
      tools: ['data_processor', 'statistical_analyzer', 'chart_generator', 'report_builder'],
      capabilities: [
        'statistics',
        'data_visualization',
        'pattern_recognition',
        'business_intelligence',
      ],
    })
    .setUsageGuidelines({
      bestPractices: [
        'Always validate data quality first',
        'Use appropriate statistical methods',
        'Consider multiple hypotheses',
        'Clearly communicate uncertainty',
      ],
      commonPitfalls: [
        'Correlation vs causation confusion',
        'Ignoring data quality issues',
        'Over-interpreting results',
      ],
      scalingConsiderations: [
        'Automate routine analyses',
        'Implement data quality checks',
        'Create reusable analysis templates',
        'Monitor data freshness',
      ],
    })
    .setPerformanceBaseline({
      averageExecutionTime: 100000,
      averageTokenUsage: 12000,
      expectedSuccessRate: 0.9,
      resourceRequirements: { cpu: 'high', memory: 'high', network: 'medium' },
    })
    .build(),
} as const;

/**
 * Template registry for dynamic template management
 */
export class AgentTemplateRegistry {
  private templates = new Map<string, AgentConfigurationTemplate>();

  constructor() {
    // Register built-in templates
    Object.values(agentConfigurationTemplates).forEach(template => {
      this.registerTemplate(template);
    });
  }

  /**
   * Register a new template
   */
  registerTemplate(template: AgentConfigurationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): AgentConfigurationTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get templates by use case
   */
  getTemplatesByUseCase(useCase: AgentUseCase): AgentConfigurationTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.useCase === useCase);
  }

  /**
   * Get templates by complexity
   */
  getTemplatesByComplexity(complexity: AgentComplexity): AgentConfigurationTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.complexity === complexity,
    );
  }

  /**
   * Search templates by tags
   */
  searchTemplatesByTags(tags: string[]): AgentConfigurationTemplate[] {
    return Array.from(this.templates.values()).filter(template =>
      tags.some(tag => template.tags.includes(tag)),
    );
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): AgentConfigurationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Remove template
   */
  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Get template recommendations based on requirements
   */
  getRecommendations(requirements: {
    useCase?: AgentUseCase;
    complexity?: AgentComplexity;
    maxExecutionTime?: number;
    maxTokenUsage?: number;
    requiredTools?: string[];
    tags?: string[];
  }): AgentConfigurationTemplate[] {
    let candidates = Array.from(this.templates.values());

    // Filter by use case
    if (requirements.useCase) {
      candidates = candidates.filter(t => t.useCase === requirements.useCase);
    }

    // Filter by complexity
    if (requirements.complexity) {
      candidates = candidates.filter(t => t.complexity === requirements.complexity);
    }

    // Filter by performance requirements
    if (requirements.maxExecutionTime) {
      candidates = candidates.filter(
        t =>
          t.performanceBaseline.averageExecutionTime <= (requirements.maxExecutionTime ?? Infinity),
      );
    }

    if (requirements.maxTokenUsage) {
      candidates = candidates.filter(
        t => t.performanceBaseline.averageTokenUsage <= (requirements.maxTokenUsage ?? Infinity),
      );
    }

    // Filter by required tools
    if (requirements.requiredTools) {
      candidates = candidates.filter(t =>
        (requirements.requiredTools ?? []).every(tool => t.recommendedTools.includes(tool)),
      );
    }

    // Filter by tags
    if (requirements.tags) {
      candidates = candidates.filter(t => requirements.tags!.some(tag => t.tags.includes(tag)));
    }

    // Sort by relevance (simple scoring)
    return candidates.sort((a, b) => {
      let scoreA = 0,
        scoreB = 0;

      // Prefer exact complexity match
      if (requirements.complexity) {
        if (a.complexity === requirements.complexity) scoreA += 2;
        if (b.complexity === requirements.complexity) scoreB += 2;
      }

      // Prefer better performance
      scoreA += (1 - a.performanceBaseline.averageExecutionTime / 300000) * 0.5;
      scoreB += (1 - b.performanceBaseline.averageExecutionTime / 300000) * 0.5;

      // Prefer higher success rate
      scoreA += a.performanceBaseline.expectedSuccessRate * 0.5;
      scoreB += b.performanceBaseline.expectedSuccessRate * 0.5;

      return scoreB - scoreA;
    });
  }
}

/**
 * Utility functions for agent configuration
 */
export const configurationUtils = {
  /**
   * Apply environment-specific overrides to a template
   */
  applyEnvironmentOverrides: (
    template: AgentConfigurationTemplate,
    environment: DeploymentEnvironment,
  ): AgentConfigurationTemplate => {
    const overrides = template.environmentOverrides[environment];
    if (!overrides) return template;

    return {
      ...template,
      coreConfig: {
        ...template.coreConfig,
        ...overrides,
      },
    };
  },

  /**
   * Create agent definition from template
   */
  createAgentFromTemplate: (
    templateId: string,
    agentId: string,
    customizations: Partial<MultiStepConfig> = {},
    registry: AgentTemplateRegistry = globalTemplateRegistry,
  ): AgentDefinition | null => {
    const template = registry.getTemplate(templateId);
    if (!template) return null;

    return {
      id: agentId,
      name: template.name,
      description: template.description,
      tools: {},
      ...template.coreConfig,
      ...customizations,
    };
  },

  /**
   * Validate template configuration
   */
  validateTemplate: (
    template: AgentConfigurationTemplate,
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.coreConfig) errors.push('Core configuration is required');

    // Configuration validation
    if (template.coreConfig) {
      if (!template.coreConfig.model) errors.push('Model is required in core config');
      if (template.coreConfig.maxSteps && template.coreConfig.maxSteps < 1) {
        errors.push('maxSteps must be at least 1');
      }
      if (
        template.coreConfig.temperature !== undefined &&
        (template.coreConfig.temperature < 0 || template.coreConfig.temperature > 2)
      ) {
        errors.push('temperature must be between 0 and 2');
      }
    }

    // Performance baseline validation
    if (template.performanceBaseline) {
      if (
        template.performanceBaseline.expectedSuccessRate < 0 ||
        template.performanceBaseline.expectedSuccessRate > 1
      ) {
        errors.push('expectedSuccessRate must be between 0 and 1');
      }
      if (template.performanceBaseline.averageExecutionTime < 0) {
        errors.push('averageExecutionTime must be positive');
      }
    }

    // Warnings for potential issues
    if (template.coreConfig?.maxSteps && template.coreConfig.maxSteps > 50) {
      warnings.push('High maxSteps may result in increased token usage');
    }

    if (template.performanceBaseline?.averageExecutionTime > 300000) {
      warnings.push('High execution time may impact user experience');
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  /**
   * Generate template documentation
   */
  generateTemplateDocumentation: (template: AgentConfigurationTemplate): string => {
    const sections = [
      `# ${template.name}`,
      ``,
      `${template.description}`,
      ``,
      `## Configuration`,
      `- **Use Case**: ${template.useCase}`,
      `- **Complexity**: ${template.complexity}`,
      `- **Version**: ${template.version}`,
      `- **Author**: ${template.author}`,
      ``,
      `## Core Settings`,
      `- **Max Steps**: ${template.coreConfig.maxSteps}`,
      `- **Temperature**: ${template.coreConfig.temperature}`,
      `- **Model**: ${template.coreConfig.model ? 'Configured' : 'Not specified'}`,
      ``,
      `## Recommended Tools`,
      ...template.recommendedTools.map(tool => `- ${tool}`),
      ``,
      `## Required Capabilities`,
      ...template.requiredCapabilities.map(cap => `- ${cap}`),
      ``,
      `## Performance Baseline`,
      `- **Execution Time**: ~${Math.round(template.performanceBaseline.averageExecutionTime / 1000)}s`,
      `- **Token Usage**: ~${template.performanceBaseline.averageTokenUsage} tokens`,
      `- **Success Rate**: ${Math.round(template.performanceBaseline.expectedSuccessRate * 100)}%`,
      ``,
      `## Best Practices`,
      ...template.usageGuidelines.bestPractices.map(practice => `- ${practice}`),
      ``,
      `## Common Pitfalls`,
      ...template.usageGuidelines.commonPitfalls.map(pitfall => `- ${pitfall}`),
      ``,
      `## Scaling Considerations`,
      ...template.usageGuidelines.scalingConsiderations.map(consideration => `- ${consideration}`),
    ];

    return sections.join('\n');
  },
} as const;

/**
 * Global template registry instance
 */
export const globalTemplateRegistry = new AgentTemplateRegistry();
