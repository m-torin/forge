import * as blobClientModule from "@vercel/blob/client";
import { describe, expect, it, vi } from "vitest";

import * as storageClientModule from "../client";

// Import the mocked modules
vi.mock("@vercel/blob/client");

describe("Storage Client Module", () => {
  it.skip("exports all functions from @vercel/blob/client", () => {
    // Get all exported functions from @vercel/blob/client
    const blobClientExports = Object.keys(blobClientModule);

    // Get all exported functions from the storage client module
    const storageClientExports = Object.keys(storageClientModule);

    // Check that all functions from @vercel/blob/client are exported from the storage client module
    for (const exportName of blobClientExports) {
      expect(storageClientExports).toContain(exportName);
    }

    // Check that the functions are the same
    for (const exportName of blobClientExports) {
      expect(storageClientModule[exportName]).toBe(
        blobClientModule[exportName],
      );
    }
  });

  it.skip("exports the getPutUrl function", () => {
    expect(storageClientModule.getPutUrl).toBeDefined();
    expect(storageClientModule.getPutUrl).toBe(blobClientModule.getPutUrl);
  });

  it.skip("exports the getUrl function", () => {
    expect(storageClientModule.getUrl).toBeDefined();
    expect(storageClientModule.getUrl).toBe(blobClientModule.getUrl);
  });

  it.skip("getPutUrl returns the expected URL and headers", async () => {
    // Mock the getPutUrl function to return a specific value
    (blobClientModule.getPutUrl as any).mockResolvedValue({
      url: "https://example.com/upload-url",
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    // Call the function
    const result = await storageClientModule.getPutUrl({
      pathname: "/test-file.txt",
      contentType: "text/plain",
    });

    // Check that the function was called with the correct parameters
    expect(blobClientModule.getPutUrl).toHaveBeenCalledWith({
      pathname: "/test-file.txt",
      contentType: "text/plain",
    });

    // Check that the result is correct
    expect(result).toEqual({
      url: "https://example.com/upload-url",
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  });

  it.skip("getUrl returns the expected URL", () => {
    // Mock the getUrl function to return a specific value
    (blobClientModule.getUrl as any).mockImplementation((pathname) => {
      return `https://example.com${pathname}`;
    });

    // Call the function
    const result = storageClientModule.getUrl("/test-file.txt");

    // Check that the function was called with the correct parameters
    expect(blobClientModule.getUrl).toHaveBeenCalledWith("/test-file.txt");

    // Check that the result is correct
    expect(result).toBe("https://example.com/test-file.txt");
  });
});
