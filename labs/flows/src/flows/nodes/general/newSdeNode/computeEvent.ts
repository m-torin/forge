import {
  ComputeResult,
  generateEventId,
  createComputeSuccess,
  createComputeError,
} from '#/flows/nodes/internal';
import { logInfo, logError } from '@repo/observability';

// Types
type ComputeMode = 'source' | 'destination' | 'enrichment';

interface ProcessConfig {
  mode: ComputeMode;
  eventBridge?: {
    region: string;
    eventBusName: string;
    eventPattern?: Record<string, any>;
    targetConfig?: {
      targetBusName?: string;
      ruleName?: string;
      inputTransform?: {
        template: string;
        paths: Record<string, string>;
      };
    };
  };
  transformation?: {
    rules?: Array<{
      field: string;
      operation: 'map' | 'filter' | 'transform';
      value: string | number | boolean;
    }>;
  };
  validation?: {
    schema?: string;
    rules?: Array<{
      field: string;
      rule: string;
      message: string;
    }>;
  };
}

/**
 * Process input data for source mode
 * Handles event ingestion and initial transformation
 */
const handleSourceEvent = (
  input: Record<string, any>,
  config: ProcessConfig,
): Record<string, any> => {
  logInfo('Processing AWS EventBridge source event', { input });

  // Add AWS EventBridge source processing
  let processed: {
    eventBridge: {
      source: string;
      'detail-type': string;
      detail: Record<string, any>;
      time: string;
    };
  } = {
    eventBridge: {
      source: config.eventBridge?.eventPattern?.source?.[0] || 'aws.custom',
      'detail-type':
        config.eventBridge?.eventPattern?.detailType?.[0] || 'event',
      detail: input,
      time: new Date().toISOString(),
    },
  };

  // Apply transformations if configured
  if (config.transformation?.rules) {
    const transformedData = { ...input };
    config.transformation.rules.forEach(({ field, operation, value }) => {
      switch (operation) {
        case 'map':
          transformedData[field] = value;
          break;
        case 'filter':
          if (!value) delete transformedData[field];
          break;
        case 'transform':
          if (transformedData[field]) {
            transformedData[field] =
              typeof value === 'string'
                ? value.replace('{{value}}', String(transformedData[field]))
                : value;
          }
          break;
      }
    });

    processed = {
      eventBridge: {
        ...processed.eventBridge,
        detail: transformedData,
      },
    };
  }

  return processed;
};

/**
 * Process output data for destination mode
 * Prepares events for target systems
 */
const handleDestinationEvent = async (
  input: Record<string, any>,
  config: ProcessConfig,
): Promise<Record<string, any>> => {
  logInfo('Processing AWS EventBridge destination event', {
    input,
    config,
  });

  if (!config.eventBridge?.targetConfig?.targetBusName) {
    throw new Error('Target EventBridge bus is required for destination mode');
  }

  // Prepare event for target system
  const processed = {
    targetBus: config.eventBridge.targetConfig.targetBusName,
    payload: config.eventBridge.targetConfig.inputTransform
      ? transformEventInput(
          input,
          config.eventBridge.targetConfig.inputTransform,
        )
      : input,
    timestamp: new Date().toISOString(),
  };

  return processed;
};

/**
 * Process enrichment events
 * Handles data transformation and validation
 */
const handleEnrichmentEvent = async (
  input: Record<string, any>,
  config: ProcessConfig,
): Promise<Record<string, any>> => {
  logInfo('Processing AWS EventBridge enrichment event', {
    input,
    config,
  });

  let processed = { ...input };

  // Apply transformations
  if (config.transformation?.rules) {
    processed = config.transformation.rules.reduce((acc, rule) => {
      const { field, operation, value } = rule;
      switch (operation) {
        case 'map':
          return { ...acc, [field]: value };
        case 'filter':
          const { [field]: _removed, ...rest } = acc;
          return value ? acc : rest;
        case 'transform':
          return {
            ...acc,
            [field]:
              typeof value === 'string'
                ? value.replace('{{value}}', acc[field])
                : value,
          };
        default:
          return acc;
      }
    }, processed);
  }

  // Apply validation if configured
  if (config.validation?.rules) {
    const validationErrors = [];
    for (const rule of config.validation.rules) {
      try {
        // Add validation logic here
        logInfo(`Validating rule: ${rule.field} - ${rule.rule}`);
      } catch (_error) {
        validationErrors.push(`${rule.field}: ${rule.message}`);
      }
    }
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
  }

  return processed;
};

/**
 * Helper function to transform event input based on template
 */
const transformEventInput = (
  input: Record<string, any>,
  transform: { template: string; paths: Record<string, string> },
): Record<string, any> => {
  let result = transform.template;
  for (const [key, path] of Object.entries(transform.paths)) {
    const value = getValueFromPath(input, path);
    result = result.replace(key, JSON.stringify(value));
  }
  return JSON.parse(result);
};

/**
 * Helper function to get value from object using dot notation path
 */
const getValueFromPath = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

/**
 * Main compute function that processes events based on node mode
 */
export const computeFunction = async (
  input: Record<string, any>,
  data: Record<string, any>,
): Promise<ComputeResult> => {
  try {
    if (!input || !data) {
      throw new Error('Missing required inputs');
    }

    const mode = (data.metadata?.nodeMode || 'source') as ComputeMode;

    const config: ProcessConfig = {
      mode,
      eventBridge: data.metadata?.eventBridge,
      transformation: data.metadata?.transformation,
      validation: data.metadata?.validation,
    };

    let processed;
    let eventIdPrefix;

    switch (mode) {
      case 'source':
        processed = handleSourceEvent(input, config);
        eventIdPrefix = 'aws-eventbridge-source';
        break;

      case 'destination':
        processed = await handleDestinationEvent(input, config);
        eventIdPrefix = 'aws-eventbridge-destination';
        break;

      case 'enrichment':
        processed = await handleEnrichmentEvent(input, config);
        eventIdPrefix = 'aws-eventbridge-enrichment';
        break;

      default:
        throw new Error(`Invalid compute mode: ${mode}`);
    }

    const eventId = generateEventId(eventIdPrefix);

    return createComputeSuccess({
      eventIds: [eventId],
      processedData: { [eventId]: processed },
    });
  } catch (error) {
    logError('AWS EventBridge compute error', { error });
    return createComputeError(error);
  }
};

export const computeWrapper = computeFunction;
