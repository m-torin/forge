import { serve } from '@upstash/workflow/nextjs';

/**
 * Import External Media Workflow Payload
 */
export interface ImportExternalMediaPayload {
  dedupId?: string;
  destination: {
    type: 'local' | 'aws' | 'gcp' | 'azure';
    path: string;
    bucket?: string;
    region?: string;
  };
  notifications: {
    onSuccess?: string[]; // email addresses
    onFailure?: string[];
    webhook?: string;
  };
  organizationId?: string;
  processing: {
    autoResize?: boolean;
    generateThumbnails?: boolean;
    optimizeForWeb?: boolean;
    extractMetadata?: boolean;
    virusScan?: boolean;
  };
  sources: {
    type: 'url' | 'api' | 'ftp' | 'cloud';
    url: string;
    credentials?: {
      username?: string;
      password?: string;
      apiKey?: string;
      token?: string;
    };
    filters?: {
      fileTypes?: string[];
      sizeLimit?: number; // in MB
      dateRange?: {
        from: string;
        to: string;
      };
    };
  }[];
  userId: string;
}

/**
 * Import External Media Workflow Result
 */
export interface ImportExternalMediaResult {
  createdAt: string;
  failedFiles: {
    originalUrl: string;
    error: string;
    reason: string;
  }[];
  importedFiles: {
    originalUrl: string;
    filename: string;
    size: number;
    type: string;
    localPath: string;
    thumbnailPath?: string;
    metadata?: Record<string, any>;
    checksum: string;
  }[];
  importId: string;
  processingTime: number;
  status: 'completed' | 'failed' | 'partial';
  summary: {
    totalFiles: number;
    successfulImports: number;
    failedImports: number;
    skippedFiles: number;
    totalSizeBytes: number;
  };
  userId: string;
}

/**
 * Import External Media Workflow Implementation
 *
 * This workflow handles importing media files from external sources such as:
 * - Direct URLs
 * - APIs (social media, cloud storage)
 * - FTP servers
 * - Cloud storage providers
 *
 * Features:
 * - Multiple source type support
 * - Batch processing with progress tracking
 * - Automatic file validation and virus scanning
 * - Metadata extraction (EXIF, etc.)
 * - Thumbnail generation
 * - Web optimization
 * - Duplicate detection
 * - Error handling and retry logic
 */
export const importExternalMediaWorkflow = serve<
  ImportExternalMediaPayload,
  ImportExternalMediaResult
