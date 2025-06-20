import { useForm, zodResolver } from '@mantine/form';
import { useEffect } from 'react';
import type { z } from 'zod';

interface UsePimFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook that wraps Mantine's useForm with common PIM configurations
 * - Automatically includes Zod validation
 * - Provides consistent error handling
 * - Includes common form behaviors
 */
export function usePimForm<T>({ schema, initialValues, onSuccess, onError }: UsePimFormOptions<T>) {
  const form = useForm<T>({
    validate: zodResolver(schema),
    initialValues,
    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  // Reset form when modal/drawer closes
  const reset = () => {
    form.reset();
    form.clearErrors();
  };

  // Common submit handler wrapper
  const handleSubmit = (submitFn: (values: T) => Promise<void>) => {
    return form.onSubmit(async (values) => {
      try {
        await submitFn(values);
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        // Re-throw to let component handle specific errors
        throw error;
      }
    });
  };

  return {
    ...form,
    reset,
    handleSubmit,
  };
}
