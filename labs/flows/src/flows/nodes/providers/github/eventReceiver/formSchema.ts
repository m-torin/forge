import { z } from 'zod/v4';

/**
 * Zod schema for form validation.
 * Defines the structure and validation rules for form fields.
 */
export const formSchema = z.object({
  name: z.string().nullable(),
  isEnabled: z.boolean(),
  metadata: z
    .object({
      repositoryUrl: z.string().url(),
      secret: z.string().min(8),
      events: z.array(z.string()),
      webhookUrl: z.string().url().optional(),
    })
    .nullable(),
  uxMeta: z.object({
    heading: z.string().optional(),
    isExpanded: z.boolean().optional(),
    layer: z.number().optional(),
  }),
});

/**
 * Type for form values inferred from the schema.
 */
export type FormValues = z.infer<typeof formSchema>;
