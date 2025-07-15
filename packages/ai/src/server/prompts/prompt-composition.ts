/**
 * Prompt Composition System
 * Dynamic prompt generation and composition
 */

import { logInfo } from '@repo/observability/server/next';
import { globalTemplateRegistry } from './prompt-templates';

/**
 * Prompt component interface
 */
export interface PromptComponent {
  id: string;
  type: 'static' | 'template' | 'dynamic' | 'conditional';
  content?: string;
  templateId?: string;
  generator?: (context: any) => string | Promise<string>;
  condition?: (context: any) => boolean;
  children?: PromptComponent[];
}

/**
 * Prompt composition builder
 */
export class PromptComposer {
  private components: PromptComponent[] = [];
  private context: Record<string, any> = {};

  /**
   * Add a static text component
   */
  addStatic(content: string): this {
    this.components.push({
      id: `static_${Date.now()}`,
      type: 'static',
      content,
    });
    return this;
  }

  /**
   * Add a template component
   */
  addTemplate(templateId: string, variables?: any): this {
    this.components.push({
      id: `template_${Date.now()}`,
      type: 'template',
      templateId,
      content: variables ? JSON.stringify(variables) : undefined,
    });
    return this;
  }

  /**
   * Add a dynamic component
   */
  addDynamic(generator: (context: any) => string | Promise<string>): this {
    this.components.push({
      id: `dynamic_${Date.now()}`,
      type: 'dynamic',
      generator,
    });
    return this;
  }

  /**
   * Add a conditional component
   */
  addConditional(
    condition: (context: any) => boolean,
    ifTrue: PromptComponent | string,
    ifFalse?: PromptComponent | string,
  ): this {
    const trueComponent =
      typeof ifTrue === 'string'
        ? { id: 'true', type: 'static' as const, content: ifTrue }
        : ifTrue;

    const falseComponent = ifFalse
      ? typeof ifFalse === 'string'
        ? { id: 'false', type: 'static' as const, content: ifFalse }
        : ifFalse
      : undefined;

    this.components.push({
      id: `conditional_${Date.now()}`,
      type: 'conditional',
      condition,
      children: falseComponent ? [trueComponent, falseComponent] : [trueComponent],
    });
    return this;
  }

  /**
   * Add a section with optional header
   */
  addSection(header: string, content: string | PromptComponent[]): this {
    if (header) {
      this.addStatic(`
${header}
${'='.repeat(header.length)}
`);
    }

    if (typeof content === 'string') {
      this.addStatic(content);
    } else {
      content.forEach(component => {
        this.components.push(component);
      });
    }

    this.addStatic(`
`);
    return this;
  }

  /**
   * Add a list
   */
  addList(items: string[], ordered = false): this {
    const list = items
      .map((item, index) => (ordered ? `${index + 1}. ${item}` : `- ${item}`))
      .join('\n');
    this.addStatic(list);
    return this;
  }