>(async (context) => {
  const { requestPayload: payload } = context;
  const startTime = Date.now();
  const importId = `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log(`Starting media import workflow: ${importId}`);
  console.log('Sources:', payload.sources.length);
  console.log('Processing options:', payload.processing);

  let totalFiles = 0;
  let successfulImports = 0;
  let failedImports = 0;
  let skippedFiles = 0;
  let totalSizeBytes = 0;
  const importedFiles: ImportExternalMediaResult['importedFiles'] = [];
  const failedFiles: ImportExternalMediaResult['failedFiles'] = [];

  // Step 1: Validate sources and permissions
  await context.sleep('validate-sources', 2);
  console.log('✅ Source validation completed');

  // Step 2: Process each source
  for (let sourceIndex = 0; sourceIndex < payload.sources.length; sourceIndex++) {
    const source = payload.sources[sourceIndex];
    console.log(`Processing source ${sourceIndex + 1}/${payload.sources.length}: ${source.type}`);

    try {
      // Step 2a: Connect to source
      await context.sleep(`connect-source-${sourceIndex}`, 1);
      console.log(`Connected to ${source.type} source: ${source.url}`);

      // Step 2b: Discover files
      await context.sleep(`discover-files-${sourceIndex}`, 3);
      const discoveredFiles = await mockDiscoverFiles(source);
      totalFiles += discoveredFiles.length;
      console.log(`Discovered ${discoveredFiles.length} files from source`);

      // Step 2c: Process each file
      for (let fileIndex = 0; fileIndex < discoveredFiles.length; fileIndex++) {
        const file = discoveredFiles[fileIndex];
        try {
          console.log(
            `Processing file ${fileIndex + 1}/${discoveredFiles.length}: ${file.filename}`,
          );

          // Check file filters
          if (!passesFilters(file, source.filters)) {
            skippedFiles++;
            console.log(`Skipped file: ${file.filename} (filtered out)`);
            continue;
          }

          // Step 2c1: Download file
          await context.sleep(`download-${sourceIndex}-${fileIndex}`, 1);

          // Step 2c2: Virus scan (if enabled)
          if (payload.processing.virusScan) {
            await context.sleep(`virus-scan-${sourceIndex}-${fileIndex}`, 0.5);
            console.log(`✅ Virus scan passed: ${file.filename}`);
          }

          // Step 2c3: Extract metadata (if enabled)
          let metadata: Record<string, any> | undefined;
          if (payload.processing.extractMetadata) {
            await context.sleep(`extract-metadata-${sourceIndex}-${fileIndex}`, 1);
            metadata = await mockExtractMetadata(file);
            console.log(`✅ Metadata extracted: ${file.filename}`);
          }

          // Step 2c4: Generate thumbnail (if enabled and applicable)
          let thumbnailPath: string | undefined;
          if (payload.processing.generateThumbnails && file.type.startsWith('image/')) {
            await context.sleep(`generate-thumbnail-${sourceIndex}-${fileIndex}`, 1);
            thumbnailPath = `${payload.destination.path}/thumbnails/${file.filename}_thumb.jpg`;
            console.log(`✅ Thumbnail generated: ${file.filename}`);
          }

          // Step 2c5: Optimize for web (if enabled and applicable)
          if (payload.processing.optimizeForWeb && file.type.startsWith('image/')) {
            await context.sleep(`optimize-web-${sourceIndex}-${fileIndex}`, 1);
            console.log(`✅ Web optimization completed: ${file.filename}`);
          }

          // Step 2c6: Auto resize (if enabled and applicable)
          if (payload.processing.autoResize && file.type.startsWith('image/')) {
            await context.sleep(`auto-resize-${sourceIndex}-${fileIndex}`, 1);
            console.log(`✅ Auto resize completed: ${file.filename}`);
          }

          // Step 2c7: Store file
          await context.sleep(`store-file-${sourceIndex}-${fileIndex}`, 1);
          const localPath = `${payload.destination.path}/${file.filename}`;

          importedFiles.push({
            filename: file.filename,
            type: file.type,
            checksum: file.checksum,
            localPath,
            metadata,
            originalUrl: file.originalUrl,
            size: file.size,
            thumbnailPath,
          });

          successfulImports++;
          totalSizeBytes += file.size;
          console.log(`✅ Successfully imported: ${file.filename}`);
        } catch (fileError) {
          failedImports++;
          failedFiles.push({
            error: fileError instanceof Error ? fileError.message : 'Unknown error',
            originalUrl: file.originalUrl,
            reason: 'Processing failed',
          });
          console.error(`❌ Failed to import: ${file.filename}`, fileError);
        }
      }
    } catch (sourceError) {
      console.error(`❌ Failed to process source: ${source.url}`, sourceError);
      failedFiles.push({
        error: sourceError instanceof Error ? sourceError.message : 'Unknown error',
        originalUrl: source.url,
        reason: 'Source connection failed',
      });
    }
  }

  // Step 3: Send notifications (if configured)
  if (payload.notifications.onSuccess?.length && successfulImports > 0) {
    await context.sleep('send-success-notification', 1);
    console.log('✅ Success notifications sent');
  }

  if (payload.notifications.onFailure?.length && failedImports > 0) {
    await context.sleep('send-failure-notification', 1);
    console.log('✅ Failure notifications sent');
  }

  if (payload.notifications.webhook) {
    await context.sleep('send-webhook', 1);
    console.log('✅ Webhook notification sent');
  }

  // Step 4: Generate final report
  const processingTime = Date.now() - startTime;
  const status: ImportExternalMediaResult['status'] =
    failedImports === 0 ? 'completed' : successfulImports === 0 ? 'failed' : 'partial';

  const result: ImportExternalMediaResult = {
    createdAt: new Date().toISOString(),
    failedFiles,
    importedFiles,
    importId,
    processingTime,
    status,
    summary: {
      failedImports,
      skippedFiles,
      successfulImports,
      totalFiles,
      totalSizeBytes,
    },
    userId: payload.userId,
  };

  console.log(`Import workflow completed: ${importId}`);
  console.log(`Status: ${status}`);
  console.log(`Files processed: ${successfulImports}/${totalFiles}`);
  console.log(`Total size: ${(totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);

  return result;
});

// Mock functions for demonstration (replace with real implementations)
async function mockDiscoverFiles(source: ImportExternalMediaPayload['sources'][0]) {
  // Simulate discovering files from various sources
  const mockFiles = [
    {
      filename: 'product-image-1.jpg',
      type: 'image/jpeg',
      checksum: 'abc123def456',
      lastModified: new Date().toISOString(),
      originalUrl: `${source.url}/product-image-1.jpg`,
      size: 1024000,
    },
    {
      filename: 'promotional-video.mp4',
      type: 'video/mp4',
      checksum: 'def456ghi789',
      lastModified: new Date().toISOString(),
      originalUrl: `${source.url}/promotional-video.mp4`,
      size: 52428800,
    },
    {
      filename: 'brand-guidelines.pdf',
      type: 'application/pdf',
      checksum: 'ghi789jkl012',
      lastModified: new Date().toISOString(),
      originalUrl: `${source.url}/brand-guidelines.pdf`,
      size: 2048000,
    },
  ];

  // Filter based on source type
  return mockFiles.slice(0, Math.floor(Math.random() * 3) + 1);
}

function passesFilters(
  file: any,
  filters?: ImportExternalMediaPayload['sources'][0]['filters'],
): boolean {
  if (!filters) return true;

  // Check file type filter
  if (filters.fileTypes?.length) {
    const fileExtension = file.filename.split('.').pop()?.toLowerCase();
    if (
      !filters.fileTypes.some(
        (type) => type.toLowerCase() === fileExtension || file.type.startsWith(type.split('/')[0]),
      )
    ) {
      return false;
    }
  }

  // Check size limit
  if (filters.sizeLimit) {
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > filters.sizeLimit) {
      return false;
    }
  }

  // Check date range
  if (filters.dateRange) {
    const fileDate = new Date(file.lastModified);
    const fromDate = new Date(filters.dateRange.from);
    const toDate = new Date(filters.dateRange.to);
    if (fileDate < fromDate || fileDate > toDate) {
      return false;
    }
  }

  return true;
}

