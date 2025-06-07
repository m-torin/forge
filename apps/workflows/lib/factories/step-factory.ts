import { type StepContext, type StepDefinition, type StepResult } from '@/lib/steps/step-registry';
import { type z } from 'zod';

export interface StepFactoryConfig {
  category?: string;
  description?: string;
  id: string;
  name: string;
  tags?: string[];
  version?: string;

  // Input/Output schemas
  inputSchema?: z.ZodSchema<any>;
  outputSchema?: z.ZodSchema<any>;

  // Step configuration
  config?: Record<string, any>;
  defaults?: Record<string, any>;

  retries?: number;
  // Execution options
  timeout?: number;

  extends?: string;
  // Template metadata
  templateId?: string;
  dependencies?: string[];
}

export interface StepTemplate {
  category: string;
  description: string;
  id: string;
  name: string;

  // Template configuration
  configSchema?: z.ZodSchema<any>;
  defaultConfig?: Record<string, any>;

  // Handler factory
  createHandler: (config: any) => (context: StepContext) => Promise<StepResult>;

  afterCreate?: (step: StepDefinition) => void;
  // Lifecycle hooks
  beforeCreate?: (config: StepFactoryConfig) => void;

  // Validation
  validateConfig?: (config: any) => boolean | string;
}

export class StepFactory {
  private templates = new Map<string, StepTemplate>();
  private createdSteps = new Map<string, StepDefinition>();

  // Register a step template
  registerTemplate(template: StepTemplate): void {
    if (this.templates.has(template.id)) {
      console.warn(`Template ${template.id} is being overwritten`);
    }

    this.templates.set(template.id, template);
    console.log(`Registered step template: ${template.id}`);
  }

