import { z } from 'zod';
import { OPENAI_MODELS, OpenAIModel } from './types';

/**
 * Zod schema for form validation.
 * Defines the structure and validation rules for form fields.
 */
const metadataSchema = z
  .object({
    model: z.enum(
      Object.values(OPENAI_MODELS) as [OpenAIModel, ...OpenAIModel[]],
    ),
    prompt: z.string().min(1, 'Prompt is required'),
    systemPrompt: z.string().optional(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(1).max(4096),
    topP: z.number().min(0).max(1),
    presencePenalty: z.number().min(-2).max(2),
    frequencyPenalty: z.number().min(-2).max(2),
  })
  .nullable();

export const formSchema = z.object({
  name: z.string().nullable(),
  isEnabled: z.boolean(),
  metadata: metadataSchema,
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
export type MetadataValues = z.infer<typeof metadataSchema>;
