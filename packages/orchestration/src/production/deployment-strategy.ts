/**
 * Node 22+ Production Deployment Strategy
 *
 * Comprehensive deployment strategy for safely rolling out Node 22+ modernizations
 * to production environments. Implements gradual rollout patterns, canary deployments,
 * blue-green strategies, and automated rollback mechanisms to ensure zero-downtime
 * deployments with minimal risk.
 *
 * ## Key Features:
 * - **Gradual Rollout**: Phased deployment with traffic splitting
 * - **Canary Deployments**: Small subset testing before full rollout
 * - **Blue-Green Deployments**: Zero-downtime environment switching
 * - **Feature Flags**: Runtime feature toggling and rollback
 * - **Health Monitoring**: Real-time deployment health tracking
 * - **Automatic Rollback**: Intelligent failure detection and recovery
 *
 * ## Deployment Phases:
 * 1. **Pre-deployment Validation**: Environment and dependency checks
 * 2. **Canary Release**: 1-5% traffic to new version
 * 3. **Staged Rollout**: Gradual traffic increase (10%, 25%, 50%, 100%)
 * 4. **Full Deployment**: Complete environment switch
 * 5. **Post-deployment Validation**: Health checks and monitoring
 * 6. **Cleanup**: Old environment cleanup and resource optimization
 *
 * @module ProductionDeploymentStrategy
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { readFile } from 'fs/promises';
import { performance } from 'perf_hooks';

/**
 * Deployment environment types
 */
type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'canary';

/**
 * Deployment strategy types
 */
type DeploymentStrategy = 'blue-green' | 'canary' | 'rolling' | 'recreate';

/**
 * Deployment phase status
 */
type DeploymentPhaseStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back';

/**
 * Health check result
 */
interface HealthCheckResult {
  readonly service: string;
  readonly endpoint: string;
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly responseTime: number; // milliseconds
  readonly timestamp: bigint;
  readonly details: {
    statusCode?: number;
    error?: string;
    metrics?: Record<string, number>;
  };
}

/**
 * Deployment configuration
 */
interface DeploymentConfig {
  readonly strategy: DeploymentStrategy;
  readonly environment: DeploymentEnvironment;
  readonly version: string;
  readonly services: string[]; // Services to deploy
  readonly rollout: {
    canaryPercent: number; // 1-10%
    stagePercentages: number[]; // e.g., [10, 25, 50, 100]
    stageDelayMinutes: number; // Delay between stages
    healthCheckIntervalSeconds: number;
    rollbackThresholds: {
      errorRatePercent: number; // Max error rate before rollback
      responseTimeMs: number; // Max response time before rollback
      healthCheckFailures: number; // Max health check failures
    };
  };
  readonly validation: {
    preDeployment: string[]; // Pre-deployment checks
    postDeployment: string[]; // Post-deployment checks
    smokeTests: string[]; // Smoke test endpoints
    loadTests?: {
      duration: number; // seconds
      concurrency: number;
      rampUp: number; // seconds
    };
  };
  readonly rollback: {
    automatic: boolean;
    preserveData: boolean;
    notificationChannels: string[];
    maxRollbackTime: number; // minutes
  };
}

/**
 * Deployment phase definition
 */
interface DeploymentPhase {
  readonly name: string;
  readonly description: string;
  readonly trafficPercent: number;
  readonly duration: number; // minutes
  readonly healthChecks: string[];
  readonly successCriteria: {
    minHealthyInstances: number;
    maxErrorRate: number; // percentage
    maxResponseTime: number; // milliseconds
  };
  readonly rollbackTriggers: {
    errorThreshold: number;
    latencyThreshold: number;
    healthCheckFailures: number;
  };
}

/**
 * Deployment execution result
 */
interface DeploymentResult {
  readonly deploymentId: string;
  readonly strategy: DeploymentStrategy;
  readonly environment: DeploymentEnvironment;
  readonly version: string;
  readonly startTime: bigint;
  readonly endTime: bigint;
  readonly duration: number; // milliseconds
  readonly success: boolean;
  readonly currentPhase: string;
  readonly completedPhases: string[];
  readonly healthResults: HealthCheckResult[];
  readonly metrics: {
    totalRequests: number;
    successfulRequests: number;
    averageResponseTime: number;
    peakResponseTime: number;
    errorRate: number;
    deploymentEfficiency: number; // 0-100%
  };
  readonly rollbackInfo?: {
    triggered: boolean;
    reason: string;
    rollbackTime: number;
    recoveryTime: number;
  };
  readonly artifacts: {
    logs: string[];
    metrics: string[];
    reports: string[];
  };
}

