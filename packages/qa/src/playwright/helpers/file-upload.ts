import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * File upload utilities for multipart forms and drag-and-drop testing
 */
export class FileUploadUtils {
  constructor(private readonly page: Page) {}

  /**
   * Upload files via input element
   */
  async uploadFiles(
    selector: string,
    filePaths: string | string[],
    options?: {
      waitForUpload?: boolean;
      uploadIndicator?: string;
      timeout?: number;
    },
  ) {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const absolutePaths = paths.map(path => resolve(path));

    // Set files on input element
    await this.page.setInputFiles(selector, absolutePaths);

    // Optionally wait for upload completion
    if (options?.waitForUpload && options.uploadIndicator) {
      await expect(this.page.locator(options.uploadIndicator)).toBeVisible({
        timeout: options.timeout || 30000,
      });
    }

    return {
      uploadedFiles: paths.length,
      filePaths: absolutePaths,
    };
  }

  /**
   * Drag and drop files onto a drop zone
   */
  async dragAndDropFiles(
    dropZoneSelector: string,
    filePaths: string | string[],
    options?: {
      waitForUpload?: boolean;
      uploadIndicator?: string;
      timeout?: number;
    },
  ) {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const absolutePaths = paths.map(path => resolve(path));

    // Create file data for drag and drop
    const files = absolutePaths.map(filePath => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const buffer = readFileSync(filePath);
      const fileName = filePath.split('/').pop() || 'file';
      return {
        name: fileName,
        mimeType: this.getMimeType(fileName),
        buffer,
      };
    });

    // Simulate drag and drop
    await this.page.evaluate(
      ({ selector, files }) => {
        const dropZone = document.querySelector(selector) as HTMLElement;
        if (!dropZone) throw new Error(`Drop zone not found: ${selector}`);

        // Create File objects
        const fileList = files.map(({ name, mimeType, buffer }) => {
          const uint8Array = new Uint8Array(buffer);
          return new File([uint8Array], name, { type: mimeType });
        });

        // Create DataTransfer object
        const dataTransfer = new DataTransfer();
        fileList.forEach(file => dataTransfer.items.add(file));

        // Dispatch drag events
        dropZone.dispatchEvent(
          new DragEvent('dragenter', {
            bubbles: true,
            dataTransfer,
          }),
        );

        dropZone.dispatchEvent(
          new DragEvent('dragover', {
            bubbles: true,
            dataTransfer,
          }),
        );

        dropZone.dispatchEvent(
          new DragEvent('drop', {
            bubbles: true,
            dataTransfer,
          }),
        );
      },
      { selector: dropZoneSelector, files },
    );

    // Optionally wait for upload completion
    if (options?.waitForUpload && options.uploadIndicator) {
      await expect(this.page.locator(options.uploadIndicator)).toBeVisible({
        timeout: options.timeout || 30000,
      });
    }

