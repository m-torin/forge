/**
 * Client-side blob storage utilities that match what's exported from @vercel/blob/client
 */

/**
 * Returns a pre-signed URL for uploading a file to blob storage
 */
export async function getPutUrl(options: {
  pathname: string;
  contentType: string;
}) {
  return {
    url: `https://example.com${options.pathname}`,
    headers: {
      "Content-Type": options.contentType,
    },
  };
}

/**
 * Returns a public URL for a file in blob storage
 */
export function getUrl(pathname: string) {
  return `https://example.com${pathname}`;
}

/**
 * Creates a folder in blob storage
 */
export function createFolder(options: { folderPath: string }) {
  return Promise.resolve({
    pathname: options.folderPath,
    url: `https://example.com${options.folderPath}`,
  });
}

/**
 * Completes a multipart upload
 */
export function completeMultipartUpload() {
  return Promise.resolve();
}
