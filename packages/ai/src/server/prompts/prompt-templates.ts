/**
 * Prompt Templates System
 * Reusable and composable prompt templates
 */

import { logInfo } from '@repo/observability/server/next';
import { z } from 'zod/v4';
import type { PromptTemplateEngine } from '../types/agent-core';

/**
 * Prompt template configuration
 */
export interface PromptTemplate<TVariables = any> {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: z.ZodSchema<TVariables>;
  metadata?: {
    category?: string;
    tags?: string[];
    version?: string;
    author?: string;
    examples?: Array<{
      variables: TVariables;
      expected?: string;
    }>;
  };
}

/**
 * Prompt template registry
 */
export class PromptTemplateRegistry implements PromptTemplateEngine {
  private templates: Map<string, PromptTemplate> = new Map();

  /**
   * Register a template
   */
  register<T>(template: PromptTemplate<T>): void {
    this.templates.set(template.id, template);

    logInfo('Prompt Template: Registered', {
      operation: 'prompt_template_register',
      metadata: {
        id: template.id,
        name: template.name,
        variableCount: Object.keys((template.variables as any)?._def?.shape || {}).length,
      },
    });
  }

  /**
   * Get a template by ID
   */
  get<T = any>(id: string): PromptTemplate<T> | undefined {
    return this.templates.get(id) as PromptTemplate<T>;
  }

  /**
   * Get all templates
   */
  getAll(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getByCategory(category: string): PromptTemplate[] {
    return this.getAll().filter(t => t.metadata?.category === category);
  }

  /**
   * Get templates by tag
   */
  getByTag(tag: string): PromptTemplate[] {
    return this.getAll().filter(t => t.metadata?.tags?.includes(tag));
  }

  /**
   * Render a template with variables
   */
  render<T>(templateId: string, variables: T): string {
    const template = this.get<T>(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate variables
    const validated = template.variables.parse(variables);

    // Render template
    let rendered = template.template;

    // Replace variables in the template
    Object.entries(validated as any).forEach(([key, value]) => {
      // Escape the key for regex safety
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patterns = [
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g'),
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(`\\$\\{${escapedKey}\\}`, 'g'),
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(`<${escapedKey}>`, 'g'),
      ];

      patterns.forEach(pattern => {
        rendered = rendered.replace(pattern, String(value));
      });
    });

    return rendered;
  }

  // PromptTemplateEngine interface implementation
  compile(template: string, variables?: Record<string, any>): string {
    if (!variables) return template;

    let compiled = template;
    Object.entries(variables).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patterns = [
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g'),
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(`\\$\\{${escapedKey}\\}`, 'g'),
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(`<${escapedKey}>`, 'g'),
      ];
      patterns.forEach(pattern => {
        compiled = compiled.replace(pattern, String(value));
      });
    });
    return compiled;
  }

  validate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    try {
      // Basic validation - check for unclosed variables
      const variablePattern = /{{[^}]*}}|\$\{[^}]*\}|<[^>]*>/g;
      const matches = template.match(variablePattern);
      if (matches) {
        matches.forEach(match => {
          if (match.includes('{{') && !match.endsWith('}}')) {
            errors.push(`Unclosed variable: ${match}`);
          }
          if (match.includes('${') && !match.endsWith('}')) {
            errors.push(`Unclosed variable: ${match}`);
          }
          if (match.includes('<') && !match.endsWith('>')) {
            errors.push(`Unclosed variable: ${match}`);
          }
        });
      }
    } catch (error) {
      errors.push(`Template validation error: ${error}`);
    }
    return { valid: errors.length === 0, errors };
  }

  getVariables(template: string): string[] {
    const variables = new Set<string>();
    const patterns = [/{{([^}]+)}}/g, /\$\{([^}]+)\}/g, /<([^>]+)>/g];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(template)) !== null) {
        variables.add(match[1].trim());
      }
    });

    return Array.from(variables);
  }

  registerHelper(name: string, fn: (...args: any[]) => any): void {
    // Simple implementation - could be enhanced
    logInfo('Template helper registered', { name });
  }

  registerTemplate(name: string, template: string): void {
    const templateObj: PromptTemplate = {
      id: name,
      name,
      template,
      variables: z.object({}), // Default empty schema
    };
    this.register(templateObj);
  }
}

/**
 * Global template registry
 */
export const globalTemplateRegistry = new PromptTemplateRegistry();

/**
 * Create a prompt template
 */
export function createPromptTemplate<T>(
  config: Omit<PromptTemplate<T>, 'id'> & { id?: string },
): PromptTemplate<T> {
  const template: PromptTemplate<T> = {
    id: config.id || `template_${Date.now()}`,
    ...config,
  };

  return template;
}

/**
 * Common prompt templates
 */
