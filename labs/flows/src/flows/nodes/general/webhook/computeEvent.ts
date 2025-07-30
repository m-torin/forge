import {
  ComputeResult,
  generateEventId,
  createComputeSuccess,
  createComputeError,
} from '#/flows/nodes/internal';
import { logInfo, logError, logWarn } from '@repo/observability';

// Types
type ContentType = 'json' | 'xml' | 'html' | 'csv' | 'text';
type WebhookMode = 'source' | 'destination' | 'enrichment';

interface RequestConfig {
  method: string;
  targetUrl: string;
  queryParams?: Record<string, any>;
  bodyTemplate?: string | Record<string, any>;
  customHeaders?: Array<{ key: string; value: string }>;
  maxRetries?: number;
  retryDelay?: number;
}

interface ResponseData {
  data: any;
  contentType: string;
  status: number;
  format?: ContentType;
}

// Constants
const DEFAULT_CONFIG = {
  method: 'POST',
  maxRetries: 3,
  retryDelay: 1,
} as const;

const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  TEXT_XML: 'text/xml',
  HTML: 'text/html',
  CSV: 'text/csv',
} as const;

const getFormatFromContentType = (contentType: string = ''): ContentType => {
  const baseType = contentType.toLowerCase().split(';')[0];
  switch (baseType) {
    case CONTENT_TYPES.JSON:
      return 'json';
    case CONTENT_TYPES.XML:
    case CONTENT_TYPES.TEXT_XML:
      return 'xml';
    case CONTENT_TYPES.HTML:
      return 'html';
    case CONTENT_TYPES.CSV:
      return 'csv';
    default:
      return 'text';
  }
};

/**
 * Parses response content based on content type
 */
const parseResponseContent = async (
  response: Response,
): Promise<ResponseData> => {
  const contentType = response.headers.get('content-type') ?? '';
  const format = getFormatFromContentType(contentType);

  try {
    const data =
      format === 'json' ? await response.json() : await response.text();
    return { data, contentType, status: response.status, format };
  } catch (error) {
    logError('Response parsing error', { error });
    throw new Error(
      `Failed to parse ${format} response: ${(error as Error).message}`,
    );
  }
};

/**
 * Makes HTTP request with retry logic using Next.js 14's fetch
 */
export const makeRequest = async (
  url: URL,
  {
    method,
    customHeaders = [],
    bodyTemplate,
    maxRetries = DEFAULT_CONFIG.maxRetries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
  }: RequestConfig,
): Promise<Response> => {
  const headers = new Headers(
    customHeaders
      .filter(({ key, value }) => key && value)
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
  );

  const body =
    method !== 'GET' && bodyTemplate
      ? JSON.stringify(
          typeof bodyTemplate === 'string'
            ? JSON.parse(bodyTemplate)
            : bodyTemplate,
        )
      : undefined;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logInfo(`Webhook request attempt ${attempt + 1} of ${maxRetries}`, { attempt: attempt + 1, maxRetries });

      const response = await fetch(url.toString(), {
        method,
        headers,
        ...(body && { body }),
      });

      // Return immediately on 404 without retrying
      if (response.status === 404) {
        return response;
      }

      if (response.ok) return response;

      lastError = new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      lastError = error as Error;
    }

    // Only retry if we haven't hit max retries and it wasn't a 404
    if (attempt < maxRetries - 1) {
      logWarn(`Retrying webhook request after error - attempt ${attempt + 1}`, { attempt: attempt + 1, error: lastError });
      await new Promise((resolve) => setTimeout(resolve, retryDelay * 1000));
    }
  }

  throw lastError || new Error('Request failed with no response');
};

/**
 * Handles destination webhook events
 */
const handleDestinationEvent = async (
  input: Record<string, any>,
  data: Record<string, any>,
): Promise<ComputeResult> => {
  logInfo('Starting destination webhook handling', { input, data });

  const metadata = data.metadata?.destination;
  if (!metadata?.targetUrl) {
    throw new Error('Target URL is required for destination webhooks');
  }

  const config: RequestConfig = {
    method: data.metadata?.shared?.method ?? DEFAULT_CONFIG.method,
    ...metadata,
  };

  try {
    // Build URL with query params for GET requests
    const url = new URL(config.targetUrl);
    if (config.method === 'GET' && config.queryParams) {
      const params =
        typeof config.queryParams === 'string'
          ? JSON.parse(config.queryParams)
          : config.queryParams;
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await makeRequest(url, config);
    const responseData = await parseResponseContent(response);

    const eventId = generateEventId('webhook-destination');
    return createComputeSuccess({
      eventIds: [eventId],
      processedData: { [eventId]: responseData },
    });
  } catch (error) {
    logError('Destination webhook request failed', { error });
    throw error;
  }
};

/**
 * Main compute function that processes webhook events based on node type
 */
export const computeFunction = async (
  input: Record<string, any>,
  data: Record<string, any>,
): Promise<ComputeResult> => {
  try {
    logInfo('Starting webhook computation', {
      nodeMode: data.metadata?.nodeMode,
      dataKeys: Object.keys(input),
    });

    switch (data.metadata?.nodeMode as WebhookMode) {
      case 'destination':
        return await handleDestinationEvent(input, data);

      case 'source': {
        if (!input) throw new Error('Invalid event data');
        const eventId = generateEventId('webhook-source');
        return createComputeSuccess({
          eventIds: [eventId],
          processedData: { [eventId]: input },
        });
      }

      case 'enrichment':
        throw new Error('Enrichment mode not yet implemented');

      default:
        throw new Error(`Invalid webhook mode: ${data.metadata?.nodeMode}`);
    }
  } catch (error) {
    logError('Webhook computation failed', { error });
    return createComputeError(error);
  }
};

// This is the critical export that was missing
export { computeFunction as computeWrapper };
