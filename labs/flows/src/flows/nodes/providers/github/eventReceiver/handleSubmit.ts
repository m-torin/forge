// handleSubmit.ts
import { notifications } from '@mantine/notifications';
import { FormValues , formSchema } from './formSchema';
import { configureGithubWebhook } from '#/integrations/github';

/**
 * Type definition for the result of a form submission
 */
type SubmitResult = {
  success: boolean;
  message?: string;
  error?: Error;
  webhookId?: number;
};

/**
 * Shows a notification to the user
 */
const showNotification = (success: boolean, message: string) => {
  notifications.show({
    title: success ? 'Success' : 'Error',
    message,
    color: success ? 'green' : 'red',
  });
};

/**
 * Handles form submission by processing and validating the form values.
 * Configures GitHub webhook and provides feedback through notifications.
 *
 * @param {FormValues} values - The validated form values to submit
 * @returns {Promise<SubmitResult>} Result of the submission operation
 */
export const handleSubmit = async (
  values: FormValues,
): Promise<SubmitResult> => {
  try {
    // Validate form data
    const validation = formSchema.safeParse(values);
    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    // Call the server action to configure webhook
    const result = await configureGithubWebhook(values);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Update webhook URL in form values
    if (values.metadata && result.webhookUrl) {
      values.metadata.webhookUrl = result.webhookUrl;
    }

    const message = 'GitHub webhook configured successfully';
    showNotification(true, message);

    return {
      success: true,
      message,
      webhookId: result.webhookId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Configuration failed';
    showNotification(false, message);

    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
