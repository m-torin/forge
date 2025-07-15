/**
 * Structured Data Generation Tools using @repo/ai
 * Provides AI SDK v5 tools for generating structured outputs
 */

import { myProvider } from '#/lib/ai/providers';
import { logError } from '@repo/observability';
import { generateObject, tool } from 'ai';
import { z } from 'zod/v4';

// Default model for structured generation
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Meeting Notes Structuring Tool
 */
export const structureMeetingNotesTool = tool({
  description:
    'Convert unstructured meeting notes into a well-organized format with attendees, agenda, key discussions, and action items',
  parameters: z.object({
    rawNotes: z.string().describe('The raw, unstructured meeting notes'),
    date: z.string().optional().describe('Meeting date (YYYY-MM-DD)'),
  }),
  execute: async ({ rawNotes, date }) => {
    try {
      const model = myProvider.languageModel(DEFAULT_MODEL);

      const result = await generateObject({
        model,
        prompt: `Structure these meeting notes into a proper format: ${rawNotes}`,
        schema: z.object({
          title: z.string(),
          attendees: z.array(z.string()),
          agenda: z.array(z.string()),
          keyDiscussions: z.array(z.string()),
          actionItems: z.array(
            z.object({
              task: z.string(),
              assignee: z.string().optional(),
              dueDate: z.string().optional(),
            }),
          ),
        }),
      });

      // Add date if provided (but skip assignment since object might be readonly)
      const structuredNotes = { ...result.object };
      if (date) {
        (structuredNotes as any).date = date;
      }

      return {
        success: true,
        structuredNotes: date ? structuredNotes : result.object,
        tokens: result.usage?.totalTokens,
      };
    } catch (error) {
      logError('Failed to structure meeting notes', error);
      return {
        success: false,
        error: 'Failed to structure meeting notes',
      };
    }
  },
});

/**
 * Task List Generation Tool
 */
export const generateTaskListTool = tool({
  description: 'Generate a prioritized task list from a project description or goals',
  parameters: z.object({
    projectDescription: z.string().describe('Description of the project or goals'),
    maxTasks: z.number().optional().default(10).describe('Maximum number of tasks to generate'),
  }),
  execute: async ({ projectDescription, maxTasks = 10 }) => {
    try {
      const model = myProvider.languageModel(DEFAULT_MODEL);

      const result = await generateObject({
        model,
        prompt: `Break down this project into actionable tasks: ${projectDescription}`,
        schema: z.object({
          tasks: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              priority: z.enum(['high', 'medium', 'low']),
              estimatedTime: z.string().optional(),
            }),
          ),
        }),
      });

      // Limit tasks if needed
      if (result.object && result.object.tasks && result.object.tasks.length > maxTasks) {
        result.object.tasks = result.object.tasks.slice(0, maxTasks);
      }

      return {
        success: true,
        taskList: result.object,
        tokens: result.usage?.totalTokens,
      };
    } catch (error) {
      logError('Failed to generate task list', error);
      return {
        success: false,
        error: 'Failed to generate task list',
      };
    }
  },
});

/**
 * Key Information Extraction Tool
 */
export const extractKeyInfoTool = tool({
  description: 'Extract key information, summary, and sentiment from any text',
  parameters: z.object({
    text: z.string().describe('Text to analyze'),
    focusAreas: z.array(z.string()).optional().describe('Specific areas to focus on'),
  }),
  execute: async ({ text, focusAreas }) => {
    try {
      const model = myProvider.languageModel(DEFAULT_MODEL);

      const prompt =
        focusAreas && focusAreas.length > 0
          ? `Extract key information from the following text, focusing on: ${focusAreas.join(', ')}

${text}`
          : text;

      const result = await generateObject({
        model,
        prompt: `Extract key information from this text: ${prompt}`,
        schema: z.object({
          keyPoints: z.array(z.string()),
          summary: z.string(),
          categories: z.array(z.string()).optional(),
        }),
      });

      return {
        success: true,
        keyInfo: result.object,
        tokens: result.usage?.totalTokens,
      };
    } catch (error) {
      logError('Failed to extract key information', error);
      return {
        success: false,
        error: 'Failed to extract key information',
      };
    }
  },
});

/**
 * Contact Information Extraction Tool
 */