async function mockExtractMetadata(file: any): Promise<Record<string, any>> {
  // Simulate metadata extraction
  const baseMetadata = {
    filename: file.filename,
    type: file.type,
    checksum: file.checksum,
    lastModified: file.lastModified,
    size: file.size,
  };

  if (file.type.startsWith('image/')) {
    return {
      ...baseMetadata,
      width: 1920,
      camera: {
        lens: '24-70mm f/2.8',
        make: 'Canon',
        model: 'EOS R5',
      },
      colorSpace: 'sRGB',
      exif: {
        dateTime: '2024:01:15 10:30:00',
        exposureTime: '1/125',
        fNumber: 'f/4.0',
        focalLength: '50mm',
        iso: 400,
      },
      hasAlpha: false,
      height: 1080,
    };
  }

  if (file.type.startsWith('video/')) {
    return {
      ...baseMetadata,
      width: 1920,
      audioCodec: 'aac',
      bitrate: 5000000,
      codec: 'h264',
      duration: 120.5,
      frameRate: 30,
      height: 1080,
    };
  }

  return baseMetadata;
}

/**
 * Import External Media Workflow Definition
 *
 * This workflow provides comprehensive media import capabilities from various external sources
 * including direct URLs, APIs, FTP servers, and cloud storage providers.
 */
