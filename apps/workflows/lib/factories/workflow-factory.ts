import { type StepDefinition } from '@/lib/steps/step-registry';
import { type WorkflowDefinition } from '@/types';
import { z } from 'zod';

import { stepFactory, type StepFactoryConfig } from './step-factory';

export interface WorkflowTemplate {
  category: string;
  description: string;
  id: string;
  name: string;
  tags: string[];

  // Template configuration
  configSchema?: z.ZodSchema<any>;
  defaultConfig?: Record<string, any>;

  // Step templates that make up this workflow
  steps: {
    templateId: string;
    config: Partial<StepFactoryConfig>;
    dependencies?: string[];
  }[];

  retries?: number;
  // Workflow-level configuration
  timeout?: number;

  afterCreate?: (workflow: WorkflowDefinition) => void;
  // Hooks
  beforeCreate?: (config: any) => void;
}

export interface WorkflowFactoryConfig {
  category?: string;
  description?: string;
  id: string;
  name: string;
  tags?: string[];
  version?: string;

  // Template to use
  templateId?: string;

  // Configuration for the template
  config?: Record<string, any>;

  // Override specific steps
  stepOverrides?: Record<string, Partial<StepFactoryConfig>>;

  // Additional steps to add
  additionalSteps?: StepFactoryConfig[];
}

export class WorkflowFactory {
  private templates = new Map<string, WorkflowTemplate>();
  private createdWorkflows = new Map<string, WorkflowDefinition>();
  private workflowHandlers = new Map<string, (input: Record<string, any>) => Promise<any>>();

  // Register a workflow template
  registerTemplate(template: WorkflowTemplate): void {
    if (this.templates.has(template.id)) {
      console.warn(`Workflow template ${template.id} is being overwritten`);
    }

    this.templates.set(template.id, template);
    console.log(`Registered workflow template: ${template.id}`);
  }

