/**
 * Scraping Test Patterns
 *
 * Advanced test patterns and utilities for comprehensive scraping functionality testing.
 * Provides reusable patterns for complex test scenarios.
 */

import { describe, expect, test } from "vitest";
import {
  performanceHelpers,
  scrapingAssertions,
} from "./shared-test-utilities";

/**
 * Provider functionality test patterns
 */
export const providerTestPatterns = {
  /**
   * Tests provider initialization and basic functionality
   */
  testProviderFunctionality: (
    providerName: string,
    importPath: string,
    testScenarios: Array<{
      name: string;
      method: string;
      args: any[];
      expectedResult?: any;
      customAssertions?: (result: any) => void;
    }>,
  ) => {
    describe(`${providerName} functionality`, () => {
      testScenarios.forEach(
        ({ name, method, args, expectedResult, customAssertions }) => {
          test(`should ${name}`, async () => {
            const module = await import(importPath);
            const provider = new module[providerName]();

            await provider.initialize();
            const result = await provider[method](...args);

            if (expectedResult) {
              expect(result).toStrictEqual(expectedResult);
            }

            if (customAssertions) {
              customAssertions(result);
            }

            scrapingAssertions.hasValidScrapingResult(result);
          });
        },
      );
    });
  },

  /**
   * Tests provider error handling
   */
  testProviderErrorHandling: (
    providerName: string,
    importPath: string,
    errorScenarios: Array<{
      name: string;
      method: string;
      args: any[];
      expectedError: string;
    }>,
  ) => {
    describe(`${providerName} error handling`, () => {
      errorScenarios.forEach(({ name, method, args, expectedError }) => {
        test(`should handle ${name}`, async () => {
          const module = await import(importPath);
          const provider = new module[providerName]();

          await provider.initialize();
          await expect(provider[method](...args)).rejects.toThrow(
            expectedError,
          );
        });
      });
    });
  },

  /**
   * Tests provider performance
   */
  testProviderPerformance: (
    providerName: string,
    importPath: string,
    performanceScenarios: Array<{
      name: string;
      method: string;
      args: any[];
      maxDuration: number;
    }>,
  ) => {
    describe(`${providerName} performance`, () => {
      performanceScenarios.forEach(({ name, method, args, maxDuration }) => {
        test(`should ${name} within ${maxDuration}ms`, async () => {
          const module = await import(importPath);
          const provider = new module[providerName]();

          await provider.initialize();

          const { result, duration } =
            await performanceHelpers.measureExecutionTime(() =>
              provider[method](...args),
            );

          expect(result).toBeDefined();
          expect(duration).toBeLessThan(maxDuration);
        });
      });
    });
  },
};

/**
 * Extraction test patterns
 */
export const extractionTestPatterns = {
  /**
   * Tests data extraction with various selectors
   */
  testDataExtraction: (
    extractorName: string,
    importPath: string,
    extractionScenarios: Array<{
      name: string;
      html: string;
      selectors: any;
      expectedData: any;
    }>,
  ) => {
    describe(`${extractorName} data extraction`, () => {
      extractionScenarios.forEach(({ name, html, selectors, expectedData }) => {
        test(`should extract ${name}`, async () => {
          const module = await import(importPath);
          const extractor = module[extractorName] || module.default;

          const result = await extractor(html, selectors);

          expect(result).toBeDefined();
          expect(result).toStrictEqual(expectedData);

          scrapingAssertions.hasValidExtractedData(
            result,
            Object.keys(expectedData),
          );
        });
      });
    });
  },

  /**
   * Tests extraction performance with large datasets
   */
  testExtractionPerformance: (
    extractorName: string,
    importPath: string,
    performanceScenarios: Array<{
      name: string;
      htmlGenerator: () => string;
      selectors: any;
      maxDuration: number;
    }>,
  ) => {
    describe(`${extractorName} extraction performance`, () => {
      performanceScenarios.forEach(
        ({ name, htmlGenerator, selectors, maxDuration }) => {
          test(`should handle ${name} within ${maxDuration}ms`, async () => {
            const module = await import(importPath);
            const extractor = module[extractorName] || module.default;

            const html = htmlGenerator();

            const { result, duration } =
              await performanceHelpers.measureExecutionTime(() =>
                extractor(html, selectors),
              );

            expect(result).toBeDefined();
            expect(duration).toBeLessThan(maxDuration);
          });
        },
      );
    });
  },

  /**
   * Tests extraction edge cases
   */
  testExtractionEdgeCases: (
    extractorName: string,
    importPath: string,
    edgeCaseScenarios: Array<{
      name: string;
      html: string;
      selectors: any;
      expectedBehavior: "return_null" | "return_empty" | "throw_error";
    }>,
  ) => {
    describe(`${extractorName} edge cases`, () => {
      edgeCaseScenarios.forEach(
        ({ name, html, selectors, expectedBehavior }) => {
          test(`should handle ${name}`, async () => {
            const module = await import(importPath);
            const extractor = module[extractorName] || module.default;

            if (expectedBehavior === "throw_error") {
              await expect(extractor(html, selectors)).rejects.toThrow();
            } else {
              const result = await extractor(html, selectors);

              if (expectedBehavior === "return_null") {
                expect(result).toBeNull();
              } else if (expectedBehavior === "return_empty") {
                expect(result).toStrictEqual({});
              }
            }
          });
        },
      );
    });
  },
};

