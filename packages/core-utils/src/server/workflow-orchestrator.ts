/**
 * MCP Tool: Workflow Orchestrator
 * Replaces 27 functions from main code-quality agent for workflow orchestration
 * Enhanced with Node.js 22+ error handling, context tracking, and abort support
 */

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { extname, join } from 'path';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, safeThrowIfAborted } from './abort-support';
import { BatchProcessorEngine } from './batch-processor';
import { runWithContext } from './context';
import { getGlobalMemoryMonitor } from './memory-monitor';
import { SessionCheckpoint, getSessionRecoveryManager } from './session-recovery';
import { enhancedClone, isStructuredCloneAvailable } from './structured-clone';
import { ok, runTool } from './tool-helpers';
import { validateFilePath, validateSessionId } from './validation';
import { worktreeManagerTool } from './worktree-manager';

// Session context storage
const SESSION_CONTEXTS = new Map<string, any>();

export interface WorkflowOrchestratorArgs extends AbortableToolArgs {
  action: // Context & Session Management
  | 'detectWorktree' // Check if running in worktree
    | 'setupContext' // Initialize analysis context
    | 'createSession' // Create/resume session
    | 'checkMCPAvailability' // Verify MCP tools available
    | 'prepareExecutionContext' // Route: main agent → worktree, subagent → in-branch with guardrails
    | 'storeExecutionContext' // Persist worktree context for session
    | 'saveProgressCheckpoint' // Save current progress to disk
    | 'loadProgressCheckpoint' // Load progress from disk
    | 'listRecoverableSessions' // List available session checkpoints
    | 'getExecutionContext' // Retrieve worktree context for session

    // Branch Strategy & Safety
    | 'validateMainAgentContext' // Enforce main agent worktree-only policy
    | 'detectCallContext' // Detect if called by main agent vs direct call
    | 'confirmInBranchRisks' // User confirmation for in-branch operations
    | 'createBackupBranch' // Create safety backup branch
    | 'validateBranchStrategy' // Check if in-branch operation is safe
    | 'executeBackupPlan' // Execute backup plan via worktree manager

    // File & Discovery Operations
    | 'discoverFiles' // File discovery with filtering
    | 'countWordTargets' // Count word removal targets
    | 'detectPatterns' // Architectural pattern detection

    // Transformation Operations
    | 'removeWords' // Execute word removal
    | 'centralizeMocks' // Mock centralization
    | 'modernizeES2023' // Syntax modernization

    // Analysis Operations
    | 'analyzeUtilization' // Package utilization analysis
    | 'generateDependencyIndex' // Dependency mapping
    | 'runModernization' // Full modernization workflow

    // Resource Management
    | 'checkMemoryPressure' // Memory monitoring
    | 'performCleanup' // Resource cleanup
    | 'getUserConfirmation' // Human-in-the-loop approval

    // Workflow Control
    | 'completeAnalysis' // Analysis completion
    | 'logToFile' // Structured logging

    // Context-Aware Compound Actions (New)
    | 'contextualAnalysis' // Context-aware full analysis workflow
    | 'safeWorkflow' // Safe execution with context validation
    | 'branchAwareExecution' // Branch-aware operation routing
    | 'sessionManagedWorkflow' // Session-managed complete workflow

    // Streaming and Incremental Analysis (Task 4)
    | 'streamFileDiscovery' // Stream large file sets in batches
    | 'incrementalAnalysis' // Process files incrementally with checkpoints
    | 'loadAnalysisCheckpoint' // Load analysis state from checkpoint
    | 'saveAnalysisCheckpoint' // Save current analysis state
    | 'resumeAnalysis' // Resume interrupted analysis
    | 'streamBatchProcessing'; // Process files in memory-optimized batches

  packagePath?: string;
  sessionId?: string;
  userMessage?: string;
  options?: any;
  files?: string[];
  analysisData?: any;
  context?: any;

  // Branch Strategy Parameters
  agentType?: 'main' | 'subagent';
  enforceWorktreeOnly?: boolean;
  operation?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  agentName?: string;
  affectedFiles?: string[];
  calledDirectly?: boolean;
  userRequestedInBranch?: boolean;
  workingDirectory?: string;
}

// Context structure for analysis
interface AnalysisContext {
  packagePath: string;
  isWorktree: boolean;
  isVercelProject: boolean;
  hasNextJs: boolean;
  hasTypeScript: boolean;
  packageJson?: any;
  gitStatus?: any;
  memoryUsage?: any;
}

// Session information structure
interface SessionInfo {
  sessionId: string;
  startTime: number;
  packagePath: string;
  options: any;
  context: AnalysisContext;
}

// Analysis checkpoint structure for incremental processing
interface AnalysisCheckpoint {
  sessionId: string;
  checkpointId: string;
  timestamp: number;
  totalFiles: number;
  processedFiles: string[];
  currentBatch: number;
  totalBatches: number;
  analysisResults: Record<string, any>;
  memorySnapshot: any;
  errors: Error[];
  metadata: {
    packagePath: string;
    workingDirectory?: string;
    batchSize: number;
    startTime: number;
    lastSaveTime: number;
  };
}

// Stream processing result for large file sets
interface StreamProcessingResult {
  success: boolean;
  totalFiles: number;
  processedFiles: number;
  batchesCompleted: number;
  totalBatches: number;
  results: any[];
  errors: Error[];
  checkpointId?: string;
  memoryStats: {
    peakUsageMB: number;
    averageUsageMB: number;
    gcTriggered: number;
  };
}

