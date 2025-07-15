'use server';

import {
  bulkDeleteMediaAction,
  bulkMoveMediaAction,
  copyBetweenProvidersAction,
  listMediaAction,
  listProvidersAction,
  uploadMediaAction,
} from '@repo/storage/server/next';

/**
 * Example server action that demonstrates using storage server actions
 * from within other server actions
 */
export async function processUserUpload(formData: FormData) {
  'use server';

  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return { success: false, error: 'Missing file or user ID' };
  }

  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to user's folder
    const uploadResult = await uploadMediaAction(
      `users/${userId}/uploads/${Date.now()}-${file.name}`,
      buffer,
      {
        contentType: file.type,
        metadata: {
          uploadedBy: userId,
          originalName: file.name,
        },
      },
    );

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    return {
      success: true,
      data: {
        key: uploadResult.data?.key,
        url: uploadResult.data?.url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Example: Archive old files
 */
export async function archiveOldFiles(daysOld: number = 30) {
  'use server';

  try {
    // List all files in the uploads directory
    const listResult = await listMediaAction({ prefix: 'uploads/' });

    if (!listResult.success || !listResult.data) {
      return { success: false, error: 'Failed to list files' };
    }

    // Filter files older than specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filesToArchive = listResult.data.filter(
      file => file.lastModified && file.lastModified < cutoffDate,
    );

    if (filesToArchive.length === 0) {
      return { success: true, message: 'No files to archive' };
    }

    // Move files to archive
    const moveOperations = filesToArchive.map(file => ({
      sourceKey: file.key,
      destinationKey: file.key.replace('uploads/', 'archive/'),
    }));

    const moveResult = await bulkMoveMediaAction(moveOperations);

    if (!moveResult.success || !moveResult.data) {
      return { success: false, error: 'Failed to archive files' };
    }

    return {
      success: true,
      data: {
        archived: moveResult.data.succeeded.length,
        failed: moveResult.data.failed.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Archive operation failed',
    };
  }
}

/**
 * Example: Migrate files between storage providers
 */
export async function migrateToProvider(
  sourceProvider: string,
  destinationProvider: string,
  prefix: string = '',
) {
  'use server';

  try {
    // First, list available providers
    const providersResult = await listProvidersAction();

    if (!providersResult.success || !providersResult.data) {
      return { success: false, error: 'Failed to list providers' };
    }

    // Validate providers exist
    if (!providersResult.data.includes(sourceProvider)) {
      return { success: false, error: `Source provider '${sourceProvider}' not found` };
    }
    if (!providersResult.data.includes(destinationProvider)) {
      return { success: false, error: `Destination provider '${destinationProvider}' not found` };
    }

    // List files from source provider
    const listResult = await listMediaAction({ prefix });

    if (!listResult.success || !listResult.data) {
      return { success: false, error: 'Failed to list files from source' };
    }

    // Copy each file to destination provider
    const results = {
      succeeded: [] as string[],
      failed: [] as { key: string; error: string }[],
    };

    for (const file of listResult.data) {
      try {
        const copyResult = await copyBetweenProvidersAction(
          sourceProvider,
          destinationProvider,
          file.key,
        );

        if (copyResult.success) {
          results.succeeded.push(file.key);
        } else {
          results.failed.push({ key: file.key, error: copyResult.error || 'Unknown error' });
        }
      } catch (error) {
        results.failed.push({
          key: file.key,
          error: error instanceof Error ? error.message : 'Copy failed',
        });
      }
    }

    return {
      success: results.failed.length === 0,
      data: {
        migrated: results.succeeded.length,
        failed: results.failed.length,
        details: results,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
    };
  }
}

/**
 * Example: Clean up temporary files
 */
export async function cleanupTempFiles() {
  'use server';

  try {
    const listResult = await listMediaAction({ prefix: 'temp/' });

    if (!listResult.success || !listResult.data) {
      return { success: false, error: 'Failed to list temp files' };
    }

    if (listResult.data.length === 0) {
      return { success: true, message: 'No temp files to clean up' };
    }

    const keys = listResult.data.map(file => file.key);
    const deleteResult = await bulkDeleteMediaAction(keys);

    if (!deleteResult.success || !deleteResult.data) {
      return { success: false, error: 'Failed to delete temp files' };
    }

    return {
      success: true,
      data: {
        deleted: deleteResult.data.succeeded.length,
        failed: deleteResult.data.failed.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}
