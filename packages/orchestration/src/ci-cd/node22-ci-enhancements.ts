/**
 * Node 22+ CI/CD Pipeline Enhancements
 *
 * Advanced CI/CD pipeline configurations and utilities that leverage Node.js 22+
 * features for improved build performance, better error handling, enhanced
 * monitoring, and optimized deployment processes.
 *
 * ## Key Enhancements:
 * - **Parallel Build Processing**: Using Promise.withResolvers() for better build coordination
 * - **Advanced Timeout Management**: AbortSignal.timeout() for build step timeouts
 * - **Secure Data Handling**: structuredClone() for safe configuration management
 * - **Memory-Efficient Tracking**: WeakMap/WeakSet for build artifact management
 * - **High-Precision Timing**: Accurate build performance measurements
 * - **Resource Cleanup**: Proper cleanup of build resources and temporary files
 *
 * ## Pipeline Stages:
 * - **Pre-build**: Dependency analysis and validation
 * - **Build**: Parallel compilation with intelligent caching
 * - **Test**: Concurrent testing with resource management
 * - **Quality**: Code quality checks and security scans
 * - **Package**: Artifact generation and optimization
 * - **Deploy**: Deployment with rollback capabilities
 *
 * @module Node22CiEnhancements
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { ChildProcess, spawn } from 'child_process';
import { createHash } from 'crypto';
import { readdir, readFile, rm, stat } from 'fs/promises';
import { basename, join, relative } from 'path';
import { performance } from 'perf_hooks';

/**
 * Build stage status
 */
type BuildStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';

/**
 * Build stage configuration
 */
interface BuildStageConfig {
  readonly name: string;
  readonly command: string;
  readonly args: string[];
  readonly timeout: number; // milliseconds
  readonly retryAttempts: number;
  readonly dependencies: string[]; // stage names that must complete first
  readonly condition?: (context: BuildContext) => boolean;
  readonly environment?: Record<string, string>;
  readonly cacheKey?: string;
  readonly parallel?: boolean;
}

/**
 * Build context shared across stages
 */
interface BuildContext {
  readonly projectRoot: string;
  readonly buildId: string;
  readonly timestamp: bigint;
  readonly nodeVersion: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly branch: string;
  readonly commit: string;
  readonly changedFiles: string[];
  readonly packageNames: string[];
  readonly buildArtifacts: Map<string, BuildArtifact>;
  readonly environmentVariables: Map<string, string>;
  readonly metrics: BuildMetrics;
}

/**
 * Build artifact information
 */
interface BuildArtifact {
  readonly name: string;
  readonly path: string;
  readonly size: number;
  readonly hash: string;
  readonly createdAt: bigint;
  readonly metadata: Record<string, any>;
}

/**
 * Build metrics collection
 */
interface BuildMetrics {
  readonly stages: Map<
    string,
    {
      status: BuildStageStatus;
      startTime?: bigint;
      endTime?: bigint;
      duration?: number; // milliseconds
      memoryUsage?: NodeJS.MemoryUsage;
      exitCode?: number;
      error?: Error;
      retryCount: number;
    }
  >;
  readonly overallDuration: number;
  readonly peakMemoryUsage: number;
  readonly cacheHitRate: number;
  readonly parallelEfficiency: number;
}

/**
 * Build stage result
 */
interface BuildStageResult {
  readonly stageName: string;
  readonly status: BuildStageStatus;
  readonly duration: number;
  readonly output: string;
  readonly error?: Error;
  readonly artifacts: BuildArtifact[];
  readonly metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    exitCode: number;
  };
}

/**
 * Cache entry for build optimization
 */
interface CacheEntry {
  readonly key: string;
  readonly value: any;
  readonly createdAt: bigint;
  readonly expiresAt: bigint;
  readonly metadata: Record<string, any>;
}

/**
 * Enhanced CI/CD Pipeline with Node 22+ features
 */
