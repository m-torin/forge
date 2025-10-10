import { describe, expect } from "vitest";

import { edgeCases, testPatterns } from "#/__tests__/scraping-test-data";
import { createUtilityTestSuite } from "#/__tests__/scraping-test-factory";
import {
  cleanText,
  extractEmails,
  extractImages,
  extractLinks,
  extractMetadata,
  extractPhoneNumbers,
  extractStructuredData,
  extractText,
} from "#/shared/utils/extraction";

describe("extraction Utilities", () => {
  // Test extractText utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractText",
    utilityFunction: extractText,
    scenarios: [
      {
        name: "extract text from HTML",
        args: [
          "<div><p>Hello <strong>World</strong></p><span>Test</span></div>",
        ],
        assertion: (result: any) => {
          expect(result).toBe("Hello World Test");
        },
      },
      {
        name: "handle empty HTML",
        args: [""],
        assertion: (result: any) => {
          expect(result).toBe("");
        },
      },
      {
        name: "remove script and style tags",
        args: [testPatterns.htmlFixtures.withScript],
        assertion: (result: any) => {
          expect(result).toBe("Visible content");
        },
      },
      {
        name: "handle nested elements",
        args: ["<div><p>Outer <span>Inner <em>Deep</em></span> Text</p></div>"],
        assertion: (result: any) => {
          expect(result).toBe("Outer Inner Deep Text");
        },
      },
      {
        name: "preserve spacing between elements",
        args: ["<div>First</div><div>Second</div>"],
        assertion: (result: any) => {
          expect(result).toBe("First Second");
        },
      },
      {
        name: "handle complex HTML structure",
        args: [testPatterns.htmlFixtures.complex],
        assertion: (result: any) => {
          expect(result).toContain("Main Title");
          expect(result).toContain("Article Title");
          expect(result).toContain("Article content");
        },
      },
    ],
  });

  // Test extractLinks utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractLinks",
    utilityFunction: extractLinks,
    scenarios: [
      {
        name: "extract absolute links",
        args: [
          `<a href="https://example.com">Example</a><a href="https://test.com">Test</a>`,
        ],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { href: "https://example.com", text: "Example" },
            { href: "https://test.com", text: "Test" },
          ]);
        },
      },
      {
        name: "resolve relative links with base URL",
        args: [
          `<a href="/about">About</a><a href="contact">Contact</a>`,
          "https://example.com",
        ],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { href: "https://example.com/about", text: "About" },
            { href: "https://example.com/contact", text: "Contact" },
          ]);
        },
      },
      {
        name: "handle links without href",
        args: ['<a>No href</a><a href="">Empty href</a>'],
        assertion: (result: any) => {
          expect(result).toStrictEqual([]);
        },
      },
      {
        name: "extract link text with nested elements",
        args: ['<a href="/test">Click <strong>here</strong> now</a>'],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { href: "/test", text: "Click here now" },
          ]);
        },
      },
      {
        name: "handle mailto and tel links",
        args: [
          `<a href="mailto:test@example.com">Email</a><a href="tel:+1234567890">Phone</a>`,
        ],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { href: "mailto:test@example.com", text: "Email" },
            { href: "tel:+1234567890", text: "Phone" },
          ]);
        },
      },
      {
        name: "extract from complex HTML",
        args: [testPatterns.htmlFixtures.complex],
        assertion: (result: any) => {
          expect(result).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({ href: "/home", text: "Home" }),
              expect.objectContaining({ href: "/about", text: "About" }),
            ]),
          );
        },
      },
    ],
  });

  // Test extractImages utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractImages",
    utilityFunction: extractImages,
    scenarios: [
      {
        name: "extract image sources",
        args: [
          `<img src="https://example.com/image1.jpg" alt="Image 1"><img src="/images/photo.png" alt="Photo">`,
        ],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { src: "https://example.com/image1.jpg", alt: "Image 1" },
            { src: "/images/photo.png", alt: "Photo" },
          ]);
        },
      },
      {
        name: "resolve relative image URLs",
        args: ['<img src="logo.png" alt="Logo">', "https://example.com"],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { src: "https://example.com/logo.png", alt: "Logo" },
          ]);
        },
      },
      {
        name: "handle images without alt text",
        args: ['<img src="test.jpg">'],
        assertion: (result: any) => {
          expect(result).toStrictEqual([{ src: "test.jpg", alt: "" }]);
        },
      },
      {
        name: "skip images without src",
        args: ['<img alt="No source">'],
        assertion: (result: any) => {
          expect(result).toStrictEqual([]);
        },
      },
      {
        name: "handle data URLs",
        args: ['<img src="data:image/png;base64,iVBORw0KG..." alt="Data">'],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            { src: "data:image/png;base64,iVBORw0KG...", alt: "Data" },
          ]);
        },
      },
      {
        name: "extract from complex HTML",
        args: [testPatterns.htmlFixtures.complex],
        assertion: (result: any) => {
          expect(result).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({ src: "/image.jpg", alt: "Test Image" }),
            ]),
          );
        },
      },
    ],
  });

  // Test extractMetadata utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractMetadata",
    utilityFunction: extractMetadata,
    scenarios: [
      {
        name: "extract meta tags",
        args: [
          `<html><head><title>Page Title</title><meta name="description" content="Page description"><meta name="keywords" content="test, example"><meta property="og:title" content="Open Graph Title"><meta property="og:image" content="https://example.com/og.jpg"></head></html>`,
        ],
        assertion: (result: any) => {
          expect(result).toStrictEqual({
            title: "Page Title",
            description: "Page description",
            keywords: "test, example",
            "og:title": "Open Graph Title",
            "og:image": "https://example.com/og.jpg",
          });
        },
      },
      {
        name: "handle missing metadata",
        args: ["<html><body>Content</body></html>"],
        assertion: (result: any) => {
          expect(result).toStrictEqual({
            title: "",
          });
        },
      },
      {
        name: "prioritize property over name",
        args: [
          `<meta name="author" content="Name Author"><meta property="author" content="Property Author">`,
        ],
        assertion: (result: any) => {
          expect(result.author).toBe("Property Author");
        },
      },
      {
        name: "extract from complex HTML",
        args: [testPatterns.htmlFixtures.complex],
        assertion: (result: any) => {
          expect(result).toMatchObject({
            title: "Complex Page",
            description: "Test description",
            "og:title": "OG Title",
          });
        },
      },
    ],
  });

  // Test extractStructuredData utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractStructuredData",
    utilityFunction: extractStructuredData,
    scenarios: [
      {
        name: "extract JSON-LD structured data",
        args: [
          `<script type="application/ld+json">{"@context": "https://schema.org","@type": "Product","name": "Test Product","price": "19.99"}</script>`,
        ],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: "Test Product",
              price: "19.99",
            },
          ]);
        },
      },
      {
        name: "handle multiple structured data blocks",
        args: [
          `<script type="application/ld+json">{"@type": "Organization", "name": "Company"}</script><script type="application/ld+json">{"@type": "Product", "name": "Product"}</script>`,
        ],
        assertion: (result: any) => {
          expect(result).toHaveLength(2);
          expect(result[0]["@type"]).toBe("Organization");
          expect(result[1]["@type"]).toBe("Product");
        },
      },
      {
        name: "handle invalid JSON gracefully",
        args: [`<script type="application/ld+json">{invalid json}</script>`],
        assertion: (result: any) => {
          expect(result).toStrictEqual([]);
        },
      },
      {
        name: "extract from test fixture",
        args: [testPatterns.htmlFixtures.withStructuredData],
        assertion: (result: any) => {
          expect(result).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                "@type": "Product",
                name: "Test Product",
                price: "19.99",
              }),
            ]),
          );
        },
      },
    ],
  });

  // Test extractEmails utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractEmails",
    utilityFunction: extractEmails,
    scenarios: [
      {
        name: "extract email addresses",
        args: ["Contact us at info@example.com or support@test.com"],
        assertion: (result: any) => {
          expect(result).toStrictEqual([
            "info@example.com",
            "support@test.com",
          ]);
        },
      },
      {
        name: "handle complex email formats",
        args: ["Email: user.name+tag@example.co.uk"],
        assertion: (result: any) => {
          expect(result).toStrictEqual(["user.name+tag@example.co.uk"]);
        },
      },
      {
        name: "avoid false positives",
        args: ["Price is $10.99 @ store"],
        assertion: (result: any) => {
          expect(result).toStrictEqual([]);
        },
      },
      {
        name: "extract unique emails",
        args: ["Email test@example.com or test@example.com for info"],
        assertion: (result: any) => {
          expect(result).toStrictEqual(["test@example.com"]);
        },
      },
      {
        name: "extract from test patterns",
        args: [testPatterns.textPatterns.emails.join(" ")],
        assertion: (result: any) => {
          // Should extract at least some of the valid emails
          expect(result.length).toBeGreaterThan(0);
          // Should contain standard email patterns
          expect(result).toStrictEqual(
            expect.arrayContaining([
              "info@example.com",
              "user.name@domain.co.uk",
            ]),
          );
        },
      },
    ],
  });

  // Test extractPhoneNumbers utility using factory pattern
  createUtilityTestSuite({
    utilityName: "extractPhoneNumbers",
    utilityFunction: extractPhoneNumbers,
    scenarios: [
      {
        name: "extract US phone numbers",
        args: ["Call us at (555) 123-4567 or 555-987-6543"],
        assertion: (result: any) => {
          expect(result).toStrictEqual(["(555) 123-4567", "555-987-6543"]);
        },
      },
      {
        name: "extract international format",
        args: ["International: +1-555-123-4567"],
        assertion: (result: any) => {
          expect(result).toStrictEqual(["+1-555-123-4567"]);
        },
      },
      {
        name: "handle different formats",
        args: ["555.123.4567 or 5551234567"],
        assertion: (result: any) => {
          expect(result).toStrictEqual(["555.123.4567", "5551234567"]);
        },
      },
      {
        name: "avoid false positives",
        args: ["Product code: 12345"],
        assertion: (result: any) => {
          expect(result).toStrictEqual([]);
        },
      },
      {
        name: "extract from test patterns",
        args: [testPatterns.textPatterns.phoneNumbers.join(" ")],
        assertion: (result: any) => {
          expect(result).toStrictEqual(
            expect.arrayContaining(testPatterns.textPatterns.phoneNumbers),
          );
        },
      },
    ],
  });

  // Test cleanText utility using factory pattern
  createUtilityTestSuite({
    utilityName: "cleanText",
    utilityFunction: cleanText,
    scenarios: [
      {
        name: "clean whitespace",
        args: ["  Hello   World\n\n  Test  "],
        assertion: (result: any) => {
          expect(result).toBe("Hello World Test");
        },
      },
      {
        name: "remove HTML entities",
        args: ["Hello &amp; World &lt;test&gt;"],
        assertion: (result: any) => {
          expect(result).toBe("Hello & World <test>");
        },
      },
      {
        name: "handle special characters",
        args: ["Price: $10.99 — Save 50%!"],
        assertion: (result: any) => {
          expect(result).toBe("Price: $10.99 — Save 50%!");
        },
      },
      {
        name: "handle empty input",
        args: [""],
        assertion: (result: any) => {
          expect(result).toBe("");
        },
      },
      {
        name: "handle whitespace-only input",
        args: ["   "],
        assertion: (result: any) => {
          expect(result).toBe("");
        },
      },
      {
        name: "handle Unicode characters",
        args: [edgeCases.unicode.content],
        assertion: (result: any) => {
          expect(result).toContain("Tokyo");
          expect(result).toContain("Moscow");
          expect(result).toContain("Paris");
        },
      },
    ],
  });
});