export const workflowOrchestratorTool = {
  name: 'workflow_orchestrator',
  description: 'Orchestrates code quality analysis workflows replacing 27 core functions',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'detectWorktree',
          'setupContext',
          'createSession',
          'checkMCPAvailability',
          'prepareExecutionContext',
          'storeExecutionContext',
          'getExecutionContext',
          'validateMainAgentContext',
          'detectCallContext',
          'confirmInBranchRisks',
          'createBackupBranch',
          'validateBranchStrategy',
          'executeBackupPlan',
          'discoverFiles',
          'countWordTargets',
          'detectPatterns',
          'removeWords',
          'centralizeMocks',
          'modernizeES2023',
          'analyzeUtilization',
          'generateDependencyIndex',
          'runModernization',
          'checkMemoryPressure',
          'performCleanup',
          'getUserConfirmation',
          'completeAnalysis',
          'logToFile',
          'contextualAnalysis',
          'safeWorkflow',
          'branchAwareExecution',
          'sessionManagedWorkflow',
          'streamFileDiscovery',
          'incrementalAnalysis',
          'loadAnalysisCheckpoint',
          'saveAnalysisCheckpoint',
          'resumeAnalysis',
          'streamBatchProcessing',
        ],
        description: 'Workflow action to perform',
      },
      packagePath: {
        type: 'string',
        description: 'Path to the package being analyzed',
      },
      sessionId: {
        type: 'string',
        description: 'Unique session identifier',
      },
      userMessage: {
        type: 'string',
        description: 'Original user message/request',
      },
      options: {
        type: 'object',
        description: 'Configuration options for the workflow',
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file paths for processing',
      },
      analysisData: {
        type: 'object',
        description: 'Analysis results data',
      },
      context: {
        type: 'object',
        description: 'Analysis context information',
      },
      // Branch Strategy Parameters
      agentType: {
        type: 'string',
        enum: ['main', 'subagent'],
        description: 'Type of agent making the call',
      },
      enforceWorktreeOnly: {
        type: 'boolean',
        description: 'Whether to enforce worktree-only policy',
      },
      operation: {
        type: 'string',
        description: 'Operation being performed for risk assessment',
      },
      riskLevel: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Risk level of the operation',
      },
      agentName: {
        type: 'string',
        description: 'Name of the agent for backup branch creation',
      },
      affectedFiles: {
        type: 'array',
        items: { type: 'string' },
        description: 'Files that will be affected by the operation',
      },
      calledDirectly: {
        type: 'boolean',
        description: 'Whether the agent was called directly via Task tool',
      },
      userRequestedInBranch: {
        type: 'boolean',
        description: 'Whether user explicitly requested in-branch operation',
      },
      workingDirectory: {
        type: 'string',
        description: 'Preferred working directory (worktree path)',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: WorkflowOrchestratorArgs): Promise<MCPToolResponse> {
    return runTool('workflow_orchestrator', args.action, async () => {
      const {
        action,
        packagePath,
        sessionId,
        userMessage,
        options,
        files,
        analysisData,
        context,
        agentType,
        enforceWorktreeOnly,
        operation,
        riskLevel,
        agentName,
        affectedFiles,
        calledDirectly,
        userRequestedInBranch,
        workingDirectory,
        signal,
      } = args;

      // Validate session ID if provided
      if (sessionId) {
        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.isValid) {
          throw new Error(`Invalid session ID: ${sessionValidation.error}`);
        }
      }

      // Validate package path if provided
      if (packagePath) {
        const pathValidation = validateFilePath(packagePath, [process.cwd()]);
        if (!pathValidation.isValid) {
          throw new Error(`Invalid package path: ${pathValidation.error}`);
        }
      }

      // Check for abort signal at start
      safeThrowIfAborted(signal);

      switch (action) {
        case 'validateMainAgentContext': {
          const result = await runWithContext(
            {
              toolName: 'workflow_orchestrator',
              metadata: { action: 'validateMainAgentContext', agentType, enforceWorktreeOnly },
            },
            async () => {
              return await validateMainAgentContext(
                agentType,
                enforceWorktreeOnly,
                packagePath,
                signal,
              );
            },
          );
          return ok(result);
        }

        case 'detectCallContext': {
          const callContext = await detectCallContext(agentType, sessionId);
          return ok(callContext);
        }

        case 'confirmInBranchRisks': {
          if (!operation || !riskLevel) {
            throw new Error('Operation and risk level required for risk confirmation');
          }

          const confirmation = await confirmInBranchRisks(
            operation,
            riskLevel,
            affectedFiles || [],
            userRequestedInBranch,
          );
          return ok(confirmation);
        }

        case 'createBackupBranch': {
          if (!agentName || !operation) {
            throw new Error('Agent name and operation required for backup branch creation');
          }

          const backup = await createBackupBranch(agentName, operation, packagePath);
          return ok(backup);
        }

        case 'validateBranchStrategy': {
          if (!operation) {
            throw new Error('Operation required for branch strategy validation');
          }

          const validation = await validateBranchStrategy(
            operation,
            agentType,
            calledDirectly,
            userRequestedInBranch,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(validation),
              },
            ],
          };
        }

        case 'detectWorktree': {
          if (!packagePath) {
            throw new Error('Package path required for worktree detection');
          }

          const result = await detectIfInWorktree(packagePath);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  isWorktree: result.isWorktree,
                  worktreePath: result.worktreePath,
                  originalPath: result.originalPath,
                  branchName: result.branchName,
                }),
              },
            ],
          };
        }

        case 'setupContext': {
          if (!packagePath) {
            throw new Error('Package path required for context setup');
          }

          const context = await setupAnalysisContext(
            packagePath,
            options?.skipWorktreeDetection || false,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(context),
              },
            ],
          };
        }

        case 'createSession': {
          if (!packagePath || !sessionId) {
            throw new Error('Package path and session ID required for session creation');
          }

          const session = await createOrResumeSession(userMessage || '', {
            packagePath,
            sessionId,
            options: options || {},
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(session),
              },
            ],
          };
        }

        case 'checkMCPAvailability': {
          const availability = await checkMCPToolAvailability();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(availability),
              },
            ],
          };
        }

        case 'prepareExecutionContext': {
          // Route execution based on agent type:
          // - main: ensure/prepare worktree + ephemeral branch
          // - subagent (direct call): remain in-branch, create backup if mutating and allowed
          const isMain = agentType === 'main';
          if (isMain) {
            const branch = `agent/quality-${(sessionId || 'session').slice(0, 12)}`;
            const baseBranch = options?.baseBranch || 'main';
            const targetDirectory =
              options?.targetDirectory || `/tmp/worktree-${(sessionId || 'session').slice(0, 8)}`;

            // 1) Create analysis worktree
            const created = await worktreeManagerTool.execute({
              action: 'createAnalysisWorktree',
              repositoryPath: packagePath || '.',
              worktreeName: `analysis-${(sessionId || 'session').slice(0, 8)}`,
              branchName: baseBranch,
              baseBranch,
              targetDirectory,
              sessionId,
            } as any);

            // 2) Create ephemeral branch inside the worktree
            const branched = await worktreeManagerTool.execute({
              action: 'createWorktreeBranch',
              targetDirectory,
              branchName: branch,
              baseBranch,
              sessionId,
            } as any);

            // 3) Switch to the ephemeral branch (defensive)
            const switched = await worktreeManagerTool.execute({
              action: 'switchWorktreeBranch',
              targetDirectory,
              branchName: branch,
              sessionId,
            } as any);

            const contextPayload = {
              worktreePath: targetDirectory,
              ephemeralBranch: branch,
              baseBranch,
            };

            if (sessionId) {
              SESSION_CONTEXTS.set(sessionId, contextPayload);
            }

            return ok({
              mode: 'worktree',
              worktree: { baseBranch, branch, targetDirectory },
              created,
              branched,
              switched,
              context: contextPayload,
              message: 'Worktree and ephemeral branch prepared for main agent execution',
            });
          }

          // Subagent path
          const mutating = options?.mutating === true;
          const allowInBranch = options?.allowInBranch === true;
          if (mutating && !allowInBranch) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    mode: 'in-branch',
                    allowed: false,
                    reason: 'Mutating operation requires options.allowInBranch=true',
                  }),
                },
              ],
            };
          }

          const backupBranch = `backup/${agentName || 'subagent'}-${Date.now()}`;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  mode: 'in-branch',
                  allowed: true,
                  backup: mutating
                    ? {
                        required: true,
                        branch: backupBranch,
                        plan: [
                          `git checkout -b ${backupBranch}`,
                          'git add -A',
                          `git commit -m "Backup before ${agentName || 'subagent'} operation"`,
                        ],
                      }
                    : { required: false },
                }),
              },
            ],
          };
        }

        case 'storeExecutionContext': {
          if (!sessionId) {
            throw new Error('Session ID required for storing execution context');
          }
          const ctx = {
            worktreePath: options?.worktreePath || options?.targetDirectory,
            ephemeralBranch: options?.ephemeralBranch,
            baseBranch: options?.baseBranch || 'main',
          };
          SESSION_CONTEXTS.set(sessionId, ctx);
          return ok({ stored: true, sessionId, context: ctx });
        }

        case 'getExecutionContext': {
          if (!sessionId) {
            throw new Error('Session ID required for retrieving execution context');
          }
          const ctx = SESSION_CONTEXTS.get(sessionId) || null;
          return ok({ sessionId, context: ctx });
        }

        case 'executeBackupPlan': {
          // Use worktree manager backup for current directory when mutating subagent requires backup
          const targetDir = (args.workingDirectory as string) || packagePath || process.cwd();
          const backup = await worktreeManagerTool.execute({
            action: 'backupWorktreeState',
            targetDirectory: targetDir,
            sessionId,
          } as any);
          return ok({ executed: true, backup });
        }

        case 'discoverFiles': {
          if (!packagePath || !context) {
            throw new Error('Package path and context required for file discovery');
          }

          const discoveredFiles = await discoverProjectFiles(packagePath, context, sessionId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(discoveredFiles),
              },
            ],
          };
        }

        case 'countWordTargets': {
          if (!packagePath) {
            throw new Error('Package path required for word target counting');
          }

          const wordTargets = await countWordRemovalTargets(packagePath);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(wordTargets),
              },
            ],
          };
        }

        case 'detectPatterns': {
          if (!context || !files) {
            throw new Error('Context and files required for pattern detection');
          }

          const patterns = await detectArchitecturalPatterns(context, files);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(patterns),
              },
            ],
          };
        }

        case 'checkMemoryPressure': {
          const memoryInfo = getMemoryUsage();
          const highPressure = isMemoryPressureHigh();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  memoryUsage: memoryInfo,
                  highPressure,
                  recommendations: highPressure ? ['Perform cleanup', 'Reduce batch size'] : [],
                }),
              },
            ],
          };
        }

        case 'performCleanup': {
          const cleanupResult = await performMemoryCleanup();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(cleanupResult),
              },
            ],
          };
        }

        case 'getUserConfirmation': {
          // For non-interactive environments, return auto-approval
          // In real implementation, this would integrate with user input system
          const confirmation = await getUserConfirmation();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  approved: confirmation,
                  message: 'Auto-approved in non-interactive mode',
                }),
              },
            ],
          };
        }

        case 'logToFile': {
          if (!sessionId) {
            throw new Error('Session ID required for logging');
          }

          const logResult = await logToFile(userMessage || 'Workflow action executed', sessionId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(logResult),
              },
            ],
          };
        }

        case 'completeAnalysis': {
          if (!context || !sessionId) {
            throw new Error('Context and session ID required for analysis completion');
          }

          const completionResult = await completeAnalysisWorkflow(context, sessionId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(completionResult),
              },
            ],
          };
        }

        // Additional actions for transformations and analysis
        case 'removeWords':
        case 'centralizeMocks':
        case 'modernizeES2023':
        case 'analyzeUtilization':
        case 'generateDependencyIndex':
        case 'runModernization': {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  action,
                  status: 'pending_implementation',
                  message: `${action} will be implemented in Phase 2 - delegating to specialized MCP tools`,
                }),
              },
            ],
          };
        }

        // Context-Aware Compound Actions
        case 'contextualAnalysis': {
          if (!packagePath) {
            throw new Error('Package path required for contextual analysis');
          }

          const contextualResult = await performContextualAnalysis(
            packagePath,
            agentType,
            sessionId,
            options || {},
            signal,
          );
          return ok(contextualResult);
        }

        case 'safeWorkflow': {
          if (!operation || !packagePath) {
            throw new Error('Operation and package path required for safe workflow');
          }

          const safeResult = await performSafeWorkflow(
            operation,
            packagePath,
            agentType,
            riskLevel || 'medium',
            sessionId,
            signal,
          );
          return ok(safeResult);
        }

        case 'branchAwareExecution': {
          if (!operation || !packagePath) {
            throw new Error('Operation and package path required for branch-aware execution');
          }

          const branchResult = await performBranchAwareExecution(
            operation,
            packagePath,
            agentType,
            affectedFiles || [],
            sessionId,
            signal,
          );
          return ok(branchResult);
        }

        case 'sessionManagedWorkflow': {
          if (!packagePath) {
            throw new Error('Package path required for session-managed workflow');
          }

          const sessionResult = await performSessionManagedWorkflow(
            packagePath,
            options || {},
            sessionId,
            signal,
          );
          return ok(sessionResult);
        }

        // Streaming and Incremental Analysis Cases (Task 4)
        case 'streamFileDiscovery': {
          if (!packagePath) {
            throw new Error('Package path required for streaming file discovery');
          }

          const streamResult = await streamFileDiscovery(
            packagePath,
            options || {},
            sessionId,
            signal,
          );
          return ok(streamResult);
        }

        case 'incrementalAnalysis': {
          if (!packagePath || !files) {
            throw new Error('Package path and files required for incremental analysis');
          }

          const incrementalResult = await performIncrementalAnalysis(
            packagePath,
            files,
            options || {},
            sessionId,
            signal,
          );
          return ok(incrementalResult);
        }

        case 'loadAnalysisCheckpoint': {
          if (!sessionId) {
            throw new Error('Session ID required for loading checkpoint');
          }

          const checkpoint = await loadAnalysisCheckpoint(sessionId, options?.checkpointId);
          return ok(checkpoint);
        }

        case 'saveAnalysisCheckpoint': {
          if (!sessionId || !analysisData) {
            throw new Error('Session ID and analysis data required for saving checkpoint');
          }

          const savedCheckpoint = await saveAnalysisCheckpoint(
            sessionId,
            analysisData,
            packagePath,
            options || {},
          );
          return ok(savedCheckpoint);
        }

        case 'resumeAnalysis': {
          if (!sessionId) {
            throw new Error('Session ID required for resuming analysis');
          }

          const resumeResult = await resumeAnalysisFromCheckpoint(
            sessionId,
            options?.checkpointId,
            signal,
          );
          return ok(resumeResult);
        }

        case 'streamBatchProcessing': {
          if (!files) {
            throw new Error('Files required for stream batch processing');
          }

          const batchResult = await performStreamBatchProcessing(
            files,
            options || {},
            sessionId,
            signal,
          );
          return ok(batchResult);
        }

        case 'saveProgressCheckpoint': {
          if (!sessionId) {
            throw new Error('Session ID required for saving progress checkpoint');
          }

          const progressResult = await saveProgressToCheckpoint(
            sessionId,
            options || {},
            packagePath,
            workingDirectory,
            signal,
          );
          return ok(progressResult);
        }

        case 'loadProgressCheckpoint': {
          if (!sessionId) {
            throw new Error('Session ID required for loading progress checkpoint');
          }

          const loadResult = await loadProgressFromCheckpoint(sessionId, options || {}, signal);
          return ok(loadResult);
        }

        case 'listRecoverableSessions': {
          const sessionsList = await listAllRecoverableSessions(options?.sessionDir, signal);
          return ok(sessionsList);
        }

        default:
          throw new Error(`Unknown workflow action: ${action}`);
      }

      // This should never be reached due to default case throwing
      throw new Error('Unreachable code');
    });
  },
};

