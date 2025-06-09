import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database/prisma';

import { modelConfigs } from '../../../(authenticated)/admin/lib/prisma-model-config';
import { getModelSecurityConfig } from '../../../(authenticated)/admin/lib/security-config';
import {
  auditFieldAccess,
  checkRateLimit,
} from '../../../(authenticated)/admin/lib/security-middleware';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { modelName, recordIds } = body;

    if (!modelName || !recordIds || !Array.isArray(recordIds)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate model exists
    const modelConfig = modelConfigs.find((config) => config.name === modelName);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model name' }, { status: 400 });
    }

    // Get database delegate
    const delegate = (database as any)[modelName];
    if (!delegate) {
      return NextResponse.json({ error: 'Model not found in database' }, { status: 400 });
    }

    // Create security context
    const securityContext = {
      permissions: [
        session.user.role,
        ...(session.user.role === 'admin'
          ? ['admin', 'manage_api_keys', 'manage_security', 'manage_accounts']
          : []),
      ],
      sessionId: session.session.id,
      userId: session.user.id,
      userRole: session.user.role || 'user',
    };

    // Check rate limiting for sensitive models
    const modelSecurityConfig = getModelSecurityConfig(modelName);
    if (modelSecurityConfig) {
      const rateLimit = checkRateLimit(session.user.id, `bulk_delete_${modelName}`, 5, 60000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 },
        );
      }
    }

    const results = {
      errors: [] as string[],
      failed: 0,
      success: 0,
    };

    // Delete records individually to handle potential errors and audit
    for (const recordId of recordIds) {
      try {
        // Check if record exists first and get data for audit
        const existingRecord = await delegate.findUnique({
          where: { id: recordId },
        });

        if (!existingRecord) {
          results.failed++;
          results.errors.push(`Record ${recordId}: Not found`);
          continue;
        }

        // Audit the deletion for sensitive models
        if (modelSecurityConfig) {
          await auditFieldAccess(
            'delete',
            modelName,
            'record',
            securityContext,
            recordId,
            existingRecord,
            undefined,
            true,
          );
        }

        // Perform deletion
        await delegate.delete({
          where: { id: recordId },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Record ${recordId}: ${errorMessage}`);

        // Audit failed deletion
        if (modelSecurityConfig) {
          await auditFieldAccess(
            'delete',
            modelName,
            'record',
            securityContext,
            recordId,
            undefined,
            undefined,
            false,
            errorMessage,
          );
        }

        // Stop if too many errors
        if (results.errors.length > 20) {
          results.errors.push('Too many errors, stopping bulk delete...');
          break;
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