export const extractContactInfoTool = tool({
  description: 'Extract contact information (names, emails, phones, addresses) from text',
  parameters: z.object({
    text: z.string().describe('Text containing contact information'),
  }),
  execute: async ({ text }) => {
    try {
      const model = myProvider.languageModel(DEFAULT_MODEL);

      const result = await generateObject({
        model,
        prompt: `Extract contact information from this text: ${text}`,
        schema: z.object({
          contacts: z.array(
            z.object({
              name: z.string().optional(),
              email: z.string().optional(),
              phone: z.string().optional(),
              organization: z.string().optional(),
            }),
          ),
        }),
      });

      return {
        success: true,
        contactInfo: result.object,
        tokens: result.usage?.totalTokens,
      };
    } catch (error) {
      logError('Failed to extract contact info', error);
      return {
        success: false,
        error: 'Failed to extract contact information',
      };
    }
  },
});

/**
 * Custom Schema Generation Tool
 */
export const generateStructuredDataTool = tool({
  description: 'Generate structured data based on a custom schema and prompt',
  parameters: z.object({
    prompt: z.string().describe('Prompt describing what to generate'),
    schemaType: z.enum(['json', 'simple']).default('simple').describe('Type of schema to use'),
    exampleOutput: z
      .record(z.string(), z.any())
      .optional()
      .describe('Example of desired output structure'),
  }),
  execute: async ({ prompt, schemaType, exampleOutput }) => {
    try {
      const model = myProvider.languageModel(DEFAULT_MODEL);

      // If example output provided, create a schema from it
      let schema;
      if (exampleOutput && schemaType === 'simple') {
        // Create a basic schema from the example
        const schemaFields: Record<string, any> = {};
        for (const [key, value] of Object.entries(exampleOutput)) {
          if (typeof value === 'string') {
            schemaFields[key] = z.string();
          } else if (typeof value === 'number') {
            schemaFields[key] = z.number();
          } else if (typeof value === 'boolean') {
            schemaFields[key] = z.boolean();
          } else if (Array.isArray(value)) {
            schemaFields[key] = z.array(z.any());
          } else {
            schemaFields[key] = z.any();
          }
        }
        schema = z.object(schemaFields);
      } else {
        // Use a generic schema
        schema = z.object({
          data: z.any(),
          metadata: z
            .object({
              generated: z.boolean(),
              timestamp: z.string(),
            })
            .optional(),
        });
      }

      const result = await generateObject({
        model,
        prompt,
        schema,
      });

      return {
        success: true,
        structuredData: result.object,
        tokens: result.usage?.totalTokens,
      };
    } catch (error) {
      logError('Failed to generate structured data', error);
      return {
        success: false,
        error: 'Failed to generate structured data',
      };
    }
  },
});

/**
 * Article Generation Tool with Structure
 */
export const generateArticleTool = tool({
  description: 'Generate a well-structured article with title, sections, and conclusion',
  parameters: z.object({
    topic: z.string().describe('Topic for the article'),
    targetLength: z
      .enum(['short', 'medium', 'long'])
      .default('medium')
      .describe('Target article length'),
    tone: z
      .enum(['formal', 'casual', 'technical', 'educational'])
      .default('educational')
      .describe('Writing tone'),
  }),
  execute: async ({ topic, targetLength = 'medium', tone = 'educational' }) => {
    try {
      const model = myProvider.languageModel(DEFAULT_MODEL);

      const _prompt = `Write a ${targetLength} ${tone} article about: ${topic}. Include an engaging introduction, well-organized sections with clear headings, and a strong conclusion.`;

      const result = await generateObject({
        model,
        prompt: `Write a ${targetLength} article about: ${topic}`,
        schema: z.object({
          title: z.string(),
          introduction: z.string(),
          sections: z.array(
            z.object({
              heading: z.string(),
              content: z.string(),
            }),
          ),
          conclusion: z.string(),
        }),
      });

      return {
        success: true,
        article: result.object,
        wordCount: result.object
          ? (
              result.object.introduction +
              result.object.sections.map(s => s.content).join(' ') +
              result.object.conclusion
            ).split(' ').length
          : 0,
        tokens: result.usage?.totalTokens,
      };
    } catch (error) {
      logError('Failed to generate article', error);
      return {
        success: false,
        error: 'Failed to generate article',
      };
    }
  },
});

/**
 * Get all structured data tools for user type
 */
export function getStructuredDataTools(userType: string): Record<string, any> {
  const basicTools = {
    extractKeyInfo: extractKeyInfoTool,
    generateTaskList: generateTaskListTool,
  };

  const premiumTools = {
    ...basicTools,
    structureMeetingNotes: structureMeetingNotesTool,
    extractContactInfo: extractContactInfoTool,
    generateArticle: generateArticleTool,
    generateStructuredData: generateStructuredDataTool,
  };

  return userType === 'premium' ? premiumTools : basicTools;
}
