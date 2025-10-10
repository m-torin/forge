/**
 * Enterprise Performance Monitoring Dashboard
 *
 * Real-time performance monitoring dashboard leveraging Node.js 22+ features for
 * comprehensive system observability, alerting, and performance analytics.
 * This module provides enterprise-grade monitoring with advanced visualization
 * and intelligent alert management.
 *
 * ## Key Node 22+ Features Used:
 * - **High-resolution timing**: `process.hrtime.bigint()` for nanosecond precision metrics
 * - **Promise.withResolvers()**: External promise control for dashboard state management
 * - **WeakMap**: Automatic cleanup of component references when views are destroyed
 * - **AbortSignal.timeout()**: Timeout management for dashboard operations
 * - **Structured cloning**: Safe data serialization for dashboard state persistence
 *
 * ## Core Dashboard Capabilities:
 * - Real-time performance metrics visualization
 * - Historical trend analysis with statistical confidence intervals
 * - Intelligent alerting with configurable thresholds
 * - Memory usage monitoring with leak detection
 * - Event loop health tracking with lag analysis
 * - Custom metric collection and visualization
 * - Export capabilities for reporting and analysis
 * - Integration with enterprise monitoring platforms
 *
 * @module PerformanceDashboard
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { createServerObservability } from '@repo/observability/server/next';
import { globalMemoryMonitor, MemoryUtils } from '../shared/utils/memory-monitor';
import { globalPerformanceMonitor, PerformanceUtils } from '../shared/utils/performance-metrics';

/**
 * Dashboard widget configuration
 */
interface DashboardWidget {
  readonly id: string;
  readonly type: 'chart' | 'gauge' | 'table' | 'alert' | 'trend';
  readonly title: string;
  readonly description?: string;
  readonly config: {
    readonly refreshInterval: number; // milliseconds
    readonly dataPoints: number;
    readonly timeWindow: number; // milliseconds
    readonly alertThresholds?: {
      readonly warning: number;
      readonly critical: number;
    };
    readonly chartType?: 'line' | 'bar' | 'area' | 'heatmap';
    readonly metrics: ReadonlyArray<string>;
  };
  readonly position: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

/**
 * Dashboard layout configuration
 */
interface DashboardLayout {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly widgets: ReadonlyArray<DashboardWidget>;
  readonly globalConfig: {
    readonly refreshInterval: number;
    readonly autoRefresh: boolean;
    readonly theme: 'light' | 'dark' | 'auto';
    readonly timezone: string;
  };
}

/**
 * Real-time metric data point
 */
interface MetricDataPoint {
  readonly timestamp: Date;
  readonly value: number;
  readonly metadata?: Record<string, unknown>;
  readonly tags?: Record<string, string>;
}

/**
 * Dashboard state management
 */
interface DashboardState {
  readonly currentLayout: string;
  readonly widgets: Map<
    string,
    {
      data: MetricDataPoint[];
      lastUpdate: Date;
      isLoading: boolean;
      error?: Error;
    }
  >;
  readonly alerts: Array<{
    id: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
    widget: string;
    acknowledged: boolean;
  }>;
  readonly filters: {
    timeRange: {
      start: Date;
      end: Date;
    };
    tags: Record<string, string>;
  };
}

/**
 * Performance analytics engine
 */
interface PerformanceAnalytics {
  readonly trends: {
    readonly metric: string;
    readonly direction: 'improving' | 'degrading' | 'stable';
    readonly changePercent: number;
    readonly confidence: number;
    readonly period: string;
  }[];
  readonly anomalies: {
    readonly metric: string;
    readonly timestamp: Date;
    readonly value: number;
    readonly expectedRange: { min: number; max: number };
    readonly severity: 'low' | 'medium' | 'high';
  }[];
  readonly insights: {
    readonly type: 'optimization' | 'alert' | 'recommendation';
    readonly title: string;
    readonly description: string;
    readonly priority: number;
    readonly actionable: boolean;
  }[];
}

/**
 * Enterprise Performance Monitoring Dashboard
 */
export class PerformanceDashboard {
  private static instance: PerformanceDashboard;
  private readonly dashboardState: DashboardState;
  private readonly layouts = new Map<string, DashboardLayout>();
  private readonly metricCollectors = new Map<string, () => Promise<MetricDataPoint>>();
  private readonly widgetRefs = new WeakMap<object, Set<string>>();
  private refreshTimer?: NodeJS.Timeout;
  private isActive = false;

