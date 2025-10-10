/**
 * Agent Router for Code Quality Analysis
 *
 * Provides intelligent agent selection, fallback mechanisms, and resource management
 * for the Claude agent ecosystem.
 */

import { logWarn } from '@repo/observability';

// Types for agent routing
interface AgentCapability {
  name: string;
  description: string;
  taskTypes: string[];
  estimatedTimeMinutes: number;
  memoryRequirement: 'low' | 'medium' | 'high';
  reliability: number; // 0-1 score
  prerequisites?: string[];
  limitations?: string[];
}

interface TaskRequest {
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  maxRetries?: number;
  timeoutMinutes?: number;
  requiredCapabilities?: string[];
  context?: Record<string, any>;
}

interface AgentRouterOptions {
  maxConcurrentAgents?: number;
  memoryLimitMB?: number;
  globalTimeoutMinutes?: number;
  enableFallbacks?: boolean;
  retryStrategy?: 'exponential' | 'linear' | 'immediate';
}

export interface ProgressUpdate {
  agentName: string;
  taskId: string;
  progress: number; // 0-100
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  message: string;
  timestamp: number;
  estimatedRemainingMinutes?: number;
}

class AgentRouter {
  private agents: Map<string, AgentCapability> = new Map();
  private activeTasks: Map<string, AbortController> = new Map();
  private progressCallbacks: Set<(update: ProgressUpdate) => void> = new Set();
  private options: Required<AgentRouterOptions>;

  constructor(options: AgentRouterOptions = {}) {
    this.options = {
      maxConcurrentAgents: options.maxConcurrentAgents ?? 3,
      memoryLimitMB: options.memoryLimitMB ?? 2048,
      globalTimeoutMinutes: options.globalTimeoutMinutes ?? 30,
      enableFallbacks: options.enableFallbacks ?? true,
      retryStrategy: options.retryStrategy ?? 'exponential',
    };

    this.initializeAgents();
  }

  private initializeAgents(): void {
    // Core consolidated agents (reduced from 16 to 7)
    this.registerAgent({
      name: 'code-quality--discovery-analysis',
      description: 'Combined file discovery, analysis, and pattern detection',
      taskTypes: ['discover_files', 'analyze_code', 'detect_patterns', 'quality_check'],
      estimatedTimeMinutes: 8,
      memoryRequirement: 'medium',
      reliability: 0.95,
      limitations: ['Max 1000 files per batch', 'TypeScript/JavaScript focus'],
    });

    this.registerAgent({
      name: 'code-quality--dependency-modernization',
      description: 'Dependency analysis and modernization combined',
      taskTypes: ['analyze_dependencies', 'modernize_code', 'update_packages'],
      estimatedTimeMinutes: 12,
      memoryRequirement: 'high',
      reliability: 0.9,
      prerequisites: ['package.json exists', 'node_modules available'],
    });

    this.registerAgent({
      name: 'code-quality--context-session',
      description: 'Context detection and session management',
      taskTypes: ['detect_context', 'manage_session', 'setup_environment'],
      estimatedTimeMinutes: 3,
      memoryRequirement: 'low',
      reliability: 0.98,
    });

    this.registerAgent({
      name: 'code-quality--worktree',
      description: 'Git worktree operations for safe isolation',
      taskTypes: ['create_worktree', 'cleanup_worktree', 'git_operations'],
      estimatedTimeMinutes: 5,
      memoryRequirement: 'low',
      reliability: 0.92,
      prerequisites: ['Git repository', 'Write permissions'],
    });

    this.registerAgent({
      name: 'code-quality--transformation',
      description: 'Code transformations: word removal, refactoring, mock centralization',
      taskTypes: ['remove_words', 'refactor_code', 'centralize_mocks', 'apply_fixes'],
      estimatedTimeMinutes: 10,
      memoryRequirement: 'medium',
      reliability: 0.88,
      limitations: ['May require compilation validation'],
    });

    this.registerAgent({
      name: 'code-quality--vercel-optimization',
      description: 'Vercel-specific optimizations and performance improvements',
      taskTypes: ['vercel_optimization', 'performance_analysis', 'bundle_analysis'],
      estimatedTimeMinutes: 6,
      memoryRequirement: 'medium',
      reliability: 0.85,
      prerequisites: ['Vercel project detected'],
    });

    this.registerAgent({
      name: 'code-quality--reporting-pr',
      description: 'Report generation and pull request creation',
      taskTypes: ['generate_report', 'create_pr', 'finalize_analysis'],
      estimatedTimeMinutes: 4,
      memoryRequirement: 'low',
      reliability: 0.93,
      prerequisites: ['Git repository', 'GitHub CLI available'],
    });

    // Phase 1 & 2 new agents
    this.registerAgent({
      name: 'code-quality--security-scanner',
      description: 'Comprehensive security vulnerability scanning',
      taskTypes: ['security_scan', 'vulnerability_check', 'secret_detection', 'dependency_audit'],
      estimatedTimeMinutes: 10,
      memoryRequirement: 'medium',
      reliability: 0.94,
      limitations: ['Pattern-based detection', 'May have false positives'],
    });

    this.registerAgent({
      name: 'code-quality--test-coverage',
      description: 'Test coverage analysis and test generation',
      taskTypes: ['coverage_analysis', 'test_generation', 'test_coverage', 'generate_tests'],
      estimatedTimeMinutes: 15,
      memoryRequirement: 'high',
      reliability: 0.91,
      prerequisites: ['Test framework detected'],
      limitations: ['Generated tests need review'],
    });

    this.registerAgent({
      name: 'code-quality--performance-profiler',
      description: 'Performance analysis and optimization recommendations',
      taskTypes: ['performance_profile', 'bundle_analysis', 'optimization_check', 'profile_app'],
      estimatedTimeMinutes: 20,
      memoryRequirement: 'high',
      reliability: 0.89,
      prerequisites: ['Build output available'],
      limitations: ['Static analysis only'],
    });

    this.registerAgent({
      name: 'code-quality--documentation-generator',
      description: 'Automatic documentation generation from code',
      taskTypes: ['generate_docs', 'api_documentation', 'component_docs', 'create_documentation'],
      estimatedTimeMinutes: 8,
      memoryRequirement: 'medium',
      reliability: 0.92,
      limitations: ['Requires code comments for context'],
    });
  }