  /**
   * Set context for dynamic components
   */
  setContext(context: Record<string, any>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Build the final prompt
   */
  async build(): Promise<string> {
    const parts: string[] = [];

    for (const component of this.components) {
      const part = await this.renderComponent(component);
      if (part) {
        parts.push(part);
      }
    }

    const prompt = parts.join('');

    logInfo('Prompt Composer: Built prompt', {
      operation: 'prompt_compose_build',
      metadata: {
        componentCount: this.components.length,
        promptLength: prompt.length,
      },
    });

    return prompt;
  }

  /**
   * Render a single component
   */
  private async renderComponent(component: PromptComponent): Promise<string> {
    switch (component.type) {
      case 'static':
        return component.content || '';

      case 'template': {
        if (!component.templateId) return '';
        const variables = component.content ? JSON.parse(component.content) : {};
        return globalTemplateRegistry.render(component.templateId, {
          ...this.context,
          ...variables,
        });
      }

      case 'dynamic': {
        if (!component.generator) return '';
        return await component.generator(this.context);
      }

      case 'conditional': {
        if (!component.condition || !component.children) return '';
        const conditionMet = component.condition(this.context);
        const childIndex = conditionMet ? 0 : 1;
        const child = component.children[childIndex];
        return child ? await this.renderComponent(child) : '';
      }

      default:
        return '';
    }
  }
}

/**
 * Prompt composition patterns
 */
export const promptCompositionPatterns = {
  /**
   * Create a role-based prompt
   */
  roleBasedPrompt: (role: string, task: string, constraints?: string[]) => {
    return new PromptComposer()
      .addTemplate('system_message', {
        role,
        instructions: task,
        constraints: constraints?.join('\n'),
      })
      .build();
  },

  /**
   * Create a multi-step prompt
   */
  multiStepPrompt: (steps: Array<{ title: string; description: string }>) => {
    const composer = new PromptComposer();

    composer.addStatic('Follow these steps:\n\n');

    steps.forEach((step, index) => {
      composer.addStatic(`Step ${index + 1}: ${step.title}\n`);
      composer.addStatic(`${step.description}\n\n`);
    });

    return composer.build();
  },

  /**
   * Create a context-aware prompt
   */
  contextAwarePrompt: (
    basePrompt: string,
    contextProviders: Array<{
      name: string;
      provider: () => Promise<string>;
      required?: boolean;
    }>,
  ) => {
    return async () => {
      const composer = new PromptComposer();
      composer.addStatic(basePrompt);

      for (const { name, provider, required } of contextProviders) {
        try {
          const context = await provider();
          if (context) {
            composer.addSection(name, context);
          } else if (required) {
            throw new Error(`Required context '${name}' not available`);
          }
        } catch (error) {
          if (required) {
            throw error;
          }
          // Skip optional context on error
        }
      }

      return composer.build();
    };
  },

  /**
   * Create a formatted data prompt
   */
  formattedDataPrompt: (
    instruction: string,
    data: any,
    format: 'json' | 'yaml' | 'table' | 'list',
  ) => {
    const composer = new PromptComposer();
    composer.addStatic(instruction + '\n\n');

    switch (format) {
      case 'json':
        composer.addStatic("'''json\n");
        composer.addStatic(JSON.stringify(data, null, 2));
        composer.addStatic("\n'''\n");
        break;

      case 'yaml':
        composer.addStatic("'''yaml\n");
        composer.addDynamic(() => {
          // Simple YAML conversion (would use a proper library in production)
          return Object.entries(data)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join('\n');
        });
        composer.addStatic("\n'''\n");
        break;

      case 'table':
        composer.addDynamic(() => {
          if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const rows = data.map(item => headers.map(h => String(item[h] || '')).join(' | '));
            return [headers.join(' | '), headers.map(() => '---').join(' | '), ...rows].join('\n');
          }
          return JSON.stringify(data, null, 2);
        });
        break;

      case 'list':
        composer.addDynamic(() => {
          if (Array.isArray(data)) {
            return data.map((item, i) => `${i + 1}. ${JSON.stringify(item)}`).join('\n');
          }
          return Object.entries(data)
            .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
            .join('\n');
        });
        break;
    }

    return composer.build();
  },
};

/**
 * Dynamic prompt generator
 */
export class DynamicPromptGenerator {
  private rules: Array<{
    condition: (context: any) => boolean;
    modifier: (prompt: string, context: any) => string;
  }> = [];

  /**
   * Add a modification rule
   */
  addRule(
    condition: (context: any) => boolean,
    modifier: (prompt: string, context: any) => string,
  ): this {
    this.rules.push({ condition, modifier });
    return this;
  }

  /**
   * Generate prompt with rules applied
   */
  generate(basePrompt: string, context: any): string {
    let prompt = basePrompt;

    for (const { condition, modifier } of this.rules) {
      if (condition(context)) {
        prompt = modifier(prompt, context);
      }
    }

    return prompt;
  }
}

/**
 * Prompt builder with fluent API
 */
export function prompt(): PromptComposer {
  return new PromptComposer();
}

/**
 * Create a prompt from parts
 */
export function createPrompt(
  ...parts: Array<string | (() => string | Promise<string>)>
): Promise<string> {
  const composer = new PromptComposer();

  for (const part of parts) {
    if (typeof part === 'string') {
      composer.addStatic(part);
    } else {
      composer.addDynamic(part);
    }
  }

  return composer.build();
}
