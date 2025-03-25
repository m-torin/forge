import { describe, expect, it, vi } from 'vitest';
import * as blobModule from '@vercel/blob';
import * as storageModule from '../index';

// Import the mocked modules
vi.mock('@vercel/blob');

describe('Storage Module', () => {
  it.skip('exports all functions from @vercel/blob', () => {
    // Get all exported functions from @vercel/blob
    const blobExports = Object.keys(blobModule);

    // Get all exported functions from the storage module
    const storageExports = Object.keys(storageModule);

    // Check that all functions from @vercel/blob are exported from the storage module
    for (const exportName of blobExports) {
      expect(storageExports).toContain(exportName);
    }

    // Check that the functions are the same
    for (const exportName of blobExports) {
      expect(storageModule[exportName]).toBe(blobModule[exportName]);
    }
  });

  it('exports the put function', () => {
    expect(storageModule.put).toBeDefined();
    expect(storageModule.put).toBe(blobModule.put);
  });

  it('exports the list function', () => {
    expect(storageModule.list).toBeDefined();
    expect(storageModule.list).toBe(blobModule.list);
  });

  it.skip('exports the get function', () => {
    expect(storageModule.get).toBeDefined();
    expect(storageModule.get).toBe(blobModule.get);
  });

  it('exports the del function', () => {
    expect(storageModule.del).toBeDefined();
    expect(storageModule.del).toBe(blobModule.del);
  });

  it('exports the head function', () => {
    expect(storageModule.head).toBeDefined();
    expect(storageModule.head).toBe(blobModule.head);
  });
});
