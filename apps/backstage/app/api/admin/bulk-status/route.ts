import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { modelConfigs } from '../../../(authenticated)/admin/lib/prisma-model-config';
import { auditFieldAccess } from '../../../(authenticated)/admin/lib/security-middleware';

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
    const { modelName, recordIds, status } = body;

    if (!modelName || !recordIds || !Array.isArray(recordIds) || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate model exists
    const modelConfig = modelConfigs.find(config => config.name === modelName);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model name' }, { status: 400 });
    }

    // Check if model has a status field
    const statusField = modelConfig.fields.find(field => 
      field.name === 'status' || field.name === 'state' || field.name === 'isActive'
    );

    if (!statusField) {
      return NextResponse.json({ error: 'Model does not have a status field' }, { status: 400 });
    }

    // Get database delegate
    const delegate = (database as any)[modelName];
    if (!delegate) {
      return NextResponse.json({ error: 'Model not found in database' }, { status: 400 });
    }

    // Create security context
    const securityContext = {
      userId: session.user.id,
      userRole: session.user.role || 'user',
      permissions: [
        session.user.role,
        ...(session.user.role === 'admin' ? ['admin', 'manage_api_keys', 'manage_security', 'manage_accounts'] : []),
      ],
      sessionId: session.session.id,
    };

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Determine the correct field name and value
    let updateData: any = {};
    if (statusField.name === 'isActive') {
      // Handle boolean status field
      updateData[statusField.name] = status === 'active';
    } else {
      // Handle string status field
      updateData[statusField.name] = status;
    }

    // Update records individually to handle potential errors
    for (const recordId of recordIds) {
      try {
        // Check if record exists first and get old value for audit
        const existingRecord = await delegate.findUnique({
          where: { id: recordId },
        });

        if (!existingRecord) {
          results.failed++;
          results.errors.push(`Record ${recordId}: Not found`);
          continue;
        }

        const oldValue = existingRecord[statusField.name];

        // Perform update
        await delegate.update({
          where: { id: recordId },
          data: updateData,
        });

        // Audit the status change
        await auditFieldAccess(
          'write',
          modelName,
          statusField.name,
          securityContext,
          recordId,
          oldValue,
          updateData[statusField.name],
          true
        );

        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Record ${recordId}: ${errorMessage}`);
        
        // Audit failed status change
        await auditFieldAccess(
          'write',
          modelName,
          statusField.name,
          securityContext,
          recordId,
          undefined,
          updateData[statusField.name],
          false,
          errorMessage
        );
        
        // Stop if too many errors
        if (results.errors.length > 20) {
          results.errors.push('Too many errors, stopping status update...');
          break;
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}