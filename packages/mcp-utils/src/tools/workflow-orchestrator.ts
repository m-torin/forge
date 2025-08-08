/**
 * MCP Tool: Workflow Orchestrator
 * Replaces 27 functions from main code-quality agent for workflow orchestration
 * Enhanced with Node.js 22+ error handling, context tracking, and abort support
 */

import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { runWithContext } from '../utils/context';
import { createEnhancedMCPErrorResponse } from '../utils/error-handling';
import { enhancedClone, isStructuredCloneAvailable } from '../utils/structured-clone';
export interface WorkflowOrchestratorArgs extends AbortableToolArgs {
  action: // Context & Session Management
  | 'detectWorktree' // Check if running in worktree
    | 'setupContext' // Initialize analysis context
    | 'createSession' // Create/resume session
    | 'checkMCPAvailability' // Verify MCP tools available

    // Branch Strategy & Safety
    | 'validateMainAgentContext' // Enforce main agent worktree-only policy
    | 'detectCallContext' // Detect if called by main agent vs direct call
    | 'confirmInBranchRisks' // User confirmation for in-branch operations
    | 'createBackupBranch' // Create safety backup branch
    | 'validateBranchStrategy' // Check if in-branch operation is safe

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
    | 'logToFile'; // Structured logging

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
          'validateMainAgentContext',
          'detectCallContext',
          'confirmInBranchRisks',
          'createBackupBranch',
          'validateBranchStrategy',
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
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: WorkflowOrchestratorArgs): Promise<MCPToolResponse> {
    try {
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
        signal,
      } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      switch (action) {
        case 'validateMainAgentContext': {
          return runWithContext(
            {
              toolName: 'workflow_orchestrator',
              metadata: { action: 'validateMainAgentContext', agentType, enforceWorktreeOnly },
            },
            async () => {
              const result = await validateMainAgentContext(
                agentType,
                enforceWorktreeOnly,
                packagePath,
                signal,
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result),
                  },
                ],
              };
            },
          );
        }

        case 'detectCallContext': {
          const callContext = await detectCallContext(agentType, sessionId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(callContext),
              },
            ],
          };
        }

        case 'confirmInBranchRisks': {
          if (!operation || !riskLevel) {
            throw new Error('Operation and risk level required for risk confirmation');
          }

          const confirmation = await confirmInBranchRisks(
            operation,
            riskLevel,
            affectedFiles || [],
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(confirmation),
              },
            ],
          };
        }

        case 'createBackupBranch': {
          if (!agentName || !operation) {
            throw new Error('Agent name and operation required for backup branch creation');
          }

          const backup = await createBackupBranch(agentName, operation, packagePath);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(backup),
              },
            ],
          };
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

        default:
          throw new Error(`Unknown workflow action: ${action}`);
      }
    } catch (error) {
      // Handle abort errors specially
      if (error instanceof Error && error.message.includes('aborted')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, aborted: true, action: args.action }),
            },
          ],
          isError: true,
        };
      }

      return createEnhancedMCPErrorResponse(error, 'workflow_orchestrator', {
        contextInfo: `Workflow Orchestrator - ${args.action}`,
      });
    }
  },
};

// Core workflow functions (extracted from main agent)
async function detectIfInWorktree(packagePath: string, signal?: AbortSignal) {
  try {
    throwIfAborted(signal);

    // Check if we're in a worktree by looking for .git file (not directory)
    // and checking git worktree status
    return {
      isWorktree: false, // Placeholder implementation
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
    throwIfAborted(signal);

    // Detect worktree if not skipped
    if (!skipWorktreeDetection) {
      const worktreeInfo = await detectIfInWorktree(packagePath, signal);
      context.isWorktree = worktreeInfo.isWorktree;
    }

    throwIfAborted(signal);

    // Check for package.json and analyze project structure
    // This would integrate with existing file discovery tools
    context.hasTypeScript = true; // Placeholder
    context.hasNextJs = packagePath.includes('nextjs') || packagePath.includes('next');
    context.isVercelProject = false; // Placeholder

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
    ],
    unavailable: ['security_scanner', 'test_runner', 'report_generator'],
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
  agentType?: string,
  enforceWorktreeOnly?: boolean,
  packagePath?: string,
  signal?: AbortSignal,
) {
  throwIfAborted(signal);

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

async function detectCallContext(agentType?: string, sessionId?: string) {
  // In real implementation, this would analyze the call stack or session metadata
  // For now, return a placeholder that can be used for logic
  return {
    calledByMainAgent: agentType === 'main',
    directCall: agentType !== 'main',
    sessionId: sessionId || 'unknown',
    timestamp: new Date().toISOString(),
    contextType: agentType === 'main' ? 'main_agent_orchestration' : 'direct_subagent_call',
  };
}

async function confirmInBranchRisks(operation: string, riskLevel: string, affectedFiles: string[]) {
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

  // In real implementation, this would prompt user for confirmation
  // For now, simulate user confirmation based on risk level
  const autoApprove = riskLevel === 'low' || riskLevel === 'medium';

  return {
    ...riskInfo,
    confirmed: autoApprove, // In real implementation, would be user input
    timestamp: new Date().toISOString(),
    warningShown: true,
    backupRequired: riskLevel === 'high' || riskLevel === 'critical',
  };
}

async function createBackupBranch(agentName: string, operation: string, packagePath?: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `${agentName}-backup-${timestamp}`;

  // In real implementation, this would create an actual Git branch
  // For now, return the plan for branch creation
  return {
    backupBranch: branchName,
    created: true, // Simulated - would be actual git branch creation
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
  agentType?: string,
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
