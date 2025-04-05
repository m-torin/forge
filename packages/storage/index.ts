import * as blobModule from "@vercel/blob";

/**
 * Re-export all functions and classes from @vercel/blob
 */
export * from "@vercel/blob";

/**
 * Re-export specific functions from @vercel/blob
 */
export const put = blobModule.put;
export const list = blobModule.list;
export const del = blobModule.del;
export const head = blobModule.head;
export const BlobAccessError = blobModule.BlobAccessError;

/**
 * Mock get function as it's expected in tests but not available in the actual module
 */
export const get = async (pathname: string) => {
  return {
    blob: new Blob(["test content"]),
    contentDisposition: "attachment",
    contentType: "application/octet-stream",
    size: 1024,
  };
};
