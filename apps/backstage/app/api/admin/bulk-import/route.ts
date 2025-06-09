import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database/prisma';

import { modelConfigs } from '../../../(authenticated)/admin/lib/prisma-model-config';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelName = formData.get('modelName') as string;

    if (!file || !modelName) {
      return NextResponse.json({ error: 'Missing file or model name' }, { status: 400 });
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

    // Read file content
    const fileContent = await file.text();
    let records: any[] = [];

    try {
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(fileContent);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser (for production, use a proper CSV library)
        const lines = fileContent.split('\n').filter((line) => line.trim());
        if (lines.length === 0) {
          return NextResponse.json({ error: 'Empty CSV file' }, { status: 400 });
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
        records = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = values[index] || null;
          });
          return record;
        });
      } else {
        return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Failed to parse file' }, { status: 400 });
    }

    const results = {
      errors: [] as string[],
      failed: 0,
      success: 0,
      warnings: [] as string[],
    };

    // Process records in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      for (const record of batch) {
        try {
          // Remove undefined/null values and validate
          const cleanRecord = Object.entries(record).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              // Type conversion for common field types
              if (key.endsWith('Id') && typeof value === 'string') {
                acc[key] = value;
              } else if (key === 'createdAt' || key === 'updatedAt') {
                acc[key] = new Date(value as string);
              } else if (
                typeof value === 'string' &&
                !isNaN(Number(value)) &&
                !isNaN(parseFloat(value))
              ) {
                // Check if it should be a number based on model config
                const field = modelConfig.fields.find((f) => f.name === key);
                if (field?.type === 'number') {
                  acc[key] = Number(value);
                } else {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
            }
            return acc;
          }, {} as any);

          // Add default fields if needed
          if (!cleanRecord.id) {
            delete cleanRecord.id; // Let database generate ID
          }

          // Add organization context if needed
          if (
            modelConfig.fields.some((f) => f.name === 'organizationId') &&
            !cleanRecord.organizationId
          ) {
            cleanRecord.organizationId = session.session.activeOrganizationId;
          }

          // Add user context if needed
          if (
            modelConfig.fields.some((f) => f.name === 'createdById') &&
            !cleanRecord.createdById
          ) {
            cleanRecord.createdById = session.user.id;
          }

          await delegate.create({
            data: cleanRecord,
          });

          results.success++;
        } catch (error) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Row ${i + results.success + results.failed}: ${errorMessage}`);

          // Stop if too many errors
          if (results.errors.length > 50) {
            results.warnings.push('Too many errors, stopping import...');
            break;
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
