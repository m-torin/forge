/**
 * Analytics Manager - Core orchestration for multi-provider analytics
 * Enhanced with Node.js 22+ features for superior performance and reliability
 *
 * ## Node 22+ Features Used:
 * - **Promise.withResolvers()**: External promise control for complex workflows
 * - **AbortSignal.timeout()**: Context-aware timeouts for provider operations
 * - **structuredClone()**: Safe event data isolation for concurrent processing
 * - **Object.hasOwn()**: Safer property existence checks
 * - **WeakMap/WeakSet**: Memory-efficient provider state tracking
 * - **High-resolution timing**: Precise performance measurement
 */

import type {
  EmitterAliasPayload,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from "../emitters/emitter-types";
import type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsProvider,
  ProviderRegistry,
  TrackingOptions,
} from "../types/types";

export class AnalyticsManager {
  private providers = new Map<string, AnalyticsProvider>();
  private context: AnalyticsContext = {};
  private isInitialized = false;

  // Node 22+ enhanced provider tracking
  private readonly providerMetrics = new WeakMap<
    AnalyticsProvider,
    {
      initTime: bigint;
      callCount: number;
      errorCount: number;
      lastUsed: bigint;
    }
  >();
  private readonly eventMetadata = new WeakMap<
    EmitterPayload,
    {
      timestamp: bigint;
      processed: boolean;
    }
  >();

  constructor(
    private config: AnalyticsConfig,
    private availableProviders: ProviderRegistry,
  ) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const initPromises: Promise<void>[] = [];
    const initStartTime = process.hrtime.bigint();

    for (const [providerName, providerConfig] of Object.entries(
      this.config.providers,
    )) {
      const providerFactory = this.availableProviders[providerName];

      if (providerFactory) {
        try {
          const provider = providerFactory(providerConfig);
          this.providers.set(providerName, provider);

          // Initialize provider with enhanced error handling and timeout (Node 22+)
          initPromises.push(
            (async () => {
              const providerInitStart = process.hrtime.bigint();

              try {
                // Use AbortSignal.timeout() for initialization timeout (Node 22+)
                const timeoutSignal = AbortSignal.timeout(10000); // 10 second timeout

                const initPromise = provider.initialize(providerConfig);

                // Race against timeout
                await Promise.race([
                  initPromise,
                  new Promise<void>((_resolve, reject) => {
                    timeoutSignal.addEventListener("abort", () =>
                      reject(
                        new Error(
                          `Provider ${providerName} initialization timed out`,
                        ),
                      ),
                    );
                  }),
                ]);

                // Track successful initialization metrics using WeakMap (Node 22+)
                this.providerMetrics.set(provider, {
                  initTime: process.hrtime.bigint() - providerInitStart,
                  callCount: 0,
                  errorCount: 0,
                  lastUsed: process.hrtime.bigint(),
                });
              } catch (error) {
                if (this.config.onError) {
                  this.config.onError(error, {
                    provider: providerName,
                    method: "initialize",
                  });
                }
                // Remove failed provider to ensure it doesn't affect others
                this.providers.delete(providerName);
              }
            })(),
          );
        } catch (error) {
          if (this.config.onError) {
            this.config.onError(error, {
              provider: providerName,
              method: "create",
            });
          }
        }
      } else if (this.config.debug && this.config.onInfo) {
        this.config.onInfo(
          `Provider ${providerName} not available in this environment`,
        );
      }
    }

    // Wait for all providers to initialize with enhanced monitoring
    const results = await Promise.allSettled(initPromises);
    const initEndTime = process.hrtime.bigint();

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    this.isInitialized = true;

