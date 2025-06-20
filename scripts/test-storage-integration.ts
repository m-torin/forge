#!/usr/bin/env tsx

/**
 * Storage Integration Test Script
 *
 * Run with: pnpm tsx scripts/test-storage-integration.ts
 *
 * This script tests the storage integration including:
 * - File uploads
 * - Signed URL generation
 * - Database integration
 * - Bulk operations
 */

import {
  uploadAndCreateMediaAction,
  getMediaSignedUrlAction,
  bulkRefreshMediaUrlsAction,
  deleteMediaAndStorageAction,
} from '../packages/storage/src/actions/mediaDbActions';
import { uploadMediaAction, getMediaUrlAction } from '../packages/storage/src/actions/mediaActions';
import { prisma } from '../packages/database/src/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

// Test configuration
const TEST_USER_ID = 'test-script-user';
const TEST_PRODUCT_ID = 'test-product-123';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName: string) {
  console.log(`\n${colors.blue}━━━ ${testName} ━━━${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'gray');
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testBasicUpload() {
  logTest('Test 1: Basic File Upload');

  try {
    // Create a test buffer (simulating an image)
    const testContent = Buffer.from('Test image content for storage integration test');
    const key = `test/integration-test-${Date.now()}.txt`;

    logInfo(`Uploading to key: ${key}`);

    const result = await uploadMediaAction(key, testContent, {
      contentType: 'text/plain',
      metadata: {
        test: 'true',
        timestamp: new Date().toISOString(),
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    logSuccess('File uploaded successfully');
    logInfo(`URL: ${result.data.url}`);
    logInfo(`Size: ${result.data.size} bytes`);
    logInfo(`ETag: ${result.data.etag}`);

    return { success: true, key };
  } catch (error) {
    logError(`Upload failed: ${error.message}`);
    return { success: false };
  }
}

async function testSignedUrls() {
  logTest('Test 2: Signed URL Generation');

  try {
    const key = `test/signed-url-test-${Date.now()}.jpg`;

    // Test product context (auto-signed)
    logInfo('Testing product context signed URL...');
    const productUrl = await getMediaUrlAction(key, {
      context: 'product',
      expiresIn: 3600,
    });

    if (!productUrl.success) {
      throw new Error(productUrl.error || 'Failed to get product URL');
    }

    const hasSignature = productUrl.data.includes('X-Amz-Algorithm');
    if (!hasSignature) {
      throw new Error('Product URL is not signed!');
    }

    logSuccess('Product URL is properly signed');
    logInfo(`URL: ${productUrl.data.substring(0, 100)}...`);

    // Test admin context
    logInfo('\nTesting admin context signed URL...');
    const adminUrl = await getMediaUrlAction(key, {
      context: 'admin',
      expiresIn: 7200,
    });

    if (!adminUrl.success) {
      throw new Error(adminUrl.error || 'Failed to get admin URL');
    }

    logSuccess('Admin URL generated with 2-hour expiration');

    return { success: true };
  } catch (error) {
    logError(`Signed URL test failed: ${error.message}`);
    return { success: false };
  }
}

async function testDatabaseIntegration() {
  logTest('Test 3: Database Integration');

  let mediaId: string | null = null;

  try {
    // Create test content
    const testContent = Buffer.from(`Test product image ${Date.now()}`);

    logInfo('Uploading and creating Media record...');

    const result = await uploadAndCreateMediaAction({
      file: testContent,
      type: 'IMAGE',
      altText: 'Test product image',
      productId: TEST_PRODUCT_ID,
      userId: TEST_USER_ID,
      width: 800,
      height: 600,
      sortOrder: 0,
    });

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    mediaId = result.data.media.id;

    logSuccess('Media record created successfully');
    logInfo(`Media ID: ${mediaId}`);
    logInfo(`URL: ${result.data.url.substring(0, 100)}...`);

    // Verify database record
    logInfo('\nVerifying database record...');
    const dbRecord = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        url: true,
        type: true,
        altText: true,
        productId: true,
        copy: true,
      },
    });

    if (!dbRecord) {
      throw new Error('Media record not found in database');
    }

    logSuccess('Database record verified');
    logInfo(`Type: ${dbRecord.type}`);
    logInfo(`Alt text: ${dbRecord.altText}`);
    logInfo(`Product ID: ${dbRecord.productId}`);

    const storageKey = dbRecord.copy?.storageKey;
    if (!storageKey) {
      throw new Error('Storage key not found in metadata');
    }

    logSuccess(`Storage key stored: ${storageKey}`);

    return { success: true, mediaId };
  } catch (error) {
    logError(`Database integration failed: ${error.message}`);
    return { success: false, mediaId };
  }
}

async function testBulkOperations() {
  logTest('Test 4: Bulk Operations');

  const createdMediaIds: string[] = [];

  try {
    // Create multiple media records
    logInfo('Creating 3 test media records...');

    for (let i = 0; i < 3; i++) {
      const result = await uploadAndCreateMediaAction({
        file: Buffer.from(`Bulk test image ${i}`),
        type: 'IMAGE',
        altText: `Bulk test ${i}`,
        userId: TEST_USER_ID,
      });

      if (result.success) {
        createdMediaIds.push(result.data.media.id);
      }
    }

    logSuccess(`Created ${createdMediaIds.length} media records`);

    // Test bulk refresh
    logInfo('\nTesting bulk URL refresh...');

    const startTime = Date.now();
    const bulkResult = await bulkRefreshMediaUrlsAction(createdMediaIds);
    const duration = Date.now() - startTime;

    if (!bulkResult.success) {
      throw new Error(bulkResult.error || 'Bulk refresh failed');
    }

    const urlCount = Object.keys(bulkResult.data).length;
    logSuccess(`Refreshed ${urlCount} URLs in ${duration}ms`);

    // Verify all URLs are signed
    let allSigned = true;
    for (const [mediaId, url] of Object.entries(bulkResult.data)) {
      if (!url.includes('X-Amz-Algorithm')) {
        logError(`Media ${mediaId} URL is not signed!`);
        allSigned = false;
      }
    }

    if (allSigned) {
      logSuccess('All URLs are properly signed');
    }

    return { success: allSigned, mediaIds: createdMediaIds };
  } catch (error) {
    logError(`Bulk operations failed: ${error.message}`);
    return { success: false, mediaIds: createdMediaIds };
  }
}

async function testCleanup(mediaIds: string[]) {
  logTest('Test 5: Cleanup Operations');

  try {
    logInfo(`Cleaning up ${mediaIds.length} test media records...`);

    let deleted = 0;
    for (const mediaId of mediaIds) {
      const result = await deleteMediaAndStorageAction(mediaId, TEST_USER_ID);
      if (result.success) {
        deleted++;
      }
    }

    logSuccess(`Cleaned up ${deleted} media records`);

    // Verify soft delete
    if (mediaIds.length > 0) {
      const checkRecord = await prisma.media.findUnique({
        where: { id: mediaIds[0] },
        select: { deletedAt: true, deletedById: true },
      });

      if (checkRecord?.deletedAt && checkRecord?.deletedById === TEST_USER_ID) {
        logSuccess('Soft delete verified');
      }
    }

    return { success: true };
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`);
    return { success: false };
  }
}

