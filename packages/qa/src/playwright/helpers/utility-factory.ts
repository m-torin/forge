import type { BrowserContext, Page } from "@playwright/test";
import { BetterAuthTestHelpers } from "./auth";
import { ErrorHandler, PlaywrightUtilityError } from "./errors";
import { FileUploadUtils } from "./file-upload";
import { NetworkUtils, PerformanceUtils } from "./patterns";
import { PerformanceBudgetValidator } from "./performance-budgets";
import { ContextSessionUtils, SessionUtils } from "./session-management";
import type {
  CompositeTestResult,
  TestFixture,
  TestMetadata,
  UtilityEventHandler,
  UtilityFactoryConfig,
} from "./shared-interfaces";

/**
 * Comprehensive utility suite combining all Playwright helpers
 */
export class PlaywrightUtilitySuite {
  public readonly page: Page;
  public readonly context: BrowserContext;
  public readonly config: UtilityFactoryConfig;

  // Individual utilities
  public readonly auth?: BetterAuthTestHelpers;
  public readonly network: NetworkUtils;
  public readonly performance: PerformanceUtils;
  public readonly fileUpload: FileUploadUtils;
  public readonly session: SessionUtils;
  public readonly contextSession: ContextSessionUtils;
  public readonly performanceBudgets: PerformanceBudgetValidator;

  // Shared state
  private readonly fixture: TestFixture;
  private readonly eventHandlers?: UtilityEventHandler;
  private readonly measurements: any[] = [];

  constructor(config: UtilityFactoryConfig) {
    this.config = config;
    this.page = config.page;
    this.context = config.context || config.page.context();
    this.eventHandlers = config.eventHandlers;

    // Initialize fixture
    this.fixture = config.fixture || {
      page: this.page,
      context: this.context,
      cleanup: [],
      testData: {},
    };

    // Initialize utilities based on configuration
    const enabled = config.enabledUtilities || {};

    if (enabled.auth !== false) {
      this.auth = new BetterAuthTestHelpers(this.page.url());
    }

    this.network = new NetworkUtils(this.page);
    this.performance = new PerformanceUtils(this.page);
    this.fileUpload = new FileUploadUtils(this.page);
    this.session = new SessionUtils(this.page);
    this.contextSession = new ContextSessionUtils(this.context);
    this.performanceBudgets = new PerformanceBudgetValidator();
  }