export class Node22CiPipeline {
  private readonly context: BuildContext;
  private readonly stages = new Map<string, BuildStageConfig>();
  private readonly stageResults = new Map<string, BuildStageResult>();
  private readonly processTracking = new WeakMap<
    ChildProcess,
    { stage: string; startTime: bigint }
  >();
  private readonly artifactTracking = new WeakSet<BuildArtifact>();
  private readonly buildCache = new Map<string, CacheEntry>();
  private readonly finalizationRegistry = new FinalizationRegistry(
    (processInfo: { pid: number; stage: string }) => {
      console.debug(
        `Process ${processInfo.pid} from stage ${processInfo.stage} was garbage collected`,
      );
    },
  );

  constructor(config: {
    projectRoot: string;
    environment: 'development' | 'staging' | 'production';
    branch?: string;
    commit?: string;
  }) {
    this.context = {
      projectRoot: config.projectRoot,
      buildId: `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: process.hrtime.bigint(),
      nodeVersion: process.version,
      environment: config.environment,
      branch: config.branch || 'unknown',
      commit: config.commit || 'unknown',
      changedFiles: [],
      packageNames: [],
      buildArtifacts: new Map(),
      environmentVariables: new Map(),
      metrics: {
        stages: new Map(),
        overallDuration: 0,
        peakMemoryUsage: 0,
        cacheHitRate: 0,
        parallelEfficiency: 0,
      } as any,
    };
  }

  /**
   * Configure build stages with Node 22+ enhancements
   */
  configureStages(stages: BuildStageConfig[]): void {
    stages.forEach(stage => {
      this.stages.set(stage.name, structuredClone(stage)); // Safe configuration cloning

      // Initialize stage metrics
      this.context.metrics.stages.set(stage.name, {
        status: 'pending',
        retryCount: 0,
      });
    });
  }

  /**
   * Execute the complete CI/CD pipeline
   */
  async executePipeline(
    options: {
      abortSignal?: AbortSignal;
      onStageStart?: (stageName: string) => void;
      onStageComplete?: (result: BuildStageResult) => void;
      onProgress?: (completed: number, total: number) => void;
    } = {},
  ): Promise<{
    success: boolean;
    results: BuildStageResult[];
    metrics: BuildMetrics;
    artifacts: BuildArtifact[];
  }> {
    const { abortSignal, onStageStart, onStageComplete, onProgress } = options;
    const pipelineStartTime = process.hrtime.bigint();

    try {
      // Pre-build initialization
      await this.initializeBuildContext();

      // Get execution order considering dependencies
      const executionPlan = this.createExecutionPlan();
      const results: BuildStageResult[] = [];
      let completedStages = 0;

      // Execute stages according to plan
      for (const stageGroup of executionPlan) {
        // Check for cancellation
        if (abortSignal?.aborted) {
          throw new Error('Pipeline execution was cancelled');
        }

        // Execute stages in parallel where possible
        const stagePromises = stageGroup.map(stageName =>
          this.executeStageWithRetry(stageName, abortSignal, onStageStart),
        );

        const stageResults = await this.executeWithCoordination(
          stagePromises,
          { timeout: 300000, abortSignal }, // 5 minute timeout per stage group
        );

        // Process results and update metrics
        stageResults.forEach(result => {
          results.push(result);
          this.stageResults.set(result.stageName, result);

          completedStages++;
          onStageComplete?.(result);
          onProgress?.(completedStages, this.stages.size);

          // Fail fast if critical stage fails
          if (result.status === 'failed' && this.isCriticalStage(result.stageName)) {
            throw new Error(`Critical stage ${result.stageName} failed: ${result.error?.message}`);
          }
        });
      }

      // Finalize pipeline
      const pipelineEndTime = process.hrtime.bigint();
      this.context.metrics.overallDuration =
        Number(pipelineEndTime - pipelineStartTime) / 1_000_000;

      return {
        success: results.every(r => r.status === 'completed' || r.status === 'skipped'),
        results,
        metrics: this.calculateFinalMetrics(),
        artifacts: Array.from(this.context.buildArtifacts.values()),
      };
    } catch (error) {
      const pipelineEndTime = process.hrtime.bigint();
      this.context.metrics.overallDuration =
        Number(pipelineEndTime - pipelineStartTime) / 1_000_000;

      return {
        success: false,
        results: Array.from(this.stageResults.values()),
        metrics: this.calculateFinalMetrics(),
        artifacts: Array.from(this.context.buildArtifacts.values()),
      };
    } finally {
      // Cleanup build resources
      await this.performCleanup();
    }
  }

  /**
   * Execute stage with retry logic and Node 22+ features
   */
  private async executeStageWithRetry(
    stageName: string,
    abortSignal?: AbortSignal,
    onStageStart?: (stageName: string) => void,
  ): Promise<BuildStageResult> {
    const stage = this.stages.get(stageName);
    if (!stage) {
      throw new Error(`Stage ${stageName} not found`);
    }

    const stageMetrics = this.context.metrics.stages.get(stageName)!;
    let lastError: Error | undefined;

    // Check stage condition
    if (stage.condition && !stage.condition(this.context)) {
      stageMetrics.status = 'skipped';
      return {
        stageName,
        status: 'skipped',
        duration: 0,
        output: 'Stage skipped due to condition',
        artifacts: [],
        metrics: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          exitCode: 0,
        },
      };
    }

    // Execute with retry logic
    for (let attempt = 1; attempt <= stage.retryAttempts + 1; attempt++) {
      stageMetrics.retryCount = attempt - 1;

      try {
        onStageStart?.(stageName);

        const result = await this.executeStage(stage, abortSignal);

        stageMetrics.status = 'completed';
        stageMetrics.endTime = process.hrtime.bigint();
        stageMetrics.duration = result.duration;

        return result;
      } catch (error) {
        lastError = error as Error;
        stageMetrics.error = lastError;

        // Don't retry if cancelled
        if (abortSignal?.aborted) {
          stageMetrics.status = 'cancelled';
          break;
        }

        // Don't retry on final attempt
        if (attempt > stage.retryAttempts) {
          stageMetrics.status = 'failed';
          break;
        }

        // Exponential backoff before retry
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, delay);

          abortSignal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timeoutId);
              reject(new Error('Retry cancelled'));
            },
            { once: true },
          );
        });
      }
    }

    // Return failure result
    return {
      stageName,
      status: stageMetrics.status,
      duration: stageMetrics.duration || 0,
      output: lastError?.message || 'Stage failed',
      error: lastError,
      artifacts: [],
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        exitCode: -1,
      },
    };
  }

  /**
   * Execute individual stage with Node 22+ features
   */
  private async executeStage(
    stage: BuildStageConfig,
    abortSignal?: AbortSignal,
  ): Promise<BuildStageResult> {
    const startTime = process.hrtime.bigint();
    const initialMemory = process.memoryUsage();
    const initialCpu = process.cpuUsage();

    // Update stage metrics
    const stageMetrics = this.context.metrics.stages.get(stage.name)!;
    stageMetrics.status = 'running';
    stageMetrics.startTime = startTime;
    stageMetrics.memoryUsage = initialMemory;

    // Check cache if cache key is provided
    if (stage.cacheKey) {
      const cachedResult = await this.checkCache(stage.cacheKey);
      if (cachedResult) {
        return {
          stageName: stage.name,
          status: 'completed',
          duration: Number(process.hrtime.bigint() - startTime) / 1_000_000,
          output: 'Result retrieved from cache',
          artifacts: cachedResult.artifacts || [],
          metrics: {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            exitCode: 0,
          },
        };
      }
    }

    // Create combined abort signal with timeout
    const timeoutSignal = AbortSignal.timeout(stage.timeout);
    const combinedSignal = abortSignal
      ? AbortSignal.any([abortSignal, timeoutSignal])
      : timeoutSignal;

    // Execute stage command
    const {
      promise: executionPromise,
      resolve,
      reject,
    } = Promise.withResolvers<{
      output: string;
      exitCode: number;
      artifacts: BuildArtifact[];
    }>();

    const process = spawn(stage.command, stage.args, {
      cwd: this.context.projectRoot,
      env: { ...process.env, ...stage.environment },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Track process for cleanup
    this.processTracking.set(process, { stage: stage.name, startTime });
    this.finalizationRegistry.register(process, { pid: process.pid!, stage: stage.name });

    let output = '';
    let errorOutput = '';

    // Collect stdout and stderr
    process.stdout?.on('data', data => {
      output += data.toString();
    });

    process.stderr?.on('data', data => {
      errorOutput += data.toString();
    });

    // Handle process completion
    process.on('close', async exitCode => {
      try {
        const artifacts = await this.collectStageArtifacts(stage.name);

        if (exitCode === 0) {
          // Cache successful result
          if (stage.cacheKey) {
            await this.cacheResult(stage.cacheKey, { output, artifacts });
          }

          resolve({ output, exitCode, artifacts });
        } else {
          reject(new Error(`Stage failed with exit code ${exitCode}: ${errorOutput || output}`));
        }
      } catch (error) {
        reject(error);
      }
    });

    process.on('error', error => {
      reject(new Error(`Process error: ${error.message}`));
    });

    // Handle cancellation
    combinedSignal.addEventListener(
      'abort',
      () => {
        if (!process.killed) {
          process.kill('SIGTERM');

          // Force kill after grace period
          setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
          }, 5000);
        }

        reject(new Error(`Stage ${stage.name} was cancelled or timed out`));
      },
      { once: true },
    );

    try {
      const result = await executionPromise;
      const endTime = process.hrtime.bigint();
      const finalMemory = process.memoryUsage();
      const finalCpu = process.cpuUsage(initialCpu);

      // Add artifacts to context
      result.artifacts.forEach(artifact => {
        this.context.buildArtifacts.set(artifact.name, artifact);
        this.artifactTracking.add(artifact);
      });

      return {
        stageName: stage.name,
        status: 'completed',
        duration: Number(endTime - startTime) / 1_000_000,
        output: result.output,
        artifacts: result.artifacts,
        metrics: {
          memoryUsage: finalMemory,
          cpuUsage: finalCpu,
          exitCode: result.exitCode,
        },
      };
    } catch (error) {
      const endTime = process.hrtime.bigint();

      return {
        stageName: stage.name,
        status: 'failed',
        duration: Number(endTime - startTime) / 1_000_000,
        output: errorOutput || output,
        error: error as Error,
        artifacts: [],
        metrics: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(initialCpu),
          exitCode: -1,
        },
      };
    }
  }

  /**
   * Coordinated promise execution using Promise.withResolvers()
   */
  private async executeWithCoordination<T>(
    promises: Promise<T>[],
    options: {
      timeout?: number;
      abortSignal?: AbortSignal;
      failFast?: boolean;
    } = {},
  ): Promise<T[]> {
    const { timeout = 30000, abortSignal, failFast = false } = options;

    const { promise: coordinationPromise, resolve, reject } = Promise.withResolvers<T[]>();

    // Create timeout if specified
    let timeoutId: NodeJS.Timeout | null = null;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        reject(new Error(`Coordination timeout after ${timeout}ms`));
      }, timeout);
    }

    // Handle abort signal
    if (abortSignal) {
      abortSignal.addEventListener(
        'abort',
        () => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(new Error('Coordination aborted'));
        },
        { once: true },
      );
    }

    try {
      const results = failFast
        ? await Promise.all(promises)
        : await Promise.allSettled(promises).then(results =>
            results.map(result => {
              if (result.status === 'rejected') {
                throw result.reason;
              }
              return result.value;
            }),
          );

      if (timeoutId) clearTimeout(timeoutId);
      resolve(results);
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    }

    return coordinationPromise;
  }

  /**
   * Initialize build context with environment detection
   */
  private async initializeBuildContext(): Promise<void> {
    try {
      // Detect changed files (simplified - would use git in real implementation)
      this.context.changedFiles.push(...(await this.detectChangedFiles()));

      // Discover packages
      this.context.packageNames.push(...(await this.discoverPackages()));

      // Load environment variables
      await this.loadEnvironmentVariables();
    } catch (error) {
      console.warn('Failed to initialize build context:', error);
    }
  }

  /**
   * Create execution plan considering dependencies
   */
  private createExecutionPlan(): string[][] {
    const stages = Array.from(this.stages.keys());
    const plan: string[][] = [];
    const processed = new Set<string>();
    const inProgress = new Set<string>();

    const canExecute = (stageName: string): boolean => {
      const stage = this.stages.get(stageName)!;
      return stage.dependencies.every(dep => processed.has(dep));
    };

    while (processed.size < stages.length) {
      const readyStages = stages.filter(
        stage => !processed.has(stage) && !inProgress.has(stage) && canExecute(stage),
      );

      if (readyStages.length === 0) {
        // Check for circular dependencies
        const remaining = stages.filter(stage => !processed.has(stage));
        throw new Error(`Circular dependency detected in stages: ${remaining.join(', ')}`);
      }

      plan.push(readyStages);
      readyStages.forEach(stage => {
        inProgress.add(stage);
        processed.add(stage);
      });
    }

    return plan;
  }

  /**
   * Collect artifacts produced by a stage
   */
  private async collectStageArtifacts(stageName: string): Promise<BuildArtifact[]> {
    const artifacts: BuildArtifact[] = [];

    // Define common artifact patterns by stage name
    const artifactPatterns: Record<string, string[]> = {
      build: ['dist/**/*', 'build/**/*', '*.tgz'],
      test: ['coverage/**/*', 'test-results/**/*'],
      lint: ['lint-results.json', 'eslint-report.html'],
      package: ['*.tgz', 'packages/**/*.tgz'],
      docker: ['Dockerfile.*', 'docker-compose.*.yml'],
    };

    const patterns = artifactPatterns[stageName] || [];

    for (const pattern of patterns) {
      try {
        const files = await this.findFiles(this.context.projectRoot, pattern);

        for (const file of files) {
          const stats = await stat(file);
          const content = await readFile(file);
          const hash = createHash('sha256').update(content).digest('hex');

          const artifact: BuildArtifact = {
            name: basename(file),
            path: relative(this.context.projectRoot, file),
            size: stats.size,
            hash,
            createdAt: process.hrtime.bigint(),
            metadata: {
              stageName,
              buildId: this.context.buildId,
              lastModified: stats.mtime.toISOString(),
            },
          };

          artifacts.push(artifact);
        }
      } catch (error) {
        // Pattern might not match any files
        console.debug(`No artifacts found for pattern ${pattern} in stage ${stageName}`);
      }
    }

    return artifacts;
  }

  /**
   * Cache management with Node 22+ features
   */
  private async checkCache(cacheKey: string): Promise<any> {
    const entry = this.buildCache.get(cacheKey);

    if (!entry) return null;

    // Check if cache entry is still valid
    const now = process.hrtime.bigint();
    if (now > entry.expiresAt) {
      this.buildCache.delete(cacheKey);
      return null;
    }

    return entry.value;
  }

  private async cacheResult(cacheKey: string, value: any, ttl: number = 3600000): Promise<void> {
    const now = process.hrtime.bigint();

    const entry: CacheEntry = {
      key: cacheKey,
      value: structuredClone(value), // Safe value cloning
      createdAt: now,
      expiresAt: now + BigInt(ttl * 1_000_000), // Convert ms to nanoseconds
      metadata: {
        buildId: this.context.buildId,
        nodeVersion: this.context.nodeVersion,
      },
    };

    this.buildCache.set(cacheKey, entry);
  }

  /**
   * Helper methods
   */
  private async detectChangedFiles(): Promise<string[]> {
    // Simplified implementation - would use git diff in real scenario
    return [];
  }

  private async discoverPackages(): Promise<string[]> {
    try {
      const packagesDir = join(this.context.projectRoot, 'packages');
      const entries = await readdir(packagesDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name);
    } catch {
      return [];
    }
  }

  private async loadEnvironmentVariables(): Promise<void> {
    // Load environment-specific variables
    const envFiles = ['.env', `.env.${this.context.environment}`, '.env.local'];

    for (const envFile of envFiles) {
      try {
        const envPath = join(this.context.projectRoot, envFile);
        const content = await readFile(envPath, 'utf-8');

        content.split('\n').forEach(line => {
          const [key, ...valueParts] = line.trim().split('=');
          if (key && valueParts.length > 0) {
            this.context.environmentVariables.set(key, valueParts.join('='));
          }
        });
      } catch {
        // Environment file might not exist
      }
    }
  }

  private async findFiles(directory: string, pattern: string): Promise<string[]> {
    // Simplified glob implementation
    const files: string[] = [];

    try {
      const entries = await readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isFile() && entry.name.match(pattern.replace('*', '.*'))) {
          files.push(fullPath);
        } else if (entry.isDirectory() && pattern.includes('**')) {
          const subFiles = await this.findFiles(fullPath, pattern);
          files.push(...subFiles);
        }
      }
    } catch {
      // Directory might not exist
    }

    return files;
  }

  private isCriticalStage(stageName: string): boolean {
    const criticalStages = ['build', 'security-scan', 'dependency-check'];
    return criticalStages.includes(stageName);
  }

  private calculateFinalMetrics(): BuildMetrics {
    const stages = Array.from(this.context.metrics.stages.values());
    const completedStages = stages.filter(s => s.status === 'completed');

    // Calculate cache hit rate
    const totalCacheChecks = stages.length;
    const cacheHits = stages.filter(s => s.duration && s.duration < 1000).length; // Simplified
    const cacheHitRate = totalCacheChecks > 0 ? (cacheHits / totalCacheChecks) * 100 : 0;

    // Calculate parallel efficiency (simplified)
    const totalStageTime = stages.reduce((sum, stage) => sum + (stage.duration || 0), 0);
    const parallelEfficiency =
      this.context.metrics.overallDuration > 0
        ? (totalStageTime / this.context.metrics.overallDuration) * 100
        : 0;

    // Calculate peak memory usage
    const peakMemoryUsage = stages.reduce(
      (max, stage) => Math.max(max, stage.memoryUsage?.heapUsed || 0),
      0,
    );

    return {
      stages: this.context.metrics.stages,
      overallDuration: this.context.metrics.overallDuration,
      peakMemoryUsage,
      cacheHitRate,
      parallelEfficiency: Math.min(100, parallelEfficiency),
    };
  }

  /**
   * Cleanup build resources using FinalizationRegistry patterns
   */
  private async performCleanup(): Promise<void> {
    try {
      // Clean up temporary directories
      const tempDirs = ['temp', 'tmp', '.build-temp'];

      for (const dir of tempDirs) {
        const dirPath = join(this.context.projectRoot, dir);
        try {
          await rm(dirPath, { recursive: true, force: true });
        } catch {
          // Directory might not exist
        }
      }

      // Clear caches older than 1 hour
      const now = process.hrtime.bigint();
      const oneHour = BigInt(3600000 * 1_000_000); // 1 hour in nanoseconds

      for (const [key, entry] of this.buildCache.entries()) {
        if (now - entry.createdAt > oneHour) {
          this.buildCache.delete(key);
        }
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }
}

/**
 * Predefined CI/CD stage configurations optimized for Node 22+
 */
export const Node22CiStages = {
  /**
   * Pre-build validation and setup
   */
  prebuild: {
    name: 'prebuild',
    command: 'node',
    args: ['--experimental-strip-types', 'scripts/prebuild.ts'],
    timeout: 60000,
    retryAttempts: 1,
    dependencies: [],
    parallel: false,
    cacheKey: 'prebuild-validation',
  },

  /**
   * Install dependencies with Node 22+ optimizations
   */
  install: {
    name: 'install',
    command: 'pnpm',
    args: ['install', '--frozen-lockfile', '--prefer-offline'],
    timeout: 300000,
    retryAttempts: 2,
    dependencies: ['prebuild'],
    parallel: false,
    cacheKey: 'node_modules',
  },

  /**
   * Build packages in parallel
   */
  build: {
    name: 'build',
    command: 'pnpm',
    args: ['build'],
    timeout: 600000,
    retryAttempts: 1,
    dependencies: ['install'],
    parallel: true,
    environment: {
      NODE_OPTIONS: '--experimental-strip-types --max-old-space-size=4096',
    },
  },

  /**
   * Run tests with Node 22+ features
   */
  test: {
    name: 'test',
    command: 'pnpm',
    args: ['test', '--coverage', '--reporter=json'],
    timeout: 300000,
    retryAttempts: 2,
    dependencies: ['build'],
    parallel: true,
    environment: {
      NODE_OPTIONS: '--experimental-strip-types',
    },
  },

  /**
   * Code quality checks
   */
  lint: {
    name: 'lint',
    command: 'pnpm',
    args: ['lint', '--format', 'json'],
    timeout: 120000,
    retryAttempts: 1,
    dependencies: ['install'],
    parallel: true,
  },

  /**
   * Type checking with Node 22+ support
   */
  typecheck: {
    name: 'typecheck',
    command: 'pnpm',
    args: ['typecheck'],
    timeout: 180000,
    retryAttempts: 1,
    dependencies: ['install'],
    parallel: true,
    environment: {
      NODE_OPTIONS: '--experimental-strip-types',
    },
  },

  /**
   * Security scanning
   */
  security: {
    name: 'security',
    command: 'pnpm',
    args: ['audit', '--audit-level', 'moderate'],
    timeout: 120000,
    retryAttempts: 1,
    dependencies: ['install'],
    parallel: true,
  },

  /**
   * Package artifacts
   */
  package: {
    name: 'package',
    command: 'pnpm',
    args: ['package'],
    timeout: 180000,
    retryAttempts: 1,
    dependencies: ['build', 'test', 'lint', 'typecheck'],
    parallel: false,
  },
} as const satisfies Record<string, BuildStageConfig>;

/**
 * Factory function to create optimized CI pipeline
 */
export function createNode22Pipeline(config: {
  projectRoot: string;
  environment: 'development' | 'staging' | 'production';
  branch?: string;
  commit?: string;
  customStages?: BuildStageConfig[];
}): Node22CiPipeline {
  const pipeline = new Node22CiPipeline(config);

  // Configure standard stages
  const stages = Object.values(Node22CiStages);

  // Add custom stages if provided
  if (config.customStages) {
    stages.push(...config.customStages);
  }

  pipeline.configureStages(stages);

  return pipeline;
}

/**
 * CLI function to run pipeline
 */
export async function runNode22Pipeline(
  projectRoot: string = process.cwd(),
  environment: 'development' | 'staging' | 'production' = 'development',
): Promise<void> {
  const pipeline = createNode22Pipeline({
    projectRoot,
    environment,
    branch: process.env.CI_BRANCH,
    commit: process.env.CI_COMMIT,
  });

  console.log(`🚀 Starting Node 22+ CI/CD Pipeline (${environment})`);
  console.log(`📍 Project: ${projectRoot}`);
  console.log(`🌿 Branch: ${process.env.CI_BRANCH || 'unknown'}`);
  console.log(`📝 Commit: ${process.env.CI_COMMIT || 'unknown'}`);

  const startTime = performance.now();

  try {
    const result = await pipeline.executePipeline({
      onStageStart: stageName => {
        console.log(`⏳ Starting stage: ${stageName}`);
      },
      onStageComplete: result => {
        const icon =
          result.status === 'completed'
            ? '✅'
            : result.status === 'failed'
              ? '❌'
              : result.status === 'skipped'
                ? '⏭️'
                : '🔄';
        console.log(
          `${icon} ${result.stageName}: ${result.status} (${result.duration.toFixed(2)}ms)`,
        );

        if (result.artifacts.length > 0) {
          console.log(`   📦 Artifacts: ${result.artifacts.length}`);
        }

        if (result.error) {
          console.error(`   ❌ Error: ${result.error.message}`);
        }
      },
    });

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log('\n📊 Pipeline Summary:');
    console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Duration: ${totalTime.toFixed(2)}ms`);
    console.log(`   Stages: ${result.results.length}`);
    console.log(`   Artifacts: ${result.artifacts.length}`);
    console.log(`   Cache Hit Rate: ${result.metrics.cacheHitRate.toFixed(1)}%`);
    console.log(`   Parallel Efficiency: ${result.metrics.parallelEfficiency.toFixed(1)}%`);
    console.log(`   Peak Memory: ${Math.round(result.metrics.peakMemoryUsage / 1024 / 1024)}MB`);

    if (!result.success) {
      const failedStages = result.results.filter(r => r.status === 'failed');
      console.log('\n❌ Failed Stages:');
      failedStages.forEach(stage => {
        console.log(`   - ${stage.stageName}: ${stage.error?.message}`);
      });

      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Pipeline execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const projectRoot = process.argv[2] || process.cwd();
  const environment = (process.argv[3] as any) || 'development';

  runNode22Pipeline(projectRoot, environment).catch(console.error);
}