  // Create a workflow from a template
  createWorkflow(config: WorkflowFactoryConfig): WorkflowDefinition {
    const templateId = config.templateId;
    if (!templateId) {
      throw new Error('Workflow must have a templateId');
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Workflow template not found: ${templateId}`);
    }

    // Validate configuration if schema provided
    if (template.configSchema && config.config) {
      const parseResult = template.configSchema.safeParse(config.config);
      if (!parseResult.success) {
        throw new Error(
          `Invalid configuration for workflow template ${templateId}: ${parseResult.error.message}`,
        );
      }
    }

    // Call before create hook
    if (template.beforeCreate) {
      template.beforeCreate(config);
    }

    // Merge configuration
    const finalConfig = {
      ...template.defaultConfig,
      ...config.config,
    };

    // Create steps from template
    const steps: StepDefinition[] = [];
    const stepIdMap = new Map<string, string>(); // Template step ID -> actual step ID

    // First pass: create all steps
    template.steps.forEach((stepTemplate, index) => {
      const stepId = `${config.id}_step_${index + 1}`;
      stepIdMap.set(stepTemplate.config.id || stepId, stepId);

      // Apply any step overrides
      const stepConfig: StepFactoryConfig = {
        ...stepTemplate.config,
        id: stepId,
        name: stepTemplate.config.name || 'Unnamed Step',
        templateId: stepTemplate.templateId,
        ...(config.stepOverrides?.[stepTemplate.config.id || ''] || {}),
      };

      // Create the step
      const step = stepFactory.createStep(stepConfig);
      steps.push(step);
    });

    // Second pass: update dependencies with actual step IDs
    steps.forEach((step, index) => {
      const templateStep = template.steps[index];
      if (templateStep.dependencies) {
        step.dependencies = templateStep.dependencies.map((dep) => stepIdMap.get(dep) || dep);
      }
    });

    // Add any additional steps
    if (config.additionalSteps) {
      config.additionalSteps.forEach((stepConfig) => {
        const step = stepFactory.createStep(stepConfig);
        steps.push(step);
      });
    }

    // Create the handler function
    const handler = async (input: Record<string, any>) => {
      // This is a simplified version - real implementation would:
      // 1. Sort steps by dependencies
      // 2. Execute steps in parallel where possible
      // 3. Pass outputs between steps
      // 4. Handle errors and retries

      const results: Record<string, any> = {};

      for (const step of steps) {
        // Check dependencies
        if (step.dependencies) {
          const dependenciesMet = step.dependencies.every((dep) => results[dep]);
          if (!dependenciesMet) {
            throw new Error(`Dependencies not met for step ${step.id}`);
          }
        }

        // Execute step
        const context = {
          executionId: `exec_${Date.now()}`,
          input: input,
          metadata: {},
          previousSteps: results,
          stepId: step.id,
          workflowId: workflow.id,
        };

        const result = await step.handler(context);
        if (!result.success) {
          throw new Error(`Step ${step.id} failed: ${result.error}`);
        }

        results[step.id] = result.output;
      }

      // Return the output of the last step
      const lastStep = steps[steps.length - 1];
      return results[lastStep.id];
    };

    // Create the workflow definition
    const workflow: WorkflowDefinition = {
      id: config.id,
      name: config.name,
      category: config.category || template.category,
      description: config.description || template.description,
      tags: config.tags || template.tags,
      version: config.version || '1.0.0',

      inputSchema: {}, // Would be derived from first step's input schema
      outputSchema: {}, // Would be derived from last step's output schema

      retries: template.retries,
      timeout: template.timeout,

      // Workflow definition metadata
      author: 'workflow-factory',
      createdAt: new Date(),
      filePath: `factory:${template.id}`,
      lastModified: new Date(),
      updatedAt: new Date(),
    };

    // Store the created workflow and handler
    this.createdWorkflows.set(workflow.id, workflow);
    this.workflowHandlers.set(workflow.id, handler);

    // Call after create hook
    if (template.afterCreate) {
      template.afterCreate(workflow);
    }

    console.log(`Created workflow ${workflow.id} from template ${templateId}`);
    return workflow;
  }

  // Get the handler for a workflow
  getWorkflowHandler(
    workflowId: string,
  ): ((input: Record<string, any>) => Promise<any>) | undefined {
    return this.workflowHandlers.get(workflowId);
  }

  // Get a created workflow
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.createdWorkflows.get(workflowId);
  }

  // Get all created workflows
  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.createdWorkflows.values());
  }

  // Get all templates
  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  // Clone a workflow with modifications
  cloneWorkflow(
    workflowId: string,
    modifications: Partial<WorkflowFactoryConfig>,
  ): WorkflowDefinition {
    const originalWorkflow = this.createdWorkflows.get(workflowId);
    if (!originalWorkflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Find the original template (this is a simplification)
    const templateId = Array.from(this.templates.entries()).find(
      ([, template]) => template.category === originalWorkflow.category,
    )?.[0];

    if (!templateId) {
      throw new Error(`Cannot find template for workflow: ${workflowId}`);
    }

    const newConfig: WorkflowFactoryConfig = {
      id: modifications.id || `${workflowId}-clone`,
      name: modifications.name || `${originalWorkflow.name} (Clone)`,
      category: modifications.category || originalWorkflow.category,
      description: modifications.description || originalWorkflow.description,
      tags: modifications.tags || originalWorkflow.tags,
      templateId,
      version: modifications.version || originalWorkflow.version,
      ...modifications,
    };

    return this.createWorkflow(newConfig);
  }

  // Clear all templates and created workflows
  clear(): void {
    this.templates.clear();
    this.createdWorkflows.clear();
    this.workflowHandlers.clear();
  }
}

// Pre-built workflow templates
export const workflowTemplates = {
  // Data Pipeline Template
  dataPipeline: {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    category: 'data',
    description: 'Extract, transform, and load data from various sources',
    tags: ['etl', 'data', 'pipeline'],

    configSchema: z.object({
      destination: z.object({
        type: z.enum(['http', 'database', 'file']),
        config: z.any(),
      }),
      source: z.object({
        type: z.enum(['http', 'database', 'file']),
        config: z.any(),
      }),
      transformations: z.array(z.any()),
    }),

    steps: [
      {
        config: {
          id: 'extract',
          name: 'Extract Data',
          description: 'Extract data from source',
        },
        templateId: 'http-request',
      },
      {
        config: {
          id: 'transform',
          name: 'Transform Data',
          description: 'Apply transformations to data',
        },
        dependencies: ['extract'],
        templateId: 'data-transform',
      },
      {
        config: {
          id: 'load',
          name: 'Load Data',
          description: 'Load data to destination',
        },
        dependencies: ['transform'],
        templateId: 'http-request',
      },
    ],

    retries: 3,
    timeout: 300000, // 5 minutes
  } as WorkflowTemplate,

  // Notification Workflow Template
  notificationWorkflow: {
    id: 'notification-workflow',
    name: 'Notification Workflow',
    category: 'notification',
    description: 'Send notifications across multiple channels',
    tags: ['notification', 'alert', 'messaging'],

    configSchema: z.object({
      channels: z.array(z.enum(['email', 'sms', 'slack', 'webhook'])),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
      template: z.string(),
    }),

    steps: [
      {
        config: {
          id: 'prepare-message',
          name: 'Prepare Message',
          description: 'Prepare notification message',
        },
        templateId: 'data-transform',
      },
      {
        config: {
          id: 'check-priority',
          name: 'Check Priority',
          description: 'Route based on priority',
        },
        dependencies: ['prepare-message'],
        templateId: 'conditional-logic',
      },
      {
        config: {
          id: 'send-email',
          name: 'Send Email',
          description: 'Send email notification',
        },
        dependencies: ['check-priority'],
        templateId: 'email-notification',
      },
      {
        config: {
          id: 'send-webhook',
          name: 'Send Webhook',
          description: 'Send webhook notification',
        },
        dependencies: ['check-priority'],
        templateId: 'webhook',
      },
    ],

    retries: 2,
    timeout: 60000, // 1 minute
  } as WorkflowTemplate,

  // File Processing Template
  fileProcessingWorkflow: {
    id: 'file-processing',
    name: 'File Processing',
    category: 'file',
    description: 'Process files with validation and transformation',
    tags: ['file', 'processing', 'validation'],

    configSchema: z.object({
      validationRules: z.array(z.any()),
      outputFormat: z.enum(['json', 'csv', 'xml']),
      transformations: z.array(z.any()),
    }),

    steps: [
      {
        config: {
          id: 'read-file',
          name: 'Read File',
          config: { operation: 'read' },
          description: 'Read input file',
        },
        templateId: 'file-processing',
      },
      {
        config: {
          id: 'validate',
          name: 'Validate Data',
          description: 'Validate file contents',
        },
        dependencies: ['read-file'],
        templateId: 'data-transform',
      },
      {
        config: {
          id: 'transform',
          name: 'Transform Data',
          description: 'Apply transformations',
        },
        dependencies: ['validate'],
        templateId: 'data-transform',
      },
      {
        config: {
          id: 'write-output',
          name: 'Write Output',
          config: { operation: 'write' },
          description: 'Write processed file',
        },
        dependencies: ['transform'],
        templateId: 'file-processing',
      },
    ],

    retries: 2,
    timeout: 180000, // 3 minutes
  } as WorkflowTemplate,
};

// Singleton instance
export const workflowFactory = new WorkflowFactory();

// Register built-in templates
export function registerBuiltInWorkflowTemplates(): void {
  Object.values(workflowTemplates).forEach((template) => {
    workflowFactory.registerTemplate(template);
  });
  console.log('Registered built-in workflow templates');
}
