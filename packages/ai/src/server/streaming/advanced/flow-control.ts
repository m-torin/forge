/**
 * Advanced Flow Control for Streaming
 * Intelligent flow control with adaptive throttling and congestion management
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import type { BackpressureController } from './backpressure';
import type { BufferOptimizationEngine } from './buffer-optimization';

/**
 * Flow control configuration
 */
export interface FlowControlConfig {
  /** Enable adaptive flow control */
  adaptive?: boolean;
  /** Initial rate limit (items per second) */
  initialRateLimit?: number;
  /** Maximum rate limit */
  maxRateLimit?: number;
  /** Minimum rate limit */
  minRateLimit?: number;
  /** Rate adjustment factor (0-1) */
  adjustmentFactor?: number;
  /** Congestion detection settings */
  congestionDetection?: {
    /** Enable congestion detection */
    enabled?: boolean;
    /** Latency threshold for congestion (ms) */
    latencyThreshold?: number;
    /** Buffer utilization threshold (0-1) */
    bufferThreshold?: number;
    /** Error rate threshold (0-1) */
    errorRateThreshold?: number;
  };
  /** Traffic shaping settings */
  trafficShaping?: {
    /** Enable traffic shaping */
    enabled?: boolean;
    /** Burst size allowed */
    burstSize?: number;
    /** Burst duration (ms) */
    burstDuration?: number;
    /** Recovery time after burst (ms) */
    recoveryTime?: number;
  };
  /** Quality of Service settings */
  qos?: {
    /** Enable QoS */
    enabled?: boolean;
    /** Priority levels */
    priorityLevels?: number;
    /** High priority rate allocation (0-1) */
    highPriorityAllocation?: number;
  };
}

/**
 * Flow control metrics
 */
export interface FlowControlMetrics {
  /** Current rate limit (items/second) */
  currentRateLimit: number;
  /** Actual throughput (items/second) */
  actualThroughput: number;
  /** Rate utilization (0-1) */
  rateUtilization: number;
  /** Congestion level (0-1) */
  congestionLevel: number;
  /** Items in flight */
  itemsInFlight: number;
  /** Total items processed */
  totalProcessed: number;
  /** Total items dropped */
  totalDropped: number;
  /** Average processing latency (ms) */
  averageLatency: number;
  /** Error rate (0-1) */
  errorRate: number;
  /** Flow control efficiency (0-100) */
  efficiency: number;
}

/**
 * Traffic priority levels
 */
export enum TrafficPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Flow control token bucket for rate limiting
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume tokens
   */
  consume(tokensRequested = 1): boolean {
    this.refill();

    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const timeSinceRefill = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = timeSinceRefill * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Update refill rate
   */
  updateRefillRate(newRate: number): void {
    this.refill(); // Ensure current state is up to date
    this.refillRate = newRate;
  }

  /**
   * Get current token count
   */
  getTokenCount(): number {
    this.refill();
    return this.tokens;
  }
}

/**
 * Advanced flow control manager
 */
export class AdvancedFlowController<T> {
  private config: Required<
    FlowControlConfig & {
      congestionDetection: Required<FlowControlConfig['congestionDetection']>;
      trafficShaping: Required<FlowControlConfig['trafficShaping']>;
      qos: Required<FlowControlConfig['qos']>;
    }
  >;

  private tokenBucket: TokenBucket;
  private congestionWindow = 1.0; // Congestion control multiplier
  private metrics: FlowControlMetrics;
  private processingTimes: number[] = [];
  private errorCount = 0;
  private processedCount = 0;
  private droppedCount = 0;
  private itemsInFlight = 0;
  private startTime = Date.now();

  // Traffic shaping state
  private burstTokens = 0;
  private lastBurstTime = 0;
  private inRecovery = false;

  // QoS queues
  private priorityQueues: Map<
    TrafficPriority,
    Array<{
      item: T;
      priority: TrafficPriority;
      timestamp: number;
      resolve: (value: boolean) => void;
      reject: (error: Error) => void;
    }>
  > = new Map();