/**
 * Service health monitoring
 */
class ServiceHealthMonitor {
  private readonly healthChecks = new Map<string, HealthCheckResult>();
  private readonly healthHistory = new WeakMap<object, HealthCheckResult[]>();
  private readonly monitoringIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start monitoring service health
   */
  startMonitoring(service: string, endpoints: string[], intervalMs: number = 30000): void {
    // Stop existing monitoring if any
    this.stopMonitoring(service);

    const monitor = async () => {
      const results: HealthCheckResult[] = [];

      for (const endpoint of endpoints) {
        try {
          const startTime = process.hrtime.bigint();

          // Simulate health check (would be actual HTTP request in real implementation)
          const response = await this.performHealthCheck(endpoint);

          const endTime = process.hrtime.bigint();
          const responseTime = Number(endTime - startTime) / 1_000_000; // Convert to ms

          const result: HealthCheckResult = {
            service,
            endpoint,
            status: response.status >= 200 && response.status < 300 ? 'healthy' : 'unhealthy',
            responseTime,
            timestamp: endTime,
            details: {
              statusCode: response.status,
              metrics: response.metrics,
            },
          };

          results.push(result);
          this.healthChecks.set(`${service}-${endpoint}`, result);
        } catch (error) {
          const result: HealthCheckResult = {
            service,
            endpoint,
            status: 'unhealthy',
            responseTime: 0,
            timestamp: process.hrtime.bigint(),
            details: {
              error: String(error),
            },
          };

          results.push(result);
          this.healthChecks.set(`${service}-${endpoint}`, result);
        }
      }

      // Store health history
      const historyKey = { service, timestamp: Date.now() };
      this.healthHistory.set(historyKey, results);
    };

    // Initial check
    monitor();

    // Schedule periodic checks
    const intervalId = setInterval(monitor, intervalMs);
    this.monitoringIntervals.set(service, intervalId);
  }

  /**
   * Stop monitoring service
   */
  stopMonitoring(service: string): void {
    const intervalId = this.monitoringIntervals.get(service);
    if (intervalId) {
      clearInterval(intervalId);
      this.monitoringIntervals.delete(service);
    }
  }

  /**
   * Get current health status for service
   */
  getHealthStatus(service: string): {
    healthy: number;
    total: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const serviceChecks = Array.from(this.healthChecks.entries())
      .filter(([key]) => key.startsWith(service))
      .map(([, result]) => result);

    const healthy = serviceChecks.filter(check => check.status === 'healthy').length;
    const total = serviceChecks.length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthy === total) {
      status = 'healthy';
    } else if (healthy > total / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { healthy, total, status };
  }

  /**
   * Get all health results
   */
  getAllHealthResults(): HealthCheckResult[] {
    return Array.from(this.healthChecks.values());
  }

  private async performHealthCheck(endpoint: string): Promise<{
    status: number;
    metrics: Record<string, number>;
  }> {
    // Simulate health check - would be actual HTTP request in real implementation
    const isHealthy = Math.random() > 0.05; // 95% health rate

    return {
      status: isHealthy ? 200 : 500,
      metrics: {
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        requestsPerSecond: Math.random() * 1000,
      },
    };
  }
}

/**
 * Traffic splitting controller for gradual rollouts
 */
class TrafficSplitController {
  private currentSplit = new Map<string, number>(); // service -> percentage
  private readonly splitHistory: Array<{ timestamp: bigint; splits: Map<string, number> }> = [];

  /**
   * Update traffic split for services
   */
  updateTrafficSplit(splits: Map<string, number>): void {
    // Validate splits total to 100%
    const total = Array.from(splits.values()).reduce((sum, percent) => sum + percent, 0);
    if (Math.abs(total - 100) > 0.1) {
      throw new Error(`Traffic splits must total 100%, got ${total}%`);
    }

    // Store current split
    this.currentSplit.clear();
    splits.forEach((percent, service) => {
      this.currentSplit.set(service, percent);
    });

    // Record in history
    this.splitHistory.push({
      timestamp: process.hrtime.bigint(),
      splits: structuredClone(this.currentSplit),
    });

    // Apply split (would integrate with load balancer in real implementation)
    console.log('Traffic split updated:', Object.fromEntries(this.currentSplit));
  }

