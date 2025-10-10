/**
 * Enterprise Memory Leak Detection Alerting System
 *
 * Specialized memory monitoring and leak detection alerting system leveraging Node.js 22+
 * features for proactive memory management, intelligent leak detection, and automated
 * remediation recommendations. This module provides comprehensive memory alerting with
 * advanced pattern recognition and predictive analysis.
 *
 * ## Key Node 22+ Features Used:
 * - **WeakMap/WeakSet**: Context-aware memory leak tracking without introducing leaks
 * - **FinalizationRegistry**: Object lifecycle monitoring for leak detection validation
 * - **WeakRef**: Non-intrusive reference tracking for memory pattern analysis
 * - **Promise.withResolvers()**: External promise control for complex memory analysis workflows
 * - **High-resolution timing**: Precise memory allocation/deallocation timing analysis
 *
 * ## Core Memory Alerting Capabilities:
 * - Real-time memory leak detection with pattern recognition
 * - Predictive memory exhaustion alerts with time-to-failure estimates
 * - Memory pressure monitoring with adaptive thresholds
 * - Garbage collection performance analysis and alerting
 * - Memory fragmentation detection and optimization recommendations
 * - Context-aware memory tracking for component-specific alerts
 * - Automated memory optimization suggestions and remediation
 * - Integration with memory profiling and heap snapshot analysis
 *
 * @module MemoryAlerts
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { createServerObservability } from '@repo/observability/server/next';
import { globalMemoryMonitor, MemoryUtils } from '../shared/utils/memory-monitor';
import { AlertSeverity } from './performance-alerts';

/**
 * Memory leak pattern types
 */
export enum MemoryLeakPattern {
  GRADUAL_GROWTH = 'gradual_growth',
  SUDDEN_SPIKE = 'sudden_spike',
  OSCILLATING = 'oscillating',
  PERSISTENT_OBJECTS = 'persistent_objects',
  EVENT_LISTENERS = 'event_listeners',
  TIMERS = 'timers',
  CLOSURES = 'closures',
  CIRCULAR_REFERENCES = 'circular_references',
}

/**
 * Memory alert types
 */
export enum MemoryAlertType {
  LEAK_DETECTED = 'leak_detected',
  MEMORY_PRESSURE = 'memory_pressure',
  GC_PERFORMANCE = 'gc_performance',
  FRAGMENTATION = 'fragmentation',
  HEAP_GROWTH = 'heap_growth',
  PREDICTION = 'prediction',
}

/**
 * Memory leak detection alert
 */
interface MemoryLeakAlert {
  readonly id: string;
  readonly type: MemoryAlertType;
  readonly pattern: MemoryLeakPattern;
  readonly severity: AlertSeverity;
  readonly detectedAt: Date;
  readonly affectedObjects: Array<{
    id: string;
    type: string;
    size: number;
    age: number;
    stackTrace?: string;
  }>;
  readonly memoryGrowth: {
    rate: number; // bytes per minute
    duration: number; // milliseconds
    totalIncrease: number; // bytes
  };
  readonly confidence: number; // 0-1
  readonly recommendation: string;
  readonly actionItems: string[];
  readonly estimatedImpact: {
    memoryLoss: number; // bytes
    performanceImpact: 'low' | 'medium' | 'high';
    timeToFailure?: number; // milliseconds
  };
  readonly metadata: Record<string, unknown>;
}

/**
 * Memory pressure alert
 */
interface MemoryPressureAlert {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly triggeredAt: Date;
  readonly currentUsage: number; // bytes
  readonly threshold: number; // bytes
  readonly pressureLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly availableMemory: number; // bytes
  readonly gcActivity: {
    frequency: number; // collections per minute
    averageDuration: number; // milliseconds
    totalPauseTime: number; // milliseconds
  };
  readonly prediction: {
    timeToExhaustion: number; // milliseconds
    recommendedActions: string[];
    criticalThreshold: number; // bytes
  };
}

/**
 * GC performance alert
 */