    return {
      uploadedFiles: paths.length,
      filePaths: absolutePaths,
    };
  }

  /**
   * Validate file upload UI feedback
   */
  async validateFileUpload(options: {
    expectedFiles: number;
    fileListSelector?: string;
    progressIndicator?: string;
    successIndicator?: string;
    errorIndicator?: string;
    timeout?: number;
  }) {
    const timeout = options.timeout || 30000;

    // Check file list if provided
    if (options.fileListSelector) {
      const fileItems = this.page.locator(`${options.fileListSelector} > *`);
      await expect(fileItems).toHaveCount(options.expectedFiles, { timeout });
    }

    // Check progress indicator
    if (options.progressIndicator) {
      await expect(this.page.locator(options.progressIndicator)).toBeVisible({ timeout });
    }

    // Check for success or error
    if (options.successIndicator) {
      await expect(this.page.locator(options.successIndicator)).toBeVisible({ timeout });
    }

    if (options.errorIndicator) {
      await expect(this.page.locator(options.errorIndicator)).toBeHidden();
    }
  }

  /**
   * Test file upload with validation
   */
  async testFileUploadFlow(config: {
    uploadMethod: 'input' | 'dragDrop';
    selector: string;
    files: string | string[];
    validation: {
      expectedFiles: number;
      fileListSelector?: string;
      successMessage?: string;
      errorMessage?: string;
    };
    timeout?: number;
  }) {
    const startTime = Date.now();

    // Perform upload
    let result;
    if (config.uploadMethod === 'input') {
      result = await this.uploadFiles(config.selector, config.files, {
        waitForUpload: true,
        timeout: config.timeout,
      });
    } else {
      result = await this.dragAndDropFiles(config.selector, config.files, {
        waitForUpload: true,
        timeout: config.timeout,
      });
    }

    // Validate upload
    await this.validateFileUpload({
      expectedFiles: config.validation.expectedFiles,
      fileListSelector: config.validation.fileListSelector,
      successIndicator: config.validation.successMessage,
      errorIndicator: config.validation.errorMessage,
      timeout: config.timeout,
    });

    const duration = Date.now() - startTime;

    return {
      ...result,
      duration,
      method: config.uploadMethod,
    };
  }

  /**
   * Create test files for upload testing
   */
  async createTestFiles(
    files: Array<{
      name: string;
      content: string | Buffer;
      mimeType?: string;
    }>,
    tempDir = '/tmp',
  ) {
    const { writeFileSync, mkdirSync } = require('fs');

    // Ensure temp directory exists
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      mkdirSync(tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const createdFiles = [];

    for (const file of files) {
      const filePath = resolve(tempDir, file.name);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      writeFileSync(filePath, file.content);
      createdFiles.push(filePath);
    }

    return createdFiles;
  }

  /**
   * Test file size limits
   */
  async testFileSizeLimit(
    selector: string,
    filePath: string,
    expectedBehavior: 'accept' | 'reject',
    options?: {
      errorSelector?: string;
      timeout?: number;
    },
  ) {
    await this.uploadFiles(selector, filePath);

    if (expectedBehavior === 'reject' && options?.errorSelector) {
      await expect(this.page.locator(options.errorSelector)).toBeVisible({
        timeout: options.timeout || 10000,
      });
    } else if (expectedBehavior === 'accept') {
      // Verify no error is shown
      if (options?.errorSelector) {
        await expect(this.page.locator(options.errorSelector)).toBeHidden();
      }
    }
  }

  /**
   * Test file type validation
   */
  async testFileTypeValidation(
    selector: string,
    filePath: string,
    expectedBehavior: 'accept' | 'reject',
    options?: {
      errorSelector?: string;
      timeout?: number;
    },
  ) {
    return this.testFileSizeLimit(selector, filePath, expectedBehavior, options);
  }

  /**
   * Test multiple file upload
   */
  async testMultipleFileUpload(
    selector: string,
    filePaths: string[],
    maxFiles?: number,
    options?: {
      errorSelector?: string;
      fileListSelector?: string;
      timeout?: number;
    },
  ) {
    await this.uploadFiles(selector, filePaths);

    const expectedCount = maxFiles ? Math.min(filePaths.length, maxFiles) : filePaths.length;
    const shouldError = maxFiles && filePaths.length > maxFiles;

    if (shouldError && options?.errorSelector) {
      await expect(this.page.locator(options.errorSelector)).toBeVisible({
        timeout: options?.timeout || 10000,
      });
    }

    if (options?.fileListSelector) {
      const fileItems = this.page.locator(`${options.fileListSelector} > *`);
      await expect(fileItems).toHaveCount(expectedCount, {
        timeout: options?.timeout || 10000,
      });
    }

    return {
      uploadedCount: expectedCount,
      totalAttempted: filePaths.length,
      wasLimited: shouldError,
    };
  }

  /**
   * Get MIME type for file extension
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

/**
 * Create file upload utilities instance
 */
export function createFileUploadUtils(page: Page) {
  return new FileUploadUtils(page);
}