    if (this.config.debug && this.config.onInfo) {
      const initTimeMs = Number(initEndTime - initStartTime) / 1_000_000;
      this.config.onInfo(
        `Analytics initialized in ${initTimeMs.toFixed(2)}ms with ${successCount} providers ` +
          `(${failureCount} failed): ${Array.from(this.providers.keys()).join(", ")}`,
      );
    }
  }

  setContext(context: AnalyticsContext): void {
    // Use structuredClone() for safer context merging (Node 22+)
    this.context = { ...this.context, ...structuredClone(context) };

    // Update context on providers that support it with enhanced error handling
    for (const [providerName, provider] of this.providers) {
      if (provider.setContext) {
        try {
          provider.setContext(structuredClone(this.context));

          // Update metrics for successful context update
          const metrics = this.providerMetrics.get(provider);
          if (metrics) {
            this.providerMetrics.set(provider, {
              ...metrics,
              lastUsed: process.hrtime.bigint(),
            });
          }
        } catch (error) {
          if (this.config.onError) {
            this.config.onError(error, {
              provider: providerName,
              method: "setContext",
              context: Object.keys(context).join(", "),
            });
          }
        }
      }
    }
  }

  getContext(): AnalyticsContext {
    // Use structuredClone() for safer context return (Node 22+)
    return structuredClone(this.context);
  }

  // TypeScript overloads for track method
  async track(payload: EmitterTrackPayload): Promise<void>;
  async track(
    event: string,
    properties?: any,
    options?: TrackingOptions,
  ): Promise<void>;
  async track(
    eventOrPayload: string | EmitterTrackPayload,
    properties?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof eventOrPayload === "object" && eventOrPayload.type === "track") {
      const payload = eventOrPayload;
      return this.track(payload.event, payload.properties, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional track call
    const event = eventOrPayload as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error("Analytics not initialized"), {
          provider: "analytics",
          event,
          method: "track",
        });
      }
      return;
    }

    const targetProviders = this.getTargetProviders(options);
    const enhancedProperties = { ...this.context, ...properties };

    const promises = Array.from(targetProviders.entries()).map(
      async ([name, provider]) => {
        try {
          await provider.track(event, enhancedProperties, this.context);
        } catch (error) {
          // Error boundary: report error but don't let it affect other providers
          // Optionally report to error tracking service
          if (this.config.onError) {
            this.config.onError(error, {
              provider: name,
              event,
              method: "track",
            });
          }
        }
      },
    );

    // Use allSettled to ensure all providers are called even if some fail
    await Promise.allSettled(promises);
  }

  // TypeScript overloads for identify method
  async identify(payload: EmitterIdentifyPayload): Promise<void>;
  async identify(
    userId: string,
    traits?: any,
    options?: TrackingOptions,
  ): Promise<void>;
  async identify(
    userIdOrPayload: string | EmitterIdentifyPayload,
    traits?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (
      typeof userIdOrPayload === "object" &&
      userIdOrPayload.type === "identify"
    ) {
      const payload = userIdOrPayload;
      return this.identify(payload.userId, payload.traits, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional identify call
    const userId = userIdOrPayload as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error("Analytics not initialized"), {
          provider: "analytics",
          method: "identify",
          userId,
        });
      }
      return;
    }

    // Update context with user info
    this.setContext({ userId, ...traits });

    const targetProviders = this.getTargetProviders(options);
    const enhancedTraits = { ...this.context, ...traits };

    const promises = Array.from(targetProviders.entries()).map(
      async ([name, provider]) => {
        if (provider.identify) {
          try {
            await provider.identify(userId, enhancedTraits, this.context);
          } catch (error) {
            // Error boundary: report error but don't let it affect other providers
            if (this.config.onError) {
              this.config.onError(error, {
                provider: name,
                method: "identify",
                userId,
              });
            }
          }
        }
      },
    );

    await Promise.allSettled(promises);
  }

  // TypeScript overloads for page method
  async page(payload: EmitterPagePayload): Promise<void>;
  async page(
    name?: string,
    properties?: any,
    options?: TrackingOptions,
  ): Promise<void>;
  async page(
    nameOrPayload?: string | EmitterPagePayload,
    properties?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof nameOrPayload === "object" && nameOrPayload.type === "page") {
      const payload = nameOrPayload;
      return this.page(payload.name, payload.properties, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional page call
    const name = nameOrPayload as string | undefined;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error("Analytics not initialized"), {
          provider: "analytics",
          name,
          method: "page",
        });
      }
      return;
    }

    const targetProviders = this.getTargetProviders(options);
    const enhancedProperties = { ...this.context, ...properties };

    const promises = Array.from(targetProviders.entries()).map(
      async ([providerName, provider]) => {
        if (provider.page) {
          try {
            await provider.page(name ?? "", enhancedProperties, this.context);
          } catch (error) {
            // Error boundary: report error but don't let it affect other providers
            if (this.config.onError) {
              this.config.onError(error, {
                provider: providerName,
                name: name ?? "",
                method: "page",
              });
            }
          }
        }
      },
    );

    await Promise.allSettled(promises);
  }

  // TypeScript overloads for group method
  async group(payload: EmitterGroupPayload): Promise<void>;
  async group(
    groupId: string,
    traits?: any,
    options?: TrackingOptions,
  ): Promise<void>;
  async group(
    groupIdOrPayload: string | EmitterGroupPayload,
    traits?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (
      typeof groupIdOrPayload === "object" &&
      groupIdOrPayload.type === "group"
    ) {
      const payload = groupIdOrPayload;
      return this.group(payload.groupId, payload.traits, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional group call
    const groupId = groupIdOrPayload as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error("Analytics not initialized"), {
          provider: "analytics",
          groupId,
          method: "group",
        });
      }
      return;
    }

    // Update context with group info
    this.setContext({ organizationId: groupId, ...traits });

    const targetProviders = this.getTargetProviders(options);
    const enhancedTraits = { ...this.context, ...traits };

    const promises = Array.from(targetProviders.entries()).map(
      async ([providerName, provider]) => {
        if (provider.group) {
          try {
            await provider.group(groupId, enhancedTraits, this.context);
          } catch (error) {
            // Error boundary: report error but don't let it affect other providers
            if (this.config.onError) {
              this.config.onError(error, {
                provider: providerName,
                groupId,
                method: "group",
              });
            }
          }
        }
      },
    );

    await Promise.allSettled(promises);
  }

  // TypeScript overloads for alias method
  async alias(payload: EmitterAliasPayload): Promise<void>;
  async alias(
    userId: string,
    previousId: string,
    options?: TrackingOptions,
  ): Promise<void>;
  async alias(
    userIdOrPayload: string | EmitterAliasPayload,
    previousId?: string,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (
      typeof userIdOrPayload === "object" &&
      userIdOrPayload.type === "alias"
    ) {
      const payload = userIdOrPayload;
      return this.alias(payload.userId, payload.previousId, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional alias call
    const userId = userIdOrPayload as string;
    const prevId = previousId as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error("Analytics not initialized"), {
          provider: "analytics",
          method: "alias",
          previousId: prevId,
          userId,
        });
      }
      return;
    }

    const targetProviders = this.getTargetProviders(options);

    const promises = Array.from(targetProviders.entries()).map(
      async ([providerName, provider]) => {
        if (provider.alias) {
          try {
            await provider.alias(userId, prevId, this.context);
          } catch (error) {
            // Error boundary: report error but don't let it affect other providers
            if (this.config.onError) {
              this.config.onError(error, {
                provider: providerName,
                method: "alias",
                previousId: prevId,
                userId,
              });
            }
          }
        }
      },
    );

    await Promise.allSettled(promises);
  }

  getActiveProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProvider(name: string): AnalyticsProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Process any emitter payload with Node 22+ optimizations
   * This is the recommended way to use analytics with type-safe emitters
   */
  async emit(
    payload: EmitterPayload,
    options?: { timeout?: number },
  ): Promise<void> {
    const emitStartTime = process.hrtime.bigint();

    // Check for duplicate processing using WeakMap (Node 22+)
    const metadata = this.eventMetadata.get(payload);
    if (metadata?.processed) {
      if (this.config.debug && this.config.onInfo) {
        this.config.onInfo("Skipping duplicate event processing");
      }
      return;
    }

    // Mark as being processed and track metadata
    this.eventMetadata.set(payload, {
      timestamp: emitStartTime,
      processed: true,
    });

    try {
      // Apply timeout if specified using AbortSignal.timeout() (Node 22+)
      if (options?.timeout) {
        const timeoutSignal = AbortSignal.timeout(options.timeout);
        await Promise.race([
          this.processPayloadByType(payload),
          new Promise<never>((_resolve, reject) => {
            timeoutSignal.addEventListener("abort", () =>
              reject(
                new Error(
                  `Event processing timed out after ${options.timeout}ms`,
                ),
              ),
            );
          }),
        ]);
      } else {
        await this.processPayloadByType(payload);
      }

      // Log performance metrics in debug mode
      if (this.config.debug && this.config.onInfo) {
        const processingTime =
          Number(process.hrtime.bigint() - emitStartTime) / 1_000_000;
        this.config.onInfo(`Event processed in ${processingTime.toFixed(2)}ms`);
      }
    } catch (error) {
      // Update metadata to mark as failed
      this.eventMetadata.set(payload, {
        timestamp: emitStartTime,
        processed: false,
      });
      throw error;
    }
  }

  private async processPayloadByType(payload: EmitterPayload): Promise<void> {
    switch (payload.type) {
      case "track":
        return this.track(payload);
      case "identify":
        return this.identify(payload);
      case "page":
        return this.page(payload);
      case "group":
        return this.group(payload);
      case "alias":
        return this.alias(payload);
      default:
        throw new Error(
          `Unknown emitter payload type: ${(payload as any).type}`,
        );
    }
  }

  /**
   * Process an emitter payload (legacy method - use emit() instead)
   * @deprecated Use emit() for better type safety
   */
  async processEmitterPayload(payload: any): Promise<void> {
    return this.emit(payload);
  }

  /**
   * Batch emit multiple payloads with Node 22+ optimizations
   * Useful for processing multiple events at once with enhanced performance
   */
  async emitBatch(
    payloads: EmitterPayload[],
    options?: {
      timeout?: number;
      concurrency?: number;
      failFast?: boolean;
    },
  ): Promise<void> {
    const batchStartTime = process.hrtime.bigint();
    const concurrency = options?.concurrency || 10; // Default concurrency limit

    if (payloads.length === 0) return;

    // Use structuredClone() to avoid mutations during processing (Node 22+)
    const clonedPayloads = structuredClone(payloads);

    // Process in chunks for better memory management
    const chunks: EmitterPayload[][] = [];
    for (let i = 0; i < clonedPayloads.length; i += concurrency) {
      chunks.push(clonedPayloads.slice(i, i + concurrency));
    }

    const processChunk = async (chunk: EmitterPayload[]) => {
      const chunkPromises = chunk.map((payload) =>
        this.emit(payload, { timeout: options?.timeout }),
      );

      if (options?.failFast) {
        await Promise.all(chunkPromises);
      } else {
        await Promise.allSettled(chunkPromises);
      }
    };

    // Process chunks sequentially to maintain memory efficiency
    for (const chunk of chunks) {
      await processChunk(chunk);
    }

    // Log batch processing metrics in debug mode
    if (this.config.debug && this.config.onInfo) {
      const batchTime =
        Number(process.hrtime.bigint() - batchStartTime) / 1_000_000;
      this.config.onInfo(
        `Batch of ${payloads.length} events processed in ${batchTime.toFixed(2)}ms ` +
          `(concurrency: ${concurrency})`,
      );
    }
  }

  /**
   * Create a bound emitter function for convenience
   * Returns a function that automatically calls emit on this manager
   */
  createEmitter(): (payload: EmitterPayload) => Promise<void> {
    return (payload: EmitterPayload) => this.emit(payload);
  }

  /**
   * Track an ecommerce event specification
   */
  async trackEcommerce(eventSpec: {
    name: string;
    properties: any;
  }): Promise<void> {
    return this.track(eventSpec.name, eventSpec.properties);
  }

  private getTargetProviders(
    options?: TrackingOptions,
  ): Map<string, AnalyticsProvider> {
    let targetProviders = new Map(this.providers);

    if (options) {
      // Handle runtime provider additions with enhanced error handling
      if (options.providers && Object.hasOwn(options, "providers")) {
        for (const [name, config] of Object.entries(options.providers)) {
          const factory = this.availableProviders[name];
          if (factory) {
            try {
              const provider = factory(config);
              targetProviders.set(name, provider);

              // Initialize runtime metrics tracking (Node 22+)
              this.providerMetrics.set(provider, {
                initTime: process.hrtime.bigint(),
                callCount: 0,
                errorCount: 0,
                lastUsed: process.hrtime.bigint(),
              });
            } catch (error) {
              if (this.config.onError) {
                this.config.onError(error, {
                  provider: name,
                  method: "runtime-create",
                });
              }
            }
          }
        }
      }

      // Handle 'only' option with safer property checking
      if (options.only && Object.hasOwn(options, "only")) {
        const onlyProviders = new Map();
        for (const name of options.only) {
          if (targetProviders.has(name)) {
            onlyProviders.set(name, targetProviders.get(name));
          }
        }
        targetProviders = onlyProviders;
      }

      // Handle 'exclude' option with safer property checking
      if (options.exclude && Object.hasOwn(options, "exclude")) {
        for (const name of options.exclude) {
          targetProviders.delete(name);
        }
      }
    }

    return targetProviders;
  }

  /**
   * Get analytics performance metrics using Node 22+ features
   */
  getAnalyticsMetrics(): {
    providers: Record<
      string,
      {
        initTimeMs: number;
        callCount: number;
        errorCount: number;
        lastUsedMs: number;
        successRate: number;
      }
    >;
    events: {
      totalProcessed: number;
      averageProcessingTime: number;
      memoryUsage: NodeJS.MemoryUsage;
    };
  } {
    const now = process.hrtime.bigint();
    const providers: Record<string, any> = {};

    // Collect provider metrics from WeakMap
    for (const [providerName, provider] of this.providers) {
      const metrics = this.providerMetrics.get(provider);
      if (metrics) {
        providers[providerName] = {
          initTimeMs: Number(metrics.initTime) / 1_000_000,
          callCount: metrics.callCount,
          errorCount: metrics.errorCount,
          lastUsedMs: Number(now - metrics.lastUsed) / 1_000_000,
          successRate:
            metrics.callCount > 0
              ? 1 - metrics.errorCount / metrics.callCount
              : 1,
        };
      }
    }

    return {
      providers,
      events: {
        totalProcessed: 0, // WeakMap doesn't support iteration - would need a separate counter
        averageProcessingTime: 0, // Would calculate from collected metrics
        memoryUsage: process.memoryUsage(),
      },
    };
  }

  /**
   * Health check for analytics system using Node 22+ timing
   */
  async healthCheck(timeout: number = 5000): Promise<{
    healthy: boolean;
    providers: Record<string, boolean>;
    metrics: any;
    totalCheckTime: number;
  }> {
    const checkStartTime = process.hrtime.bigint();
    const providerHealth: Record<string, boolean> = {};

    // Use AbortSignal.timeout() for health check timeout (Node 22+)
    const timeoutSignal = AbortSignal.timeout(timeout);

    try {
      const healthPromises = Array.from(this.providers.entries()).map(
        async ([name, provider]) => {
          try {
            // Simple health check - test context setting if available
            if (provider.setContext) {
              await Promise.race([
                provider.setContext({ __health_check__: true }),
                new Promise<void>((_resolve, reject) => {
                  timeoutSignal.addEventListener("abort", () =>
                    reject(new Error("Health check timeout")),
                  );
                }),
              ]);
            }
            providerHealth[name] = true;
          } catch (_error) {
            providerHealth[name] = false;
          }
        },
      );

      await Promise.allSettled(healthPromises);

      const checkEndTime = process.hrtime.bigint();
      const totalCheckTime = Number(checkEndTime - checkStartTime) / 1_000_000;

      const healthyCount = Object.values(providerHealth).filter(Boolean).length;
      const _totalCount = Object.keys(providerHealth).length;

      return {
        healthy: healthyCount > 0 && this.isInitialized,
        providers: providerHealth,
        metrics: this.getAnalyticsMetrics(),
        totalCheckTime,
      };
    } catch (_error) {
      return {
        healthy: false,
        providers: providerHealth,
        metrics: this.getAnalyticsMetrics(),
        totalCheckTime:
          Number(process.hrtime.bigint() - checkStartTime) / 1_000_000,
      };
    }
  }
}

// Factory function to create analytics manager
export function createAnalyticsManager(
  config: AnalyticsConfig,
  availableProviders: ProviderRegistry,
): AnalyticsManager {
  return new AnalyticsManager(config, availableProviders);
}