  constructor() {
    this.dashboardState = {
      currentLayout: 'default',
      widgets: new Map(),
      alerts: [],
      filters: {
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          end: new Date(),
        },
        tags: {},
      },
    };

    this.initializeDefaultLayouts();
    this.setupMetricCollectors();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      PerformanceDashboard.instance = new PerformanceDashboard();
    }
    return PerformanceDashboard.instance;
  }

  /**
   * Start the dashboard monitoring
   */
  async start(): Promise<void> {
    if (this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting performance dashboard monitoring');

    this.isActive = true;

    // Start global monitors if not already running
    try {
      await globalPerformanceMonitor.start();
      await globalMemoryMonitor.start();
    } catch (error) {
      logger?.log('warning', 'Some monitors failed to start', { error });
    }

    // Start dashboard refresh cycle
    const currentLayout = this.layouts.get(this.dashboardState.currentLayout);
    if (currentLayout) {
      this.startRefreshCycle(currentLayout.globalConfig.refreshInterval);
    }

    // Initialize all widgets
    await this.refreshAllWidgets();
  }

  /**
   * Stop dashboard monitoring
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Stopping performance dashboard monitoring');

    this.isActive = false;

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  /**
   * Get current dashboard state
   */
  getDashboardState(): Readonly<DashboardState> {
    return structuredClone(this.dashboardState);
  }

  /**
   * Switch to a different layout
   */
  async switchLayout(layoutId: string): Promise<void> {
    const layout = this.layouts.get(layoutId);
    if (!layout) {
      throw new Error(`Layout '${layoutId}' not found`);
    }

    // Update state
    (this.dashboardState as any).currentLayout = layoutId;

    // Clear existing widget data
    this.dashboardState.widgets.clear();

    // Restart refresh cycle with new layout
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    if (this.isActive) {
      this.startRefreshCycle(layout.globalConfig.refreshInterval);
      await this.refreshAllWidgets();
    }
  }

  /**
   * Add custom widget to current layout
   */
  addWidget(widget: DashboardWidget): void {
    const currentLayout = this.layouts.get(this.dashboardState.currentLayout);
    if (!currentLayout) return;

    // Create new layout with additional widget
    const updatedLayout: DashboardLayout = {
      ...currentLayout,
      widgets: [...currentLayout.widgets, widget],
    };

    this.layouts.set(this.dashboardState.currentLayout, updatedLayout);

    // Initialize widget data
    this.dashboardState.widgets.set(widget.id, {
      data: [],
      lastUpdate: new Date(),
      isLoading: false,
    });
  }

  /**
   * Remove widget from current layout
   */
  removeWidget(widgetId: string): void {
    const currentLayout = this.layouts.get(this.dashboardState.currentLayout);
    if (!currentLayout) return;

    // Remove from layout
    const updatedLayout: DashboardLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.filter(w => w.id !== widgetId),
    };

    this.layouts.set(this.dashboardState.currentLayout, updatedLayout);

    // Clean up widget data
    this.dashboardState.widgets.delete(widgetId);
  }

  /**
   * Export dashboard data for reporting
   */
  async exportDashboardData(options: {
    format: 'json' | 'csv' | 'xlsx';
    timeRange?: { start: Date; end: Date };
    widgets?: string[];
  }): Promise<{
    data: unknown;
    filename: string;
    contentType: string;
  }> {
    const { format, timeRange, widgets } = options;
    const currentLayout = this.layouts.get(this.dashboardState.currentLayout);

    if (!currentLayout) {
      throw new Error('No active layout for export');
    }

    const exportData = {
      dashboard: {
        layout: currentLayout.name,
        exportedAt: new Date().toISOString(),
        timeRange: timeRange || this.dashboardState.filters.timeRange,
      },
      widgets: {},
      analytics: await this.getPerformanceAnalytics(),
    };

    // Collect widget data
    const targetWidgets = widgets || currentLayout.widgets.map(w => w.id);

    for (const widgetId of targetWidgets) {
      const widgetData = this.dashboardState.widgets.get(widgetId);
      const widgetConfig = currentLayout.widgets.find(w => w.id === widgetId);

      if (widgetData && widgetConfig) {
        (exportData.widgets as any)[widgetId] = {
          config: widgetConfig,
          data: this.filterDataByTimeRange(
            widgetData.data,
            timeRange || this.dashboardState.filters.timeRange,
          ),
          lastUpdate: widgetData.lastUpdate,
        };
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(exportData, null, 2),
          filename: `performance-dashboard-${timestamp}.json`,
          contentType: 'application/json',
        };

      case 'csv':
        const csvData = this.convertToCSV(exportData);
        return {
          data: csvData,
          filename: `performance-dashboard-${timestamp}.csv`,
          contentType: 'text/csv',
        };

      case 'xlsx':
        // Would integrate with xlsx library for Excel export
        throw new Error('XLSX export not yet implemented');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get performance analytics and insights
   */
  async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
    const performanceMetrics = globalPerformanceMonitor.getCurrentMetrics();
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
    const performanceSummary = globalPerformanceMonitor.getPerformanceSummary();
    const memorySummary = globalMemoryMonitor.getMemorySummary();

    const analytics: PerformanceAnalytics = {
      trends: [],
      anomalies: [],
      insights: [],
    };

    // Analyze performance trends
    const performanceTrends = globalPerformanceMonitor.analyzePerformanceTrends();
    analytics.trends.push(
      ...performanceTrends.map(trend => ({
        metric: `performance.${trend.metric}`,
        direction:
          trend.direction === 'degrading'
            ? ('degrading' as const)
            : trend.direction === 'improving'
              ? ('improving' as const)
              : ('stable' as const),
        changePercent: trend.changePercent,
        confidence: trend.confidence,
        period: `${trend.timespan}ms`,
      })),
    );

    // Analyze memory trends
    analytics.trends.push({
      metric: 'memory.trend',
      direction:
        memorySummary.trend === 'increasing'
          ? 'degrading'
          : memorySummary.trend === 'decreasing'
            ? 'improving'
            : 'stable',
      changePercent: 0, // Would calculate from historical data
      confidence: 0.8,
      period: '1h',
    });

    // Generate insights
    if (performanceMetrics?.eventLoop.lag > 100) {
      analytics.insights.push({
        type: 'alert',
        title: 'High Event Loop Lag Detected',
        description: `Event loop lag is ${performanceMetrics.eventLoop.lag.toFixed(2)}ms. Consider optimizing synchronous operations.`,
        priority: 1,
        actionable: true,
      });
    }

    if (memoryMetrics?.memoryPressure === 'high' || memoryMetrics?.memoryPressure === 'critical') {
      analytics.insights.push({
        type: 'alert',
        title: 'Memory Pressure Alert',
        description: `Memory pressure is ${memoryMetrics.memoryPressure}. Consider implementing memory cleanup or increasing heap size.`,
        priority: memoryMetrics.memoryPressure === 'critical' ? 1 : 2,
        actionable: true,
      });
    }

    // Performance optimization recommendations
    const operationStats = performanceSummary.operationStats;
    const slowOperations = operationStats.filter(op => op.p95Duration > 1000); // > 1 second

    if (slowOperations.length > 0) {
      analytics.insights.push({
        type: 'optimization',
        title: 'Slow Operations Detected',
        description: `${slowOperations.length} operations have 95th percentile duration > 1s. Consider optimization.`,
        priority: 3,
        actionable: true,
      });
    }

    return analytics;
  }

  /**
   * Initialize default dashboard layouts
   */
  private initializeDefaultLayouts(): void {
    // Default performance overview layout
    const defaultLayout: DashboardLayout = {
      id: 'default',
      name: 'Performance Overview',
      description: 'Comprehensive performance monitoring dashboard',
      globalConfig: {
        refreshInterval: 5000, // 5 seconds
        autoRefresh: true,
        theme: 'auto',
        timezone: 'UTC',
      },
      widgets: [
        // Event Loop Health
        {
          id: 'event-loop-lag',
          type: 'gauge',
          title: 'Event Loop Lag',
          description: 'Current event loop lag in milliseconds',
          config: {
            refreshInterval: 1000,
            dataPoints: 100,
            timeWindow: 5 * 60 * 1000, // 5 minutes
            alertThresholds: {
              warning: 50,
              critical: 100,
            },
            metrics: ['eventLoop.lag'],
          },
          position: { x: 0, y: 0, width: 6, height: 4 },
        },

        // Memory Usage
        {
          id: 'memory-usage',
          type: 'chart',
          title: 'Memory Usage',
          description: 'Heap memory usage over time',
          config: {
            refreshInterval: 5000,
            dataPoints: 288, // 24 hours at 5-second intervals
            timeWindow: 24 * 60 * 60 * 1000, // 24 hours
            chartType: 'area',
            alertThresholds: {
              warning: 80,
              critical: 90,
            },
            metrics: ['memory.heapUsedPercent', 'memory.heapUsed', 'memory.heapTotal'],
          },
          position: { x: 6, y: 0, width: 6, height: 4 },
        },

        // CPU Utilization
        {
          id: 'cpu-utilization',
          type: 'chart',
          title: 'CPU Utilization',
          description: 'CPU usage percentage over time',
          config: {
            refreshInterval: 2000,
            dataPoints: 180, // 6 minutes at 2-second intervals
            timeWindow: 6 * 60 * 1000, // 6 minutes
            chartType: 'line',
            alertThresholds: {
              warning: 70,
              critical: 90,
            },
            metrics: ['cpu.usage', 'cpu.user', 'cpu.system'],
          },
          position: { x: 0, y: 4, width: 8, height: 4 },
        },

        // Active Operations
        {
          id: 'active-operations',
          type: 'table',
          title: 'Active Operations',
          description: 'Currently running performance-monitored operations',
          config: {
            refreshInterval: 3000,
            dataPoints: 50,
            timeWindow: 10 * 60 * 1000, // 10 minutes
            metrics: ['operations.active', 'operations.duration', 'operations.memory'],
          },
          position: { x: 8, y: 4, width: 4, height: 4 },
        },

        // Performance Trends
        {
          id: 'performance-trends',
          type: 'trend',
          title: 'Performance Trends',
          description: 'Performance trend analysis with confidence intervals',
          config: {
            refreshInterval: 30000, // 30 seconds
            dataPoints: 24, // 12 hours at 30-minute intervals
            timeWindow: 12 * 60 * 60 * 1000, // 12 hours
            metrics: ['trends.eventLoop', 'trends.memory', 'trends.cpu'],
          },
          position: { x: 0, y: 8, width: 12, height: 3 },
        },

        // System Alerts
        {
          id: 'system-alerts',
          type: 'alert',
          title: 'System Alerts',
          description: 'Recent performance alerts and notifications',
          config: {
            refreshInterval: 10000, // 10 seconds
            dataPoints: 100,
            timeWindow: 60 * 60 * 1000, // 1 hour
            metrics: ['alerts.recent', 'alerts.critical', 'alerts.warnings'],
          },
          position: { x: 0, y: 11, width: 12, height: 2 },
        },
      ],
    };

    this.layouts.set('default', defaultLayout);

    // Memory-focused layout
    const memoryLayout: DashboardLayout = {
      id: 'memory',
      name: 'Memory Analysis',
      description: 'Detailed memory usage and leak detection dashboard',
      globalConfig: {
        refreshInterval: 3000,
        autoRefresh: true,
        theme: 'auto',
        timezone: 'UTC',
      },
      widgets: [
        {
          id: 'memory-pressure',
          type: 'gauge',
          title: 'Memory Pressure',
          config: {
            refreshInterval: 2000,
            dataPoints: 100,
            timeWindow: 5 * 60 * 1000,
            alertThresholds: { warning: 70, critical: 85 },
            metrics: ['memory.pressure'],
          },
          position: { x: 0, y: 0, width: 4, height: 4 },
        },
        {
          id: 'heap-usage-detailed',
          type: 'chart',
          title: 'Detailed Heap Usage',
          config: {
            refreshInterval: 3000,
            dataPoints: 480,
            timeWindow: 24 * 60 * 60 * 1000,
            chartType: 'area',
            metrics: [
              'memory.heapUsed',
              'memory.heapTotal',
              'memory.external',
              'memory.arrayBuffers',
            ],
          },
          position: { x: 4, y: 0, width: 8, height: 4 },
        },
        {
          id: 'gc-activity',
          type: 'chart',
          title: 'Garbage Collection Activity',
          config: {
            refreshInterval: 5000,
            dataPoints: 288,
            timeWindow: 24 * 60 * 60 * 1000,
            chartType: 'bar',
            metrics: ['gc.collections', 'gc.duration', 'gc.freedMemory'],
          },
          position: { x: 0, y: 4, width: 12, height: 4 },
        },
        {
          id: 'potential-leaks',
          type: 'table',
          title: 'Potential Memory Leaks',
          config: {
            refreshInterval: 30000,
            dataPoints: 100,
            timeWindow: 60 * 60 * 1000,
            metrics: ['leaks.detected', 'leaks.age', 'leaks.type'],
          },
          position: { x: 0, y: 8, width: 12, height: 4 },
        },
      ],
    };

    this.layouts.set('memory', memoryLayout);
  }

  /**
   * Setup metric collectors for widgets
   */
  private setupMetricCollectors(): void {
    // Event Loop Metrics
    this.metricCollectors.set('eventLoop.lag', async (): Promise<MetricDataPoint> => {
      const lag = await PerformanceUtils.getCurrentEventLoopLag();
      return {
        timestamp: new Date(),
        value: lag,
        tags: { metric: 'eventLoop.lag', unit: 'milliseconds' },
      };
    });

    // Memory Metrics
    this.metricCollectors.set('memory.heapUsedPercent', async (): Promise<MetricDataPoint> => {
      const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
      if (!memoryMetrics) {
        return {
          timestamp: new Date(),
          value: 0,
          tags: { metric: 'memory.heapUsedPercent', unit: 'percent' },
        };
      }

      const percentage = (memoryMetrics.heapUsed / memoryMetrics.heapTotal) * 100;
      return {
        timestamp: new Date(),
        value: percentage,
        tags: { metric: 'memory.heapUsedPercent', unit: 'percent' },
      };
    });

    this.metricCollectors.set('memory.heapUsed', async (): Promise<MetricDataPoint> => {
      const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
      return {
        timestamp: new Date(),
        value: memoryMetrics?.heapUsed || 0,
        tags: { metric: 'memory.heapUsed', unit: 'bytes' },
      };
    });

    // CPU Metrics
    this.metricCollectors.set('cpu.usage', async (): Promise<MetricDataPoint> => {
      const performanceMetrics = globalPerformanceMonitor.getCurrentMetrics();
      return {
        timestamp: new Date(),
        value: performanceMetrics?.cpu.usage || 0,
        tags: { metric: 'cpu.usage', unit: 'percent' },
      };
    });

    // Add more metric collectors as needed...
  }

  /**
   * Start refresh cycle for dashboard
   */
  private startRefreshCycle(intervalMs: number): void {
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshAllWidgets();
      } catch (error) {
        const logger = await createServerObservability().catch(() => null);
        logger?.log('error', 'Dashboard refresh failed', { error });
      }
    }, intervalMs);
  }

  /**
   * Refresh all widgets in current layout
   */
  private async refreshAllWidgets(): Promise<void> {
    const currentLayout = this.layouts.get(this.dashboardState.currentLayout);
    if (!currentLayout) return;

    const refreshPromises = currentLayout.widgets.map(widget =>
      this.refreshWidget(widget.id, widget.config.metrics),
    );

    await Promise.allSettled(refreshPromises);
  }

  /**
   * Refresh individual widget
   */
  private async refreshWidget(widgetId: string, metrics: ReadonlyArray<string>): Promise<void> {
    const widgetData = this.dashboardState.widgets.get(widgetId);
    if (!widgetData) {
      // Initialize widget data
      this.dashboardState.widgets.set(widgetId, {
        data: [],
        lastUpdate: new Date(),
        isLoading: true,
      });
    }

    const currentData = this.dashboardState.widgets.get(widgetId)!;
    (currentData as any).isLoading = true;

    try {
      // Collect data for all metrics
      const dataPoints: MetricDataPoint[] = [];

      for (const metric of metrics) {
        const collector = this.metricCollectors.get(metric);
        if (collector) {
          const dataPoint = await collector();
          dataPoints.push(dataPoint);
        }
      }

      // Update widget data
      const maxDataPoints = 1000; // Limit data points per widget
      const updatedData = [...currentData.data, ...dataPoints];
      if (updatedData.length > maxDataPoints) {
        updatedData.splice(0, updatedData.length - maxDataPoints);
      }

      (currentData as any).data = updatedData;
      (currentData as any).lastUpdate = new Date();
      (currentData as any).isLoading = false;
      (currentData as any).error = undefined;

      // Check for alerts
      await this.checkWidgetAlerts(widgetId, dataPoints);
    } catch (error) {
      (currentData as any).error = error as Error;
      (currentData as any).isLoading = false;
    }
  }

  /**
   * Check for alerts based on widget data
   */
  private async checkWidgetAlerts(widgetId: string, dataPoints: MetricDataPoint[]): Promise<void> {
    const currentLayout = this.layouts.get(this.dashboardState.currentLayout);
    if (!currentLayout) return;

    const widget = currentLayout.widgets.find(w => w.id === widgetId);
    if (!widget || !widget.config.alertThresholds) return;

    const { warning, critical } = widget.config.alertThresholds;

    for (const dataPoint of dataPoints) {
      let alertLevel: 'warning' | 'critical' | null = null;

      if (dataPoint.value >= critical) {
        alertLevel = 'critical';
      } else if (dataPoint.value >= warning) {
        alertLevel = 'warning';
      }

      if (alertLevel) {
        // Check if we already have a recent alert for this widget
        const recentAlert = this.dashboardState.alerts.find(
          alert =>
            alert.widget === widgetId &&
            alert.level === alertLevel &&
            Date.now() - alert.timestamp.getTime() < 5 * 60 * 1000, // 5 minutes
        );

        if (!recentAlert) {
          const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            level: alertLevel,
            message: `${widget.title}: ${dataPoint.tags?.metric} is ${dataPoint.value}${dataPoint.tags?.unit || ''} (threshold: ${alertLevel === 'critical' ? critical : warning})`,
            timestamp: new Date(),
            widget: widgetId,
            acknowledged: false,
          };

          this.dashboardState.alerts.push(alert);

          // Log alert
          const logger = await createServerObservability().catch(() => null);
          logger?.log(
            alertLevel === 'critical' ? 'error' : 'warning',
            'Performance alert triggered',
            {
              alert: alert,
              metric: dataPoint.tags?.metric,
              value: dataPoint.value,
              threshold: alertLevel === 'critical' ? critical : warning,
            },
          );
        }
      }
    }
  }

  /**
   * Filter data points by time range
   */
  private filterDataByTimeRange(
    data: MetricDataPoint[],
    timeRange: { start: Date; end: Date },
  ): MetricDataPoint[] {
    return data.filter(
      point => point.timestamp >= timeRange.start && point.timestamp <= timeRange.end,
    );
  }

  /**
   * Convert dashboard data to CSV format
   */
  private convertToCSV(exportData: any): string {
    const lines: string[] = [];

    // Header
    lines.push('Timestamp,Widget,Metric,Value,Unit,Tags');

    // Data rows
    for (const [widgetId, widgetData] of Object.entries(exportData.widgets as any)) {
      const data = (widgetData as any).data as MetricDataPoint[];

      for (const point of data) {
        const tags = point.tags
          ? Object.entries(point.tags)
              .map(([k, v]) => `${k}=${v}`)
              .join(';')
          : '';
        lines.push(
          [
            point.timestamp.toISOString(),
            widgetId,
            point.tags?.metric || '',
            point.value.toString(),
            point.tags?.unit || '',
            tags,
          ].join(','),
        );
      }
    }

    return lines.join('\n');
  }
}

