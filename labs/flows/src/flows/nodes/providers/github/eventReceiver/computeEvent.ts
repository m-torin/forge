// computeEvent.ts

import {
  ComputeResult,
  generateEventId,
  createComputeSuccess,
  createComputeError,
} from '#/flows/nodes/internal';
import { createHmac } from 'crypto';
import { FormValues } from './formSchema';
import { logInfo, logError } from '@repo/observability';

// Required GitHub webhook headers
const REQUIRED_HEADERS = [
  'x-hub-signature-256',
  'x-github-event',
  'x-github-delivery',
] as const;

type GitHubHeaders = {
  [K in (typeof REQUIRED_HEADERS)[number]]: string;
} & Record<string, string>;

/**
 * Process input data according to node configuration
 * @param data - Raw input data
 * @returns Processed data with any transformations applied
 */
const _processInput = (data: Record<string, any>): Record<string, any> => {
  // Add any input processing logic here
  return data;
};

/**
 * Validates presence of required GitHub webhook headers
 * @param headers - Request headers
 * @returns True if all required headers present and valid
 */
const validateHeaders = (
  headers: Record<string, any>,
): headers is GitHubHeaders => {
  return REQUIRED_HEADERS.every(
    (header) =>
      typeof headers[header] === 'string' && headers[header].length > 0,
  );
};

/**
 * Validates that the event type is configured for the webhook
 * @param eventType - GitHub event type
 * @param allowedEvents - Configured event types
 * @returns Boolean indicating if event type is allowed
 */
const validateEventType = (
  eventType: string,
  allowedEvents: string[],
): boolean => {
  return allowedEvents.includes(eventType);
};

/**
 * Verifies GitHub webhook signature using HMAC SHA-256
 * @param payload - Raw request payload (Uint8Array or string)
 * @param signature - GitHub signature header
 * @param secret - Webhook secret
 * @returns Boolean indicating if signature is valid
 */
const verifyGithubSignature = (
  payload: Uint8Array | string,
  signature: string,
  secret: string,
): boolean => {
  const hmac = createHmac('sha256', secret);
  const payloadString = payload instanceof Uint8Array ? new TextDecoder().decode(payload) : payload;
  const digest = hmac.update(payloadString).digest('hex');
  return `sha256=${digest}` === signature;
};

/**
 * Main compute function that processes incoming data
 * Validates, transforms, and generates events based on the input
 *
 * Features:
 * - Validates required GitHub webhook headers
 * - Verifies webhook signature
 * - Validates event types against configuration
 * - Generates unique event IDs
 * - Processes and transforms webhook payload
 *
 * @param input - Raw input data to process including headers and body
 * @param data - Form values containing node settings
 * @returns Promise<ComputeResult> - Result of the computation
 * @throws Error if validation fails or processing errors occur
 */
export const computeFunction = async (
  input: Record<string, any>,
  data: FormValues,
): Promise<ComputeResult> => {
  try {
    if (!input || !data?.metadata) {
      throw new Error('Missing required configuration');
    }

    logInfo('Processing GitHub webhook compute function', { input, data });

    const { headers, body, rawBody } = input;

    // Validate headers
    if (!validateHeaders(headers)) {
      throw new Error('Missing required GitHub webhook headers');
    }

    // Validate event type
    if (!validateEventType(headers['x-github-event'], data.metadata.events)) {
      throw new Error(
        `Event type ${headers['x-github-event']} not configured for webhook`,
      );
    }

    // Verify signature using raw body
    const isValid = verifyGithubSignature(
      rawBody || JSON.stringify(body),
      headers['x-hub-signature-256'],
      data.metadata.secret,
    );

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const eventId = generateEventId('github');

    // Process the event
    return createComputeSuccess({
      eventIds: [eventId],
      processedData: {
        [eventId]: {
          event: headers['x-github-event'],
          delivery: headers['x-github-delivery'],
          payload: body,
          repository: data.metadata.repositoryUrl,
          timestamp: new Date().toISOString(),
          signature: headers['x-hub-signature-256'],
        },
      },
    });
  } catch (error) {
    // Log error details for monitoring
    logError('GitHub webhook processing error', {
      error,
      timestamp: new Date().toISOString(),
    });

    return createComputeError(error);
  }
};

/**
 * Exported compute function for use in node configuration
 * Wraps the main compute function to maintain consistent interface
 */
export const computeWrapper = computeFunction;
