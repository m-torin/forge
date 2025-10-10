// JavaScriptEditorNode/formSchema.ts
import { z } from 'zod/v4';

const validateJavaScript = (code: string): boolean => {
  try {
    new Function(code);
    return true;
  } catch {
    return false;
  }
};

export const formSchema = z.object({
  name: z.string().nullable(),
  isEnabled: z.boolean(),
  metadata: z
    .object({
      code: z
        .string()
        .min(1, 'Code cannot be empty')
        .refine(validateJavaScript, {
          message: 'Invalid JavaScript code syntax',
        }),
      language: z.enum(['javascript', 'typescript']),
      autoFormat: z.boolean(),
      theme: z.enum(['dracula', 'vs-dark', 'light']),
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

export type FormValues = z.infer<typeof formSchema>;
