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
 * This function should encapsulate all submission-related side effects.
 *
 * @param {FormValues} values - The validated form values to submit
 * @returns {Promise<SubmitResult>} Result of the submission operation
 */
export const handleSubmit = async (
  values: FormValues,
): Promise<SubmitResult> => {
  try {
    // Validate against schema
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

    // Transform and sanitize values
    const transformedData = {
      name: values.name,
      isEnabled: values.isEnabled,
      metadata: {
        ...values.metadata,
        // Ensure numbers are within OpenAI's bounds
        temperature: Math.max(0, Math.min(2, values.metadata.temperature)),
        maxTokens: Math.max(1, Math.min(4096, values.metadata.maxTokens)),
        topP: Math.max(0, Math.min(1, values.metadata.topP)),
        // OpenAI specific parameters
        presencePenalty: Math.max(
          -2,
          Math.min(2, values.metadata.presencePenalty),
        ),
        frequencyPenalty: Math.max(
          -2,
          Math.min(2, values.metadata.frequencyPenalty),
        ),
        // Sanitize strings
        prompt: values.metadata.prompt.trim(),
        systemPrompt: values.metadata.systemPrompt?.trim() || '',
      },
      uxMeta: values.uxMeta,
    };

    // Validate prompt template format
    if (
      transformedData.metadata.prompt.includes('{{') &&
      !transformedData.metadata.prompt.includes('}}')
    ) {
      return {
        success: false,
        error: new Error('Invalid prompt template format. Missing closing }}'),
      };
    }

    logInfo('Processing OpenAI form submission', { transformedData });

    // Here you would typically save to your database
    // await saveNodeConfig(transformedData);

    return {
      success: true,
      message: 'OpenAI configuration saved successfully',
    };
  } catch (error) {
    logError('OpenAI form submission failed', { error });
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