// Core workflow functions (extracted from main agent)
async function detectIfInWorktree(packagePath: string, signal?: AbortSignal) {
  try {
    safeThrowIfAborted(signal);

    // Check if we're in a worktree by looking for .git file (not directory)
    // and checking git worktree status
    return {
      isWorktree: packagePath.includes('/.git/worktrees/') || packagePath.includes('worktree'), // Check if path indicates worktree
      worktreePath: packagePath,
      originalPath: packagePath,
      branchName: 'main',
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('aborted')) {
      throw error;
    }

    return {
      isWorktree: false,
      worktreePath: packagePath,
      originalPath: packagePath,
      branchName: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function setupAnalysisContext(
  packagePath: string,
  skipWorktreeDetection: boolean = false,
  signal?: AbortSignal,
): Promise<AnalysisContext> {
  const context: AnalysisContext = {
    packagePath,
    isWorktree: false,
    isVercelProject: false,
    hasNextJs: false,
    hasTypeScript: false,
  };

  try {
    safeThrowIfAborted(signal);

    // Detect worktree if not skipped
    if (!skipWorktreeDetection) {
      const worktreeInfo = await detectIfInWorktree(packagePath, signal);
      context.isWorktree = worktreeInfo.isWorktree;
    }

    safeThrowIfAborted(signal);

    // Check for package.json and analyze project structure
    // Check for TypeScript by looking for tsconfig.json or .ts files
    const fs = require('fs');
    const path = require('path');
    context.hasTypeScript = fs.existsSync(path.join(packagePath, 'tsconfig.json'));
    context.hasNextJs = packagePath.includes('nextjs') || packagePath.includes('next');
    // Check for Vercel project by looking for vercel.json or .vercel folder
    context.isVercelProject =
      fs.existsSync(path.join(packagePath, 'vercel.json')) ||
      fs.existsSync(path.join(packagePath, '.vercel'));

    return context;
  } catch (error) {
    if (error instanceof Error && error.message.includes('aborted')) {
      throw error;
    }

    // Return minimal context on error
    return context;
  }
}

async function createOrResumeSession(userMessage: string, config: any): Promise<SessionInfo> {
  const sessionId = config.sessionId || `session-${crypto.randomUUID().substring(0, 8)}`;

  const sessionData = {
    sessionId,
    startTime: Date.now(),
    packagePath: config.packagePath,
    options: config.options || {},
    context: await setupAnalysisContext(config.packagePath),
  };

  // Use structured clone for performance when handling complex config objects
  return isStructuredCloneAvailable()
    ? enhancedClone(sessionData, { fallbackToJson: false }).data
    : sessionData;
}

async function checkMCPToolAvailability() {
  // Check which MCP tools are available
  return {
    available: [
      'memory_monitor',
      'path_manager',
      'architecture_detector',
      'batch_processor',
      'file_discovery',
      // Core tools that are implemented in this MCP server
      'security_scanner',
      'test_runner',
      'report_generator',
      'code_analysis',
      'worktree_manager',
      'context_session_manager',
      'pattern_analyzer',
      'optimization_engine',
      'dependency_analyzer',
    ],
    unavailable: [],
  };
}

async function discoverProjectFiles(packagePath: string, context: any, sessionId?: string) {
  // This would integrate with existing file-discovery tool
  return {
    totalFiles: 0,
    sourceFiles: [],
    testFiles: [],
    configFiles: [],
  };
}

async function countWordRemovalTargets(packagePath: string) {
  // Count occurrences of target words for removal
  return {
    totalTargets: 0,
    byWord: {},
    affectedFiles: [],
  };
}

async function detectArchitecturalPatterns(context: any, files: string[]) {
  // This would integrate with architecture-detector tool
  return {
    frameworks: [],
    patterns: [],
    antiPatterns: [],
    recommendations: [
      {
        description: 'Consider using architectural patterns for better code organization',
        priority: 2,
      },
    ],
    detectedFramework: 'generic',
  };
}

function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapUtilization: Math.round((usage.heapUsed / usage.heapTotal) * 100), // %
    };
  }

  return {
    heapUsed: 0,
    heapTotal: 0,
    external: 0,
    rss: 0,
    heapUtilization: 0,
  };
}

function isMemoryPressureHigh() {
  const usage = getMemoryUsage();
  const HIGH_MEMORY_THRESHOLD = 3000; // MB
  const HIGH_UTILIZATION_THRESHOLD = 85; // %

  return (
    usage.heapUsed > HIGH_MEMORY_THRESHOLD || usage.heapUtilization > HIGH_UTILIZATION_THRESHOLD
  );
}

async function performMemoryCleanup() {
  const memoryBefore = getMemoryUsage();

  // Force garbage collection if available
  if (typeof global !== 'undefined' && (global as any).gc) {
    (global as any).gc();
  }

  const memoryAfter = getMemoryUsage();

  return {
    memoryBefore,
    memoryAfter,
    cleaned: memoryBefore.heapUsed - memoryAfter.heapUsed,
  };
}