  constructor(
    config: FlowControlConfig = {},
    private backpressureController?: BackpressureController<T>,
    private bufferOptimizer?: BufferOptimizationEngine<T>,
  ) {
    this.config = {
      adaptive: config.adaptive ?? true,
      initialRateLimit: config.initialRateLimit || 100,
      maxRateLimit: config.maxRateLimit || 1000,
      minRateLimit: config.minRateLimit || 10,
      adjustmentFactor: config.adjustmentFactor || 0.1,
      congestionDetection: {
        enabled: config.congestionDetection?.enabled ?? true,
        latencyThreshold: config.congestionDetection?.latencyThreshold || 200,
        bufferThreshold: config.congestionDetection?.bufferThreshold || 0.8,
        errorRateThreshold: config.congestionDetection?.errorRateThreshold || 0.05,
      },
      trafficShaping: {
        enabled: config.trafficShaping?.enabled ?? true,
        burstSize: config.trafficShaping?.burstSize || 50,
        burstDuration: config.trafficShaping?.burstDuration || 1000,
        recoveryTime: config.trafficShaping?.recoveryTime || 2000,
      },
      qos: {
        enabled: config.qos?.enabled ?? true,
        priorityLevels: config.qos?.priorityLevels || 4,
        highPriorityAllocation: config.qos?.highPriorityAllocation || 0.3,
      },
    };

    this.tokenBucket = new TokenBucket(this.config.initialRateLimit, this.config.initialRateLimit);

    this.metrics = {
      currentRateLimit: this.config.initialRateLimit,
      actualThroughput: 0,
      rateUtilization: 0,
      congestionLevel: 0,
      itemsInFlight: 0,
      totalProcessed: 0,
      totalDropped: 0,
      averageLatency: 0,
      errorRate: 0,
      efficiency: 100,
    };

    // Initialize priority queues
    for (let i = 0; i < (this.config.qos?.priorityLevels || 3); i++) {
      this.priorityQueues.set(i as TrafficPriority, []);
    }

    // Reset burst tokens
    this.burstTokens = this.config.trafficShaping?.burstSize || 0;

    this.startMetricsCollection();
  }