  /**
   * Get current traffic split
   */
  getCurrentSplit(): Map<string, number> {
    return new Map(this.currentSplit);
  }

  /**
   * Gradually shift traffic from old to new version
   */
  async gradualShift(
    fromService: string,
    toService: string,
    targetPercent: number,
    durationMs: number,
    steps: number = 10,
  ): Promise<void> {
    const initialFromPercent = this.currentSplit.get(fromService) || 0;
    const initialToPercent = this.currentSplit.get(toService) || 0;

    const stepDuration = durationMs / steps;
    const percentStep = (targetPercent - initialToPercent) / steps;

    for (let step = 1; step <= steps; step++) {
      const newToPercent = initialToPercent + percentStep * step;
      const newFromPercent = initialFromPercent - percentStep * step;

      this.updateTrafficSplit(
        new Map([
          [fromService, Math.max(0, newFromPercent)],
          [toService, Math.min(100, newToPercent)],
        ]),
      );

      // Wait before next step
      if (step < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  }
}

/**
 * Production deployment orchestrator with Node 22+ features
 */
export class ProductionDeploymentOrchestrator {
  private readonly healthMonitor = new ServiceHealthMonitor();
  private readonly trafficController = new TrafficSplitController();
  private readonly deploymentCache = new Map<string, DeploymentResult>();
  private readonly activeDeployments = new WeakSet<object>();
  private readonly finalizationRegistry = new FinalizationRegistry((deploymentId: string) => {
    console.debug(`Deployment ${deploymentId} resources cleaned up`);
  });

  constructor(
    private readonly config: DeploymentConfig,
    private readonly environment: {
      kubernetesContext?: string;
      awsRegion?: string;
      cloudProvider: 'aws' | 'gcp' | 'azure' | 'local';
      nodeVersion: string;
    },
  ) {}

  /**
   * Execute deployment with gradual rollout
   */
  async executeDeployment(
    options: {
      abortSignal?: AbortSignal;
      dryRun?: boolean;
      onPhaseStart?: (phase: DeploymentPhase) => void;
      onPhaseComplete?: (phase: DeploymentPhase, success: boolean) => void;
      onHealthCheck?: (results: HealthCheckResult[]) => void;
    } = {},
  ): Promise<DeploymentResult> {
    const { abortSignal, dryRun = false, onPhaseStart, onPhaseComplete, onHealthCheck } = options;
    const deploymentId = this.generateDeploymentId();
    const startTime = process.hrtime.bigint();

    const result: DeploymentResult = {
      deploymentId,
      strategy: this.config.strategy,
      environment: this.config.environment,
      version: this.config.version,
      startTime,
      endTime: startTime,
      duration: 0,
      success: false,
      currentPhase: 'pre-deployment',
      completedPhases: [],
      healthResults: [],
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
        errorRate: 0,
        deploymentEfficiency: 0,
      },
      artifacts: {
        logs: [],
        metrics: [],
        reports: [],
      },
    };

    // Register deployment for cleanup
    const deploymentRef = { id: deploymentId };
    this.activeDeployments.add(deploymentRef);
    this.finalizationRegistry.register(deploymentRef, deploymentId);

    try {
      // Pre-deployment validation
      result.currentPhase = 'validation';
      await this.runPreDeploymentValidation(dryRun);
      result.completedPhases.push('validation');

      // Create deployment phases based on strategy
      const phases = this.createDeploymentPhases();

      // Start health monitoring
      if (!dryRun) {
        this.startHealthMonitoring(onHealthCheck);
      }

      // Execute each deployment phase
      for (const phase of phases) {
        if (abortSignal?.aborted) {
          throw new Error('Deployment cancelled by user');
        }

        result.currentPhase = phase.name;
        onPhaseStart?.(phase);

        try {
          if (dryRun) {
            console.log(
              `[DRY RUN] Executing phase: ${phase.name} (${phase.trafficPercent}% traffic)`,
            );
            await this.simulatePhase(phase);
          } else {
            await this.executePhase(phase, abortSignal);
          }

          result.completedPhases.push(phase.name);
          onPhaseComplete?.(phase, true);
        } catch (error) {
          console.error(`Phase ${phase.name} failed:`, error);

          // Check if rollback should be triggered
          if (this.shouldTriggerRollback(phase, result)) {
            console.log('Triggering automatic rollback...');
            await this.performRollback(deploymentId, String(error));

            result.rollbackInfo = {
              triggered: true,
              reason: String(error),
              rollbackTime: 0, // Would be measured in real implementation
              recoveryTime: 0,
            };
          }

          onPhaseComplete?.(phase, false);
          throw error;
        }
      }

      // Post-deployment validation
      result.currentPhase = 'post-validation';
      await this.runPostDeploymentValidation(dryRun);
      result.completedPhases.push('post-validation');

      // Final metrics collection
      result.healthResults = this.healthMonitor.getAllHealthResults();
      result.metrics = this.calculateDeploymentMetrics(result);

      const endTime = process.hrtime.bigint();
      result.endTime = endTime;
      result.duration = Number(endTime - startTime) / 1_000_000;
      result.success = true;

      // Cache successful deployment
      this.deploymentCache.set(deploymentId, structuredClone(result));

      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      result.endTime = endTime;
      result.duration = Number(endTime - startTime) / 1_000_000;
      result.success = false;

      console.error('Deployment failed:', error);
      return result;
    } finally {
      // Cleanup monitoring
      this.config.services.forEach(service => {
        this.healthMonitor.stopMonitoring(service);
      });
    }
  }

  /**
   * Create deployment phases based on strategy
   */
  private createDeploymentPhases(): DeploymentPhase[] {
    switch (this.config.strategy) {
      case 'canary':
        return this.createCanaryPhases();
      case 'blue-green':
        return this.createBlueGreenPhases();
      case 'rolling':
        return this.createRollingPhases();
      case 'recreate':
        return this.createRecreatePhases();
      default:
        throw new Error(`Unknown deployment strategy: ${this.config.strategy}`);
    }
  }

  /**
   * Create canary deployment phases
   */
  private createCanaryPhases(): DeploymentPhase[] {
    const phases: DeploymentPhase[] = [];

    // Canary phase
    phases.push({
      name: 'canary',
      description: `Deploy to ${this.config.rollout.canaryPercent}% of traffic`,
      trafficPercent: this.config.rollout.canaryPercent,
      duration: this.config.rollout.stageDelayMinutes,
      healthChecks: ['health', 'readiness'],
      successCriteria: {
        minHealthyInstances: 1,
        maxErrorRate: this.config.rollout.rollbackThresholds.errorRatePercent,
        maxResponseTime: this.config.rollout.rollbackThresholds.responseTimeMs,
      },
      rollbackTriggers: {
        errorThreshold: this.config.rollout.rollbackThresholds.errorRatePercent,
        latencyThreshold: this.config.rollout.rollbackThresholds.responseTimeMs,
        healthCheckFailures: this.config.rollout.rollbackThresholds.healthCheckFailures,
      },
    });

    // Staged rollout phases
    for (const [index, percentage] of this.config.rollout.stagePercentages.entries()) {
      phases.push({
        name: `stage-${index + 1}`,
        description: `Scale to ${percentage}% of traffic`,
        trafficPercent: percentage,
        duration: this.config.rollout.stageDelayMinutes,
        healthChecks: ['health', 'readiness', 'performance'],
        successCriteria: {
          minHealthyInstances: Math.ceil((percentage / 100) * this.config.services.length),
          maxErrorRate: this.config.rollout.rollbackThresholds.errorRatePercent,
          maxResponseTime: this.config.rollout.rollbackThresholds.responseTimeMs,
        },
        rollbackTriggers: {
          errorThreshold: this.config.rollout.rollbackThresholds.errorRatePercent,
          latencyThreshold: this.config.rollout.rollbackThresholds.responseTimeMs,
          healthCheckFailures: this.config.rollout.rollbackThresholds.healthCheckFailures,
        },
      });
    }

    return phases;
  }

  /**
   * Create blue-green deployment phases
   */
  private createBlueGreenPhases(): DeploymentPhase[] {
    return [
      {
        name: 'green-deploy',
        description: 'Deploy new version to green environment',
        trafficPercent: 0,
        duration: 10,
        healthChecks: ['health', 'readiness'],
        successCriteria: {
          minHealthyInstances: this.config.services.length,
          maxErrorRate: 1,
          maxResponseTime: 5000,
        },
        rollbackTriggers: {
          errorThreshold: 5,
          latencyThreshold: 10000,
          healthCheckFailures: 3,
        },
      },
      {
        name: 'smoke-test',
        description: 'Run smoke tests on green environment',
        trafficPercent: 0,
        duration: 5,
        healthChecks: ['health', 'smoke'],
        successCriteria: {
          minHealthyInstances: this.config.services.length,
          maxErrorRate: 0,
          maxResponseTime: 2000,
        },
        rollbackTriggers: {
          errorThreshold: 1,
          latencyThreshold: 5000,
          healthCheckFailures: 1,
        },
      },
      {
        name: 'traffic-switch',
        description: 'Switch all traffic to green environment',
        trafficPercent: 100,
        duration: 2,
        healthChecks: ['health', 'readiness', 'performance'],
        successCriteria: {
          minHealthyInstances: this.config.services.length,
          maxErrorRate: 1,
          maxResponseTime: 2000,
        },
        rollbackTriggers: {
          errorThreshold: 2,
          latencyThreshold: 5000,
          healthCheckFailures: 2,
        },
      },
    ];
  }

  /**
   * Create rolling deployment phases
   */
  private createRollingPhases(): DeploymentPhase[] {
    const phases: DeploymentPhase[] = [];
    const serviceCount = this.config.services.length;
    const instancesPerPhase = Math.max(1, Math.floor(serviceCount / 4)); // 4 phases by default

    for (let i = 0; i < 4; i++) {
      const startInstance = i * instancesPerPhase;
      const endInstance = Math.min((i + 1) * instancesPerPhase, serviceCount);
      const percentage = (endInstance / serviceCount) * 100;

      phases.push({
        name: `rolling-${i + 1}`,
        description: `Rolling update instances ${startInstance + 1}-${endInstance}`,
        trafficPercent: percentage,
        duration: this.config.rollout.stageDelayMinutes,
        healthChecks: ['health', 'readiness'],
        successCriteria: {
          minHealthyInstances: endInstance,
          maxErrorRate: this.config.rollout.rollbackThresholds.errorRatePercent,
          maxResponseTime: this.config.rollout.rollbackThresholds.responseTimeMs,
        },
        rollbackTriggers: {
          errorThreshold: this.config.rollout.rollbackThresholds.errorRatePercent,
          latencyThreshold: this.config.rollout.rollbackThresholds.responseTimeMs,
          healthCheckFailures: this.config.rollout.rollbackThresholds.healthCheckFailures,
        },
      });
    }

    return phases;
  }

  /**
   * Create recreate deployment phases
   */
  private createRecreatePhases(): DeploymentPhase[] {
    return [
      {
        name: 'shutdown',
        description: 'Shutdown old version',
        trafficPercent: 0,
        duration: 2,
        healthChecks: [],
        successCriteria: {
          minHealthyInstances: 0,
          maxErrorRate: 100,
          maxResponseTime: 60000,
        },
        rollbackTriggers: {
          errorThreshold: 100,
          latencyThreshold: 60000,
          healthCheckFailures: 10,
        },
      },
      {
        name: 'deploy',
        description: 'Deploy new version',
        trafficPercent: 100,
        duration: 10,
        healthChecks: ['health', 'readiness'],
        successCriteria: {
          minHealthyInstances: this.config.services.length,
          maxErrorRate: 5,
          maxResponseTime: 5000,
        },
        rollbackTriggers: {
          errorThreshold: 10,
          latencyThreshold: 10000,
          healthCheckFailures: 3,
        },
      },
    ];
  }

  /**
   * Execute a deployment phase
   */
  private async executePhase(phase: DeploymentPhase, abortSignal?: AbortSignal): Promise<void> {
    console.log(`Executing phase: ${phase.name} (${phase.description})`);

    // Update traffic split
    if (phase.trafficPercent > 0) {
      await this.updateTrafficSplit(phase.trafficPercent);
    }

    // Wait for phase duration while monitoring health
    const phaseStart = performance.now();
    const phaseEnd = phaseStart + phase.duration * 60 * 1000; // Convert minutes to ms

    while (performance.now() < phaseEnd) {
      if (abortSignal?.aborted) {
        throw new Error('Phase cancelled');
      }

      // Check health criteria
      const healthStatus = this.checkPhaseHealth(phase);
      if (!healthStatus.success) {
        throw new Error(`Phase failed health check: ${healthStatus.reason}`);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second intervals
    }

    console.log(`Phase ${phase.name} completed successfully`);
  }

  /**
   * Simulate phase execution for dry runs
   */
  private async simulatePhase(phase: DeploymentPhase): Promise<void> {
    const duration = Math.min(phase.duration * 1000, 5000); // Max 5 seconds for simulation
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Start health monitoring for all services
   */
  private startHealthMonitoring(onHealthCheck?: (results: HealthCheckResult[]) => void): void {
    for (const service of this.config.services) {
      const endpoints = [`/health`, `/ready`, `/metrics`];

      this.healthMonitor.startMonitoring(
        service,
        endpoints,
        this.config.rollout.healthCheckIntervalSeconds * 1000,
      );
    }

    // Report health results periodically
    if (onHealthCheck) {
      const healthReportInterval = setInterval(() => {
        const results = this.healthMonitor.getAllHealthResults();
        onHealthCheck(results);
      }, 10000); // Every 10 seconds

      setTimeout(() => clearInterval(healthReportInterval), 30 * 60 * 1000); // Stop after 30 minutes
    }
  }

  /**
   * Update traffic split for current phase
   */
  private async updateTrafficSplit(targetPercent: number): Promise<void> {
    const oldVersion = 'current';
    const newVersion = 'new';

    // Gradual shift traffic
    await this.trafficController.gradualShift(
      oldVersion,
      newVersion,
      targetPercent,
      60000, // 1 minute shift
      6, // 10-second steps
    );
  }

  /**
   * Check if phase health criteria are met
   */
  private checkPhaseHealth(phase: DeploymentPhase): { success: boolean; reason?: string } {
    const healthResults = this.healthMonitor.getAllHealthResults();

    // Check minimum healthy instances
    const healthyServices = new Set(
      healthResults.filter(result => result.status === 'healthy').map(result => result.service),
    );

    if (healthyServices.size < phase.successCriteria.minHealthyInstances) {
      return {
        success: false,
        reason: `Only ${healthyServices.size} healthy instances, need ${phase.successCriteria.minHealthyInstances}`,
      };
    }

    // Check error rate
    const recentResults = healthResults.filter(result => {
      const age = Number(process.hrtime.bigint() - result.timestamp) / 1_000_000_000; // seconds
      return age < 60; // Last minute
    });

    const errorRate =
      (recentResults.filter(r => r.status !== 'healthy').length / recentResults.length) * 100;
    if (errorRate > phase.successCriteria.maxErrorRate) {
      return {
        success: false,
        reason: `Error rate ${errorRate.toFixed(1)}% exceeds threshold ${phase.successCriteria.maxErrorRate}%`,
      };
    }

    // Check response times
    const avgResponseTime =
      recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length;
    if (avgResponseTime > phase.successCriteria.maxResponseTime) {
      return {
        success: false,
        reason: `Average response time ${avgResponseTime.toFixed(0)}ms exceeds threshold ${phase.successCriteria.maxResponseTime}ms`,
      };
    }

    return { success: true };
  }

  /**
   * Check if automatic rollback should be triggered
   */
  private shouldTriggerRollback(phase: DeploymentPhase, result: DeploymentResult): boolean {
    if (!this.config.rollback.automatic) {
      return false;
    }

    const healthResults = this.healthMonitor.getAllHealthResults();
    const recentResults = healthResults.filter(result => {
      const age = Number(process.hrtime.bigint() - result.timestamp) / 1_000_000_000;
      return age < 120; // Last 2 minutes
    });

    // Check error threshold
    const errorRate =
      (recentResults.filter(r => r.status !== 'healthy').length / recentResults.length) * 100;
    if (errorRate > phase.rollbackTriggers.errorThreshold) {
      return true;
    }

    // Check latency threshold
    const avgLatency =
      recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length;
    if (avgLatency > phase.rollbackTriggers.latencyThreshold) {
      return true;
    }

    // Check consecutive health check failures
    const recentFailures = recentResults.filter(r => r.status !== 'healthy').length;
    if (recentFailures >= phase.rollbackTriggers.healthCheckFailures) {
      return true;
    }

    return false;
  }

  /**
   * Perform automatic rollback
   */
  private async performRollback(deploymentId: string, reason: string): Promise<void> {
    console.log(`Performing rollback for deployment ${deploymentId}: ${reason}`);

    // Revert traffic split
    this.trafficController.updateTrafficSplit(
      new Map([
        ['current', 100],
        ['new', 0],
      ]),
    );

    // Additional rollback steps would be implemented here
    // - Revert database migrations
    // - Restore previous configuration
    // - Clean up new deployment resources

    console.log(`Rollback completed for deployment ${deploymentId}`);
  }

  /**
   * Run pre-deployment validation
   */
  private async runPreDeploymentValidation(dryRun: boolean): Promise<void> {
    console.log('Running pre-deployment validation...');

    for (const check of this.config.validation.preDeployment) {
      if (dryRun) {
        console.log(`[DRY RUN] Would run pre-deployment check: ${check}`);
      } else {
        await this.runValidationCheck(check);
      }
    }

    console.log('Pre-deployment validation completed');
  }

  /**
   * Run post-deployment validation
   */
  private async runPostDeploymentValidation(dryRun: boolean): Promise<void> {
    console.log('Running post-deployment validation...');

    for (const check of this.config.validation.postDeployment) {
      if (dryRun) {
        console.log(`[DRY RUN] Would run post-deployment check: ${check}`);
      } else {
        await this.runValidationCheck(check);
      }
    }

    // Run smoke tests
    for (const smokeTest of this.config.validation.smokeTests) {
      if (dryRun) {
        console.log(`[DRY RUN] Would run smoke test: ${smokeTest}`);
      } else {
        await this.runSmokeTest(smokeTest);
      }
    }

    console.log('Post-deployment validation completed');
  }

  private async runValidationCheck(check: string): Promise<void> {
    // Implementation would run actual validation check
    console.log(`Running validation check: ${check}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate check
  }

  private async runSmokeTest(test: string): Promise<void> {
    // Implementation would run actual smoke test
    console.log(`Running smoke test: ${test}`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate test
  }

  private calculateDeploymentMetrics(result: DeploymentResult): DeploymentResult['metrics'] {
    const healthResults = result.healthResults;
    const totalRequests = healthResults.length;
    const successfulRequests = healthResults.filter(r => r.status === 'healthy').length;
    const responseTimes = healthResults.map(r => r.responseTime);

    return {
      totalRequests,
      successfulRequests,
      averageResponseTime:
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length || 0,
      peakResponseTime: Math.max(...responseTimes, 0),
      errorRate:
        totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0,
      deploymentEfficiency:
        (result.completedPhases.length / (result.completedPhases.length + 1)) * 100, // Simplified
    };
  }

  private generateDeploymentId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    return `deploy-${timestamp}-${randomString}`;
  }
}

/**
 * Predefined deployment configurations for different scenarios
 */
export const DeploymentConfigs = {
  /**
   * Safe production canary deployment
   */
  productionCanary: {
    strategy: 'canary' as DeploymentStrategy,
    environment: 'production' as DeploymentEnvironment,
    rollout: {
      canaryPercent: 2,
      stagePercentages: [5, 15, 35, 70, 100],
      stageDelayMinutes: 15,
      healthCheckIntervalSeconds: 30,
      rollbackThresholds: {
        errorRatePercent: 1,
        responseTimeMs: 2000,
        healthCheckFailures: 3,
      },
    },
    validation: {
      preDeployment: ['dependency-check', 'security-scan', 'performance-baseline'],
      postDeployment: ['health-check', 'integration-test', 'performance-validation'],
      smokeTests: ['/health', '/api/status', '/api/version'],
    },
    rollback: {
      automatic: true,
      preserveData: true,
      notificationChannels: ['slack', 'email', 'pagerduty'],
      maxRollbackTime: 10,
    },
  },

  /**
   * Fast staging blue-green deployment
   */
  stagingBlueGreen: {
    strategy: 'blue-green' as DeploymentStrategy,
    environment: 'staging' as DeploymentEnvironment,
    rollout: {
      canaryPercent: 0,
      stagePercentages: [100],
      stageDelayMinutes: 5,
      healthCheckIntervalSeconds: 15,
      rollbackThresholds: {
        errorRatePercent: 5,
        responseTimeMs: 5000,
        healthCheckFailures: 5,
      },
    },
    validation: {
      preDeployment: ['dependency-check', 'integration-test'],
      postDeployment: ['health-check', 'smoke-test'],
      smokeTests: ['/health', '/ready'],
    },
    rollback: {
      automatic: true,
      preserveData: false,
      notificationChannels: ['slack'],
      maxRollbackTime: 5,
    },
  },
} as const;

/**
 * Factory function to create deployment orchestrator
 */
export function createDeploymentOrchestrator(
  config: DeploymentConfig,
  environment: {
    cloudProvider: 'aws' | 'gcp' | 'azure' | 'local';
    nodeVersion: string;
    kubernetesContext?: string;
  },
): ProductionDeploymentOrchestrator {
  return new ProductionDeploymentOrchestrator(config, environment);
}

/**
 * CLI function for production deployment
 */
export async function deployToProduction(
  version: string,
  services: string[],
  options: {
    strategy?: DeploymentStrategy;
    environment?: DeploymentEnvironment;
    dryRun?: boolean;
    configPath?: string;
  } = {},
): Promise<void> {
  const { strategy = 'canary', environment = 'production', dryRun = false, configPath } = options;

  // Load configuration
  let config: DeploymentConfig;
  if (configPath) {
    const configData = await readFile(configPath, 'utf-8');
    config = JSON.parse(configData);
  } else {
    config = {
      ...DeploymentConfigs.productionCanary,
      strategy,
      environment,
      version,
      services,
    };
  }

  const orchestrator = createDeploymentOrchestrator(config, {
    cloudProvider: 'aws', // Would be detected from environment
    nodeVersion: process.version,
  });

  console.log(`🚀 Starting ${dryRun ? 'dry run ' : ''}deployment`);
  console.log(`📦 Version: ${version}`);
  console.log(`🎯 Strategy: ${strategy}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log(`⚙️  Services: ${services.join(', ')}`);

  const startTime = performance.now();

  try {
    const result = await orchestrator.executeDeployment({
      dryRun,
      onPhaseStart: phase => {
        console.log(`📋 Phase: ${phase.name} - ${phase.description}`);
      },
      onPhaseComplete: (phase, success) => {
        const icon = success ? '✅' : '❌';
        console.log(`${icon} Phase completed: ${phase.name}`);
      },
      onHealthCheck: results => {
        const healthy = results.filter(r => r.status === 'healthy').length;
        const total = results.length;
        console.log(`💚 Health: ${healthy}/${total} healthy services`);
      },
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log('\n📊 Deployment Summary:');
    console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Duration: ${duration.toFixed(2)}ms`);
    console.log(`   Phases: ${result.completedPhases.length}`);
    console.log(`   Error Rate: ${result.metrics.errorRate.toFixed(2)}%`);
    console.log(`   Avg Response Time: ${result.metrics.averageResponseTime.toFixed(0)}ms`);

    if (result.rollbackInfo?.triggered) {
      console.log(`   🔄 Rollback: ${result.rollbackInfo.reason}`);
    }

    if (!result.success) {
      console.error(`\n❌ Deployment failed at phase: ${result.currentPhase}`);
      process.exit(1);
    } else {
      console.log('\n🎉 Deployment completed successfully!');
    }
  } catch (error) {
    console.error('\n💥 Deployment error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const version = process.argv[2] || '1.0.0';
  const services = process.argv.slice(3).filter(arg => !arg.startsWith('--'));
  const dryRun = process.argv.includes('--dry-run');
  const strategy = process.argv.includes('--blue-green') ? 'blue-green' : 'canary';

  deployToProduction(version, services, { dryRun, strategy }).catch(console.error);
}