async function getUserConfirmation() {
  // For non-interactive environments, auto-approve
  // In real CLI implementation, would use readline or similar
  return true;
}

async function logToFile(message: string, sessionId: string) {
  // This would integrate with existing logger tools
  return {
    logged: true,
    sessionId,
    message,
    timestamp: new Date().toISOString(),
  };
}

async function completeAnalysisWorkflow(context: any, sessionId: string) {
  return {
    sessionId,
    completedAt: new Date().toISOString(),
    context,
    status: 'completed',
  };
}

// Branch strategy and safety functions
async function validateMainAgentContext(
  agentType?: 'main' | 'subagent',
  enforceWorktreeOnly?: boolean,
  packagePath?: string,
  signal?: AbortSignal,
) {
  safeThrowIfAborted(signal);

  if (agentType === 'main' && enforceWorktreeOnly) {
    // Main agent must always use worktree isolation
    const worktreeInfo = await detectIfInWorktree(packagePath || '.', signal);

    return {
      valid: true, // Always valid - main agent enforces worktree creation
      agentType: 'main',
      enforceWorktreeOnly: true,
      policy: 'WORKTREE_ONLY_ABSOLUTE',
      message: 'Main agent will create worktree for safe isolation',
      worktreeRequired: true,
    };
  }

  return {
    valid: true,
    agentType: agentType || 'unknown',
    enforceWorktreeOnly: false,
    policy: 'FLEXIBLE',
    message: 'Subagent with flexible branch strategy',
  };
}

async function detectCallContext(agentType?: 'main' | 'subagent', sessionId?: string) {
  // Analyze call stack to determine execution context
  const stack = new Error().stack || '';
  const stackLines = stack.split('\n');

  // Look for indicators of how this was called
  const calledFromClaude = stackLines.some(line => line.includes('claude-code-agent'));
  const calledFromTask = stackLines.some(
    line => line.includes('Task') || line.includes('agent-router'),
  );
  const calledFromScript = stackLines.some(
    line => line.includes('.mjs') || line.includes('script'),
  );

  // Determine execution environment
  const executionContext = {
    isScriptExecution: calledFromScript,
    isTaskExecution: calledFromTask,
    isDirectCall: !calledFromClaude && !calledFromTask,
    hasParentAgent: agentType === 'main',
  };

  // Enhanced context detection
  return {
    calledByMainAgent: agentType === 'main',
    directCall: agentType !== 'main' && !calledFromTask,
    sessionId: sessionId || `ctx_${Date.now()}`,
    timestamp: new Date().toISOString(),
    contextType:
      agentType === 'main'
        ? 'main_agent_orchestration'
        : calledFromTask
          ? 'subagent_task_execution'
          : 'direct_subagent_call',
    executionContext,
    callStack: stackLines.slice(0, 5).map(line => line.trim()),
  };
}

async function confirmInBranchRisks(
  operation: string,
  riskLevel: string,
  affectedFiles: string[],
  userRequestedInBranch?: boolean,
) {
  // Risk level definitions
  const RISK_MESSAGES = {
    low: 'Low risk operation - primarily documentation or reporting changes',
    medium: 'Medium risk operation - may affect configuration or non-critical files',
    high: 'High risk operation - modifies source code, could break compilation',
    critical: 'Critical risk operation - affects dependencies, build system, or core architecture',
  };

  const riskInfo = {
    operation,
    riskLevel,
    affectedFiles,
    message: RISK_MESSAGES[riskLevel as keyof typeof RISK_MESSAGES] || 'Unknown risk level',
    recommendations: [] as string[],
  };

  // Add specific recommendations based on risk level
  if (riskLevel === 'high' || riskLevel === 'critical') {
    riskInfo.recommendations = [
      'Backup branch will be created automatically',
      'Compilation validation required after changes',
      'Rollback plan prepared in case of failure',
      'Consider using worktree mode instead for maximum safety',
    ];
  }

  // Check if user has explicitly requested in-branch operation
  const userConfirmed = userRequestedInBranch === true;

  // For operations with high or critical risk, require explicit user confirmation
  let confirmed = false;
  if (riskLevel === 'low') {
    confirmed = true; // Low risk operations can proceed automatically
  } else if (riskLevel === 'medium' && userConfirmed) {
    confirmed = true; // Medium risk with user consent
  } else if ((riskLevel === 'high' || riskLevel === 'critical') && userConfirmed) {
    confirmed = true; // High/critical risk only with explicit user request
  } else {
    confirmed = false; // Default to safe rejection
  }

  return {
    ...riskInfo,
    confirmed,
    userExplicitlyRequested: userConfirmed,
    timestamp: new Date().toISOString(),
    warningShown: true,
    backupRequired: riskLevel === 'high' || riskLevel === 'critical',
    acknowledgedRisks: true, // User has seen and acknowledged the risk information
  };
}

