import { createHmac } from 'crypto';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Request signing configuration
 */
export interface RequestSigningConfig {
  /** Clock tolerance in seconds */
  clockTolerance?: number;
  /** Current signing key (for key rotation) */
  currentSigningKey?: string;
  /** Next signing key (for key rotation) */
  nextSigningKey?: string;
  /** Required headers to include in signature */
  requiredHeaders?: string[];
  /** QStash signing key */
  signingKey: string;
}

/**
 * Signature verification result
 */
export interface SignatureVerificationResult {
  keyUsed?: string;
  reason?: string;
  timestamp?: number;
  valid: boolean;
}

/**
 * Extract QStash signature from headers
 */
export function extractQStashSignature(context: WorkflowContext<any>): {
  signature: string | null;
  timestamp: number | null;
} {
  const headers = context.headers || {};

  let signature: string | null = null;
  let timestamp: number | null = null;

  // Try different ways to access headers
  if (typeof headers.get === 'function') {
    signature = headers.get('upstash-signature');
    const timestampHeader = headers.get('upstash-timestamp');
    timestamp = timestampHeader ? parseInt(timestampHeader, 10) : null;
  } else if (typeof headers === 'object' && headers !== null) {
    const h = headers as any;
    signature = h['upstash-signature'];
    const timestampHeader = h['upstash-timestamp'];
    timestamp = timestampHeader ? parseInt(timestampHeader, 10) : null;
  }

  return { signature, timestamp };
}

/**
 * Generate signature for request
 */
export function generateSignature(
  payload: string,
  timestamp: number,
  signingKey: string,
  url?: string,
  method = 'POST',
): string {
  // QStash signature format: method + url + payload + timestamp
  const stringToSign = `${method}${url || ''}${payload}${timestamp}`;

  return createHmac('sha256', signingKey).update(stringToSign).digest('base64');
}

/**
 * Verify QStash request signature
 */
export function verifyQStashSignature(
  context: WorkflowContext<any>,
  config: RequestSigningConfig,
): SignatureVerificationResult {
  const { signature, timestamp } = extractQStashSignature(context);

  if (!signature) {
    return {
      valid: false,
      reason: 'missing_signature',
    };
  }

  if (!timestamp) {
    return {
      valid: false,
      reason: 'missing_timestamp',
    };
  }

  // Check clock tolerance
  const now = Math.floor(Date.now() / 1000);
  const clockTolerance = config.clockTolerance || 300; // 5 minutes default

  if (Math.abs(now - timestamp) > clockTolerance) {
    return {
      valid: false,
      reason: 'timestamp_out_of_tolerance',
      timestamp,
    };
  }

  // Get request payload
  const payload = JSON.stringify(context.requestPayload || {});
  const url = context.url;

  // Try to verify with each available key
  const keysToTry = [
    { name: 'primary', key: config.signingKey },
    ...(config.currentSigningKey ? [{ name: 'current', key: config.currentSigningKey }] : []),
    ...(config.nextSigningKey ? [{ name: 'next', key: config.nextSigningKey }] : []),
  ];

  for (const { name, key } of keysToTry) {
    const expectedSignature = generateSignature(payload, timestamp, key, url);

    if (signature === expectedSignature) {
      return {
        valid: true,
        keyUsed: name,
        timestamp,
      };
    }
  }

  return {
    valid: false,
    reason: 'signature_mismatch',
    timestamp,
  };
}

/**
 * Middleware for request signature verification
 */
export function withSignatureVerification<T>(
  context: WorkflowContext<T>,
  config: RequestSigningConfig,
  handler: () => Promise<any>,
): Promise<any> {
  const verification = verifyQStashSignature(context, config);

  if (!verification.valid) {
    throw new Error(`Request signature verification failed: ${verification.reason}`);
  }

  console.log(`[SIGNATURE] Request verified with ${verification.keyUsed} key`);
  return handler();
}

/**
 * Create signing configuration from environment
 */
export function createSigningConfigFromEnv(): RequestSigningConfig | null {
  const signingKey = process.env.QSTASH_CURRENT_SIGNING_KEY || process.env.QSTASH_SIGNING_KEY;

  if (!signingKey) {
    console.warn('[SIGNATURE] No QStash signing key found in environment');
    return null;
  }

  return {
    clockTolerance: process.env.QSTASH_CLOCK_TOLERANCE
      ? parseInt(process.env.QSTASH_CLOCK_TOLERANCE, 10)
      : 300,
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
    signingKey,
  };
}

/**
 * Sign outgoing requests to other services
 */
export function signOutgoingRequest(
  payload: any,
  signingKey: string,
  url: string,
  method = 'POST',
): { signature: string; timestamp: number; headers: Record<string, string> } {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = generateSignature(payloadString, timestamp, signingKey, url, method);

  return {
    headers: {
      'upstash-signature': signature,
      'upstash-timestamp': timestamp.toString(),
    },
    signature,
    timestamp,
  };
}

/**
 * Wrapper for context.call with signature signing
 */
export async function callWithSignature(
  context: WorkflowContext<any>,
  stepName: string,
  options: any,
  signingKey: string,
): Promise<any> {
  const { url, body, headers = {}, method = 'POST' } = options;

  if (!url) {
    throw new Error('URL is required for signed calls');
  }

  const signedRequest = signOutgoingRequest(body, signingKey, url, method);

  const enhancedOptions = {
    ...options,
    headers: {
      ...headers,
      ...signedRequest.headers,
    },
  };

  return context.call(stepName, enhancedOptions);
}

/**
 * Batch verify multiple signatures (for batch processing)
 */
export function batchVerifySignatures(
  requests: {
    signature: string;
    timestamp: number;
    payload: string;
    url?: string;
    method?: string;
  }[],
  config: RequestSigningConfig,
): (SignatureVerificationResult & { index: number })[] {
  return requests.map((request, index) => {
    const now = Math.floor(Date.now() / 1000);
    const clockTolerance = config.clockTolerance || 300;

    if (Math.abs(now - request.timestamp) > clockTolerance) {
      return {
        valid: false,
        index,
        reason: 'timestamp_out_of_tolerance',
        timestamp: request.timestamp,
      };
    }

    const keysToTry = [
      { name: 'primary', key: config.signingKey },
      ...(config.currentSigningKey ? [{ name: 'current', key: config.currentSigningKey }] : []),
      ...(config.nextSigningKey ? [{ name: 'next', key: config.nextSigningKey }] : []),
    ];

    for (const { name, key } of keysToTry) {
      const expectedSignature = generateSignature(
        request.payload,
        request.timestamp,
        key,
        request.url,
        request.method,
      );

      if (request.signature === expectedSignature) {
        return {
          valid: true,
          index,
          keyUsed: name,
          timestamp: request.timestamp,
        };
      }
    }

    return {
      valid: false,
      index,
      reason: 'signature_mismatch',
      timestamp: request.timestamp,
    };
  });
}

/**
 * Generate a webhook endpoint signature for testing
 */
export function generateTestSignature(
  payload: any,
  signingKey = 'test-key',
  url = 'https://example.com/webhook',
): { headers: Record<string, string>; body: string } {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signed = signOutgoingRequest(payload, signingKey, url);

  return {
    body,
    headers: signed.headers,
  };
}