export const workflowDefinition = {
  id: 'import-external-media-workflow',
  name: 'Import External Media',
  description: 'Import media files from external sources with processing and optimization',
  version: '1.0.0',

  // Import the workflow function
  handler: importExternalMediaWorkflow,

  // Metadata for UI/documentation
  metadata: {
    category: 'media',
    color: '#8B5CF6', // purple
    estimatedDuration: '1-10 minutes',
    features: [
      'Multiple source types (URL, API, FTP, Cloud)',
      'Batch processing with progress tracking',
      'Automatic file validation',
      'Virus scanning',
      'Metadata extraction',
      'Thumbnail generation',
      'Web optimization',
      'Duplicate detection',
      'Error handling and retry logic',
    ],
    icon: '📥',
    limitations: [
      'Demo workflow - simulates import process',
      'Does not actually connect to external sources',
      'File processing is mocked',
    ],
    tags: ['import', 'media', 'etl', 'batch-processing', 'external-sources'],
  },

  // Default payload for testing/examples
  defaultPayload: {
    destination: {
      type: 'local' as const,
      path: '/uploads/imported-media',
    },
    notifications: {
      onFailure: ['admin@example.com'],
      onSuccess: ['admin@example.com'],
    },
    processing: {
      autoResize: true,
      extractMetadata: true,
      generateThumbnails: true,
      optimizeForWeb: true,
      virusScan: true,
    },
    sources: [
      {
        type: 'url' as const,
        url: 'https://example.com/media-assets',
        filters: {
          fileTypes: ['jpg', 'png', 'mp4', 'pdf'],
          sizeLimit: 50, // MB
        },
      },
    ],
    userId: 'demo-user-123',
  } satisfies ImportExternalMediaPayload,

  // Configuration for the workflow runtime
  config: {
    enableDeduplication: true,
    queueConcurrency: 3,
    retries: 2,
    timeout: 600, // 10 minutes
  },

  // Preset configurations for common use cases
  presets: {
    bulkAssetImport: {
      name: 'Bulk Asset Import',
      description: 'Import large quantities of media assets',
      payload: {
        processing: {
          autoResize: false,
          extractMetadata: true,
          generateThumbnails: true,
          optimizeForWeb: false,
          virusScan: true,
        },
      },
    },
    cloudStorageSync: {
      name: 'Cloud Storage Sync',
      description: 'Sync media files from cloud storage',
      payload: {
        processing: {
          autoResize: true,
          extractMetadata: true,
          generateThumbnails: true,
          optimizeForWeb: true,
          virusScan: false,
        },
        sources: [
          {
            type: 'cloud' as const,
            url: 'https://storage.googleapis.com/my-bucket/media',
            credentials: {
              apiKey: 'cloud_api_key',
            },
          },
        ],
      },
    },
    ftpMigration: {
      name: 'FTP Migration',
      description: 'Migrate media files from FTP server',
      payload: {
        processing: {
          autoResize: false,
          extractMetadata: true,
          generateThumbnails: false,
          optimizeForWeb: false,
          virusScan: true,
        },
        sources: [
          {
            type: 'ftp' as const,
            url: 'ftp://media-server.example.com/assets',
            credentials: {
              username: 'media_user',
              password: 'secure_password',
            },
          },
        ],
      },
    },
    socialMediaImport: {
      name: 'Social Media Import',
      description: 'Import images and videos from social media platforms',
      payload: {
        processing: {
          autoResize: true,
          extractMetadata: false,
          generateThumbnails: true,
          optimizeForWeb: true,
          virusScan: true,
        },
        sources: [
          {
            type: 'api' as const,
            url: 'https://api.instagram.com/v1/media',
            filters: {
              fileTypes: ['jpg', 'png', 'mp4'],
              sizeLimit: 100,
            },
          },
        ],
      },
    },
  },

  // Input validation schema (for UI forms)
  inputSchema: {
    type: 'object',
    properties: {
      dedupId: {
        type: 'string',
        description: 'Optional deduplication ID',
      },
      destination: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Destination storage type',
            enum: ['local', 'aws', 'gcp', 'azure'],
          },
          bucket: { type: 'string' },
          path: {
            type: 'string',
            description: 'Destination path',
          },
          region: { type: 'string' },
        },
        required: ['type', 'path'],
      },
      notifications: {
        type: 'object',
        properties: {
          onFailure: {
            type: 'array',
            items: { type: 'string', format: 'email' },
          },
          onSuccess: {
            type: 'array',
            items: { type: 'string', format: 'email' },
          },
          webhook: {
            type: 'string',
            format: 'uri',
          },
        },
      },
      organizationId: {
        type: 'string',
        description: 'Organization ID',
        pattern: '^[a-zA-Z0-9-_]+$',
      },
      processing: {
        type: 'object',
        properties: {
          autoResize: { type: 'boolean', default: false },
          extractMetadata: { type: 'boolean', default: true },
          generateThumbnails: { type: 'boolean', default: true },
          optimizeForWeb: { type: 'boolean', default: false },
          virusScan: { type: 'boolean', default: true },
        },
      },
      sources: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Source type',
              enum: ['url', 'api', 'ftp', 'cloud'],
            },
            url: {
              type: 'string',
              description: 'Source URL or endpoint',
              format: 'uri',
            },
            credentials: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                apiKey: { type: 'string' },
                password: { type: 'string' },
                token: { type: 'string' },
              },
            },
            filters: {
              type: 'object',
              properties: {
                dateRange: {
                  type: 'object',
                  properties: {
                    from: { type: 'string', format: 'date' },
                    to: { type: 'string', format: 'date' },
                  },
                },
                fileTypes: {
                  type: 'array',
                  description: 'Allowed file types',
                  items: { type: 'string' },
                },
                sizeLimit: {
                  type: 'number',
                  description: 'Maximum file size in MB',
                  maximum: 1000,
                  minimum: 1,
                },
              },
            },
          },
          required: ['type', 'url'],
        },
        minItems: 1,
      },
      userId: {
        type: 'string',
        description: 'User ID initiating the import',
        pattern: '^[a-zA-Z0-9-_]+$',
      },
    },
    required: ['sources', 'destination', 'userId'],
  },

  // Output schema (what the workflow returns)
  outputSchema: {
    type: 'object',
    properties: {
      createdAt: { type: 'string' },
      failedFiles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            originalUrl: { type: 'string' },
            reason: { type: 'string' },
          },
        },
      },
      importedFiles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            type: { type: 'string' },
            checksum: { type: 'string' },
            localPath: { type: 'string' },
            metadata: { type: 'object' },
            originalUrl: { type: 'string' },
            size: { type: 'number' },
            thumbnailPath: { type: 'string' },
          },
        },
      },
      importId: { type: 'string' },
      processingTime: { type: 'number' },
      status: {
        type: 'string',
        enum: ['completed', 'failed', 'partial'],
      },
      summary: {
        type: 'object',
        properties: {
          failedImports: { type: 'number' },
          skippedFiles: { type: 'number' },
          successfulImports: { type: 'number' },
          totalFiles: { type: 'number' },
          totalSizeBytes: { type: 'number' },
        },
      },
      userId: { type: 'string' },
    },
  },
};

// Export the type for use in other parts of the app
export type ImportExternalMediaWorkflowDefinition = typeof workflowDefinition;

// Default export for the workflow definition
export default workflowDefinition;
