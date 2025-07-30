// computeEvent.ts

import {
  ComputeResult,
  generateEventId,
  createComputeSuccess,
  createComputeError,
} from '#/flows/nodes/internal';
import { logError } from '@repo/observability';

/**
 * Process input data according to node configuration
 * @param data - Raw input data
 * @returns Processed data with any transformations applied
 */
const processInput = (data: Record<string, any>): Record<string, any> => {
  // Add any input processing logic here
  return data;
};

/**
 * Main compute function that processes incoming data
 * Validates, transforms, and generates events based on the input
 *
 * @param input - Raw input data to process
 * @param data - Form values containing node settings
 * @returns Promise<ComputeResult> - Result of the computation
 */
export const computeFunction = async (
  ...args: any[]
): Promise<ComputeResult> => {
  const [input, data] = args;

  try {
    // Validate inputs exist
    if (!input || !data) {
      throw new Error('Missing required inputs');
    }

    // Process the input data
    const processed = processInput(input);

    // Generate event ID and store results
    const eventId = generateEventId('source');

    return createComputeSuccess({
      eventIds: [eventId],
      processedData: { [eventId]: processed },
    });
  } catch (error) {
    logError('Compute error', { error });
    return createComputeError(error);
  }
};

/**
 * Exported compute function for use in node configuration
 */
export const computeWrapper = computeFunction;