  public registerAgent(capability: AgentCapability): void {
    this.agents.set(capability.name, capability);
  }

  public onProgress(callback: (update: ProgressUpdate) => void): void {
    this.progressCallbacks.add(callback);
  }

  public offProgress(callback: (update: ProgressUpdate) => void): void {
    this.progressCallbacks.delete(callback);
  }

  private emitProgress(update: ProgressUpdate): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        logWarn('Progress callback error:', { error });
      }
    });
  }

  /**
   * Select the best agent for a given task with fallback options
   */
  public selectAgent(task: TaskRequest): { primary: string; fallbacks: string[] } {
    const candidates: Array<{ name: string; score: number; capability: AgentCapability }> = [];

    for (const [name, capability] of this.agents) {
      // Check if agent can handle this task type
      const canHandle = capability.taskTypes.some(
        type => task.type === type || task.type.includes(type) || type.includes(task.type),
      );

      if (!canHandle) continue;

      // Check prerequisites if specified
      if (task.requiredCapabilities) {
        const hasRequired = task.requiredCapabilities.every(req =>
          capability.taskTypes.includes(req),
        );
        if (!hasRequired) continue;
      }

      // Calculate selection score
      let score = capability.reliability * 100;

      // Prefer agents with lower resource requirements for high-priority tasks
      if (task.priority === 'critical' || task.priority === 'high') {
        if (capability.memoryRequirement === 'low') score += 20;
        if (capability.memoryRequirement === 'high') score -= 10;
      }

      // Prefer faster agents for urgent tasks
      if (task.priority === 'critical') {
        score += Math.max(0, 20 - capability.estimatedTimeMinutes);
      }

      // Exact task type match bonus
      if (capability.taskTypes.includes(task.type)) {
        score += 30;
      }

      candidates.push({ name, score, capability });
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length === 0) {
      throw new Error(`No agent found capable of handling task type: ${task.type}`);
    }

    const primary = candidates[0].name;
    const fallbacks = candidates.slice(1, 3).map(c => c.name); // Up to 2 fallbacks

    return { primary, fallbacks };
  }

  /**
   * Execute a task with automatic agent selection and fallback handling
   */
  public async executeTask(task: TaskRequest): Promise<any> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const controller = new AbortController();
    this.activeTasks.set(taskId, controller);

    try {
      return await this.executeTaskWithFallback(task, taskId, controller.signal);
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  private async executeTaskWithFallback(
    task: TaskRequest,
    taskId: string,
    signal: AbortSignal,
  ): Promise<any> {
    const { primary, fallbacks } = this.selectAgent(task);
    const agents = [primary, ...fallbacks];
    let lastError: Error | null = null;

    for (let i = 0; i < agents.length; i++) {
      const agentName = agents[i];
      const isMainAttempt = i === 0;
      const isFallback = i > 0;

      if (signal.aborted) {
        throw new Error('Task was cancelled');
      }

      try {
        this.emitProgress({
          agentName,
          taskId,
          progress: 0,
          status: 'running',
          message: isFallback
            ? `Trying fallback agent ${i}/${fallbacks.length}`
            : 'Starting task execution',
          timestamp: Date.now(),
        });

        const result = await this.executeAgentTask(agentName, task, taskId, signal);

        this.emitProgress({
          agentName,
          taskId,
          progress: 100,
          status: 'completed',
          message: 'Task completed successfully',
          timestamp: Date.now(),
        });

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        this.emitProgress({
          agentName,
          taskId,
          progress: 0,
          status: 'failed',
          message: `Agent failed: ${lastError.message}`,
          timestamp: Date.now(),
        });

        logWarn(`Agent ${agentName} failed for task ${task.type}:`, { error: lastError.message });

        // If this is not the last agent and fallbacks are enabled, try the next one
        if (i < agents.length - 1 && this.options.enableFallbacks) {
          logWarn(`Trying fallback agent for task ${task.type}...`, {});
          continue;
        }

        // No more fallbacks, re-throw the error
        break;
      }
    }

    // All agents failed
    throw new Error(
      `All agents failed for task ${task.type}. Last error: ${lastError?.message || 'Unknown error'}`,
    );
  }

  private async executeAgentTask(
    agentName: string,
    task: TaskRequest,
    taskId: string,
    signal: AbortSignal,
  ): Promise<any> {
    const capability = this.agents.get(agentName);
    if (!capability) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Check memory constraints
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > this.options.memoryLimitMB && capability.memoryRequirement === 'high') {
      throw new Error('Insufficient memory for high-requirement agent');
    }

    // Set up timeout
    const timeoutMs = (task.timeoutMinutes ?? capability.estimatedTimeMinutes * 2) * 60 * 1000;
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    // Combine signals
    const combinedController = new AbortController();
    const cleanup = () => {
      clearTimeout(timeoutId);
      combinedController.abort();
    };

    signal.addEventListener('abort', cleanup);
    timeoutController.signal.addEventListener('abort', cleanup);

    try {
      // Progress simulation (since we can't easily track real progress)
      const progressInterval = setInterval(() => {
        if (!combinedController.signal.aborted) {
          const elapsed = Date.now() - startTime;
          const estimated = capability.estimatedTimeMinutes * 60 * 1000;
          const progress = Math.min(90, (elapsed / estimated) * 100);

          this.emitProgress({
            agentName,
            taskId,
            progress,
            status: 'running',
            message: `Processing... (${Math.round(progress)}%)`,
            timestamp: Date.now(),
            estimatedRemainingMinutes: Math.max(
              0,
              capability.estimatedTimeMinutes - elapsed / 60000,
            ),
          });
        }
      }, 5000); // Update every 5 seconds

      const startTime = Date.now();

      // Execute the actual agent task
      const result = await this.callAgent(agentName, task, combinedController.signal);

      clearInterval(progressInterval);
      return result;
    } finally {
      clearTimeout(timeoutId);
      signal.removeEventListener('abort', cleanup);
      timeoutController.signal.removeEventListener('abort', cleanup);
    }
  }

  private async callAgent(agentName: string, task: TaskRequest, signal: AbortSignal): Promise<any> {
    // This would integrate with the actual Task tool or agent execution system
    // For now, we'll simulate the call structure

    const agentRequest = {
      version: '1.0',
      action: task.type,
      description: task.description,
      context: task.context || {},
      priority: task.priority,
      signal: signal, // Pass abort signal if supported
    };

    // In a real implementation, this would use the Task tool:
    // return await Task({
    //   subagent_type: agentName,
    //   description: task.description,
    //   prompt: `REQUEST: ${JSON.stringify(agentRequest)}`
    // });

    // For now, return a mock response indicating the structure
    return {
      agentName,
      taskType: task.type,
      success: true,
      message: `Task ${task.type} would be executed by ${agentName}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Cancel a running task
   */
  public cancelTask(taskId: string): boolean {
    const controller = this.activeTasks.get(taskId);
    if (controller) {
      controller.abort();
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all running tasks
   */
  public cancelAllTasks(): void {
    for (const [taskId, controller] of this.activeTasks) {
      controller.abort();
    }
    this.activeTasks.clear();
  }

  /**
   * Get current resource usage
   */
  public getResourceUsage(): {
    activeTasks: number;
    memoryUsageMB: number;
    memoryLimitMB: number;
    memoryUtilization: number;
  } {
    const memoryUsage = this.getMemoryUsage();
    return {
      activeTasks: this.activeTasks.size,
      memoryUsageMB: memoryUsage,
      memoryLimitMB: this.options.memoryLimitMB,
      memoryUtilization: (memoryUsage / this.options.memoryLimitMB) * 100,
    };
  }

  private getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024); // MB
  }

  /**
   * Get agent recommendations for a task
   */
  public getRecommendations(task: TaskRequest): Array<{
    agentName: string;
    capability: AgentCapability;
    suitabilityScore: number;
    reasoningText: string[];
  }> {
    const recommendations: Array<{
      agentName: string;
      capability: AgentCapability;
      suitabilityScore: number;
      reasoningText: string[];
    }> = [];

    for (const [name, capability] of this.agents) {
      const reasoning: string[] = [];
      let score = 0;

      // Task type compatibility
      const canHandle = capability.taskTypes.some(
        type => task.type === type || task.type.includes(type) || type.includes(task.type),
      );

      if (!canHandle) continue;

      reasoning.push(`Can handle task type: ${task.type}`);
      score += 30;

      // Reliability factor
      score += capability.reliability * 40;
      reasoning.push(`Reliability: ${(capability.reliability * 100).toFixed(0)}%`);

      // Resource efficiency
      if (capability.memoryRequirement === 'low') {
        score += 15;
        reasoning.push('Low memory requirement');
      }

      // Time efficiency
      if (capability.estimatedTimeMinutes <= 5) {
        score += 10;
        reasoning.push('Quick execution');
      }

      // Priority alignment
      if (task.priority === 'critical' && capability.reliability > 0.9) {
        score += 15;
        reasoning.push('High reliability for critical task');
      }

      // Limitations check
      if (capability.limitations && capability.limitations.length > 0) {
        score -= 5;
        reasoning.push(`Has limitations: ${capability.limitations.join(', ')}`);
      }

      recommendations.push({
        agentName: name,
        capability,
        suitabilityScore: score,
        reasoningText: reasoning,
      });
    }

    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 5); // Top 5 recommendations
  }

  /**
   * Health check for all agents
   */
  public async healthCheck(): Promise<Map<string, { healthy: boolean; error?: string }>> {
    const results = new Map<string, { healthy: boolean; error?: string }>();

    for (const [name] of this.agents) {
      try {
        // In a real implementation, this would ping the agent
        // For now, simulate a basic health check
        const memoryOk = this.getMemoryUsage() < this.options.memoryLimitMB * 0.9;

        results.set(name, {
          healthy: memoryOk,
          error: memoryOk ? undefined : 'High memory usage detected',
        });
      } catch (error) {
        results.set(name, {
          healthy: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}

// Singleton instance for global use
export const agentRouter = new AgentRouter();

// Export utility functions
export function createTaskRequest(
  type: string,
  description: string,
  options: Partial<TaskRequest> = {},
): TaskRequest {
  return {
    type,
    description,
    priority: options.priority ?? 'medium',
    maxRetries: options.maxRetries ?? 2,
    timeoutMinutes: options.timeoutMinutes ?? 15,
    requiredCapabilities: options.requiredCapabilities,
    context: options.context,
  };
}

function isHighPriorityTask(task: TaskRequest): boolean {
  return task.priority === 'critical' || task.priority === 'high';
}

function estimateTaskTime(agentName: string): number {
  const capability = agentRouter['agents'].get(agentName);
  return capability?.estimatedTimeMinutes ?? 10;
}