  /**
   * Request permission to process an item
   */
  async requestPermission(
    item: T,
    priority: TrafficPriority = TrafficPriority.NORMAL,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if we're in QoS mode
      if (this.config.qos?.enabled) {
        this.priorityQueues.get(priority)?.push({
          item,
          priority,
          timestamp: Date.now(),
          resolve,
          reject,
        });

        this.processQueuedItems();
      } else {
        // Direct processing
        const permitted = this.checkPermission(priority);
        resolve(permitted);
      }
    });
  }

  /**
   * Check if item can be processed immediately
   */
  private checkPermission(priority: TrafficPriority): boolean {
    // Check congestion level
    if (this.metrics.congestionLevel > 0.9) {
      // Only allow critical priority during high congestion
      if (priority < TrafficPriority.CRITICAL) {
        this.droppedCount++;
        logWarn('Flow Control: Item dropped due to high congestion', {
          operation: 'flow_control_congestion_drop',
          metadata: {
            priority,
            congestionLevel: this.metrics.congestionLevel,
          },
        });
        return false;
      }
    }

    // Check token bucket
    const tokensNeeded = this.getTokensNeeded(priority);
    if (!this.tokenBucket.consume(tokensNeeded)) {
      // Try burst tokens for high priority
      if (priority >= TrafficPriority.HIGH && this.canUseBurstTokens()) {
        this.useBurstTokens(tokensNeeded);
        return true;
      }

      this.droppedCount++;
      return false;
    }

    return true;
  }

  /**
   * Record item processing start
   */
  recordProcessingStart(): void {
    this.itemsInFlight++;
  }

  /**
   * Record item processing completion
   */
  recordProcessingComplete(processingTime: number, success: boolean): void {
    this.itemsInFlight = Math.max(0, this.itemsInFlight - 1);
    this.processedCount++;

    if (!success) {
      this.errorCount++;
    }

    this.processingTimes.push(processingTime);

    // Keep only recent processing times
    if (this.processingTimes.length > 100) {
      this.processingTimes = this.processingTimes.slice(-100);
    }

    // Update metrics
    this.updateMetrics();

    // Adaptive rate adjustment
    if (this.config.adaptive) {
      this.adjustRateLimit();
    }
  }

  /**
   * Get current flow control metrics
   */
  getMetrics(): FlowControlMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Process queued items with QoS
   */
  private processQueuedItems(): void {
    if (!this.config.qos?.enabled) return;

    // Process items from highest to lowest priority
    for (let priority = this.config.qos?.priorityLevels || 3 - 1; priority >= 0; priority--) {
      const queue = this.priorityQueues.get(priority as TrafficPriority);
      if (!queue || queue.length === 0) continue;

      // Determine how many items from this priority level to process
      const allocation = this.getPriorityAllocation(priority as TrafficPriority);
      const maxToProcess = Math.max(1, Math.floor(allocation * 10)); // Process up to 10x allocation

      let processed = 0;
      while (queue.length > 0 && processed < maxToProcess) {
        const queuedItem = queue.shift()!;
        const permitted = this.checkPermission(queuedItem.priority);

        queuedItem.resolve(permitted);
        processed++;

        if (!permitted) {
          // If we can't process this priority level, stop processing lower priorities
          return;
        }
      }
    }
  }

  /**
   * Get priority allocation for QoS
   */
  private getPriorityAllocation(priority: TrafficPriority): number {
    switch (priority) {
      case TrafficPriority.CRITICAL:
        return 0.4;
      case TrafficPriority.HIGH:
        return this.config.qos?.highPriorityAllocation || 0.6;
      case TrafficPriority.NORMAL:
        return 0.2;
      case TrafficPriority.LOW:
        return 0.1;
      default:
        return 0.1;
    }
  }

  /**
   * Get tokens needed based on priority
   */
  private getTokensNeeded(priority: TrafficPriority): number {
    switch (priority) {
      case TrafficPriority.CRITICAL:
        return 1; // Critical items always use 1 token
      case TrafficPriority.HIGH:
        return 1;
      case TrafficPriority.NORMAL:
        return 1;
      case TrafficPriority.LOW:
        return 2; // Low priority items use more tokens
      default:
        return 1;
    }
  }

  /**
   * Check if burst tokens can be used
   */
  private canUseBurstTokens(): boolean {
    if (!this.config.trafficShaping?.enabled) return false;
    if (this.inRecovery) return false;

    const now = Date.now();

    // Reset burst tokens if burst duration has passed
    if (now - this.lastBurstTime > this.config.trafficShaping.burstDuration) {
      this.burstTokens = this.config.trafficShaping?.burstSize || 0;
      this.inRecovery = false;
    }

    return this.burstTokens > 0;
  }

  /**
   * Use burst tokens
   */
  private useBurstTokens(count: number): void {
    this.burstTokens = Math.max(0, this.burstTokens - count);
    this.lastBurstTime = Date.now();

    // Enter recovery mode if burst tokens are exhausted
    if (this.burstTokens === 0) {
      this.inRecovery = true;
      setTimeout(() => {
        this.inRecovery = false;
      }, this.config.trafficShaping?.recoveryTime || 5000);
    }
  }

  /**
   * Update flow control metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    const totalTime = (now - this.startTime) / 1000; // seconds

    // Calculate throughput
    this.metrics.actualThroughput = totalTime > 0 ? this.processedCount / totalTime : 0;

    // Calculate rate utilization
    this.metrics.rateUtilization =
      this.metrics.currentRateLimit > 0
        ? this.metrics.actualThroughput / this.metrics.currentRateLimit
        : 0;

    // Calculate average latency
    if (this.processingTimes.length > 0) {
      this.metrics.averageLatency =
        this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
    }

    // Calculate error rate
    this.metrics.errorRate = this.processedCount > 0 ? this.errorCount / this.processedCount : 0;

    // Update congestion level
    this.updateCongestionLevel();

    // Update efficiency
    this.metrics.efficiency = this.calculateEfficiency();

    // Update counters
    this.metrics.itemsInFlight = this.itemsInFlight;
    this.metrics.totalProcessed = this.processedCount;
    this.metrics.totalDropped = this.droppedCount;
    this.metrics.currentRateLimit = this.tokenBucket.getTokenCount();
  }

  /**
   * Update congestion level based on multiple factors
   */
  private updateCongestionLevel(): void {
    let congestionFactors = 0;
    let totalWeight = 0;

    if (this.config.congestionDetection?.enabled) {
      // Latency-based congestion
      if (this.metrics.averageLatency > this.config.congestionDetection?.latencyThreshold || 100) {
        const latencyFactor = Math.min(
          1,
          (this.metrics.averageLatency - this.config.congestionDetection?.latencyThreshold || 100) /
            this.config.congestionDetection?.latencyThreshold || 100,
        );
        congestionFactors += latencyFactor * 0.4; // 40% weight
        totalWeight += 0.4;
      }

      // Error rate-based congestion
      if (this.metrics.errorRate > this.config.congestionDetection.errorRateThreshold) {
        const errorFactor = Math.min(
          1,
          this.metrics.errorRate / this.config.congestionDetection.errorRateThreshold,
        );
        congestionFactors += errorFactor * 0.3; // 30% weight
        totalWeight += 0.3;
      }

      // Buffer utilization (if available)
      if (this.backpressureController) {
        // Would get actual buffer utilization
        const bufferUtilization = 0.5; // Placeholder
        if (bufferUtilization > this.config.congestionDetection.bufferThreshold) {
          const bufferFactor =
            (bufferUtilization - this.config.congestionDetection.bufferThreshold) /
            (1 - this.config.congestionDetection.bufferThreshold);
          congestionFactors += bufferFactor * 0.3; // 30% weight
          totalWeight += 0.3;
        }
      }
    }

    this.metrics.congestionLevel = totalWeight > 0 ? congestionFactors / totalWeight : 0;
  }

  /**
   * Calculate flow control efficiency
   */
  private calculateEfficiency(): number {
    let efficiency = 100;

    // Penalize for high congestion
    efficiency -= this.metrics.congestionLevel * 30;

    // Penalize for low utilization
    if (this.metrics.rateUtilization < 0.5) {
      efficiency -= (0.5 - this.metrics.rateUtilization) * 40;
    }

    // Penalize for high error rate
    efficiency -= this.metrics.errorRate * 100;

    // Penalize for dropped items
    if (this.processedCount + this.droppedCount > 0) {
      const dropRate = this.droppedCount / (this.processedCount + this.droppedCount);
      efficiency -= dropRate * 50;
    }

    return Math.max(0, Math.min(100, efficiency));
  }

  /**
   * Adjust rate limit based on performance
   */
  private adjustRateLimit(): void {
    const currentRate = this.metrics.currentRateLimit;
    let adjustment = 0;

    // Increase rate if performing well
    if (
      this.metrics.congestionLevel < 0.3 &&
      this.metrics.errorRate < 0.01 &&
      this.metrics.rateUtilization > 0.8
    ) {
      adjustment = currentRate * this.config.adjustmentFactor;
    }
    // Decrease rate if congested
    else if (this.metrics.congestionLevel > 0.7 || this.metrics.errorRate > 0.05) {
      adjustment = -currentRate * this.config.adjustmentFactor;
    }

    if (adjustment !== 0) {
      const newRate = Math.max(
        this.config.minRateLimit,
        Math.min(this.config.maxRateLimit, currentRate + adjustment),
      );

      if (newRate !== currentRate) {
        this.tokenBucket.updateRefillRate(newRate);
        this.congestionWindow = newRate / this.config.initialRateLimit;

        logInfo('Flow Control: Rate limit adjusted', {
          operation: 'flow_control_rate_adjustment',
          metadata: {
            oldRate: currentRate,
            newRate,
            congestionLevel: this.metrics.congestionLevel,
            efficiency: this.metrics.efficiency,
          },
        });
      }
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
      this.processQueuedItems();

      // Log periodic metrics
      logInfo('Flow Control: Metrics update', {
        operation: 'flow_control_metrics',
        metadata: {
          throughput: this.metrics.actualThroughput,
          utilization: this.metrics.rateUtilization,
          congestion: this.metrics.congestionLevel,
          efficiency: this.metrics.efficiency,
        },
      });
    }, 5000); // Every 5 seconds
  }

  /**
   * Get flow control recommendations
   */
  getRecommendations(): Array<{
    type: 'rate_adjustment' | 'congestion_control' | 'qos_tuning' | 'traffic_shaping';
    description: string;
    priority: 'high' | 'medium' | 'low';
    implementation: string;
  }> {
    const recommendations: Array<{
      type: 'rate_adjustment' | 'congestion_control' | 'qos_tuning' | 'traffic_shaping';
      description: string;
      priority: 'high' | 'medium' | 'low';
      implementation: string;
    }> = [];

    // Rate adjustment recommendations
    if (this.metrics.rateUtilization < 0.3) {
      recommendations.push({
        type: 'rate_adjustment',
        description: 'Low rate utilization - consider reducing rate limit',
        priority: 'medium',
        implementation: 'Reduce initial rate limit or adjust adaptive factors',
      });
    } else if (this.metrics.rateUtilization > 0.9 && this.metrics.congestionLevel < 0.3) {
      recommendations.push({
        type: 'rate_adjustment',
        description: 'High utilization with low congestion - increase rate limit',
        priority: 'medium',
        implementation: 'Increase max rate limit or adjustment factor',
      });
    }

    // Congestion control recommendations
    if (this.metrics.congestionLevel > 0.8) {
      recommendations.push({
        type: 'congestion_control',
        description: 'High congestion detected - implement aggressive throttling',
        priority: 'high',
        implementation: 'Reduce rate limits and enable traffic shaping',
      });
    }

    // QoS recommendations
    if (this.config.qos?.enabled && this.droppedCount > this.processedCount * 0.1) {
      recommendations.push({
        type: 'qos_tuning',
        description: 'High drop rate - adjust QoS priority allocations',
        priority: 'high',
        implementation: 'Increase high priority allocation or adjust queue sizes',
      });
    }

    // Traffic shaping recommendations
    if (this.config.trafficShaping?.enabled && this.burstTokens === 0) {
      recommendations.push({
        type: 'traffic_shaping',
        description: 'Burst capacity exhausted - adjust burst parameters',
        priority: 'medium',
        implementation: 'Increase burst size or reduce recovery time',
      });
    }

    return recommendations;
  }

  /**
   * Reset flow control state
   */
  reset(): void {
    this.tokenBucket = new TokenBucket(this.config.initialRateLimit, this.config.initialRateLimit);

    this.congestionWindow = 1.0;
    this.processingTimes = [];
    this.errorCount = 0;
    this.processedCount = 0;
    this.droppedCount = 0;
    this.itemsInFlight = 0;
    this.startTime = Date.now();
    this.burstTokens = this.config.trafficShaping?.burstSize || 0;
    this.inRecovery = false;

    // Clear priority queues
    this.priorityQueues.forEach(queue => (queue.length = 0));

    logInfo('Flow Control: State reset', {
      operation: 'flow_control_reset',
    });
  }

  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    // Clear any pending promises in queues
    this.priorityQueues.forEach(queue => {
      queue.forEach(item => {
        item.reject(new Error('Flow controller destroyed'));
      });
    });

    logInfo('Flow Control: Destroyed', {
      operation: 'flow_control_destroy',
      metadata: {
        finalEfficiency: this.metrics.efficiency,
        totalProcessed: this.processedCount,
      },
    });
  }
}

