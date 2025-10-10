import { z } from 'zod/v4';

/**
 * Zod schema for form validation.
 * Defines the structure and validation rules for form fields.
 */
export const formSchema = z.object({
  name: z.string().nullable(),
  isEnabled: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
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