/**
 * Configuration test patterns
 */
export const configurationTestPatterns = {
  /**
   * Tests configuration validation
   */
  testConfigurationValidation: (
    validatorName: string,
    importPath: string,
    configScenarios: Array<{
      name: string;
      config: any;
      shouldPass: boolean;
      expectedError?: string;
    }>,
  ) => {
    describe(`${validatorName} configuration validation`, () => {
      configScenarios.forEach(({ name, config, shouldPass, expectedError }) => {
        test(`should ${shouldPass ? "accept" : "reject"} ${name}`, async () => {
          const module = await import(importPath);
          const validator = module[validatorName] || module.default;

          if (shouldPass) {
            expect(() => validator(config)).not.toThrow();
          } else {
            expect(() => validator(config)).toThrow(expectedError || "");
          }
        });
      });
    });
  },

  /**
   * Tests configuration merging and defaults
   */
  testConfigurationDefaults: (
    configManagerName: string,
    importPath: string,
    defaultScenarios: Array<{
      name: string;
      inputConfig: any;
      expectedDefaults: any;
    }>,
  ) => {
    describe(`${configManagerName} configuration defaults`, () => {
      defaultScenarios.forEach(({ name, inputConfig, expectedDefaults }) => {
        test(`should apply defaults for ${name}`, async () => {
          const module = await import(importPath);
          const configManager = module[configManagerName] || module.default;

          const result = configManager(inputConfig);

          Object.entries(expectedDefaults).forEach(([key, value]) => {
            expect(result).toHaveProperty(key, value);
          });
        });
      });
    });
  },
};

/**
 * Integration test patterns
 */
export const integrationTestPatterns = {
  /**
   * Tests end-to-end scraping workflows
   */
  testFullScrapingWorkflow: (
    workflowName: string,
    workflowSteps: Array<{
      name: string;
      action: (context: any) => Promise<any>;
      validate: (result: any, context: any) => void;
    }>,
  ) => {
    describe(`${workflowName} full workflow`, () => {
      test("should complete entire scraping workflow", async () => {
        let context: any = {};

        for (const step of workflowSteps) {
          const result = await step.action(context);
          step.validate(result, context);
          context[step.name] = result;
        }

        // Final validation
        expect(context).toBeDefined();
        expect(Object.keys(context)).toHaveLength(workflowSteps.length);
      });
    });
  },

  /**
   * Tests concurrent scraping operations
   */
  testConcurrentScraping: (
    scraperName: string,
    importPath: string,
    concurrencyScenarios: Array<{
      name: string;
      urls: string[];
      maxConcurrency: number;
      maxTotalDuration: number;
    }>,
  ) => {
    describe(`${scraperName} concurrent scraping`, () => {
      concurrencyScenarios.forEach(
        ({ name, urls, maxConcurrency, maxTotalDuration }) => {
          test(`should handle ${name}`, async () => {
            const module = await import(importPath);
            const scraper = module[scraperName] || module.default;

            const { results, averageDuration } =
              await performanceHelpers.measureAverageTime(async () => {
                const chunks = [];
                for (let i = 0; i < urls.length; i += maxConcurrency) {
                  chunks.push(urls.slice(i, i + maxConcurrency));
                }

                const allResults = [];
                for (const chunk of chunks) {
                  const chunkResults = await Promise.all(
                    chunk.map((url) => scraper.scrape(url)),
                  );
                  allResults.push(...chunkResults);
                }

                return allResults;
              });

            expect(results[0]).toHaveLength(urls.length);
            expect(averageDuration).toBeLessThan(maxTotalDuration);

            // Validate each result
            results[0].forEach((result: any) => {
              scrapingAssertions.hasValidScrapingResult(result);
            });
          });
        },
      );
    });
  },
};