  // Create a step from a template
  createStep(config: StepFactoryConfig): StepDefinition {
    const templateId = config.templateId || config.extends;
    if (!templateId) {
      throw new Error('Step must have a templateId or extends property');
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate configuration if schema provided
    if (template.configSchema && config.config) {
      const parseResult = template.configSchema.safeParse(config.config);
      if (!parseResult.success) {
        throw new Error(
          `Invalid configuration for template ${templateId}: ${parseResult.error.message}`,
        );
      }
    }

    // Additional validation if provided
    if (template.validateConfig) {
      const validationResult = template.validateConfig(config.config);
      if (validationResult !== true) {
        throw new Error(`Configuration validation failed: ${validationResult}`);
      }
    }

    // Call before create hook
    if (template.beforeCreate) {
      template.beforeCreate(config);
    }

    // Merge configuration
    const finalConfig = {
      ...template.defaultConfig,
      ...config.defaults,
      ...config.config,
    };

    // Create the step handler
    const handler = template.createHandler(finalConfig);

    // Build the step definition
    const step: StepDefinition = {
      id: config.id,
      name: config.name,
      category: config.category || template.category,
      description: config.description || template.description,
      tags: config.tags || [],
      version: config.version || '1.0.0',

      retries: config.retries,
      timeout: config.timeout,

      handler: async (context: StepContext): Promise<StepResult> => {
        // Validate input if schema provided
        if (config.inputSchema) {
          const parseResult = config.inputSchema.safeParse(context.input);
          if (!parseResult.success) {
            return {
              error: `Input validation failed: ${parseResult.error.message}`,
              success: false,
            };
          }
        }

        // Execute the handler
        const result = await handler(context);

        // Validate output if schema provided
        if (config.outputSchema && result.success && result.output) {
          const parseResult = config.outputSchema.safeParse(result.output);
          if (!parseResult.success) {
            return {
              error: `Output validation failed: ${parseResult.error.message}`,
              success: false,
            };
          }
        }

        return result;
      },
    };

    // Store the created step
    this.createdSteps.set(step.id, step);

    // Call after create hook
    if (template.afterCreate) {
      template.afterCreate(step);
    }

    console.log(`Created step ${step.id} from template ${templateId}`);
    return step;
  }

  // Create multiple steps from configurations
  createSteps(configs: StepFactoryConfig[]): StepDefinition[] {
    return configs.map((config) => this.createStep(config));
  }

  // Get a created step
  getStep(stepId: string): StepDefinition | undefined {
    return this.createdSteps.get(stepId);
  }

  // Get all created steps
  getAllSteps(): StepDefinition[] {
    return Array.from(this.createdSteps.values());
  }

  // Get all templates
  getAllTemplates(): StepTemplate[] {
    return Array.from(this.templates.values());
  }

  // Clone a step with modifications
  cloneStep(stepId: string, modifications: Partial<StepFactoryConfig>): StepDefinition {
    const originalStep = this.createdSteps.get(stepId);
    if (!originalStep) {
      throw new Error(`Step not found: ${stepId}`);
    }

    // Find the original template (this is a simplification)
    const templateId = Array.from(this.templates.entries()).find(
      ([, template]) => template.category === originalStep.category,
    )?.[0];

    if (!templateId) {
      throw new Error(`Cannot find template for step: ${stepId}`);
    }

    const newConfig: StepFactoryConfig = {
      id: modifications.id || `${stepId}-clone`,
      name: modifications.name || `${originalStep.name} (Clone)`,
      category: modifications.category || originalStep.category,
      config: modifications.config,
      defaults: modifications.defaults,
      description: modifications.description || originalStep.description,
      extends: modifications.extends,
      inputSchema: modifications.inputSchema,
      outputSchema: modifications.outputSchema,
      retries: modifications.retries || originalStep.retries,
      tags: modifications.tags || originalStep.tags,
      templateId,
      timeout: modifications.timeout || originalStep.timeout,
      version: modifications.version || originalStep.version,
    };

    return this.createStep(newConfig);
  }

  // Compose steps into a composite step
  composeSteps(
    id: string,
    name: string,
    stepIds: string[],
    options: {
      description?: string;
      parallel?: boolean;
      continueOnError?: boolean;
      aggregateResults?: boolean;
    } = {},
  ): StepDefinition {
    const steps = stepIds.map((stepId) => {
      const step = this.createdSteps.get(stepId);
      if (!step) {
        throw new Error(`Step not found: ${stepId}`);
      }
      return step;
    });

    const compositeStep: StepDefinition = {
      id,
      name,
      category: 'composite',
      description: options.description || `Composite step containing ${steps.length} steps`,
      tags: ['composite', ...Array.from(new Set(steps.flatMap((s) => s.tags)))],
      version: '1.0.0',

      handler: async (context: StepContext): Promise<StepResult> => {
        const results: StepResult[] = [];
        const outputs: Record<string, any> = {};
        const errors: string[] = [];

        if (options.parallel) {
          // Execute steps in parallel
          const promises = steps.map(async (step) => {
            try {
              const result = await step.handler({
                ...context,
                previousSteps: outputs,
                stepId: step.id,
              });
              return { result, step };
            } catch (error) {
              return {
                result: {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  success: false,
                },
                step,
              };
            }
          });

          const parallelResults = await Promise.all(promises);

          for (const { result, step } of parallelResults) {
            results.push(result);
            if (result.success) {
              outputs[step.id] = result.output;
            } else {
              errors.push(`${step.id}: ${result.error}`);
              if (!options.continueOnError) {
                return {
                  error: `Composite step failed at ${step.id}: ${result.error}`,
                  metadata: { errors, failedStep: step.id, outputs },
                  success: false,
                };
              }
            }
          }
        } else {
          // Execute steps sequentially
          for (const step of steps) {
            try {
              const result = await step.handler({
                ...context,
                previousSteps: outputs,
                stepId: step.id,
              });

              results.push(result);

              if (result.success) {
                outputs[step.id] = result.output;
              } else {
                errors.push(`${step.id}: ${result.error}`);
                if (!options.continueOnError) {
                  return {
                    error: `Composite step failed at ${step.id}: ${result.error}`,
                    metadata: { errors, failedStep: step.id, outputs },
                    success: false,
                  };
                }
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              errors.push(`${step.id}: ${errorMessage}`);

              if (!options.continueOnError) {
                return {
                  error: `Composite step failed at ${step.id}: ${errorMessage}`,
                  metadata: { errors, failedStep: step.id, outputs },
                  success: false,
                };
              }
            }
          }
        }

        const allSuccessful = results.every((r) => r.success);

        return {
          metadata: {
            errors: errors.length > 0 ? errors : undefined,
            executionMode: options.parallel ? 'parallel' : 'sequential',
            outputs,
            steps: stepIds,
          },
          output:
            (options.aggregateResults ?? false) ? outputs : results[results.length - 1]?.output,
          success:
            allSuccessful || ((options.continueOnError ?? false) && results.some((r) => r.success)),
        };
      },
    };

    this.createdSteps.set(id, compositeStep);
    return compositeStep;
  }

  // Create a conditional step
  createConditionalStep(
    id: string,
    name: string,
    condition: (context: StepContext) => boolean | Promise<boolean>,
    ifTrueStepId: string,
    ifFalseStepId?: string,
    options: {
      description?: string;
      tags?: string[];
    } = {},
  ): StepDefinition {
    const ifTrueStep = this.createdSteps.get(ifTrueStepId);
    if (!ifTrueStep) {
      throw new Error(`Step not found: ${ifTrueStepId}`);
    }

    const ifFalseStep = ifFalseStepId ? this.createdSteps.get(ifFalseStepId) : undefined;
    if (ifFalseStepId && !ifFalseStep) {
      throw new Error(`Step not found: ${ifFalseStepId}`);
    }

    const conditionalStep: StepDefinition = {
      id,
      name,
      category: 'control',
      description:
        options.description || `Conditional step: ${ifTrueStepId} or ${ifFalseStepId || 'skip'}`,
      tags: options.tags || ['conditional'],
      version: '1.0.0',

      handler: async (context: StepContext): Promise<StepResult> => {
        const conditionResult = await condition(context);

        if (conditionResult) {
          const result = await ifTrueStep.handler(context);
          return {
            error: result.error,
            metadata: {
              ...result.metadata,
              condition: true,
              executedStep: ifTrueStepId,
            },
            output: result.output,
            success: result.success,
          };
        } else if (ifFalseStep) {
          const result = await ifFalseStep.handler(context);
          return {
            error: result.error,
            metadata: {
              ...result.metadata,
              condition: false,
              executedStep: ifFalseStepId,
            },
            output: result.output,
            success: result.success,
          };
        } else {
          return {
            metadata: {
              condition: false,
              skipped: true,
            },
            output: null,
            success: true,
          };
        }
      },
    };

    this.createdSteps.set(id, conditionalStep);
    return conditionalStep;
  }

  // Create a loop step
  createLoopStep(
    id: string,
    name: string,
    stepId: string,
    options: {
      description?: string;
      maxIterations?: number;
      parallel?: boolean;
      continueOnError?: boolean;
      itemsPath?: string; // Path in context.input to array of items
      tags?: string[];
    } = {},
  ): StepDefinition {
    const step = this.createdSteps.get(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const loopStep: StepDefinition = {
      id,
      name,
      category: 'control',
      description: options.description || `Loop step executing ${stepId}`,
      tags: options.tags || ['loop'],
      version: '1.0.0',

      handler: async (context: StepContext): Promise<StepResult> => {
        const items = options.itemsPath
          ? getNestedProperty(context.input, options.itemsPath)
          : context.input.items;

        if (!Array.isArray(items)) {
          return {
            error: 'Loop step requires an array of items',
            success: false,
          };
        }

        const maxIterations = options.maxIterations || items.length;
        const itemsToProcess = items.slice(0, maxIterations);
        const results: any[] = [];
        const errors: string[] = [];

        if (options.parallel) {
          // Process items in parallel
          const promises = itemsToProcess.map(async (item, index) => {
            try {
              const result = await step.handler({
                ...context,
                input: {
                  ...context.input,
                  index,
                  item,
                  total: itemsToProcess.length,
                },
              });
              return { index, result };
            } catch (error) {
              return {
                index,
                result: {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  success: false,
                },
              };
            }
          });

          const parallelResults = await Promise.all(promises);

          for (const { index, result } of parallelResults.sort((a, b) => a.index - b.index)) {
            if (result.success) {
              results.push(result.output);
            } else {
              errors.push(`Item ${index}: ${result.error}`);
              if (!options.continueOnError) {
                return {
                  error: `Loop failed at item ${index}: ${result.error}`,
                  metadata: { errors, failedIndex: index, results },
                  success: false,
                };
              }
            }
          }
        } else {
          // Process items sequentially
          for (let i = 0; i < itemsToProcess.length; i++) {
            try {
              const result = await step.handler({
                ...context,
                input: {
                  ...context.input,
                  index: i,
                  item: itemsToProcess[i],
                  total: itemsToProcess.length,
                },
              });

              if (result.success) {
                results.push(result.output);
              } else {
                errors.push(`Item ${i}: ${result.error}`);
                if (!options.continueOnError) {
                  return {
                    error: `Loop failed at item ${i}: ${result.error}`,
                    metadata: { errors, failedIndex: i, results },
                    success: false,
                  };
                }
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              errors.push(`Item ${i}: ${errorMessage}`);

              if (!options.continueOnError) {
                return {
                  error: `Loop failed at item ${i}: ${errorMessage}`,
                  metadata: { errors, failedIndex: i, results },
                  success: false,
                };
              }
            }
          }
        }

        const success =
          errors.length === 0 || ((options.continueOnError ?? false) && results.length > 0);

        return {
          metadata: {
            errors: errors.length > 0 ? errors : undefined,
            failedItems: errors.length,
            processedItems: itemsToProcess.length,
            successfulItems: results.length,
            totalItems: items.length,
          },
          output: results,
          success,
        };
      },
    };

    this.createdSteps.set(id, loopStep);
    return loopStep;
  }

  // Clear all templates and created steps
  clear(): void {
    this.templates.clear();
    this.createdSteps.clear();
  }
}

// Helper function to get nested property
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Singleton instance
export const stepFactory = new StepFactory();
