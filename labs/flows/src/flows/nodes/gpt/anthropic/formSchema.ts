import { z } from 'zod';
import { CLAUDE_MODELS, ClaudeModel } from './types';

/**
 * Zod schema for form validation.
 * Defines the structure and validation rules for form fields.
 */
export const formSchema = z.object({
  name: z.string().nullable(),
  isEnabled: z.boolean(),
  metadata: z
    .object({
      model: z.enum(
        Object.values(CLAUDE_MODELS) as [ClaudeModel, ...ClaudeModel[]],
      ),
      prompt: z.string().min(1, 'Prompt is required'),
      systemPrompt: z.string().optional(),
      temperature: z.number().min(0).max(1),
      maxTokens: z.number().min(1).max(4096),
      topP: z.number().min(0).max(1),
      topK: z.number().min(1),
    })
    .nullable(),
  uxMeta: z.object({
    heading: z.string().optional(),
    isExpanded: z.boolean().optional(),
    layer: z.number().optional(),
    isLocked: z.boolean().optional(),
    rotation: z.number().optional(),
  }),
});

/**
 * Type for form values inferred from the schema.
 */
export type FormValues = z.infer<typeof formSchema>;