/**
 * Flow control utilities
 */
export const flowControlUtils = {
  /**
   * Create flow control configuration for specific scenarios
   */
  createConfig: (
    scenario: 'high_throughput' | 'low_latency' | 'balanced' | 'conservative',
  ): FlowControlConfig => {
    const configs: Record<string, FlowControlConfig> = {
      high_throughput: {
        adaptive: true,
        initialRateLimit: 500,
        maxRateLimit: 2000,
        adjustmentFactor: 0.2,
        congestionDetection: {
          enabled: true,
          latencyThreshold: 300,
          bufferThreshold: 0.9,
        },
        trafficShaping: {
          enabled: true,
          burstSize: 100,
          burstDuration: 2000,
        },
        qos: {
          enabled: true,
          highPriorityAllocation: 0.4,
        },
      },
      low_latency: {
        adaptive: true,
        initialRateLimit: 200,
        maxRateLimit: 800,
        adjustmentFactor: 0.05,
        congestionDetection: {
          enabled: true,
          latencyThreshold: 50,
          bufferThreshold: 0.6,
        },
        trafficShaping: {
          enabled: true,
          burstSize: 20,
          burstDuration: 500,
        },
      },
      balanced: {
        adaptive: true,
        initialRateLimit: 100,
        maxRateLimit: 1000,
        adjustmentFactor: 0.1,
        congestionDetection: {
          enabled: true,
          latencyThreshold: 200,
          bufferThreshold: 0.8,
        },
        trafficShaping: {
          enabled: true,
          burstSize: 50,
        },
        qos: {
          enabled: true,
        },
      },
      conservative: {
        adaptive: true,
        initialRateLimit: 50,
        maxRateLimit: 200,
        adjustmentFactor: 0.05,
        congestionDetection: {
          enabled: true,
          latencyThreshold: 100,
          bufferThreshold: 0.7,
        },
      },
    };

    return configs[scenario];
  },

  /**
   * Calculate optimal rate limit based on system metrics
   */
  calculateOptimalRate: (
    averageLatency: number,
    targetLatency: number,
    currentThroughput: number,
    errorRate: number,
  ): number => {
    let optimalRate = currentThroughput;

    // Adjust based on latency
    if (averageLatency > targetLatency) {
      const latencyFactor = targetLatency / averageLatency;
      optimalRate *= latencyFactor;
    }

    // Adjust based on error rate
    if (errorRate > 0.01) {
      const errorFactor = Math.max(0.5, 1 - errorRate * 10);
      optimalRate *= errorFactor;
    }

    return Math.max(10, Math.floor(optimalRate));
  },
};