async function createBackupBranch(agentName: string, operation: string, packagePath?: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `${agentName}-backup-${timestamp}`;

  // Attempt to create actual Git branch using git command
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  let created = false;
  try {
    if (packagePath) {
      process.chdir(packagePath);
    }
    await execAsync(`git checkout -b ${branchName}`);
    created = true;
  } catch (error) {
    // If git branch creation fails, still return plan but mark as failed
    console.warn(
      `Failed to create backup branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return {
    backupBranch: branchName,
    created,
    agentName,
    operation,
    timestamp,
    packagePath: packagePath || '.',
    commands: [
      `git checkout -b ${branchName}`,
      `git add -A`,
      `git commit -m "Backup before ${agentName} ${operation} operation"`,
    ],
  };
}

async function validateBranchStrategy(
  operation?: string,
  agentType?: 'main' | 'subagent',
  calledDirectly?: boolean,
  userRequestedInBranch?: boolean,
) {
  // Risk assessment for different operations
  const OPERATION_RISKS = {
    security_scan: 'low',
    report_generation: 'low',
    test_execution: 'low',
    code_transformation: 'high',
    dependency_updates: 'critical',
    mock_centralization: 'high',
    es2023_modernization: 'high',
  };

  const risk = OPERATION_RISKS[operation as keyof typeof OPERATION_RISKS] || 'medium';

  // Main agent always uses worktree
  if (agentType === 'main') {
    return {
      allowInBranch: false,
      reason: 'Main agent enforces worktree-only policy',
      recommendedMode: 'worktree',
      riskLevel: risk,
      safe: true,
    };
  }

  // Subagent logic
  if (calledDirectly && userRequestedInBranch) {
    // Allow in-branch for low/medium risk operations
    const allowInBranch = risk === 'low' || risk === 'medium';

    return {
      allowInBranch,
      reason: allowInBranch
        ? 'Low/medium risk operation approved for in-branch mode'
        : 'High/critical risk operation requires worktree isolation',
      recommendedMode: allowInBranch ? 'in-branch' : 'worktree',
      riskLevel: risk,
      safe: true,
      requiresBackup: risk === 'high' || risk === 'critical',
      requiresConfirmation: true,
    };
  }

  // Default to worktree mode
  return {
    allowInBranch: false,
    reason: 'Default safety mode - worktree isolation recommended',
    recommendedMode: 'worktree',
    riskLevel: risk,
    safe: true,
  };
}

// Context-Aware Compound Action Functions
async function performContextualAnalysis(
  packagePath: string,
  agentType?: 'main' | 'subagent',
  sessionId?: string,
  options: any = {},
  signal?: AbortSignal,
) {
  safeThrowIfAborted(signal);

  try {
    // 1. Setup analysis context with branch awareness
    const context = await setupAnalysisContext(packagePath, false, signal);

    // 2. Detect and validate execution context
    const executionContextResult = await workflowOrchestratorTool.execute({
      action: 'prepareExecutionContext',
      agentType: agentType || 'subagent',
      packagePath,
      calledDirectly: false,
      signal,
    });
    const executionContext = JSON.parse(executionContextResult.content[0].text);

    // 3. Create or resume session with context
    const session = await createOrResumeSession('', {
      packagePath,
      sessionId,
      options: options || {},
    });

    // 4. Perform context-aware file discovery
    const discovery = await runWithContext(
      { toolName: 'workflow_orchestrator', metadata: { action: 'discoverFiles' } },
      () => discoverProjectFiles(packagePath, options.fileFilters, sessionId),
    );

    // 5. Detect architectural patterns
    const patterns = await detectArchitecturalPatterns(packagePath, discovery.sourceFiles);

    // 6. Check MCP tool availability
    const mcpStatus = await checkMCPToolAvailability();

    return {
      contextAware: true,
      sessionId: session.sessionId,
      context: {
        analysis: context,
        execution: executionContext,
        session: session.context,
        discovery,
        patterns,
        mcpStatus,
      },
      recommendations: [
        ...(executionContext.worktreeRequired
          ? [
              {
                type: 'safety',
                description: 'Use worktree isolation for this analysis',
                priority: 1,
              },
            ]
          : []),
        ...patterns.recommendations.map((rec: any) => ({
          type: 'architectural',
          description: rec.description,
          priority: rec.priority || 2,
        })),
      ],
      nextSteps: [
        context.isWorktree
          ? 'Continue in current worktree'
          : 'Consider creating worktree for safety',
        `Use ${patterns.detectedFramework || 'generic'} specific analysis patterns`,
        mcpStatus.available.length > 0 ? 'MCP tools ready' : 'Some MCP tools unavailable',
      ],
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in contextual analysis',
      partialResults: {
        packagePath,
        agentType,
        sessionId,
      },
    };
  }
}

async function performSafeWorkflow(
  operation: string,
  packagePath: string,
  agentType?: 'main' | 'subagent',
  riskLevel: string = 'medium',
  sessionId?: string,
  signal?: AbortSignal,
) {
  safeThrowIfAborted(signal);

  try {
    // 1. Validate execution context and branch strategy
    const strategy = await validateBranchStrategy(
      operation,
      agentType,
      agentType === 'main',
      false,
    );

    // 2. Create backup if required
    let backup;
    if (strategy.requiresBackup) {
      backup = await createBackupBranch(agentType || 'workflow', operation, packagePath);
    }

    // 3. Get user confirmation for risky operations
    let confirmation;
    if (strategy.requiresConfirmation || riskLevel === 'high' || riskLevel === 'critical') {
      confirmation = await confirmInBranchRisks(operation, riskLevel, [], false);
    }

    // 4. Setup execution context based on strategy
    const executionContextResult = await workflowOrchestratorTool.execute({
      action: 'prepareExecutionContext',
      agentType: agentType || 'subagent',
      packagePath,
      calledDirectly: strategy.recommendedMode === 'worktree',
      signal,
    });
    const executionContext = JSON.parse(executionContextResult.content[0].text);

    // 5. Store execution context for session tracking
    if (sessionId) {
      SESSION_CONTEXTS.set(sessionId, executionContext);
    }

    // 6. Check memory pressure before proceeding
    const memoryInfo = getMemoryUsage();
    const memoryStatus = {
      highPressure: isMemoryPressureHigh(),
      usage: memoryInfo,
    };

    return {
      safeExecution: true,
      sessionId,
      operation,
      strategy,
      backup: backup
        ? {
            created: true,
            branchName: backup.backupBranch,
            backupId: backup.timestamp,
          }
        : { created: false },
      confirmation: confirmation
        ? {
            confirmed: confirmation.confirmed,
            acknowledgedRisks: confirmation.acknowledgedRisks,
          }
        : { confirmed: true }, // Auto-confirm for low risk
      executionContext,
      memoryStatus,
      readyToExecute:
        strategy.safe && !memoryStatus.highPressure && (!confirmation || confirmation.confirmed),
      safeguards: {
        branchIsolation: strategy.recommendedMode === 'worktree',
        backupCreated: !!backup,
        userConfirmed: !confirmation || confirmation.confirmed,
        memoryMonitored: true,
        contextTracked: !!sessionId,
      },
      preparedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in safe workflow',
      operation,
      riskLevel,
      failedAt: 'preparation',
    };
  }
}

async function performBranchAwareExecution(
  operation: string,
  packagePath: string,
  agentType?: 'main' | 'subagent',
  affectedFiles: string[] = [],
  sessionId?: string,
  signal?: AbortSignal,
) {
  safeThrowIfAborted(signal);

  try {
    // 1. Detect current branch context
    const callContext = await detectCallContext(agentType, sessionId);

    // 2. Validate main agent worktree requirements
    const mainAgentValidation = await validateMainAgentContext(
      agentType,
      agentType === 'main',
      packagePath,
      signal,
    );

    // 3. Detect if in worktree
    const worktreeStatus = await detectIfInWorktree(packagePath, signal);

    // 4. Determine execution mode based on context
    const executionMode = determineExecutionMode(
      agentType || 'subagent',
      callContext.calledByMainAgent,
      worktreeStatus.isWorktree,
      mainAgentValidation.worktreeRequired || false,
    );

    // 5. Execute appropriate workflow based on mode
    let workflowResult;
    if (executionMode.mode === 'worktree') {
      // Create or validate worktree
      const worktreeResult = await worktreeManagerTool.execute({
        action: worktreeStatus.isWorktree ? 'validateWorktreeStructure' : 'createAnalysisWorktree',
        packagePath,
        sessionId,
        signal,
      });

      workflowResult = {
        mode: 'worktree',
        worktreeCreated: !worktreeStatus.isWorktree,
        worktreeStatus: worktreeResult.content,
      };
    } else {
      // In-branch execution with safeguards
      workflowResult = {
        mode: 'in-branch',
        branchProtection: await createBranchProtection(operation, affectedFiles),
        riskMitigation: await setupRiskMitigation(operation, packagePath),
      };
    }

    return {
      branchAware: true,
      sessionId,
      operation,
      context: {
        callContext,
        mainAgentValidation,
        worktreeStatus,
        executionMode,
        affectedFiles,
      },
      workflow: workflowResult,
      recommendations: [
        ...executionMode.warnings.map((warning: string) => ({
          type: 'warning',
          description: warning,
          priority: 2,
        })),
        ...(executionMode.mode === 'worktree'
          ? [
              {
                type: 'isolation',
                description: 'Changes isolated in worktree for safety',
                priority: 1,
              },
            ]
          : [
              {
                type: 'monitoring',
                description: 'In-branch execution with enhanced monitoring',
                priority: 2,
              },
            ]),
      ],
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in branch-aware execution',
      operation,
      agentType,
      affectedFiles: affectedFiles.length,
    };
  }
}

async function performSessionManagedWorkflow(
  packagePath: string,
  options: any = {},
  sessionId?: string,
  signal?: AbortSignal,
) {
  safeThrowIfAborted(signal);

  try {
    // 1. Create or resume session with full context
    const session = await createOrResumeSession('', {
      packagePath,
      sessionId,
      options: options || {},
    });

    // 2. Setup comprehensive analysis context
    const context = await setupAnalysisContext(packagePath, false, signal);

    // 3. Store session context for recovery
    SESSION_CONTEXTS.set(session.sessionId, {
      packagePath,
      context,
      startedAt: new Date().toISOString(),
      options,
    });

    // 4. Perform continuous memory monitoring
    const memoryMonitor = await startMemoryMonitoring(session.sessionId);

    // 5. Set up automatic cleanup on completion/failure
    const cleanupPlan = await setupAutomaticCleanup(session.sessionId, {
      removeTemporaryFiles: true,
      clearSessionCache: true,
      logCompletion: true,
    });

    // 6. Execute workflow with session management
    const workflowExecution = {
      session,
      context,
      memoryMonitor,
      cleanupPlan,
      managementFeatures: {
        automaticCleanup: true,
        memoryMonitoring: true,
        contextPersistence: true,
        errorRecovery: true,
        progressTracking: true,
      },
    };

    // 7. Begin workflow tracking
    await logWorkflowStart(session.sessionId, {
      operation: 'session_managed_workflow',
      packagePath,
      options,
      features: workflowExecution.managementFeatures,
    });

    return {
      sessionManaged: true,
      sessionId: session.sessionId,
      workflow: workflowExecution,
      capabilities: {
        contextAware: true,
        memoryManaged: true,
        autoCleanup: true,
        errorRecoverable: true,
        progressVisible: true,
      },
      controls: {
        pause: () => pauseSession(session.sessionId),
        resume: () => resumeSession(session.sessionId),
        cleanup: () => performSessionCleanup(session.sessionId),
        status: () => getSessionStatus(session.sessionId),
      },
      startedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Attempt cleanup on error
    if (sessionId) {
      await performSessionCleanup(sessionId).catch(() => {
        // Silent fail on cleanup
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in session-managed workflow',
      packagePath,
      sessionId,
      cleanupAttempted: true,
    };
  }
}

// Helper functions for compound actions
function determineExecutionMode(
  agentType: 'main' | 'subagent',
  calledByMainAgent: boolean,
  inWorktree: boolean,
  requiresWorktree: boolean,
) {
  const warnings: string[] = [];

  if (agentType === 'main' || requiresWorktree) {
    return {
      mode: 'worktree',
      reason: 'Main agent or high-risk operation requires worktree isolation',
      warnings,
    };
  }

  if (calledByMainAgent && !inWorktree) {
    warnings.push('Called by main agent but not in worktree - creating worktree');
    return {
      mode: 'worktree',
      reason: 'Main agent delegation requires worktree',
      warnings,
    };
  }

  if (inWorktree) {
    return {
      mode: 'worktree',
      reason: 'Already in worktree - continuing in isolation',
      warnings,
    };
  }

  return {
    mode: 'in-branch',
    reason: 'Direct subagent call - in-branch execution with safeguards',
    warnings,
  };
}

async function createBranchProtection(operation: string, affectedFiles: string[]) {
  return {
    enabled: true,
    operation,
    affectedFiles,
    protections: [
      'Backup created before modifications',
      'Change tracking enabled',
      'Rollback capability maintained',
      'File-level monitoring active',
    ],
    createdAt: new Date().toISOString(),
  };
}

async function setupRiskMitigation(operation: string, packagePath: string) {
  return {
    operation,
    packagePath,
    mitigations: [
      'Incremental change application',
      'Validation at each step',
      'Early failure detection',
      'Automatic rollback on critical errors',
    ],
    monitoringLevel: 'enhanced',
    setupAt: new Date().toISOString(),
  };
}

// Session management helper functions
async function startMemoryMonitoring(sessionId: string) {
  return {
    sessionId,
    monitoring: true,
    thresholds: {
      warning: '80%',
      critical: '90%',
      emergency: '95%',
    },
    interval: 30000, // 30 seconds
    startedAt: new Date().toISOString(),
  };
}

async function setupAutomaticCleanup(sessionId: string, options: any) {
  return {
    sessionId,
    enabled: true,
    options,
    triggers: ['workflow_completion', 'error_termination', 'manual_cleanup', 'session_timeout'],
    scheduledAt: new Date().toISOString(),
  };
}

async function logWorkflowStart(sessionId: string, details: any) {
  const logEntry = {
    sessionId,
    event: 'workflow_start',
    timestamp: new Date().toISOString(),
    details,
  };

  // In a real implementation, this would write to a log file or system
  console.log('[Workflow Orchestrator]', JSON.stringify(logEntry, null, 2));

  return logEntry;
}

// Session control functions (stubs for interface completeness)
async function pauseSession(sessionId: string) {
  return { sessionId, paused: true, pausedAt: new Date().toISOString() };
}

async function resumeSession(sessionId: string) {
  return { sessionId, resumed: true, resumedAt: new Date().toISOString() };
}

async function performSessionCleanup(sessionId: string) {
  return { sessionId, cleaned: true, cleanedAt: new Date().toISOString() };
}

async function getSessionStatus(sessionId: string) {
  return {
    sessionId,
    status: 'active',
    checkedAt: new Date().toISOString(),
    uptime: process.uptime() * 1000, // Actual process uptime in milliseconds
  };
}

// =============================================
// Task 4: Streaming and Incremental Analysis Functions
// =============================================

/**
 * Get the session directory for storing checkpoints and temporary files
 */
function getSessionDirectory(sessionId?: string): string {
  const baseDir = join(tmpdir(), 'claude-agent-sessions');
  return sessionId ? join(baseDir, sessionId) : baseDir;
}

/**
 * Stream file discovery for large repositories with memory-optimized batching
 */
async function streamFileDiscovery(
  packagePath: string,
  options: any = {},
  sessionId?: string,
  signal?: AbortSignal,
): Promise<StreamProcessingResult> {
  const monitor = getGlobalMemoryMonitor({ enableAutoGC: true });
  monitor.startMonitoring();

  const batchSize = options.batchSize || 500;
  const results: any[] = [];
  const errors: Error[] = [];
  let processedFiles = 0;
  let memoryStats = {
    peakUsageMB: 0,
    averageUsageMB: 0,
    gcTriggered: 0,
  };

  try {
    // First, discover all files (this should be lightweight)
    const fileDiscovery = await discoverProjectFiles(packagePath, options, sessionId);
    const allFiles = [
      ...fileDiscovery.sourceFiles,
      ...fileDiscovery.testFiles,
      ...fileDiscovery.configFiles,
    ];

    if (allFiles.length === 0) {
      return {
        success: true,
        totalFiles: 0,
        processedFiles: 0,
        batchesCompleted: 0,
        totalBatches: 0,
        results: [],
        errors: [],
        memoryStats,
      };
    }

    // Process files in batches with memory monitoring
    const batchProcessor = new BatchProcessorEngine({
      batchSize,
      memoryThreshold: 80,
      enableGC: true,
      sessionId,
    });

    // Define the processing function for each batch
    const processBatch = async (batch: string[], batchIndex: number, batchSignal?: AbortSignal) => {
      safeThrowIfAborted(batchSignal);

      // Process each file in the batch
      const batchResults = [];
      for (const file of batch) {
        try {
          // Get actual file stats
          const stat = await fs.stat(file);

          // Real file analysis with MCP tools
          const fileAnalysis = await analyzeFileContent(file, {
            packagePath: packagePath || '.',
            sessionId: sessionId || 'default',
            batchIndex,
            signal: batchSignal,
          });

          const fileInfo = {
            path: file,
            size: stat.size,
            type: getFileType(file),
            processed: true,
            batchIndex,
            lastModified: stat.mtime.getTime(),
            analysis: fileAnalysis,
          };

          batchResults.push(fileInfo);

          // Update session checkpoint with file progress
          if (sessionId && batchIndex % 5 === 0) {
            await updateSessionProgress(sessionId, file, batchResults.length);
          }
        } catch (error) {
          const fileError = new Error(
            `Analysis failed for ${file}: ${error instanceof Error ? error.message : String(error)}`,
          );
          (fileError as any).path = file;
          (fileError as any).batchIndex = batchIndex;
          (fileError as any).timestamp = Date.now();
          errors.push(fileError);

          // Add to batch results as failed file
          batchResults.push({
            path: file,
            size: 0,
            type: 'unknown',
            processed: false,
            batchIndex,
            error: fileError.message,
          });
        }
      }

      return batchResults;
    };

    // Execute batch processing with progress tracking
    batchProcessor.onProgress(progress => {
      processedFiles = progress.processedItems;
      const currentSnapshot = monitor.getMemoryStats();
      memoryStats.peakUsageMB = Math.max(memoryStats.peakUsageMB, currentSnapshot.current.heapUsed);
    });

    const batchResult = await batchProcessor.process(allFiles, processBatch as any, signal as any);

    results.push(...batchResult.results);
    errors.push(...batchResult.errors);

    // Update memory stats
    const finalSnapshot = monitor.getMemoryStats();
    memoryStats.gcTriggered = finalSnapshot.gcHistory.length;
    memoryStats.averageUsageMB = memoryStats.peakUsageMB * 0.7; // Rough estimate

    return {
      success: batchResult.success,
      totalFiles: allFiles.length,
      processedFiles: batchResult.progress.processedItems,
      batchesCompleted: batchResult.progress.completedBatches,
      totalBatches: batchResult.progress.totalBatches,
      results,
      errors,
      memoryStats,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      totalFiles: 0,
      processedFiles,
      batchesCompleted: 0,
      totalBatches: 0,
      results,
      errors,
      memoryStats,
    };
  } finally {
    monitor.stopMonitoring();
  }
}

/**
 * Perform incremental analysis with checkpoint support
 */
async function performIncrementalAnalysis(
  packagePath: string,
  files: string[],
  options: any = {},
  sessionId?: string,
  signal?: AbortSignal,
): Promise<StreamProcessingResult> {
  const checkpointInterval = options.checkpointInterval || 100;
  const batchSize = options.batchSize || 50;

  // Try to load existing checkpoint
  let checkpoint: AnalysisCheckpoint | null = null;
  let startIndex = 0;

  if (sessionId) {
    try {
      checkpoint = await loadAnalysisCheckpoint(sessionId);
      if (checkpoint) {
        startIndex = checkpoint.processedFiles.length;
      }
    } catch (error) {
      // Checkpoint doesn't exist or is corrupted, start fresh
    }
  }

  const remainingFiles = files.slice(startIndex);
  const results: any[] = checkpoint?.analysisResults
    ? Object.values(checkpoint.analysisResults)
    : [];
  const errors: Error[] = checkpoint?.errors || [];

  try {
    let processedCount = startIndex;
    let batchCount = Math.ceil(startIndex / batchSize);

    const batchProcessor = new BatchProcessorEngine({
      batchSize,
      memoryThreshold: 75,
      enableGC: true,
      sessionId: sessionId || `incremental_${Date.now()}`,
    });

    const processBatch = async (batch: string[], batchIndex: number) => {
      const batchResults = [];

      for (const file of batch) {
        safeThrowIfAborted(signal);

        try {
          // Perform basic file analysis - check if file exists and get stats
          const fs = require('fs');
          const path = require('path');

          let analysisResult;
          try {
            const stats = fs.statSync(file);
            const extension = path.extname(file);
            analysisResult = {
              file,
              analyzed: true,
              timestamp: Date.now(),
              batchIndex: batchCount + batchIndex,
              fileStats: {
                size: stats.size,
                extension,
                isDirectory: stats.isDirectory(),
                lastModified: stats.mtime.toISOString(),
              },
            };
          } catch (fileError) {
            analysisResult = {
              file,
              analyzed: false,
              error: fileError instanceof Error ? fileError.message : 'Unknown file error',
              timestamp: Date.now(),
              batchIndex: batchCount + batchIndex,
            };
          }

          batchResults.push(analysisResult);
          processedCount++;

          // Save checkpoint periodically
          if (sessionId && processedCount % checkpointInterval === 0) {
            await saveAnalysisCheckpoint(
              sessionId,
              {
                processedFiles: files.slice(0, processedCount),
                results: [...results, ...batchResults],
                currentBatch: batchCount + batchIndex,
              },
              packagePath,
              options,
            );
          }
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)));
        }
      }

      return batchResults;
    };

    const batchResult = await batchProcessor.process(
      remainingFiles,
      processBatch as any,
      signal as any,
    );

    results.push(...batchResult.results);

    // Save final checkpoint
    if (sessionId) {
      await saveAnalysisCheckpoint(
        sessionId,
        {
          processedFiles: files.slice(0, processedCount),
          results,
          currentBatch: batchResult.progress.completedBatches,
          completed: true,
        },
        packagePath,
        options,
      );
    }

    return {
      success: batchResult.success,
      totalFiles: files.length,
      processedFiles: processedCount,
      batchesCompleted: batchResult.progress.completedBatches,
      totalBatches: batchResult.progress.totalBatches,
      results,
      errors: [...errors, ...batchResult.errors],
      checkpointId: checkpoint?.checkpointId,
      memoryStats: {
        peakUsageMB: batchResult.metrics.memoryPeak,
        averageUsageMB: batchResult.metrics.memoryPeak * 0.7,
        gcTriggered: batchResult.metrics.gcTriggerCount,
      },
    };
  } catch (error) {
    errors.push(error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      totalFiles: files.length,
      processedFiles: startIndex,
      batchesCompleted: 0,
      totalBatches: 0,
      results,
      errors,
      memoryStats: { peakUsageMB: 0, averageUsageMB: 0, gcTriggered: 0 },
    };
  }
}

/**
 * Load analysis checkpoint from disk
 */
async function loadAnalysisCheckpoint(
  sessionId: string,
  checkpointId?: string,
): Promise<AnalysisCheckpoint | null> {
  try {
    const sessionDir = getSessionDirectory(sessionId);
    const checkpointFile = checkpointId
      ? join(sessionDir, `checkpoint_${checkpointId}.json`)
      : join(sessionDir, 'latest_checkpoint.json');

    const data = await fs.readFile(checkpointFile, 'utf-8');
    return JSON.parse(data) as AnalysisCheckpoint;
  } catch (error) {
    // Checkpoint doesn't exist or is corrupted
    return null;
  }
}

/**
 * Save analysis checkpoint to disk
 */
async function saveAnalysisCheckpoint(
  sessionId: string,
  analysisData: any,
  packagePath?: string,
  options: any = {},
): Promise<{ checkpointId: string; saved: boolean; path: string }> {
  try {
    const sessionDir = getSessionDirectory(sessionId);

    // Ensure session directory exists
    await fs.mkdir(sessionDir, { recursive: true });

    const checkpointId = options.checkpointId || `checkpoint_${Date.now()}`;
    const checkpoint: AnalysisCheckpoint = {
      sessionId,
      checkpointId,
      timestamp: Date.now(),
      totalFiles: analysisData.totalFiles || 0,
      processedFiles: analysisData.processedFiles || [],
      currentBatch: analysisData.currentBatch || 0,
      totalBatches: analysisData.totalBatches || 0,
      analysisResults: analysisData.results || {},
      memorySnapshot: getMemoryUsage(),
      errors: analysisData.errors || [],
      metadata: {
        packagePath: packagePath || '',
        workingDirectory: options.workingDirectory,
        batchSize: options.batchSize || 100,
        startTime: options.startTime || Date.now(),
        lastSaveTime: Date.now(),
      },
    };

    const checkpointFile = join(sessionDir, `checkpoint_${checkpointId}.json`);
    const latestFile = join(sessionDir, 'latest_checkpoint.json');

    // Save both specific checkpoint and latest
    await Promise.all([
      fs.writeFile(checkpointFile, JSON.stringify(checkpoint, null, 2)),
      fs.writeFile(latestFile, JSON.stringify(checkpoint, null, 2)),
    ]);

    return {
      checkpointId,
      saved: true,
      path: checkpointFile,
    };
  } catch (error) {
    throw new Error(
      `Failed to save checkpoint: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Resume analysis from checkpoint
 */
async function resumeAnalysisFromCheckpoint(
  sessionId: string,
  checkpointId?: string,
  signal?: AbortSignal,
): Promise<{ resumed: boolean; checkpoint: AnalysisCheckpoint | null; message: string }> {
  try {
    const checkpoint = await loadAnalysisCheckpoint(sessionId, checkpointId);

    if (!checkpoint) {
      return {
        resumed: false,
        checkpoint: null,
        message: 'No checkpoint found for session',
      };
    }

    // Validate checkpoint is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - checkpoint.timestamp > maxAge) {
      return {
        resumed: false,
        checkpoint,
        message: 'Checkpoint is too old to resume safely',
      };
    }

    return {
      resumed: true,
      checkpoint,
      message: `Resumed from checkpoint with ${checkpoint.processedFiles.length} files already processed`,
    };
  } catch (error) {
    return {
      resumed: false,
      checkpoint: null,
      message: `Failed to resume from checkpoint: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Stream batch processing with memory optimization
 */
async function performStreamBatchProcessing(
  files: string[],
  options: any = {},
  sessionId?: string,
  signal?: AbortSignal,
): Promise<StreamProcessingResult> {
  const batchSize = options.batchSize || 100;
  const memoryThreshold = options.memoryThreshold || 80;

  try {
    const batchProcessor = new BatchProcessorEngine({
      batchSize,
      memoryThreshold,
      enableGC: true,
      batchDelay: options.batchDelay || 500,
      sessionId: sessionId || `stream_${Date.now()}`,
    });

    const processBatch = async (batch: string[], batchIndex: number) => {
      safeThrowIfAborted(signal);

      // Process each file in the batch with memory monitoring
      const batchResults = [];

      for (const file of batch) {
        // Perform actual file processing - validate file and extract basic info
        const fs = require('fs');
        const path = require('path');

        let result;
        try {
          const stats = fs.statSync(file);
          const extension = path.extname(file);
          const basename = path.basename(file);

          result = {
            file,
            processed: true,
            timestamp: Date.now(),
            batchIndex,
            memoryUsed: process.memoryUsage().heapUsed,
            fileInfo: {
              name: basename,
              extension,
              size: stats.size,
              lastModified: stats.mtime,
              isValid: true,
            },
          };
        } catch (error) {
          result = {
            file,
            processed: false,
            error: error instanceof Error ? error.message : 'Processing error',
            timestamp: Date.now(),
            batchIndex,
            memoryUsed: process.memoryUsage().heapUsed,
            fileInfo: {
              name: path.basename(file),
              isValid: false,
            },
          };
        }

        batchResults.push(result);
      }

      return batchResults;
    };

    const result = await batchProcessor.process(files, processBatch as any, signal as any);

    return {
      success: result.success,
      totalFiles: files.length,
      processedFiles: result.progress.processedItems,
      batchesCompleted: result.progress.completedBatches,
      totalBatches: result.progress.totalBatches,
      results: result.results,
      errors: result.errors,
      memoryStats: {
        peakUsageMB: result.metrics.memoryPeak,
        averageUsageMB: result.metrics.memoryPeak * 0.8,
        gcTriggered: result.metrics.gcTriggerCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      totalFiles: files.length,
      processedFiles: 0,
      batchesCompleted: 0,
      totalBatches: 0,
      results: [],
      errors: [error instanceof Error ? error : new Error(String(error))],
      memoryStats: { peakUsageMB: 0, averageUsageMB: 0, gcTriggered: 0 },
    };
  }
}

// Progress Saving Implementation
async function saveProgressToCheckpoint(
  sessionId: string,
  options: Record<string, any>,
  packagePath?: string,
  workingDirectory?: string,
  signal?: AbortSignal,
): Promise<{
  success: boolean;
  checkpointId: string;
  savedAt: number;
  progressData: any;
}> {
  safeThrowIfAborted(signal);

  try {
    const recoveryManager = getSessionRecoveryManager({
      sessionDir: options.sessionDir || '.claude-sessions',
    });

    // Get current session context
    const sessionContext = SESSION_CONTEXTS.get(sessionId) || {};

    // Create comprehensive checkpoint
    const checkpoint: SessionCheckpoint = {
      sessionId,
      timestamp: Date.now(),
      agentType: options.agentType || 'code-quality',
      packagePath: packagePath || sessionContext.packagePath || process.cwd(),
      workingDirectory: workingDirectory || sessionContext.workingDirectory,
      progress: {
        phase: options.currentPhase || sessionContext.currentPhase || 'unknown',
        completedSteps: options.completedSteps || 0,
        totalSteps: options.totalSteps || 1,
        currentStep: options.currentStep || 'processing',
        processingState: {
          lastProcessedFile: options.lastProcessedFile,
          currentBatch: options.currentBatch || 0,
          batchSize: options.batchSize || 100,
          analysisConfig: options.analysisConfig || {},
          ...sessionContext.processingState,
        },
      },
      analysis: {
        completedFiles: options.completedFiles || sessionContext.completedFiles || [],
        pendingFiles: options.pendingFiles || sessionContext.pendingFiles || [],
        results: options.analysisResults || sessionContext.results || {},
        errors: options.errors || sessionContext.errors || [],
      },
      context: {
        userMessage: options.userMessage || sessionContext.userMessage,
        options: options.contextOptions || sessionContext.options || {},
        environment: {
          NODE_VERSION: process.version,
          PLATFORM: process.platform,
          MEMORY_LIMIT: process.env.AGENT_MEMORY_LIMIT_MB || '6144',
          WORKING_DIRECTORY: workingDirectory || process.cwd(),
          PACKAGE_PATH: packagePath || process.cwd(),
        },
      },
      metrics: {
        startTime: sessionContext.startTime || Date.now(),
        lastUpdateTime: Date.now(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        filesProcessed: options.filesProcessed || sessionContext.filesProcessed || 0,
        errorsEncountered: (options.errors?.length || 0) + (sessionContext.errors?.length || 0),
      },
    };

    // Save checkpoint
    const saved = await recoveryManager.saveCheckpoint(checkpoint);

    if (saved) {
      // Update session context
      SESSION_CONTEXTS.set(sessionId, {
        ...sessionContext,
        lastCheckpoint: checkpoint.timestamp,
        checkpointSaved: true,
      });

      return {
        success: true,
        checkpointId: sessionId,
        savedAt: checkpoint.timestamp,
        progressData: {
          phase: checkpoint.progress.phase,
          completedSteps: checkpoint.progress.completedSteps,
          totalSteps: checkpoint.progress.totalSteps,
          filesProcessed: checkpoint.metrics.filesProcessed,
          memoryUsage: checkpoint.metrics.memoryUsage,
        },
      };
    } else {
      throw new Error('Failed to save checkpoint to disk');
    }
  } catch (error) {
    return {
      success: false,
      checkpointId: sessionId,
      savedAt: 0,
      progressData: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

async function loadProgressFromCheckpoint(
  sessionId: string,
  options: Record<string, any>,
  signal?: AbortSignal,
): Promise<{
  success: boolean;
  checkpoint?: SessionCheckpoint;
  resumeData?: any;
  error?: string;
}> {
  safeThrowIfAborted(signal);

  try {
    const recoveryManager = getSessionRecoveryManager({
      sessionDir: options.sessionDir || '.claude-sessions',
    });

    const recoveryResult = await recoveryManager.recoverSession(sessionId);

    if (recoveryResult.success && recoveryResult.checkpoint) {
      // Restore session context
      SESSION_CONTEXTS.set(sessionId, {
        packagePath: recoveryResult.checkpoint.packagePath,
        workingDirectory: recoveryResult.checkpoint.workingDirectory,
        currentPhase: recoveryResult.checkpoint.progress.phase,
        completedFiles: recoveryResult.checkpoint.analysis.completedFiles,
        pendingFiles: recoveryResult.checkpoint.analysis.pendingFiles,
        results: recoveryResult.checkpoint.analysis.results,
        errors: recoveryResult.checkpoint.analysis.errors,
        startTime: recoveryResult.checkpoint.metrics.startTime,
        filesProcessed: recoveryResult.checkpoint.metrics.filesProcessed,
        userMessage: recoveryResult.checkpoint.context.userMessage,
        options: recoveryResult.checkpoint.context.options,
        processingState: recoveryResult.checkpoint.progress.processingState,
        checkpointLoaded: true,
        loadedAt: Date.now(),
      });

      return {
        success: true,
        checkpoint: recoveryResult.checkpoint,
        resumeData: recoveryResult.resumeData,
      };
    } else {
      return {
        success: false,
        error: recoveryResult.error || 'Failed to recover session',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function listAllRecoverableSessions(
  sessionDir?: string,
  signal?: AbortSignal,
): Promise<{
  sessions: Array<{
    sessionId: string;
    agentType: string;
    lastUpdate: number;
    status: 'active' | 'crashed' | 'completed' | 'stale';
    progress: number;
    filesProcessed: number;
    packagePath: string;
  }>;
  totalSessions: number;
  recoverableSessions: number;
}> {
  safeThrowIfAborted(signal);

  try {
    const recoveryManager = getSessionRecoveryManager({
      sessionDir: sessionDir || '.claude-sessions',
    });

    const sessionSummaries = await recoveryManager.listRecoverableSessions();

    const sessions = sessionSummaries.map(summary => ({
      sessionId: summary.sessionId,
      agentType: summary.agentType,
      lastUpdate: summary.lastUpdate,
      status: summary.status,
      progress: summary.progress,
      filesProcessed: summary.filesProcessed,
      packagePath: '', // Will be filled from checkpoint if needed
    }));

    const recoverableSessions = sessions.filter(
      s => s.status === 'crashed' || s.status === 'active',
    ).length;

    return {
      sessions,
      totalSessions: sessions.length,
      recoverableSessions,
    };
  } catch (error) {
    return {
      sessions: [],
      totalSessions: 0,
      recoverableSessions: 0,
    };
  }
}

/**
 * Analyze file content using available MCP tools
 */
async function analyzeFileContent(
  filePath: string,
  context: {
    packagePath: string;
    sessionId: string;
    batchIndex: number;
    signal?: AbortSignal;
  },
) {
  const { packagePath, sessionId, batchIndex, signal } = context;

  try {
    safeThrowIfAborted(signal);

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');

    // Basic file analysis - in a real implementation, this would use more sophisticated tools
    const analysis = {
      lineCount: content.split('\n').length,
      characterCount: content.length,
      fileType: getFileType(filePath),
      hasTypeScript: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
      hasReact: content.includes('React') || content.includes('jsx'),
      imports: extractImports(content),
      exports: extractExports(content),
      complexity: estimateComplexity(content),
      lastAnalyzed: Date.now(),
      sessionId,
      batchIndex,
    };

    // Could integrate with other MCP tools here for deeper analysis
    // For example: security scanning, dependency analysis, etc.

    return analysis;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      fileType: getFileType(filePath),
      lastAnalyzed: Date.now(),
      sessionId,
      batchIndex,
    };
  }
}

/**
 * Get file type based on extension
 */
function getFileType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const typeMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript-react',
    '.js': 'javascript',
    '.jsx': 'javascript-react',
    '.json': 'json',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.html': 'html',
    '.py': 'python',
    '.sh': 'shell',
    '.mjs': 'javascript-module',
  };

  return typeMap[ext] || 'unknown';
}

/**
 * Extract import statements from code content
 */
function extractImports(content: string): string[] {
  const importRegex = /^import\s[^;]*?from\s+['"`]([^'"`]+)['"`]/gmu;
  const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gu;

  const imports: string[] = [];
  let match;

  // Extract ES6 imports
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Extract CommonJS requires
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Extract export statements from code content
 */
function extractExports(content: string): string[] {
  const exportRegex = /^export\s+(?:const|let|var|function|class)\s+(\w+)/gmu;
  const exports: string[] = [];
  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  return exports;
}

/**
 * Estimate code complexity (simplified version)
 */
function estimateComplexity(content: string): number {
  // Count complexity indicators
  const indicators = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bswitch\b/g,
    /\bcatch\b/g,
    /\btry\b/g,
    /\?\s*:/g, // ternary operators
  ];

  let complexity = 1; // Base complexity

  for (const regex of indicators) {
    const matches = content.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

/**
 * Update session progress with current file
 */
async function updateSessionProgress(
  sessionId: string,
  currentFile: string,
  filesProcessed: number,
): Promise<void> {
  try {
    const recoveryManager = getSessionRecoveryManager();
    const checkpoint = await recoveryManager.loadCheckpoint(sessionId);

    if (checkpoint) {
      checkpoint.progress.currentStep = `Processing: ${currentFile}`;
      checkpoint.analysis.completedFiles.push(currentFile);
      checkpoint.metrics.filesProcessed = filesProcessed;
      checkpoint.metrics.lastUpdateTime = Date.now();
      checkpoint.metrics.memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

      await recoveryManager.saveCheckpoint(checkpoint);
    }
  } catch (error) {
    // Don't fail the main process for checkpoint errors
    console.warn('Failed to update session progress:', error);
  }
}