export const commonTemplates = {
  /**
   * System message template
   */
  systemMessage: createPromptTemplate({
    id: 'system_message',
    name: 'System Message',
    description: 'Standard system message for AI assistants',
    template: `You are {{role}}. {{instructions}}

{{#constraints}}
Constraints:
{{constraints}}
{{/constraints}}

{{#examples}}
Examples:
{{examples}}
{{/examples}}`,
    variables: z.object({
      role: z.string().describe('The role of the AI assistant'),
      instructions: z.string().describe('Specific instructions for the assistant'),
      constraints: z.string().optional().describe('Any constraints or limitations'),
      examples: z.string().optional().describe('Example interactions'),
    }),
    metadata: {
      category: 'system',
      tags: ['core', 'system'],
    },
  }),

  /**
   * Chain of thought template
   */
  chainOfThought: createPromptTemplate({
    id: 'chain_of_thought',
    name: 'Chain of Thought',
    description: 'Prompt for step-by-step reasoning',
    template: `{{task}}

Let's approach this step-by-step:

1. First, I'll {{step1}}
2. Then, I'll {{step2}}
3. Next, I'll {{step3}}
{{#additionalSteps}}
{{additionalSteps}}
{{/additionalSteps}}
4. Finally, I'll {{finalStep}}

Let me work through each step:`,
    variables: z.object({
      task: z.string(),
      step1: z.string(),
      step2: z.string(),
      step3: z.string(),
      additionalSteps: z.string().optional(),
      finalStep: z.string(),
    }),
    metadata: {
      category: 'reasoning',
      tags: ['cot', 'reasoning'],
    },
  }),

  /**
   * Few-shot learning template
   */
  fewShot: createPromptTemplate({
    id: 'few_shot',
    name: 'Few-Shot Learning',
    description: 'Template for few-shot learning prompts',
    template: `{{instruction}}

{{#examples}}
{{examples}}
{{/examples}}

Now, {{task}}:`,
    variables: z.object({
      instruction: z.string(),
      examples: z
        .array(
          z.object({
            input: z.string(),
            output: z.string(),
          }),
        )
        .transform(examples =>
          examples.map(e => `Input: ${e.input}\nOutput: ${e.output}`).join('\n\n'),
        ),
      task: z.string(),
    }),
    metadata: {
      category: 'learning',
      tags: ['few-shot', 'examples'],
    },
  }),

  /**
   * Code generation template
   */
  codeGeneration: createPromptTemplate({
    id: 'code_generation',
    name: 'Code Generation',
    description: 'Template for generating code',
    template: `Generate {{language}} code that {{description}}.

Requirements:
{{requirements}}

{{#constraints}}
Constraints:
{{constraints}}
{{/constraints}}

{{#examples}}
Example usage:
{{examples}}
{{/examples}}

Code:`,
    variables: z.object({
      language: z.string(),
      description: z.string(),
      requirements: z.string(),
      constraints: z.string().optional(),
      examples: z.string().optional(),
    }),
    metadata: {
      category: 'code',
      tags: ['code', 'generation'],
    },
  }),

  /**
   * Analysis template
   */
  analysis: createPromptTemplate({
    id: 'analysis',
    name: 'Analysis',
    description: 'Template for analysis tasks',
    template: `Analyze the following {{dataType}}:

{{data}}

Focus on:
{{focusAreas}}

{{#methodology}}
Use the following methodology:
{{methodology}}
{{/methodology}}

Provide your analysis in the following format:
{{format}}`,
    variables: z.object({
      dataType: z.string(),
      data: z.string(),
      focusAreas: z.string(),
      methodology: z.string().optional(),
      format: z.string(),
    }),
    metadata: {
      category: 'analysis',
      tags: ['analysis', 'data'],
    },
  }),
};

/**
 * Template composition utilities
 */
export const templateComposition = {
  /**
   * Combine multiple templates
   */
  combine: (
    templates: Array<{ template: PromptTemplate; prefix?: string; suffix?: string }>,
  ): string => {
    return templates
      .map(({ template, prefix = '', suffix = '' }) => {
        return `${prefix}${template.template}${suffix}`;
      })
      .join('\n\n');
  },

  /**
   * Create a nested template
   */
  nest: (parent: PromptTemplate, child: PromptTemplate, placeholder: string): PromptTemplate => {
    const combinedVariables = z.object({
      ...((parent.variables as any)?._def?.shape || {}),
      ...((child.variables as any)?._def?.shape || {}),
    });

    return createPromptTemplate({
      name: `${parent.name} + ${child.name}`,
      description: `Nested template combining ${parent.name} and ${child.name}`,
      template: parent.template.replace(placeholder, child.template),
      variables: combinedVariables as any,
      metadata: {
        category: 'composite',
        tags: ['nested', ...(parent.metadata?.tags || []), ...(child.metadata?.tags || [])],
      },
    });
  },

  /**
   * Create a conditional template
   */
  conditional: <T extends Record<string, any>>(
    conditions: Array<{
      condition: (vars: T) => boolean;
      template: PromptTemplate<T>;
    }>,
    defaultTemplate: PromptTemplate<T>,
  ) => {
    return {
      render: (variables: T): string => {
        const matchingCondition = conditions.find(c => c.condition(variables));
        const template = matchingCondition?.template || defaultTemplate;
        return globalTemplateRegistry.render(template.id, variables);
      },
    };
  },
};

/**
 * Register common templates
 */
Object.values(commonTemplates).forEach(template => {
  globalTemplateRegistry.register(template as PromptTemplate<any>);
});
