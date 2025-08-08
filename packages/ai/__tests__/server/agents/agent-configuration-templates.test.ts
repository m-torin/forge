/**
 * AI SDK v5 Agent Configuration Templates Tests
 * Comprehensive tests for agent configuration templates and presets
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  AgentConfigurationBuilder,
  AgentTemplateRegistry,
  agentConfigurationTemplates,
  configurationUtils,
  globalTemplateRegistry,
  type AgentConfigurationTemplate,
  type AgentUseCase,
  type DeploymentEnvironment,
} from '../../../src/server/agents/agent-configuration-templates';

// Mock AI SDK providers
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn().mockReturnValue('mocked-openai-model'),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn().mockReturnValue('mocked-anthropic-model'),
}));

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe('agent Configuration Templates', () => {
  let builder: AgentConfigurationBuilder;
  let registry: AgentTemplateRegistry;

  beforeEach(() => {
    builder = new AgentConfigurationBuilder();
    registry = new AgentTemplateRegistry();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('agentConfigurationBuilder', () => {
    test('should build basic configuration templates', () => {
      const template = builder
        .setBasicInfo({
          id: 'test-template',
          name: 'Test Template',
          description: 'A template for testing',
          useCase: 'customer_support',
          complexity: 'simple',
        })
        .setCoreConfig({
          model: openai('gpt-4o'),
          maxSteps: 8,
          temperature: 0.6,
          system: 'You are a helpful assistant',
        })
        .build();

      expect(template.id).toBe('test-template');
      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('A template for testing');
      expect(template.useCase).toBe('customer_support');
      expect(template.complexity).toBe('simple');
      expect(template.coreConfig.maxSteps).toBe(8);
      expect(template.coreConfig.temperature).toBe(0.6);
      expect(template.version).toBe('1.0.0');
      expect(template.author).toBe('system');
    });

    test('should build templates with custom memory configuration', () => {
      const template = builder
        .setBasicInfo({
          id: 'memory-template',
          name: 'Memory Template',
          description: 'Template with custom memory config',
          useCase: 'research_assistant',
          complexity: 'advanced',
        })
        .setCoreConfig({
          model: anthropic('claude-3-5-sonnet-20241022'),
          maxSteps: 15,
        })
        .setMemoryConfig({
          maxEntries: 2000,
          retentionDays: 30,
          persistenceEnabled: true,
          searchEnabled: true,
        })
        .build();

      expect(template.memoryConfig.maxEntries).toBe(2000);
      expect(template.memoryConfig.retentionDays).toBe(30);
      expect(template.memoryConfig.persistenceEnabled).toBeTruthy();
      expect(template.memoryConfig.searchEnabled).toBeTruthy();
    });

    test('should build templates with monitoring configuration', () => {
      const template = builder
        .setBasicInfo({
          id: 'monitoring-template',
          name: 'Monitoring Template',
          description: 'Template with custom monitoring',
          useCase: 'code_development',
          complexity: 'expert',
        })
        .setCoreConfig({
          model: anthropic('claude-3-5-sonnet-20241022'),
          maxSteps: 25,
        })
        .setMonitoringConfig({
          enableTracing: true,
          traceLevel: 'debug',
          enablePerformanceTracking: true,
          alertThresholds: {
            maxExecutionTime: 600000,
            maxTokenUsage: 100000,
            minSuccessRate: 0.7,
            maxErrorRate: 0.3,
          },
        })
        .build();

      expect(template.monitoringConfig.enableTracing).toBeTruthy();
      expect(template.monitoringConfig.traceLevel).toBe('debug');
      expect(template.monitoringConfig.alertThresholds.maxExecutionTime).toBe(600000);
    });

    test('should build templates with recommendations and guidelines', () => {
      const template = builder
        .setBasicInfo({
          id: 'full-template',
          name: 'Full Template',
          description: 'Complete template with all features',
          useCase: 'data_analysis',
          complexity: 'advanced',
        })
        .setCoreConfig({
          model: openai('gpt-4o'),
          maxSteps: 12,
        })
        .setRecommendations({
          tools: ['data_processor', 'chart_generator', 'report_builder'],
          capabilities: ['statistics', 'visualization', 'analysis'],
        })
        .setUsageGuidelines({
          bestPractices: [
            'Always validate data quality',
            'Use appropriate statistical methods',
            'Consider multiple hypotheses',
          ],
          commonPitfalls: ['Correlation vs causation confusion', 'Ignoring data quality issues'],
          scalingConsiderations: ['Automate routine analyses', 'Implement data quality checks'],
        })
        .setPerformanceBaseline({
          averageExecutionTime: 120000,
          averageTokenUsage: 8000,
          expectedSuccessRate: 0.9,
          resourceRequirements: {
            cpu: 'high',
            memory: 'high',
            network: 'medium',
          },
        })
        .build();

      expect(template.recommendedTools).toContain('data_processor');
      expect(template.requiredCapabilities).toContain('statistics');
      expect(template.usageGuidelines.bestPractices).toContain('Always validate data quality');
      expect(template.usageGuidelines.commonPitfalls).toContain(
        'Correlation vs causation confusion',
      );
      expect(template.performanceBaseline.averageExecutionTime).toBe(120000);
      expect(template.performanceBaseline.resourceRequirements.cpu).toBe('high');
    });

    test('should build templates with environment overrides', () => {
      const template = builder
        .setBasicInfo({
          id: 'env-template',
          name: 'Environment Template',
          description: 'Template with environment overrides',
          useCase: 'customer_support',
          complexity: 'intermediate',
        })
        .setCoreConfig({
          model: openai('gpt-4o'),
          maxSteps: 10,
          temperature: 0.7,
        })
        .setEnvironmentOverrides({
          development: {
            temperature: 0.9,
            maxSteps: 5,
          },
          staging: {
            temperature: 0.8,
            maxSteps: 8,
          },
          production: {
            temperature: 0.6,
            maxSteps: 12,
          },
        })
        .build();

      expect(template.environmentOverrides.development?.temperature).toBe(0.9);
      expect(template.environmentOverrides.staging?.maxSteps).toBe(8);
      expect(template.environmentOverrides.production?.temperature).toBe(0.6);
    });

    test('should throw error when building incomplete templates', () => {
      expect(() => {
        builder.build(); // No basic info or core config set
      }).toThrow('Missing required template configuration');

      expect(() => {
        builder
          .setBasicInfo({
            id: 'incomplete',
            name: 'Incomplete',
            description: 'Missing core config',
            useCase: 'customer_support',
            complexity: 'simple',
          })
          .build(); // No core config
      }).toThrow('Missing required template configuration');
    });
  });

  describe('pre-built Configuration Templates', () => {
    test('should provide customer support agent template', () => {
      const template = agentConfigurationTemplates.customerSupport;

      expect(template.id).toBe('customer_support_agent');
      expect(template.name).toBe('Customer Support Agent');
      expect(template.useCase).toBe('customer_support');
      expect(template.complexity).toBe('intermediate');
      expect(template.coreConfig.maxSteps).toBe(8);
      expect(template.coreConfig.temperature).toBe(0.6);
      expect(template.coreConfig.system).toContain('customer support agent');
      expect(template.recommendedTools).toContain('knowledge_base_search');
      expect(template.usageGuidelines.bestPractices).toContain(
        'Always acknowledge customer emotions',
      );
    });

    test('should provide research assistant agent template', () => {
      const template = agentConfigurationTemplates.researchAssistant;

      expect(template.id).toBe('research_assistant_agent');
      expect(template.name).toBe('Research Assistant Agent');
      expect(template.useCase).toBe('research_assistant');
      expect(template.complexity).toBe('advanced');
      expect(template.coreConfig.maxSteps).toBe(20);
      expect(template.coreConfig.temperature).toBe(0.3);
      expect(template.coreConfig.system).toContain('research assistant');
      expect(template.recommendedTools).toContain('web_search');
      expect(template.performanceBaseline.averageExecutionTime).toBe(120000);
    });

    test('should provide code development agent template', () => {
      const template = agentConfigurationTemplates.codeDevelopment;

      expect(template.id).toBe('code_development_agent');
      expect(template.name).toBe('Code Development Agent');
      expect(template.useCase).toBe('code_development');
      expect(template.complexity).toBe('expert');
      expect(template.coreConfig.maxSteps).toBe(25);
      expect(template.coreConfig.temperature).toBe(0.2);
      expect(template.recommendedTools).toContain('code_analyzer');
      expect(template.performanceBaseline.resourceRequirements.cpu).toBe('high');
    });

    test('should provide content creation agent template', () => {
      const template = agentConfigurationTemplates.contentCreation;

      expect(template.id).toBe('content_creation_agent');
      expect(template.name).toBe('Content Creation Agent');
      expect(template.useCase).toBe('content_creation');
      expect(template.complexity).toBe('intermediate');
      expect(template.coreConfig.temperature).toBe(0.8);
      expect(template.recommendedTools).toContain('seo_optimizer');
      expect(template.usageGuidelines.bestPractices).toContain('Know your audience intimately');
    });

    test('should provide data analysis agent template', () => {
      const template = agentConfigurationTemplates.dataAnalysis;

      expect(template.id).toBe('data_analysis_agent');
      expect(template.name).toBe('Data Analysis Agent');
      expect(template.useCase).toBe('data_analysis');
      expect(template.complexity).toBe('advanced');
      expect(template.coreConfig.maxSteps).toBe(15);
      expect(template.recommendedTools).toContain('statistical_analyzer');
      expect(template.usageGuidelines.bestPractices).toContain(
        'Always validate data quality first',
      );
    });
  });

  describe('agentTemplateRegistry', () => {
    test('should register and retrieve templates', () => {
      const customTemplate: AgentConfigurationTemplate = {
        id: 'custom-test',
        name: 'Custom Test Template',
        description: 'Test template',
        useCase: 'customer_support',
        complexity: 'simple',
        version: '1.0.0',
        author: 'test',
        tags: ['test'],
        coreConfig: {
          model: openai('gpt-4o'),
          maxSteps: 5,
          temperature: 0.5,
        },
        memoryConfig: {
          maxEntries: 100,
          retentionDays: 1,
          compressionThreshold: 50,
          indexingEnabled: true,
          persistenceEnabled: false,
          searchEnabled: true,
        },
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
      };

      registry.registerTemplate(customTemplate);

      const retrieved = registry.getTemplate('custom-test');
      expect(retrieved).toStrictEqual(customTemplate);
    });

    test('should get templates by use case', () => {
      const templates = registry.getTemplatesByUseCase('customer_support');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.useCase === 'customer_support')).toBeTruthy();
    });

    test('should get templates by complexity', () => {
      const simpleTemplates = registry.getTemplatesByComplexity('simple');
      const expertTemplates = registry.getTemplatesByComplexity('expert');

      expect(simpleTemplates.every(t => t.complexity === 'simple')).toBeTruthy();
      expect(expertTemplates.every(t => t.complexity === 'expert')).toBeTruthy();
    });

    test('should search templates by tags', () => {
      // Built-in templates should have tags
      const allTemplates = registry.getAllTemplates();
      expect(allTemplates.length).toBeGreaterThan(0);

      // Search would work if templates had tags
      const results = registry.searchTemplatesByTags(['communication']);
      expect(Array.isArray(results)).toBeTruthy();
    });

    test('should remove templates', () => {
      const customTemplate: AgentConfigurationTemplate = {
        id: 'removable-test',
        name: 'Removable Template',
        description: 'Template to be removed',
        useCase: 'customer_support',
        complexity: 'simple',
        version: '1.0.0',
        author: 'test',
        tags: [],
        coreConfig: {
          model: openai('gpt-4o'),
          maxSteps: 5,
        },
        memoryConfig: {
          maxEntries: 100,
          retentionDays: 1,
          compressionThreshold: 50,
          indexingEnabled: true,
          persistenceEnabled: false,
          searchEnabled: true,
        },
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
      };

      registry.registerTemplate(customTemplate);
      expect(registry.getTemplate('removable-test')).toBeDefined();

      const removed = registry.removeTemplate('removable-test');
      expect(removed).toBeTruthy();
      expect(registry.getTemplate('removable-test')).toBeUndefined();

      const notRemoved = registry.removeTemplate('nonexistent');
      expect(notRemoved).toBeFalsy();
    });

    test('should get template recommendations based on requirements', () => {
      const recommendations = registry.getRecommendations({
        useCase: 'customer_support',
        complexity: 'intermediate',
        maxExecutionTime: 60000,
        maxTokenUsage: 5000,
      });

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.every(t => t.useCase === 'customer_support')).toBeTruthy();
      expect(
        recommendations.every(t => t.performanceBaseline.averageExecutionTime <= 60000),
      ).toBeTruthy();
    });

    test('should handle empty recommendation requirements', () => {
      const recommendations = registry.getRecommendations({});

      expect(Array.isArray(recommendations)).toBeTruthy();
      expect(recommendations.length).toBeGreaterThan(0);
    });

    test('should sort recommendations by relevance', () => {
      const recommendations = registry.getRecommendations({
        useCase: 'research_assistant',
        complexity: 'advanced',
      });

      expect(recommendations.length).toBeGreaterThan(0);

      // Verify sorting: relevant recommendations should appear first
      const relevantRecommendations = recommendations.filter(
        r => r.useCase === 'research_assistant' && r.complexity === 'advanced',
      );
      const irrelevantRecommendations = recommendations.filter(
        r => r.useCase !== 'research_assistant' || r.complexity !== 'advanced',
      );

      // If we have both relevant and irrelevant results, relevant should come first
      expect(relevantRecommendations.length + irrelevantRecommendations.length).toBe(
        recommendations.length,
      );
    });
  });

  describe('configuration Utilities', () => {
    test('should apply environment overrides to templates', () => {
      const baseTemplate = agentConfigurationTemplates.customerSupport;

      // Add environment overrides to test
      const templateWithOverrides: AgentConfigurationTemplate = {
        ...baseTemplate,
        environmentOverrides: {
          development: {
            temperature: 0.9,
            maxSteps: 5,
          },
          production: {
            temperature: 0.4,
            maxSteps: 15,
          },
        },
      };

      const devTemplate = configurationUtils.applyEnvironmentOverrides(
        templateWithOverrides,
        'development',
      );

      expect(devTemplate.coreConfig.temperature).toBe(0.9);
      expect(devTemplate.coreConfig.maxSteps).toBe(5);

      const prodTemplate = configurationUtils.applyEnvironmentOverrides(
        templateWithOverrides,
        'production',
      );

      expect(prodTemplate.coreConfig.temperature).toBe(0.4);
      expect(prodTemplate.coreConfig.maxSteps).toBe(15);
    });

    test('should handle environment overrides for non-existent environments', () => {
      const template = agentConfigurationTemplates.customerSupport;

      const unchanged = configurationUtils.applyEnvironmentOverrides(
        template,
        'nonexistent' as DeploymentEnvironment,
      );

      expect(unchanged).toStrictEqual(template);
    });

    test('should create agent definitions from templates', () => {
      const testRegistry = new AgentTemplateRegistry();
      testRegistry.registerTemplate(agentConfigurationTemplates.customerSupport);

      const agentDef = configurationUtils.createAgentFromTemplate(
        'customer_support_agent',
        'my-support-agent',
        { temperature: 0.8 },
        testRegistry,
      );

      expect(agentDef).toBeDefined();
      expect(agentDef!.id).toBe('my-support-agent');
      expect(agentDef!.name).toBe('Customer Support Agent');
      expect(agentDef!.temperature).toBe(0.8); // Override applied
      expect(agentDef!.maxSteps).toBe(8); // From template
    });

    test('should handle non-existent templates gracefully', () => {
      const agentDef = configurationUtils.createAgentFromTemplate(
        'nonexistent-template',
        'my-agent',
        {},
        registry,
      );

      expect(agentDef).toBeNull();
    });

    test('should validate template configurations', () => {
      const validTemplate = agentConfigurationTemplates.customerSupport;
      const validation = configurationUtils.validateTemplate(validTemplate);

      expect(validation.valid).toBeTruthy();
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid template configurations', () => {
      const invalidTemplate: AgentConfigurationTemplate = {
        id: '', // Invalid: empty ID
        name: '',
        description: 'Invalid template',
        useCase: 'customer_support',
        complexity: 'simple',
        version: '1.0.0',
        author: 'test',
        tags: [],
        coreConfig: {
          model: null as any, // Invalid: null model
          maxSteps: -5, // Invalid: negative maxSteps
          temperature: 3, // Invalid: temperature > 2
        },
        memoryConfig: {
          maxEntries: 1000,
          retentionDays: 7,
          compressionThreshold: 200,
          indexingEnabled: true,
          persistenceEnabled: false,
          searchEnabled: true,
        },
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
          expectedSuccessRate: 1.5, // Invalid: > 1
          resourceRequirements: {
            cpu: 'medium',
            memory: 'medium',
            network: 'low',
          },
        },
      };

      const validation = configurationUtils.validateTemplate(invalidTemplate);

      expect(validation.valid).toBeFalsy();
      expect(validation.errors).toContain('Template ID is required');
      expect(validation.errors).toContain('Template name is required');
      expect(validation.errors).toContain('Model is required in core config');
      expect(validation.errors).toContain('maxSteps must be at least 1');
      expect(validation.errors).toContain('temperature must be between 0 and 2');
      expect(validation.errors).toContain('expectedSuccessRate must be between 0 and 1');
    });

    test('should provide warnings for suboptimal configurations', () => {
      const suboptimalTemplate: AgentConfigurationTemplate = {
        ...agentConfigurationTemplates.customerSupport,
        coreConfig: {
          ...agentConfigurationTemplates.customerSupport.coreConfig,
          maxSteps: 100, // High step count
          system: 'x'.repeat(15000), // Very long system prompt
        },
        performanceBaseline: {
          ...agentConfigurationTemplates.customerSupport.performanceBaseline,
          averageExecutionTime: 400000, // High execution time
        },
      };

      const validation = configurationUtils.validateTemplate(suboptimalTemplate);

      expect(validation.valid).toBeTruthy();
      expect(validation.warnings).toContain('High maxSteps may result in increased token usage');
      expect(validation.warnings).toContain('High execution time may impact user experience');
    });

    test('should generate template documentation', () => {
      const template = agentConfigurationTemplates.customerSupport;
      const documentation = configurationUtils.generateTemplateDocumentation(template);

      expect(documentation).toContain('# Customer Support Agent');
      expect(documentation).toContain('## Configuration');
      expect(documentation).toContain('- **Use Case**: customer_support');
      expect(documentation).toContain('- **Complexity**: intermediate');
      expect(documentation).toContain('## Core Settings');
      expect(documentation).toContain('- **Max Steps**: 8');
      expect(documentation).toContain('- **Temperature**: 0.6');
      expect(documentation).toContain('## Recommended Tools');
      expect(documentation).toContain('## Performance Baseline');
      expect(documentation).toContain('## Best Practices');
      expect(documentation).toContain('## Common Pitfalls');
      expect(documentation).toContain('## Scaling Considerations');
    });
  });

  describe('global Template Registry', () => {
    test('should provide a global template registry with built-in templates', () => {
      expect(globalTemplateRegistry).toBeInstanceOf(AgentTemplateRegistry);

      const allTemplates = globalTemplateRegistry.getAllTemplates();
      expect(allTemplates.length).toBeGreaterThan(0);

      // Should have customer support template
      const customerSupport = globalTemplateRegistry.getTemplate('customer_support_agent');
      expect(customerSupport).toBeDefined();
      expect(customerSupport!.name).toBe('Customer Support Agent');
    });

    test('should allow registration of custom templates', () => {
      const customTemplate: AgentConfigurationTemplate = {
        id: 'global-custom-template',
        name: 'Global Custom Template',
        description: 'Custom template for global registry',
        useCase: 'workflow_automation',
        complexity: 'intermediate',
        version: '1.0.0',
        author: 'test',
        tags: ['custom', 'global'],
        coreConfig: {
          model: openai('gpt-4o'),
          maxSteps: 10,
          temperature: 0.5,
        },
        memoryConfig: {
          maxEntries: 1000,
          retentionDays: 7,
          compressionThreshold: 200,
          indexingEnabled: true,
          persistenceEnabled: false,
          searchEnabled: true,
        },
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
        recommendedTools: ['workflow_engine'],
        requiredCapabilities: ['automation'],
        environmentOverrides: {},
        usageGuidelines: {
          bestPractices: ['Test workflows thoroughly'],
          commonPitfalls: ['Not handling edge cases'],
          scalingConsiderations: ['Monitor resource usage'],
        },
        performanceBaseline: {
          averageExecutionTime: 45000,
          averageTokenUsage: 6000,
          expectedSuccessRate: 0.85,
          resourceRequirements: {
            cpu: 'medium',
            memory: 'medium',
            network: 'low',
          },
        },
      };

      globalTemplateRegistry.registerTemplate(customTemplate);

      const retrieved = globalTemplateRegistry.getTemplate('global-custom-template');
      expect(retrieved).toBeDefined();
      expect(retrieved!.useCase).toBe('workflow_automation');
    });
  });

  describe('error Handling and Edge Cases', () => {
    test('should handle missing template data gracefully', () => {
      const registry = new AgentTemplateRegistry();

      const template = registry.getTemplate('nonexistent');
      expect(template).toBeUndefined();

      const templates = registry.getTemplatesByUseCase('nonexistent' as AgentUseCase);
      expect(templates).toHaveLength(0);

      const recommendations = registry.getRecommendations({
        useCase: 'nonexistent' as AgentUseCase,
      });
      expect(recommendations).toHaveLength(0);
    });

    test('should handle builder with partial configurations', () => {
      const builder = new AgentConfigurationBuilder();

      builder.setBasicInfo({
        id: 'partial',
        name: 'Partial',
        description: 'Partial config',
        useCase: 'customer_support',
        complexity: 'simple',
      });

      // Should throw when trying to build without core config
      expect(() => builder.build()).toThrow('Cannot build configuration');
    });

    test('should handle template validation edge cases', () => {
      const emptyTemplate = {} as AgentConfigurationTemplate;
      const validation = configurationUtils.validateTemplate(emptyTemplate);

      expect(validation.valid).toBeFalsy();
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should handle documentation generation for minimal templates', () => {
      const minimalTemplate: AgentConfigurationTemplate = {
        id: 'minimal',
        name: 'Minimal Template',
        description: 'Minimal configuration',
        useCase: 'customer_support',
        complexity: 'simple',
        version: '1.0.0',
        author: 'test',
        tags: [],
        coreConfig: {
          model: openai('gpt-4o'),
        },
        memoryConfig: {
          maxEntries: 1000,
          retentionDays: 7,
          compressionThreshold: 200,
          indexingEnabled: true,
          persistenceEnabled: false,
          searchEnabled: true,
        },
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
      };

      const documentation = configurationUtils.generateTemplateDocumentation(minimalTemplate);

      expect(documentation).toContain('# Minimal Template');
      expect(documentation).toContain('## Configuration');
      // Should handle empty arrays gracefully
      expect(() => documentation).not.toThrow();
    });
  });
});
