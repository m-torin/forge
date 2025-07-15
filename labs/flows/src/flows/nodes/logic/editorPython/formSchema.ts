// PythonEditorNode/formSchema.ts
import { z } from 'zod';

const validatePython = (code: string): boolean => {
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
      code: z.string().min(1, 'Code cannot be empty').refine(validatePython, {
        message: 'Invalid Python code syntax',
      }),
      language: z.enum(['python', 'typescript']),
      autoFormat: z.boolean(),
      theme: z.enum(['vs-dark', 'light']),
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