  /**
   * Execute a complete authenticated test flow
   */
  async executeAuthenticatedTestFlow(options: {
    user: { email: string; password: string; name: string };
    testOperation: () => Promise<void>;
    measurePerformance?: boolean;
    validateBudgets?: boolean;
  }): Promise<CompositeTestResult> {
    const startTime = Date.now();
    const result: CompositeTestResult = {
      metadata: this.config.metadata || { testName: "authenticated-flow" },
      success: false,
      totalDuration: 0,
      errors: [],
      warnings: [],
    };

    try {
      await this.eventHandlers?.onStart?.("authenticated-test-flow", options);

      // Authenticate user
      if (this.auth) {
        await ErrorHandler.withContext(
          () => this.auth!.signIn(this.page, options.user),
          {
            operation: "authentication",
            errorType: PlaywrightUtilityError,
          },
        );

        await this.auth.waitForAuth(this.page);
        result.session = {
          authenticated: true,
          user: options.user,
        };
      }

      // Setup performance monitoring if requested
      let performanceCleanup: (() => Promise<void>) | undefined;
      if (options.measurePerformance) {
        performanceCleanup =
          await this.network.simulateNetworkConditions("fast3G");
      }

      // Execute the main test operation
      const operationStart = Date.now();
      await options.testOperation();
      const operationDuration = Date.now() - operationStart;

      // Measure performance if requested
      if (options.measurePerformance) {
        const webVitals = (await this.performance.measureWebVitals()) as any;
        const resourceAnalysis =
          await this.performance.analyzeResourceLoading();

        result.performance = [
          {
            operation: "test-operation",
            duration: operationDuration,
            startTime: operationStart,
            endTime: Date.now(),
            success: true,
            metrics: {
              lcp: webVitals.lcp || 0,
              fid: webVitals.fid || 0,
              cls: webVitals.cls || 0,
              totalResources: resourceAnalysis.totalResources,
              totalSize: resourceAnalysis.totalSize,
            },
          },
        ];

        // Validate against performance budgets if requested
        if (options.validateBudgets) {
          try {
            this.performanceBudgets.validateWebVitals({
              lcp: webVitals.lcp,
              fid: webVitals.fid,
              cls: webVitals.cls,
              fcp: webVitals.fcp,
            });
            this.performanceBudgets.validateResourceLoading(resourceAnalysis);
          } catch (error) {
            result.warnings.push(`Performance budget violation: ${error}`);
          }
        }
      }

      // Cleanup
      if (performanceCleanup) {
        await performanceCleanup();
      }

      result.success = true;
      await this.eventHandlers?.onComplete?.("authenticated-test-flow", result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      await this.eventHandlers?.onError?.(
        "authenticated-test-flow",
        error as Error,
      );
      throw error;
    } finally {
      result.totalDuration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Execute file upload test with performance monitoring
   */
  async executeFileUploadTest(options: {
    files: string | string[];
    uploadMethod: "input" | "dragDrop";
    selector: string;
    validation: {
      expectedFiles: number;
      fileListSelector?: string;
      successMessage?: string;
    };
    measurePerformance?: boolean;
  }): Promise<CompositeTestResult> {
    const startTime = Date.now();
    const result: CompositeTestResult = {
      metadata: { testName: "file-upload-test", ...this.config.metadata },
      success: false,
      totalDuration: 0,
      errors: [],
      warnings: [],
    };

    try {
      await this.eventHandlers?.onStart?.("file-upload-test", options);

      // Perform file upload
      const uploadResult = await this.fileUpload.testFileUploadFlow({
        uploadMethod: options.uploadMethod,
        selector: options.selector,
        files: options.files,
        validation: options.validation,
      });

      result.fileOperations = [
        {
          fileCount: uploadResult.uploadedFiles,
          totalSize: 0, // Would need to calculate from actual files
          duration: uploadResult.duration,
          success: true,
          filePaths: uploadResult.filePaths,
        },
      ];

      // Measure performance if requested
      if (options.measurePerformance) {
        const resourceAnalysis =
          await this.performance.analyzeResourceLoading();
        result.performance = [
          {
            operation: "file-upload",
            duration: uploadResult.duration,
            startTime: startTime,
            endTime: Date.now(),
            success: true,
            metrics: {
              totalResources: resourceAnalysis.totalResources,
              totalSize: resourceAnalysis.totalSize,
            },
          },
        ];
      }

      result.success = true;
      await this.eventHandlers?.onComplete?.("file-upload-test", result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      await this.eventHandlers?.onError?.("file-upload-test", error as Error);
    } finally {
      result.totalDuration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Execute comprehensive performance audit
   */
  async executePerformanceAudit(options: {
    pages: string[];
    budgets?: any;
    includeMemoryLeakDetection?: boolean;
    networkConditions?: "slow3G" | "fast3G" | "offline";
  }): Promise<CompositeTestResult> {
    const startTime = Date.now();
    const result: CompositeTestResult = {
      metadata: { testName: "performance-audit", ...this.config.metadata },
      success: false,
      totalDuration: 0,
      errors: [],
      warnings: [],
      performance: [],
    };

    try {
      await this.eventHandlers?.onStart?.("performance-audit", options);

      // Setup network conditions if specified
      let networkCleanup: (() => Promise<void>) | undefined;
      if (options.networkConditions) {
        networkCleanup = await this.network.simulateNetworkConditions(
          options.networkConditions,
        );
      }

      // Audit each page
      for (const pageUrl of options.pages) {
        const pageStart = Date.now();

        try {
          await this.page.goto(pageUrl);

          // Measure Web Vitals
          const webVitals = (await this.performance.measureWebVitals()) as any;

          // Analyze resources
          const resourceAnalysis =
            await this.performance.analyzeResourceLoading();

          // Check for memory leaks if requested
          let memoryLeakInfo: any;
          if (options.includeMemoryLeakDetection) {
            memoryLeakInfo = await this.performance.detectMemoryLeaks();
          }

          const pageDuration = Date.now() - pageStart;

          result.performance!.push({
            operation: `audit-${pageUrl}`,
            duration: pageDuration,
            startTime: pageStart,
            endTime: Date.now(),
            success: true,
            metrics: {
              lcp: webVitals.lcp || 0,
              fid: webVitals.fid || 0,
              cls: webVitals.cls || 0,
              totalResources: resourceAnalysis.totalResources,
              totalSize: resourceAnalysis.totalSize,
              memoryLeak: memoryLeakInfo?.hasLeak || false,
            },
          });

          // Validate against budgets if provided
          if (options.budgets) {
            const validator = new PerformanceBudgetValidator(options.budgets);
            try {
              validator.validateWebVitals({
                lcp: webVitals.lcp,
                fid: webVitals.fid,
                cls: webVitals.cls,
                fcp: webVitals.fcp,
              });
              validator.validateResourceLoading(resourceAnalysis);
              if (
                memoryLeakInfo &&
                memoryLeakInfo.growthPercentage !== undefined
              ) {
                validator.validateMemoryUsage({
                  hasLeak: memoryLeakInfo.hasLeak,
                  growthPercentage: memoryLeakInfo.growthPercentage,
                });
              }
            } catch (error) {
              result.warnings.push(`Budget violation on ${pageUrl}: ${error}`);
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to audit ${pageUrl}: ${errorMessage}`);

          result.performance!.push({
            operation: `audit-${pageUrl}`,
            duration: Date.now() - pageStart,
            startTime: pageStart,
            endTime: Date.now(),
            success: false,
            error: errorMessage,
          });
        }
      }

      // Cleanup network conditions
      if (networkCleanup) {
        await networkCleanup();
      }

      result.success = result.errors.length === 0;
      await this.eventHandlers?.onComplete?.("performance-audit", result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      await this.eventHandlers?.onError?.("performance-audit", error as Error);
    } finally {
      result.totalDuration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Cleanup all utilities and resources
   */
  async cleanup(): Promise<void> {
    await Promise.all(this.fixture.cleanup.map((fn) => fn()));
    this.fixture.cleanup.length = 0;
  }

  /**
   * Add cleanup function
   */
  addCleanup(fn: () => Promise<void>): void {
    this.fixture.cleanup.push(fn);
  }

  /**
   * Get shared test data
   */
  getTestData<T = any>(key: string): T | undefined {
    return this.fixture.testData?.[key];
  }

  /**
   * Set shared test data
   */
  setTestData(key: string, value: any): void {
    if (!this.fixture.testData) {
      this.fixture.testData = {};
    }
    this.fixture.testData[key] = value;
  }
}

/**
 * Factory function to create a utility suite
 */
export function createUtilitySuite(
  config: UtilityFactoryConfig,
): PlaywrightUtilitySuite {
  return new PlaywrightUtilitySuite(config);
}

/**
 * Factory function with common defaults
 */
export function createDefaultUtilitySuite(
  page: Page,
  metadata?: TestMetadata,
): PlaywrightUtilitySuite {
  return new PlaywrightUtilitySuite({
    page,
    metadata: metadata || { testName: "default-test" },
    enabledUtilities: {
      auth: true,
      performance: true,
      fileUpload: true,
      network: true,
      session: true,
    },
  });
}

/**
 * Factory function for performance-focused testing
 */
export function createPerformanceUtilitySuite(
  page: Page,
  metadata?: TestMetadata,
): PlaywrightUtilitySuite {
  return new PlaywrightUtilitySuite({
    page,
    metadata: metadata || { testName: "performance-test" },
    enabledUtilities: {
      auth: false,
      performance: true,
      fileUpload: false,
      network: true,
      session: false,
    },
    timeouts: {
      default: 30000,
      performance: 60000,
      network: 15000,
    },
  });
}
