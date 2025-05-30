import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { type NextRequest } from 'next/server';

/**
 * Security utilities for workflow endpoints
 * Based on Upstash security best practices
 */

/**
 * Verify QStash signature for production environments
 */
export async function verifyWorkflowRequest(request: NextRequest): Promise<boolean> {
  // Skip verification in development with local QStash
  if (
    process.env.QSTASH_URL?.includes('127.0.0.1') ||
    process.env.QSTASH_URL?.includes('localhost')
  ) {
    return true;
  }

  try {
    // Verify the signature from QStash
    const handler = async (_req: NextRequest) => {
      return new Response('Verified', { status: 200 });
    };
    const verifiedHandler = verifySignatureAppRouter(handler);
    await verifiedHandler(request);
    return true;
  } catch (error) {
    console.error('Workflow signature verification failed:', error);
    return false;
  }
}

/**
 * Check if the request is from a trusted source
 */
export function isTrustedSource(request: NextRequest): boolean {
  const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
  const clientIP =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Always trust local development
  if (clientIP === '127.0.0.1' || clientIP === '::1') {
    return true;
  }

  // Check against trusted IPs if configured
  if (trustedIPs.length > 0) {
    return trustedIPs.includes(clientIP);
  }

  return true; // Default to trust if no specific IPs configured
}

/**
 * Rate limiting check (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Middleware to secure workflow endpoints
 */
export async function secureWorkflowEndpoint(
  request: NextRequest,
): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Verify QStash signature
  const signatureValid = await verifyWorkflowRequest(request);
  if (!signatureValid) {
    return { allowed: false, reason: 'Invalid signature' };
  }

  // 2. Check trusted source
  const trusted = isTrustedSource(request);
  if (!trusted) {
    return { allowed: false, reason: 'Untrusted source' };
  }

  // 3. Basic rate limiting
  const clientId = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitOk = checkRateLimit(clientId);
  if (!rateLimitOk) {
    return { allowed: false, reason: 'Rate limit exceeded' };
  }

  return { allowed: true };
}