/**
 * Security test patterns
 */
export const securityTestPatterns = {
  /**
   * Tests XSS prevention and content sanitization
   */
  testXSSPrevention: (
    sanitizerName: string,
    importPath: string,
    xssScenarios: Array<{
      name: string;
      maliciousInput: string;
      expectedBehavior: "remove" | "escape" | "reject";
    }>,
  ) => {
    describe(`${sanitizerName} XSS prevention`, () => {
      xssScenarios.forEach(({ name, maliciousInput, expectedBehavior }) => {
        test(`should handle ${name}`, async () => {
          const module = await import(importPath);
          const sanitizer = module[sanitizerName] || module.default;

          if (expectedBehavior === "reject") {
            expect(() => sanitizer(maliciousInput)).toThrow();
          } else {
            const result = sanitizer(maliciousInput);

            if (expectedBehavior === "remove") {
              expect(result).not.toContain("<script>");
              expect(result).not.toContain("javascript:");
            } else if (expectedBehavior === "escape") {
              expect(result).toContain("&lt;script&gt;");
            }

            scrapingAssertions.hasCleanHTML(result);
          }
        });
      });
    });
  },

  /**
   * Tests URL validation and filtering
   */
  testURLSecurity: (
    validatorName: string,
    importPath: string,
    urlScenarios: Array<{
      name: string;
      url: string;
      shouldAllow: boolean;
      reason?: string;
    }>,
  ) => {
    describe(`${validatorName} URL security`, () => {
      urlScenarios.forEach(({ name, url, shouldAllow, reason }) => {
        test(`should ${shouldAllow ? "allow" : "block"} ${name}`, async () => {
          const module = await import(importPath);
          const validator = module[validatorName] || module.default;

          const result = validator(url);

          if (shouldAllow) {
            expect(result).toBeTruthy();
          } else {
            expect(result).toBeFalsy();
          }
        });
      });
    });
  },
};

/**
 * Utility functions for creating common test scenarios
 */
export const createTestScenarios = {
  /**
   * Creates basic scraping scenarios
   */
  basicScraping: () => [
    {
      name: "simple HTML page",
      url: "https://example.com",
      expectedData: { title: "Example Domain" },
    },
    {
      name: "page with links",
      url: "https://example.com/links",
      expectedData: {
        links: ["https://example.com/page1", "https://example.com/page2"],
      },
    },
    {
      name: "page with images",
      url: "https://example.com/images",
      expectedData: {
        images: [
          "https://example.com/img1.jpg",
          "https://example.com/img2.jpg",
        ],
      },
    },
  ],

  /**
   * Creates performance test scenarios
   */
  performanceScenarios: () => [
    {
      name: "large page (1MB)",
      htmlGenerator: () =>
        `<html><body>${"<p>Content</p>".repeat(10000)}</body></html>`,
      maxDuration: 2000,
    },
    {
      name: "deeply nested structure",
      htmlGenerator: () =>
        `${"<div>".repeat(100)}Content${"</div>".repeat(100)}`,
      maxDuration: 1000,
    },
    {
      name: "many elements (10k)",
      htmlGenerator: () =>
        `<html><body>${Array.from({ length: 10000 }, (_, i) => `<span id="item-${i}">Item ${i}</span>`).join("")}</body></html>`,
      maxDuration: 3000,
    },
  ],

  /**
   * Creates error handling scenarios
   */
  errorScenarios: () => [
    {
      name: "invalid URL",
      input: "not-a-url",
      expectedError: "Invalid URL",
    },
    {
      name: "404 error",
      input: "https://httpbin.org/status/404",
      expectedError: "404",
    },
    {
      name: "timeout",
      input: "https://httpbin.org/delay/10",
      expectedError: "timeout",
    },
    {
      name: "malformed HTML",
      input: "<html><body><div>Unclosed div</body></html>",
      expectedError: "parse",
    },
  ],

  /**
   * Creates security test scenarios
   */
  securityScenarios: () => [
    {
      name: "script injection",
      maliciousInput: '<script>alert("xss")</script>',
      expectedBehavior: "remove" as const,
    },
    {
      name: "javascript URL",
      maliciousInput: "javascript:alert(1)",
      expectedBehavior: "reject" as const,
    },
    {
      name: "data URL with script",
      maliciousInput: "data:text/html,<script>alert(1)</script>",
      expectedBehavior: "reject" as const,
    },
    {
      name: "iframe injection",
      maliciousInput: '<iframe src="javascript:alert(1)"></iframe>',
      expectedBehavior: "remove" as const,
    },
  ],
};