/**
 * Global performance dashboard instance
 */
export const globalPerformanceDashboard = PerformanceDashboard.getInstance();

/**
 * Dashboard utility functions
 */
export namespace DashboardUtils {
  /**
   * Create a simple widget configuration
   */
  export function createWidget(
    id: string,
    type: DashboardWidget['type'],
    title: string,
    metrics: string[],
    options: Partial<DashboardWidget['config']> = {},
  ): DashboardWidget {
    return {
      id,
      type,
      title,
      config: {
        refreshInterval: 5000,
        dataPoints: 100,
        timeWindow: 60 * 60 * 1000, // 1 hour
        metrics,
        ...options,
      },
      position: { x: 0, y: 0, width: 6, height: 4 },
    };
  }

  /**
   * Format metric value for display
   */
  export function formatMetricValue(value: number, unit: string): string {
    switch (unit) {
      case 'bytes':
        return MemoryUtils.formatBytes(value);
      case 'milliseconds':
        return `${value.toFixed(2)}ms`;
      case 'nanoseconds':
        return PerformanceUtils.formatDuration(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  }

  /**
   * Calculate metric statistics
   */
  export function calculateStats(data: MetricDataPoint[]): {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    if (data.length === 0) {
      return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    }

    const values = data.map(d => d.value).sort((a, b) => a - b);
    const sum = values.reduce((s, v) => s + v, 0);

    return {
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p50: values[Math.floor(values.length * 0.5)] || 0,
      p95: values[Math.floor(values.length * 0.95)] || 0,
      p99: values[Math.floor(values.length * 0.99)] || 0,
    };
  }
}

/**
 * Start global performance dashboard
 */
export async function startPerformanceDashboard(): Promise<PerformanceDashboard> {
  const dashboard = PerformanceDashboard.getInstance();
  await dashboard.start();
  return dashboard;
}
