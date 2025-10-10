import { allFlags } from '#/lib/flags';
import { env } from '#/root/env';
import { logError } from '@repo/observability';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Feature flags discovery endpoint
 * This endpoint provides flag definitions for client-side evaluation and debugging
 *
 * Usage:
 * - GET /api/flags - Returns all flag definitions
 * - Used by development tools and client-side flag evaluation
 */
export async function GET(_request: NextRequest) {
  try {
    // Return flag definitions for discovery
    const flagDefinitions = allFlags.map(flag => ({
      key: flag.key,
      description: flag.description || `Feature flag: ${flag.key}`,
      // Note: Don't expose sensitive flag logic or values
    }));

    return NextResponse.json({
      flags: flagDefinitions,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Use proper error logging
    logError(error instanceof Error ? error.message : 'Failed to load flag definitions', {
      context: 'flags-discovery-endpoint',
    });

    return NextResponse.json({ error: 'Failed to load flag definitions' }, { status: 500 });
  }
}
