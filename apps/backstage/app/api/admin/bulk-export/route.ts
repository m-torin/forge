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

    const body = await request.json();
    const { format, modelName, selectedIds } = body;

    if (!modelName || !format) {
      return NextResponse.json({ error: 'Missing model name or format' }, { status: 400 });
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

    // Build query
    const where = selectedIds && selectedIds.length > 0 ? { id: { in: selectedIds } } : {};

    // Fetch records
    const records = await delegate.findMany({
      orderBy: { createdAt: 'desc' },
      where,
    });

    if (records.length === 0) {
      return NextResponse.json({ error: 'No records found' }, { status: 404 });
    }

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'json') {
      content = JSON.stringify(records, null, 2);
      mimeType = 'application/json';
      filename = `${modelName}-export-${new Date().toISOString().split('T')[0]}.json`;
    } else if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(records[0]);
      const csvHeaders = headers.join(',');
      const csvRows = records.map((record: any) =>
        headers
          .map((header) => {
            const value = record[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            const stringValue = value.toString();
            // Escape quotes and wrap in quotes if contains comma, newline, or quotes
            if (
              stringValue.includes(',') ||
              stringValue.includes('\n') ||
              stringValue.includes('"')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(','),
      );
      content = [csvHeaders, ...csvRows].join('\n');
      mimeType = 'text/csv';
      filename = `${modelName}-export-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    // Return file
    return new NextResponse(content, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': mimeType,
      },
    });
  } catch (error) {
    console.error('Bulk export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
