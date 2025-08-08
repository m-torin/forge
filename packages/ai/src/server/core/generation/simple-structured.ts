/**
 * Simple structured data generation using AI SDK v5
 * Provides easy-to-use functions for generating structured data
 */

import { generateObject, streamObject } from 'ai';
import { z } from 'zod/v4';

/**
 * Common schemas for structured data generation
 */
export const CommonSchemas = {
  /** Extract key information from text */
  keyInformation: z.object({
    mainPoints: z.array(z.string()).describe('Main points from the text'),
    summary: z.string().describe('Brief summary'),
    keywords: z.array(z.string()).describe('Important keywords'),
    sentiment: z.enum(['positive', 'negative', 'neutral']).describe('Overall sentiment'),
  }),

  /** Generate a structured article */
  article: z.object({
    title: z.string().describe('Article title'),
    introduction: z.string().describe('Introduction paragraph'),
    sections: z
      .array(
        z.object({
          heading: z.string(),
          content: z.string(),
        }),
      )
      .describe('Article sections'),
    conclusion: z.string().describe('Conclusion paragraph'),
    tags: z.array(z.string()).describe('Relevant tags'),
  }),

  /** Create a task list */
  taskList: z.object({
    title: z.string().describe('Task list title'),
    tasks: z
      .array(
        z.object({
          task: z.string().describe('Task description'),
          priority: z.enum(['low', 'medium', 'high']).describe('Task priority'),
          estimatedTime: z.string().describe('Estimated time (e.g., "2 hours")'),
        }),
      )
      .describe('List of tasks'),
    totalEstimatedTime: z.string().describe('Total estimated time'),
  }),

  /** Extract contact information */
  contactInfo: z.object({
    name: z.string().optional().describe('Person or company name'),
    email: z.string().optional().describe('Email address'),
    phone: z.string().optional().describe('Phone number'),
    address: z.string().optional().describe('Physical address'),
    website: z.string().optional().describe('Website URL'),
    socialMedia: z
      .array(
        z.object({
          platform: z.string(),
          handle: z.string(),
        }),
      )
      .optional()
      .describe('Social media accounts'),
  }),

  /** Meeting notes structure */
  meetingNotes: z.object({
    title: z.string().describe('Meeting title'),
    date: z.string().describe('Meeting date'),
    attendees: z.array(z.string()).describe('List of attendees'),
    agenda: z.array(z.string()).describe('Meeting agenda items'),
    keyDiscussions: z.array(z.string()).describe('Key discussion points'),
    actionItems: z
      .array(
        z.object({
          task: z.string(),
          assignee: z.string(),
          deadline: z.string().optional(),
        }),
      )
      .describe('Action items with assignees'),
    nextSteps: z.array(z.string()).describe('Next steps'),
  }),
};

/**
 * Quick generation functions for common use cases
 */
export class StructuredUtils {
  /**
   * Extract key information from any text
   */
  static async extractKeyInfo(model: any, text: string) {
    return generateObject({
      experimental_telemetry: { isEnabled: true },
      model,
      schema: CommonSchemas.keyInformation,
      prompt: `Extract key information from the following text:

${text}`,
    } as any);
  }

  /**
   * Generate a structured article from a topic
   */
  static async generateArticle(model: any, topic: string, targetLength = 'medium') {
    return generateObject({
      experimental_telemetry: { isEnabled: true },
      model,
      schema: CommonSchemas.article,
      prompt: `Write a ${targetLength} article about: ${topic}. Include an introduction, several sections with headings, and a conclusion.`,
    } as any);
  }

  /**
   * Create a task list from a project description
   */
  static async createTaskList(model: any, projectDescription: string) {
    return generateObject({
      experimental_telemetry: { isEnabled: true },
      model,
      schema: CommonSchemas.taskList,
      prompt: `Create a detailed task list for the following project:

${projectDescription}

Break it down into actionable tasks with priorities and time estimates.`,
    } as any);
  }

  /**
   * Extract contact information from text
   */
  static async extractContactInfo(model: any, text: string) {
    return generateObject({
      experimental_telemetry: { isEnabled: true },
      model,
      schema: CommonSchemas.contactInfo,
      prompt: `Extract any contact information from the following text:

${text}`,
    } as any);
  }

  /**
   * Structure meeting notes from raw notes
   */
  static async structureMeetingNotes(model: any, rawNotes: string) {
    return generateObject({
      experimental_telemetry: { isEnabled: true },
      model,
      schema: CommonSchemas.meetingNotes,
      prompt: `Structure the following raw meeting notes into a well-organized format:

${rawNotes}`,
    } as any);
  }
}

/**
 * Simple structured data generator that wraps AI SDK functions
 */
export function quickGenerate<T>(
  model: any,
  schema: z.ZodSchema<T>,
  prompt: string,
  options: {
    system?: string;
    temperature?: number;
    maxRetries?: number;
  } = {},
) {
  return generateObject({
    experimental_telemetry: { isEnabled: true },
    model,
    schema,
    prompt,
    system: options.system,
    temperature: options.temperature,
    maxRetries: options.maxRetries ?? 2,
  } as any);
}

/**
 * Stream structured data generation
 */
export function quickStreamGenerate<T>(
  model: any,
  schema: z.ZodSchema<T>,
  prompt: string,
  options: {
    system?: string;
    temperature?: number;
  } = {},
) {
  return streamObject({
    model,
    schema,
    prompt,
    system: options.system,
    temperature: options.temperature,
    experimental_telemetry: { isEnabled: true },
  } as any);
}
