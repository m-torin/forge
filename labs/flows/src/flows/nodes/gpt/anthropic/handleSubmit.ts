import { formSchema, FormValues } from './formSchema';
import { logInfo, logError } from '@repo/observability';

/**
 * Type definition for the result of a form submission
 */
type SubmitResult = {
  success: boolean;
  message?: string;
  error?: Error;
};

/**
 * Handles form submission by processing and validating the form values.
 * This function encapsulates validation, transformation, and submission logic.
 *
 * @param {FormValues} values - The form values to submit
 * @returns {Promise<SubmitResult>} Result of the submission operation
 */
export const handleSubmit = async (
  values: FormValues,
): Promise<SubmitResult> => {
  try {
    // Additional validation using zod schema
    const validation = formSchema.safeParse(values);
    if (!validation.success) {
      return {
        success: false,
        error: new Error(validation.error.message),
      };
    }

    // Early exit if required metadata is missing
    if (!values.metadata) {
      return {
        success: false,
        error: new Error('Missing required metadata configuration'),
      };
    }

    // Transform values for API submission
    const transformedData = {
      name: values.name,
      isEnabled: values.isEnabled,
      metadata: {
        ...values.metadata,
        // Ensure numbers are within bounds
        temperature: Math.max(0, Math.min(1, values.metadata.temperature)),
        maxTokens: Math.max(1, Math.min(4096, values.metadata.maxTokens)),
        topP: Math.max(0, Math.min(1, values.metadata.topP)),
        topK: Math.max(1, values.metadata.topK),
        // Ensure strings are properly trimmed
        prompt: values.metadata.prompt.trim(),
        systemPrompt: values.metadata.systemPrompt?.trim(),
      },
      uxMeta: values.uxMeta,
    };

    logInfo('Processing form submission', { transformedData });

    return {
      success: true,
      message: 'Form submitted successfully',
    };
  } catch (error) {
    logError('Form submission failed', { error });
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
