import { logInfo, logError } from '@repo/observability';
import { FormValues } from './formSchema';

/**
 * Type definition for the form submission result
 */
type SubmitResult = {
  success: boolean;
  message?: string;
  error?: Error;
};

/**
 * Process source mode form submission
 */
const handleSourceSubmit = async (values: FormValues): Promise<void> => {
  if (values.metadata.nodeMode !== 'source') throw new Error('Invalid mode');

  logInfo('Processing EventBridge source configuration', {
    eventBridge: values.metadata.source.eventBridge,
    validation: values.metadata.source.inputValidation,
  });

  // Here you would typically:
  // - Validate EventBridge event pattern
  // - Check permissions and IAM roles
  // - Configure event rules
  // - Set up event filtering
  // - Establish event routing
};

/**
 * Process destination mode form submission
 */
const handleDestinationSubmit = async (values: FormValues): Promise<void> => {
  if (values.metadata.nodeMode !== 'destination')
    throw new Error('Invalid mode');

  logInfo('Processing EventBridge destination configuration', {
    targetSystem: values.metadata.destination.targetSystem,
    eventBridge: values.metadata.destination.eventBridge,
  });

  // Here you would typically:
  // - Validate target configuration
  // - Set up event bus targets
  // - Configure input transformations
  // - Set up error handling and DLQ
  // - Establish connectivity
};

/**
 * Process enrichment mode form submission
 */
const handleEnrichmentSubmit = async (values: FormValues): Promise<void> => {
  if (values.metadata.nodeMode !== 'enrichment')
    throw new Error('Invalid mode');

  logInfo('Processing EventBridge enrichment configuration', {
    enrichmentType: values.metadata.enrichment.enrichmentType,
    eventBridge: values.metadata.enrichment.eventBridge,
  });

  // Here you would typically:
  // - Set up enrichment rules
  // - Configure transformations
  // - Establish validation rules
  // - Set up caching if enabled
};

/**
 * Handles form submission by processing and validating the form values.
 * Routes processing based on node mode and handles AWS EventBridge specific logic.
 *
 * @param {FormValues} values - The validated form values to submit
 * @returns {Promise<SubmitResult>} Result of the submission operation
 */
export const handleSubmit = async (
  values: FormValues,
): Promise<SubmitResult> => {
  try {
    logInfo('Processing EventBridge form submission', {
      mode: values.metadata.nodeMode,
      name: values.name,
    });

    // Validate required fields are present
    if (!values.metadata) {
      return {
        success: false,
        error: new Error('Missing metadata configuration'),
      };
    }

    // Process based on node mode
    switch (values.metadata.nodeMode) {
      case 'source':
        await handleSourceSubmit(values);
        break;

      case 'destination':
        await handleDestinationSubmit(values);
        break;

      case 'enrichment':
        await handleEnrichmentSubmit(values);
        break;

      default:
        break;
    }

    return {
      success: true,
      message: `EventBridge ${values.metadata.nodeMode} configuration saved successfully`,
    };
  } catch (error) {
    logError('EventBridge form submission failed', { error });
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
