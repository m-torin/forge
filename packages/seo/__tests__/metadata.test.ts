import merge from "lodash.merge";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMetadata } from "../metadata";

// Import the mocked modules
vi.mock("lodash.merge");

describe("SEO Metadata", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock merge to behave like Object.assign
    (merge as unknown as any).mockImplementation(
      (target: Record<string, any>, ...sources: Record<string, any>[]) => {
        return Object.assign({}, target, ...sources);
      },
    );
  });

  it("creates metadata with required fields", () => {
    const metadata = createMetadata({
      description: "This is a test page",
      title: "Test Page",
    });

    expect(metadata).toEqual(
      expect.objectContaining({
        appleWebApp: {
          capable: true,
          statusBarStyle: "default",
          title: "Test Page | next-forge",
        },
        applicationName: "next-forge",
        authors: [
          {
            name: "Hayden Bleasel",
            url: "https://haydenbleasel.com/",
          },
        ],
        creator: "Hayden Bleasel",
        description: "This is a test page",
        formatDetection: {
          telephone: false,
        },
        openGraph: {
          type: "website",
          description: "This is a test page",
          locale: "en_US",
          siteName: "next-forge",
          title: "Test Page | next-forge",
        },
        publisher: "Hayden Bleasel",
        title: "Test Page | next-forge",
        twitter: {
          card: "summary_large_image",
          creator: "@haydenbleasel",
        },
      }),
    );
  });

  it("adds image to openGraph when provided", () => {
    const metadata = createMetadata({
      description: "This is a test page",
      image: "https://example.com/image.jpg",
      title: "Test Page",
    });

    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        images: [
          {
            width: 1200,
            url: "https://example.com/image.jpg",
            alt: "Test Page",
            height: 630,
          },
        ],
      }),
    );
  });

  it("merges additional properties with default metadata", () => {
    const metadata = createMetadata({
      description: "This is a test page",
      keywords: ["test", "page", "seo"],
      robots: {
        follow: true,
        index: false,
      },
      title: "Test Page",
    });

    // Check that merge was called with the correct arguments
    expect(merge).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "This is a test page",
        title: "Test Page | next-forge",
      }),
      expect.objectContaining({
        keywords: ["test", "page", "seo"],
        robots: {
          follow: true,
          index: false,
        },
      }),
    );

    // Check that the result includes the merged properties
    expect(metadata).toEqual(
      expect.objectContaining({
        description: "This is a test page",
        keywords: ["test", "page", "seo"],
        robots: {
          follow: true,
          index: false,
        },
        title: "Test Page | next-forge",
      }),
    );
  });

  it("formats title correctly", () => {
    const metadata = createMetadata({
      description: "This is a test page",
      title: "Custom Title",
    });

    expect(metadata.title).toBe("Custom Title | next-forge");
    expect(metadata.openGraph?.title).toBe("Custom Title | next-forge");
    // Check appleWebApp title if it exists and is an object
    if (
      metadata.appleWebApp &&
      typeof metadata.appleWebApp === "object" &&
      "title" in metadata.appleWebApp
    ) {
      expect(metadata.appleWebApp.title).toBe("Custom Title | next-forge");
    }
  });

  it("sets description in multiple places", () => {
    const metadata = createMetadata({
      description: "Custom description for testing",
      title: "Test Page",
    });

    expect(metadata.description).toBe("Custom description for testing");
    expect(metadata.openGraph?.description).toBe(
      "Custom description for testing",
    );
  });

  it("handles complex additional properties", () => {
    const metadata = createMetadata({
      alternates: {
        canonical: "https://example.com/page",
        languages: {
          "en-US": "https://example.com/page",
          "fr-FR": "https://example.com/fr/page",
        },
      },
      description: "This is a test page",
      title: "Test Page",
      verification: {
        google: "google-verification-code",
        yandex: "yandex-verification-code",
      },
    });

    expect(metadata).toEqual(
      expect.objectContaining({
        alternates: {
          canonical: "https://example.com/page",
          languages: {
            "en-US": "https://example.com/page",
            "fr-FR": "https://example.com/fr/page",
          },
        },
        verification: {
          google: "google-verification-code",
          yandex: "yandex-verification-code",
        },
      }),
    );
  });
});