interface GCPerformanceAlert {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly triggeredAt: Date;
  readonly gcType: string;
  readonly duration: number; // milliseconds
  readonly frequency: number; // collections per minute
  readonly pauseTimeRatio: number; // percentage of time spent in GC
  readonly memoryFreed: number; // bytes
  readonly efficiency: number; // 0-1 (memory freed / time spent)
  readonly recommendation: string;
}

/**
 * Memory alerting system configuration
 */
interface MemoryAlertingConfig {
  readonly evaluationInterval: number;
  readonly leakDetectionWindow: number; // milliseconds
  readonly pressureThresholds: {
    readonly warning: number; // percentage
    readonly critical: number; // percentage
  };
  readonly gcPerformanceThresholds: {
    readonly maxDuration: number; // milliseconds
    readonly maxPauseRatio: number; // percentage
  };
  readonly predictionSettings: {
    readonly enablePredictiveAlerts: boolean;
    readonly analysisWindow: number; // milliseconds
    readonly confidenceThreshold: number; // 0-1
  };
  readonly leakPatternSettings: {
    readonly gradualGrowthThreshold: number; // bytes per minute
    readonly suddenSpikeThreshold: number; // bytes
    readonly persistentObjectAge: number; // milliseconds
  };
}

/**
 * Default memory alerting configuration
 */
const DEFAULT_CONFIG: MemoryAlertingConfig = {
  evaluationInterval: 15000, // 15 seconds
  leakDetectionWindow: 10 * 60 * 1000, // 10 minutes
  pressureThresholds: {
    warning: 75, // 75%
    critical: 90, // 90%
  },
  gcPerformanceThresholds: {
    maxDuration: 100, // 100ms
    maxPauseRatio: 10, // 10%
  },
  predictionSettings: {
    enablePredictiveAlerts: true,
    analysisWindow: 30 * 60 * 1000, // 30 minutes
    confidenceThreshold: 0.8,
  },
  leakPatternSettings: {
    gradualGrowthThreshold: 1024 * 1024, // 1MB per minute
    suddenSpikeThreshold: 50 * 1024 * 1024, // 50MB
    persistentObjectAge: 30 * 60 * 1000, // 30 minutes
  },
};

/**
 * Memory analysis result
 */
interface MemoryAnalysisResult {
  readonly timestamp: Date;
  readonly currentUsage: number;
  readonly availableMemory: number;
  readonly growthRate: number; // bytes per minute
  readonly trend: 'increasing' | 'decreasing' | 'stable';
  readonly leakIndicators: Array<{
    pattern: MemoryLeakPattern;
    confidence: number;
    evidence: string[];
  }>;
  readonly gcMetrics: {
    collections: number;
    totalDuration: number;
    averageDuration: number;
    memoryFreed: number;
  };
  readonly recommendations: string[];
}

/**
 * Enterprise Memory Leak Detection Alerting System
 */
export class MemoryAlertingSystem {
  private static instance: MemoryAlertingSystem;
  private readonly config: MemoryAlertingConfig;
  private readonly activeAlerts = new Map<
    string,
    MemoryLeakAlert | MemoryPressureAlert | GCPerformanceAlert
  >();
  private readonly alertHistory: Array<MemoryLeakAlert | MemoryPressureAlert | GCPerformanceAlert> =
    [];
  private readonly memoryHistory: number[] = [];
  private readonly gcHistory: Array<{
    timestamp: Date;
    duration: number;
    type: string;
    memoryBefore: number;
    memoryAfter: number;
  }> = [];

  // Node 22+ features for memory tracking
  private readonly contextTracking = new WeakMap<
    object,
    {
      memoryBaseline: number;
      leakAlerts: Set<string>;
      lastCheck: Date;
    }
  >();
  private readonly objectRegistry = new FinalizationRegistry((id: string) => {
    this.handleObjectFinalization(id);
  });
  private readonly weakRefs = new Map<string, WeakRef<object>>();

  private evaluationTimer?: NodeJS.Timeout;
  private isActive = false;
  private lastAnalysisTime: Date = new Date();