async function runAllTests() {
  console.log(colors.blue + '\n🧪 Storage Integration Test Suite\n' + colors.reset);
  console.log(colors.gray + 'Testing storage integration with signed URLs...\n' + colors.reset);

  const results = {
    basicUpload: false,
    signedUrls: false,
    databaseIntegration: false,
    bulkOperations: false,
    cleanup: false,
  };

  const mediaIdsToCleanup: string[] = [];

  try {
    // Test 1: Basic Upload
    const uploadResult = await testBasicUpload();
    results.basicUpload = uploadResult.success;

    // Test 2: Signed URLs
    const signedResult = await testSignedUrls();
    results.signedUrls = signedResult.success;

    // Test 3: Database Integration
    const dbResult = await testDatabaseIntegration();
    results.databaseIntegration = dbResult.success;
    if (dbResult.mediaId) {
      mediaIdsToCleanup.push(dbResult.mediaId);
    }

    // Test 4: Bulk Operations
    const bulkResult = await testBulkOperations();
    results.bulkOperations = bulkResult.success;
    mediaIdsToCleanup.push(...bulkResult.mediaIds);

    // Test 5: Cleanup
    const cleanupResult = await testCleanup(mediaIdsToCleanup);
    results.cleanup = cleanupResult.success;
  } catch (error) {
    logError(`\nUnexpected error: ${error.message}`);
  }

  // Summary
  console.log(colors.blue + '\n━━━ Test Summary ━━━\n' + colors.reset);

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? `${colors.green}PASSED` : `${colors.red}FAILED`;
    const testName = test.replace(/([A-Z])/g, ' $1').trim();
    console.log(`${testName}: ${status}${colors.reset}`);
  }

  console.log('\n' + colors.gray + '────────────────────' + colors.reset);

  if (passed === total) {
    log(`\n🎉 All tests passed! (${passed}/${total})`, 'green');
    process.exit(0);
  } else {
    log(`\n⚠️  ${passed}/${total} tests passed`, 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  logError(`\nFatal error: ${error.message}`);
  process.exit(1);
});