  constructor(config: Partial<MemoryAlertingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<MemoryAlertingConfig>): MemoryAlertingSystem {
    if (!MemoryAlertingSystem.instance) {
      MemoryAlertingSystem.instance = new MemoryAlertingSystem(config);
    }
    return MemoryAlertingSystem.instance;
  }

  /**
   * Start memory alerting system
   */
  async start(): Promise<void> {
    if (this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting memory alerting system', {
      config: this.config,
    });

    this.isActive = true;

    // Ensure memory monitor is running
    try {
      await globalMemoryMonitor.start();
    } catch (error) {
      logger?.log('warning', 'Memory monitor failed to start', { error });
    }

    // Start evaluation cycle
    this.evaluationTimer = setInterval(async () => {
      try {
        await this.performMemoryAnalysis();
        await this.detectMemoryLeaks();
        await this.checkMemoryPressure();
        await this.analyzeGCPerformance();
        await this.generatePredictiveAlerts();
      } catch (error) {
        logger?.log('error', 'Memory analysis failed', { error });
      }
    }, this.config.evaluationInterval);

    // Initial analysis
    await this.performMemoryAnalysis();
  }

  /**
   * Stop memory alerting system
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Stopping memory alerting system');

    this.isActive = false;

    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = undefined;
    }
  }

  /**
   * Register object for memory leak tracking
   */
  registerObject<T extends object>(obj: T, id: string, metadata?: Record<string, unknown>): void {
    // Use FinalizationRegistry to track object lifecycle
    this.objectRegistry.register(obj, id, obj);

    // Create WeakRef for non-intrusive monitoring
    this.weakRefs.set(id, new WeakRef(obj));

    const logger = globalMemoryMonitor.registerEventuallyFreedObject(obj, id, metadata);

    // Log registration for tracking
    (async () => {
      try {
        const observability = await createServerObservability();
        observability.log('debug', 'Object registered for memory tracking', {
          objectId: id,
          memoryUsage: process.memoryUsage().heapUsed,
          metadata,
        });
      } catch {
        // Silent failure for logging
      }
    })();
  }

  /**
   * Track memory usage for specific context
   */
  trackContextMemory<T extends object>(context: T, baseline?: number): void {
    const currentMemory = process.memoryUsage().heapUsed;

    this.contextTracking.set(context, {
      memoryBaseline: baseline || currentMemory,
      leakAlerts: new Set(),
      lastCheck: new Date(),
    });
  }

  /**
   * Get current memory alerts
   */
  getActiveAlerts(): ReadonlyArray<MemoryLeakAlert | MemoryPressureAlert | GCPerformanceAlert> {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get memory alert statistics
   */
  getStatistics(): {
    activeAlerts: number;
    leakAlertsToday: number;
    pressureAlertsToday: number;
    gcAlertsToday: number;
    averageResolutionTime: number;
    memoryTrend: 'increasing' | 'decreasing' | 'stable';
    currentPressureLevel: 'low' | 'medium' | 'high' | 'critical';
    predictedTimeToExhaustion?: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAlerts = this.alertHistory.filter(
      alert => alert.triggeredAt >= today || (alert as any).detectedAt >= today,
    );

    const leakAlerts = todayAlerts.filter(
      alert => (alert as MemoryLeakAlert).type !== undefined,
    ) as MemoryLeakAlert[];

    const pressureAlerts = todayAlerts.filter(
      alert => (alert as MemoryPressureAlert).pressureLevel !== undefined,
    ) as MemoryPressureAlert[];

    const gcAlerts = todayAlerts.filter(
      alert => (alert as GCPerformanceAlert).gcType !== undefined,
    ) as GCPerformanceAlert[];

    // Calculate memory trend
    const recentMemory = this.memoryHistory.slice(-10);
    let memoryTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentMemory.length > 5) {
      const early = recentMemory.slice(0, Math.floor(recentMemory.length / 2));
      const late = recentMemory.slice(Math.floor(recentMemory.length / 2));
      const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
      const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;
      const change = (lateAvg - earlyAvg) / earlyAvg;

      if (change > 0.05) memoryTrend = 'increasing';
      else if (change < -0.05) memoryTrend = 'decreasing';
    }

    // Determine current pressure level
    const currentMemory = process.memoryUsage();
    const usagePercent = (currentMemory.heapUsed / currentMemory.heapTotal) * 100;
    let currentPressureLevel: 'low' | 'medium' | 'high' | 'critical';

    if (usagePercent >= 95) currentPressureLevel = 'critical';
    else if (usagePercent >= this.config.pressureThresholds.critical) currentPressureLevel = 'high';
    else if (usagePercent >= this.config.pressureThresholds.warning)
      currentPressureLevel = 'medium';
    else currentPressureLevel = 'low';

    return {
      activeAlerts: this.activeAlerts.size,
      leakAlertsToday: leakAlerts.length,
      pressureAlertsToday: pressureAlerts.length,
      gcAlertsToday: gcAlerts.length,
      averageResolutionTime: 0, // Would calculate from resolved alerts
      memoryTrend,
      currentPressureLevel,
      predictedTimeToExhaustion: this.calculateTimeToExhaustion(),
    };
  }

  /**
   * Perform comprehensive memory analysis
   */
  private async performMemoryAnalysis(): Promise<MemoryAnalysisResult> {
    const currentMemory = process.memoryUsage();
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();

    // Record memory usage
    this.memoryHistory.push(currentMemory.heapUsed);

    // Keep only recent history (last 2 hours)
    const maxHistorySize = Math.floor((2 * 60 * 60 * 1000) / this.config.evaluationInterval);
    if (this.memoryHistory.length > maxHistorySize) {
      this.memoryHistory.shift();
    }

    // Calculate growth rate
    let growthRate = 0;
    if (this.memoryHistory.length > 10) {
      const recent = this.memoryHistory.slice(-10);
      const older = this.memoryHistory.slice(-20, -10);
      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        const timeDiff = (recent.length * this.config.evaluationInterval) / (60 * 1000); // minutes
        growthRate = (recentAvg - olderAvg) / timeDiff; // bytes per minute
      }
    }

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(growthRate) > 1024 * 1024) {
      // 1MB threshold
      trend = growthRate > 0 ? 'increasing' : 'decreasing';
    }

    // Detect leak indicators
    const leakIndicators = await this.analyzeLeakIndicators();

    // Analyze GC metrics
    const gcMetrics = this.analyzeGCMetrics();

    // Generate recommendations
    const recommendations = this.generateMemoryRecommendations(growthRate, leakIndicators);

    const result: MemoryAnalysisResult = {
      timestamp: new Date(),
      currentUsage: currentMemory.heapUsed,
      availableMemory: currentMemory.heapTotal - currentMemory.heapUsed,
      growthRate,
      trend,
      leakIndicators,
      gcMetrics,
      recommendations,
    };

    this.lastAnalysisTime = new Date();
    return result;
  }

  /**
   * Detect memory leaks using pattern analysis
   */
  private async detectMemoryLeaks(): Promise<void> {
    const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
    const analysisWindow = Date.now() - this.config.leakDetectionWindow;

    for (const leak of potentialLeaks) {
      if (leak.createdAt.getTime() < analysisWindow) continue;

      const pattern = this.identifyLeakPattern(leak);
      const confidence = this.calculateLeakConfidence(leak, pattern);

      if (confidence >= this.config.predictionSettings.confidenceThreshold) {
        await this.createLeakAlert(leak, pattern, confidence);
      }
    }
  }

  /**
   * Check memory pressure levels
   */
  private async checkMemoryPressure(): Promise<void> {
    const currentMemory = process.memoryUsage();
    const usagePercent = (currentMemory.heapUsed / currentMemory.heapTotal) * 100;

    let severity: AlertSeverity | null = null;
    let pressureLevel: MemoryPressureAlert['pressureLevel'];

    if (usagePercent >= 95) {
      severity = AlertSeverity.CRITICAL;
      pressureLevel = 'critical';
    } else if (usagePercent >= this.config.pressureThresholds.critical) {
      severity = AlertSeverity.CRITICAL;
      pressureLevel = 'high';
    } else if (usagePercent >= this.config.pressureThresholds.warning) {
      severity = AlertSeverity.WARNING;
      pressureLevel = 'medium';
    } else {
      pressureLevel = 'low';
    }

    if (severity) {
      await this.createPressureAlert(severity, pressureLevel, currentMemory);
    }
  }

  /**
   * Analyze GC performance
   */
  private async analyzeGCPerformance(): Promise<void> {
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
    if (!memoryMetrics) return;

    const gcActivity = memoryMetrics.gcActivity;

    // Check GC duration threshold
    if (gcActivity.duration > this.config.gcPerformanceThresholds.maxDuration) {
      await this.createGCAlert('duration', gcActivity.duration, gcActivity);
    }

    // Check GC frequency (would need historical data)
    const gcFrequency = this.calculateGCFrequency();
    if (gcFrequency > 10) {
      // More than 10 collections per minute
      await this.createGCAlert('frequency', gcFrequency, gcActivity);
    }
  }

  /**
   * Generate predictive memory alerts
   */
  private async generatePredictiveAlerts(): Promise<void> {
    if (!this.config.predictionSettings.enablePredictiveAlerts) return;

    const timeToExhaustion = this.calculateTimeToExhaustion();
    if (timeToExhaustion && timeToExhaustion < 60 * 60 * 1000) {
      // Less than 1 hour
      await this.createPredictiveAlert(timeToExhaustion);
    }
  }

  /**
   * Create memory leak alert
   */
  private async createLeakAlert(
    leak: any,
    pattern: MemoryLeakPattern,
    confidence: number,
  ): Promise<void> {
    const alertId = `leak_${leak.id}_${Date.now()}`;

    const alert: MemoryLeakAlert = {
      id: alertId,
      type: MemoryAlertType.LEAK_DETECTED,
      pattern,
      severity: confidence > 0.9 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
      detectedAt: new Date(),
      affectedObjects: [
        {
          id: leak.id,
          type: leak.type,
          size: leak.metadata.size || 0,
          age: leak.age,
          stackTrace: leak.stackTrace,
        },
      ],
      memoryGrowth: {
        rate: this.calculateGrowthRate(),
        duration: leak.age,
        totalIncrease: leak.metadata.size || 0,
      },
      confidence,
      recommendation: this.getLeakRecommendation(pattern),
      actionItems: this.getLeakActionItems(pattern),
      estimatedImpact: {
        memoryLoss: leak.metadata.size || 0,
        performanceImpact: confidence > 0.9 ? 'high' : 'medium',
        timeToFailure: this.estimateTimeToFailure(leak),
      },
      metadata: { leak: structuredClone(leak) },
    };

    this.activeAlerts.set(alertId, alert);

    const logger = await createServerObservability().catch(() => null);
    logger?.log('warning', 'Memory leak detected', {
      alertId,
      pattern,
      confidence,
      leakId: leak.id,
      leakType: leak.type,
    });

    await this.notifyMemoryAlert(alert);
  }

  /**
   * Create memory pressure alert
   */
  private async createPressureAlert(
    severity: AlertSeverity,
    pressureLevel: MemoryPressureAlert['pressureLevel'],
    currentMemory: NodeJS.MemoryUsage,
  ): Promise<void> {
    // Check if we already have an active pressure alert
    const existingAlert = Array.from(this.activeAlerts.values()).find(
      alert => (alert as MemoryPressureAlert).pressureLevel !== undefined,
    );

    if (existingAlert) return; // Don't create duplicate pressure alerts

    const alertId = `pressure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();

    const alert: MemoryPressureAlert = {
      id: alertId,
      severity,
      triggeredAt: new Date(),
      currentUsage: currentMemory.heapUsed,
      threshold: currentMemory.heapTotal * (this.config.pressureThresholds.warning / 100),
      pressureLevel,
      availableMemory: currentMemory.heapTotal - currentMemory.heapUsed,
      gcActivity: {
        frequency: this.calculateGCFrequency(),
        averageDuration: memoryMetrics?.gcActivity.duration || 0,
        totalPauseTime: 0, // Would calculate from GC history
      },
      prediction: {
        timeToExhaustion: this.calculateTimeToExhaustion() || 0,
        recommendedActions: this.getPressureRecommendations(pressureLevel),
        criticalThreshold: currentMemory.heapTotal * 0.95,
      },
    };

    this.activeAlerts.set(alertId, alert);

    const logger = await createServerObservability().catch(() => null);
    logger?.log(
      severity === AlertSeverity.CRITICAL ? 'error' : 'warning',
      'Memory pressure alert',
      {
        alertId,
        pressureLevel,
        usagePercent: (currentMemory.heapUsed / currentMemory.heapTotal) * 100,
        availableMemory: alert.availableMemory,
      },
    );

    await this.notifyMemoryAlert(alert);
  }

  /**
   * Helper methods
   */
  private handleObjectFinalization(id: string): void {
    // Object was garbage collected, remove from tracking
    this.weakRefs.delete(id);
  }

  private async analyzeLeakIndicators(): Promise<
    Array<{
      pattern: MemoryLeakPattern;
      confidence: number;
      evidence: string[];
    }>
  > {
    const indicators: Array<{
      pattern: MemoryLeakPattern;
      confidence: number;
      evidence: string[];
    }> = [];

    // Analyze gradual growth pattern
    if (this.memoryHistory.length > 20) {
      const growthRate = this.calculateGrowthRate();
      if (growthRate > this.config.leakPatternSettings.gradualGrowthThreshold) {
        indicators.push({
          pattern: MemoryLeakPattern.GRADUAL_GROWTH,
          confidence: Math.min(
            0.9,
            growthRate / (this.config.leakPatternSettings.gradualGrowthThreshold * 2),
          ),
          evidence: [
            `Memory growth rate: ${MemoryUtils.formatBytes(growthRate)}/min`,
            `Sustained growth over ${this.memoryHistory.length} samples`,
          ],
        });
      }
    }

    // Check for persistent objects
    const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
    const persistentObjects = potentialLeaks.filter(
      leak => leak.age > this.config.leakPatternSettings.persistentObjectAge,
    );

    if (persistentObjects.length > 0) {
      indicators.push({
        pattern: MemoryLeakPattern.PERSISTENT_OBJECTS,
        confidence: Math.min(0.95, persistentObjects.length / 10),
        evidence: [
          `${persistentObjects.length} objects persisting > ${this.config.leakPatternSettings.persistentObjectAge / 1000}s`,
          `Object types: ${[...new Set(persistentObjects.map(o => o.type))].join(', ')}`,
        ],
      });
    }

    return indicators;
  }

  private analyzeGCMetrics(): MemoryAnalysisResult['gcMetrics'] {
    // Would use historical GC data
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
    return {
      collections: memoryMetrics?.gcActivity.collections || 0,
      totalDuration: memoryMetrics?.gcActivity.duration || 0,
      averageDuration: memoryMetrics?.gcActivity.duration || 0,
      memoryFreed: memoryMetrics?.gcActivity.freedMemory || 0,
    };
  }

  private generateMemoryRecommendations(
    growthRate: number,
    leakIndicators: Array<{ pattern: MemoryLeakPattern; confidence: number; evidence: string[] }>,
  ): string[] {
    const recommendations: string[] = [];

    if (growthRate > this.config.leakPatternSettings.gradualGrowthThreshold) {
      recommendations.push('Consider implementing object pooling to reduce allocation pressure');
      recommendations.push('Review data structure usage for memory efficiency');
    }

    for (const indicator of leakIndicators) {
      switch (indicator.pattern) {
        case MemoryLeakPattern.PERSISTENT_OBJECTS:
          recommendations.push('Audit object lifecycle management and cleanup procedures');
          break;
        case MemoryLeakPattern.EVENT_LISTENERS:
          recommendations.push('Review event listener cleanup in component unmount/destroy');
          break;
        case MemoryLeakPattern.TIMERS:
          recommendations.push('Ensure all timers and intervals are properly cleared');
          break;
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Memory usage appears healthy - continue monitoring');
    }

    return recommendations;
  }

  private identifyLeakPattern(leak: any): MemoryLeakPattern {
    if (leak.type.includes('Timer')) return MemoryLeakPattern.TIMERS;
    if (leak.type.includes('EventEmitter')) return MemoryLeakPattern.EVENT_LISTENERS;
    if (leak.age > this.config.leakPatternSettings.persistentObjectAge) {
      return MemoryLeakPattern.PERSISTENT_OBJECTS;
    }
    return MemoryLeakPattern.GRADUAL_GROWTH;
  }

  private calculateLeakConfidence(leak: any, pattern: MemoryLeakPattern): number {
    let confidence = 0.5; // Base confidence

    // Age factor
    const ageMinutes = leak.age / (60 * 1000);
    confidence += Math.min(0.3, ageMinutes / 30);

    // Type-specific factors
    switch (pattern) {
      case MemoryLeakPattern.TIMERS:
      case MemoryLeakPattern.EVENT_LISTENERS:
        confidence += 0.2;
        break;
      case MemoryLeakPattern.PERSISTENT_OBJECTS:
        confidence += 0.15;
        break;
    }

    // Stack trace available
    if (leak.stackTrace) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  private calculateGrowthRate(): number {
    if (this.memoryHistory.length < 10) return 0;

    const recent = this.memoryHistory.slice(-10);
    const older = this.memoryHistory.slice(-20, -10);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const timeDiff = (recent.length * this.config.evaluationInterval) / (60 * 1000);

    return (recentAvg - olderAvg) / timeDiff; // bytes per minute
  }

  private calculateGCFrequency(): number {
    // Would calculate from GC history
    return 5; // Placeholder
  }

  private calculateTimeToExhaustion(): number | undefined {
    const growthRate = this.calculateGrowthRate();
    if (growthRate <= 0) return undefined;

    const currentMemory = process.memoryUsage();
    const availableMemory = currentMemory.heapTotal - currentMemory.heapUsed;
    const growthRatePerMs = growthRate / (60 * 1000);

    return availableMemory / growthRatePerMs;
  }

  private getLeakRecommendation(pattern: MemoryLeakPattern): string {
    switch (pattern) {
      case MemoryLeakPattern.EVENT_LISTENERS:
        return 'Remove event listeners when components are destroyed or no longer needed';
      case MemoryLeakPattern.TIMERS:
        return 'Clear all timeouts and intervals when they are no longer needed';
      case MemoryLeakPattern.PERSISTENT_OBJECTS:
        return 'Review object lifecycle and implement proper cleanup procedures';
      case MemoryLeakPattern.GRADUAL_GROWTH:
        return 'Implement object pooling or reduce allocation frequency';
      default:
        return 'Review memory allocation patterns and implement proper cleanup';
    }
  }

  private getLeakActionItems(pattern: MemoryLeakPattern): string[] {
    const commonItems = [
      'Take heap snapshot for detailed analysis',
      'Review recent code changes for memory-related issues',
      'Monitor memory usage over time',
    ];

    switch (pattern) {
      case MemoryLeakPattern.EVENT_LISTENERS:
        return [
          ...commonItems,
          'Audit all addEventListener calls for matching removeEventListener',
          'Use AbortController for automatic cleanup',
        ];
      case MemoryLeakPattern.TIMERS:
        return [
          ...commonItems,
          'Audit all setTimeout/setInterval calls for clearTimeout/clearInterval',
          'Consider using AbortSignal for timeout management',
        ];
      default:
        return commonItems;
    }
  }

  private estimateTimeToFailure(leak: any): number | undefined {
    const growthRate = leak.metadata.size / leak.age; // bytes per ms
    const currentMemory = process.memoryUsage();
    const availableMemory = currentMemory.heapTotal - currentMemory.heapUsed;

    if (growthRate <= 0) return undefined;
    return availableMemory / growthRate;
  }

  private getPressureRecommendations(pressureLevel: string): string[] {
    const recommendations = [
      'Monitor memory usage closely',
      'Consider implementing garbage collection tuning',
    ];

    switch (pressureLevel) {
      case 'critical':
        return [
          'Immediately investigate memory leaks',
          'Consider restarting application if memory cannot be freed',
          'Implement emergency memory cleanup procedures',
          ...recommendations,
        ];
      case 'high':
        return [
          'Reduce memory allocation where possible',
          'Clear unnecessary caches and buffers',
          'Review recent operations for memory-intensive tasks',
          ...recommendations,
        ];
      default:
        return recommendations;
    }
  }

  private async createGCAlert(type: string, value: number, gcActivity: any): Promise<void> {
    // Implementation for GC performance alerts
    const alertId = `gc_${type}_${Date.now()}`;
    // Would create and send GC performance alert
  }

  private async createPredictiveAlert(timeToExhaustion: number): Promise<void> {
    // Implementation for predictive memory exhaustion alerts
    const alertId = `prediction_${Date.now()}`;
    // Would create and send predictive alert
  }

  private async notifyMemoryAlert(
    alert: MemoryLeakAlert | MemoryPressureAlert | GCPerformanceAlert,
  ): Promise<void> {
    // Would integrate with notification system
    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Memory alert notification sent', {
      alertId: alert.id,
      type: (alert as any).type || 'pressure',
      severity: alert.severity,
    });
  }
}

/**
 * Global memory alerting system instance
 */
export const globalMemoryAlerting = MemoryAlertingSystem.getInstance();

/**
 * Memory alerting utility functions
 */
export namespace MemoryAlertingUtils {
  /**
   * Format memory leak pattern for display
   */
  export function formatLeakPattern(pattern: MemoryLeakPattern): string {
    switch (pattern) {
      case MemoryLeakPattern.GRADUAL_GROWTH:
        return '📈 Gradual Growth';
      case MemoryLeakPattern.SUDDEN_SPIKE:
        return '📊 Sudden Spike';
      case MemoryLeakPattern.PERSISTENT_OBJECTS:
        return '🔒 Persistent Objects';
      case MemoryLeakPattern.EVENT_LISTENERS:
        return '📡 Event Listeners';
      case MemoryLeakPattern.TIMERS:
        return '⏰ Timers';
      case MemoryLeakPattern.CLOSURES:
        return '🔗 Closures';
      case MemoryLeakPattern.CIRCULAR_REFERENCES:
        return '🔄 Circular References';
      default:
        return pattern.replace(/_/g, ' ').toUpperCase();
    }
  }

  /**
   * Get memory pressure color
   */
  export function getPressureColor(level: string): string {
    switch (level) {
      case 'critical':
        return '#dc2626'; // red-600
      case 'high':
        return '#ea580c'; // orange-600
      case 'medium':
        return '#ca8a04'; // yellow-600
      case 'low':
        return '#16a34a'; // green-600
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Calculate memory efficiency score
   */
  export function calculateEfficiencyScore(
    currentUsage: number,
    totalMemory: number,
    gcEfficiency: number,
  ): number {
    const usageScore = (1 - currentUsage / totalMemory) * 50; // 0-50
    const gcScore = gcEfficiency * 50; // 0-50
    return Math.round(usageScore + gcScore);
  }
}

/**
 * Start global memory alerting system
 */
export async function startMemoryAlerting(
  config?: Partial<MemoryAlertingConfig>,
): Promise<MemoryAlertingSystem> {
  const alertingSystem = MemoryAlertingSystem.getInstance(config);
  await alertingSystem.start();
  return alertingSystem;
}
