/**
 * Session Management Tool for Code Quality Analysis
 *
 * Handles session creation, resumption, progress tracking, and task list
 * management for code quality analysis workflows. Provides session persistence
 * and recovery capabilities.
 */

import { logInfo, logWarn } from '@repo/observability';
import { tool, type Tool } from 'ai';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';
import { extractObservation } from '../utils';

// Input schema for session management
const sessionManagementInputSchema = z.object({
  sessionId: z.string().optional().describe('Session ID for existing session operations'),
  action: z
    .enum(['create', 'resume', 'update', 'complete', 'cleanup'])
    .describe('Action to perform'),
  userMessage: z.string().optional().describe('User message for session context'),
  context: z
    .object({
      packageName: z.string().describe('Package name being analyzed'),
      packagePath: z.string().describe('Path to the package'),
      isWorktree: z.boolean().optional().default(false).describe('Whether using Git worktree'),
      worktreeInfo: z
        .object({
          branch: z.string().optional(),
          path: z.string().optional(),
          head: z.string().optional(),
        })
        .optional()
        .describe('Worktree information if applicable'),
    })
    .optional()
    .describe('Project context information'),
  progress: z
    .object({
      batchIndex: z.number().describe('Current batch index'),
      processedFiles: z.array(z.string()).describe('List of processed files'),
      status: z.enum(['in-progress', 'completed', 'failed']).describe('Current status'),
      currentPhase: z.string().optional().describe('Current phase name'),
      completedTasks: z.array(z.string()).optional().describe('List of completed tasks'),
    })
    .optional()
    .describe('Progress data for updates'),
  options: z
    .object({
      maxSessionAge: z.number().default(24).describe('Maximum age in hours for resumable sessions'),
      createTaskList: z.boolean().default(true).describe('Whether to create a task list'),
      trackProgress: z.boolean().default(true).describe('Whether to track progress in MCP memory'),
    })
    .optional()
    .default({
      maxSessionAge: 24,
      createTaskList: true,
      trackProgress: true,
    }),
});

// Session management result interfaces
interface TaskItem {
  task: string;
  done: boolean;
  startTime?: number;
  completedTime?: number;
}

interface TaskList {
  phase1: TaskItem[];
  phase2: TaskItem[];
  phase3: TaskItem[];
  phase4: TaskItem[];
  phase5: TaskItem[];
}

interface SessionData {
  sessionId: string;
  packageName: string;
  packagePath: string;
  startTime: number;
  lastUpdate: number;
  status: 'in-progress' | 'completed' | 'failed';
  currentBatch: number;
  processedFiles: string[];
  userMessage: string;
  isWorktree: boolean;
  worktreeBranch?: string;
  currentPhase?: string;
}

interface SessionManagementResult {
  success: boolean;
  action: string;
  sessionId: string;
  isResuming?: boolean;
  sessionData?: SessionData;
  taskList?: TaskList;
  currentBatch?: number;
  processedFiles?: string[];
  progress?: {
    totalTasks: number;
    completedTasks: number;
    currentPhase: string;
    percentComplete: number;
  };
}

// Create default task list for code quality analysis
function createTaskList(): TaskList {
  return {
    phase1: [
      { task: 'Initialize Git worktree', done: false },
      { task: 'Detect package scope and context', done: false },
      { task: 'Load framework documentation', done: false },
      { task: 'Initialize Git and MCP connections', done: false },
      { task: 'Create analysis session', done: false },
    ],
    phase2: [
      { task: 'Scan package files', done: false },
      { task: 'Identify changed files via Git', done: false },
      { task: 'Build priority analysis list', done: false },
      { task: 'Create processing batches', done: false },
      { task: 'Build dependency index', done: false },
    ],
    phase3: [
      { task: 'Run TypeScript checking', done: false },
      { task: 'Run ESLint analysis', done: false },
      { task: 'Detect code patterns', done: false },
      { task: 'Analyze file quality', done: false },
      { task: 'Remove targeted generic words', done: false },
      { task: 'Check mock centralization', done: false },
    ],
    phase4: [
      { task: 'Scan package dependencies', done: false },
      { task: 'Analyze package utilization', done: false },
      { task: 'Fetch function documentation', done: false },
      { task: 'Check framework versions', done: false },
      { task: 'Identify deprecated patterns', done: false },
      { task: 'Apply modernization fixes', done: false },
      { task: 'Validate code quality and tests', done: false },
    ],
    phase5: [
      { task: 'Calculate quality scores', done: false },
      { task: 'Generate recommendations', done: false },
      { task: 'Create pull request', done: false },
      { task: 'Update session status', done: false },
    ],
  };
}

// Update task status in task list
function updateTask(
  taskList: TaskList,
  phase: keyof TaskList,
  taskName: string,
  done: boolean = true,
): void {
  const tasks = taskList[phase];
  if (tasks) {
    const task = tasks.find(t => t.task === taskName);
    if (task) {
      task.done = done;
      if (done && !task.completedTime) {
        task.completedTime = Date.now();
      }
      if (!task.startTime && !done) {
        task.startTime = Date.now();
      }
    }
  }
}

// Calculate progress statistics
function calculateProgress(taskList: TaskList): {
  totalTasks: number;
  completedTasks: number;
  currentPhase: string;
  percentComplete: number;
} {
  let totalTasks = 0;
  let completedTasks = 0;
  let currentPhase = 'phase1';

  for (const [phase, tasks] of Object.entries(taskList)) {
    totalTasks += tasks.length;
    const phaseDone = tasks.filter((t: any) => t.done).length;
    completedTasks += phaseDone;

    // Find current phase (first phase with incomplete tasks)
    if (phaseDone < tasks.length && currentPhase === 'phase1') {
      currentPhase = phase;
    }
  }

  return {
    totalTasks,
    completedTasks,
    currentPhase,
    percentComplete: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  };
}

// Create new session
async function createSession(
  userMessage: string,
  context: NonNullable<z.infer<typeof sessionManagementInputSchema>['context']>,
  options: NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
): Promise<SessionManagementResult> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  logInfo(`🆕 Creating new analysis session: ${sessionId}`);

  // Create session data
  const sessionData: SessionData = {
    sessionId,
    packageName: context.packageName,
    packagePath: context.packagePath,
    startTime: Date.now(),
    lastUpdate: Date.now(),
    status: 'in-progress',
    currentBatch: 0,
    processedFiles: [],
    userMessage: userMessage || 'analyze code quality',
    isWorktree: context.isWorktree || false,
    worktreeBranch: context.worktreeInfo?.branch,
    currentPhase: 'phase1',
  };

  // Store in MCP memory if tracking enabled
  if (options.trackProgress) {
    try {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'session-management',
        success: true,
        data: {
          action: 'create',
          sessionData,
          entityType: 'Session',
        },
      });
    } catch (error) {
      logWarn(`Could not store session in MCP`, { error });
    }
  }

  // Create task list if requested
  const taskList = options.createTaskList ? createTaskList() : undefined;
  const progress = taskList ? calculateProgress(taskList) : undefined;

  return {
    success: true,
    action: 'create',
    sessionId,
    isResuming: false,
    sessionData,
    taskList,
    currentBatch: 0,
    processedFiles: [],
    progress,
  };
}

// Resume existing session
async function resumeSession(
  sessionId: string,
  options: NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
): Promise<SessionManagementResult> {
  try {
    // Try to find existing session in MCP memory
    // Note: searchMemory method is not available on this client
    const searchResult: any = null; // await mcpClient.searchMemory({
    //   query: `Session sessionId:${sessionId}`,
    //   maxResults: 1
    // });

    if (!searchResult.entities || searchResult.entities.length === 0) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const entity = searchResult.entities[0];
    const lastUpdate = parseInt(extractObservation(entity, 'lastUpdate') || '0');
    const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);

    if (hoursSinceUpdate > options.maxSessionAge) {
      throw new Error(`Session ${sessionId} is too old (${Math.round(hoursSinceUpdate)} hours)`);
    }

    // Reconstruct session data
    const sessionData: SessionData = {
      sessionId,
      packageName: extractObservation(entity, 'packageName') || '',
      packagePath: extractObservation(entity, 'packagePath') || '',
      startTime: parseInt(extractObservation(entity, 'startTime') || '0'),
      lastUpdate,
      status: (extractObservation(entity, 'status') as SessionData['status']) || 'in-progress',
      currentBatch: parseInt(extractObservation(entity, 'currentBatch') || '0'),
      processedFiles: JSON.parse(extractObservation(entity, 'processedFiles') || '[]'),
      userMessage: extractObservation(entity, 'userMessage') || '',
      isWorktree: extractObservation(entity, 'isWorktree') === 'true',
      worktreeBranch: extractObservation(entity, 'worktreeBranch') || undefined,
      currentPhase: extractObservation(entity, 'currentPhase') || 'phase1',
    };

    logInfo(`📂 Resuming session ${sessionId} (${Math.round(hoursSinceUpdate)} hours old)`);
    logInfo(`📊 Progress: ${sessionData.processedFiles.length} files already processed`);

    // Create task list and update based on progress
    let taskList: TaskList | undefined;
    let progress: ReturnType<typeof calculateProgress> | undefined;

    if (options.createTaskList) {
      taskList = createTaskList();

      // Update task statuses based on session progress
      if (sessionData.processedFiles.length > 0) {
        updateTask(taskList, 'phase1', 'Detect package scope and context', true);
        updateTask(taskList, 'phase1', 'Load framework documentation', true);
        updateTask(taskList, 'phase1', 'Create analysis session', true);
      }

      if (sessionData.currentBatch > 0) {
        updateTask(taskList, 'phase2', 'Scan package files', true);
        updateTask(taskList, 'phase2', 'Build priority analysis list', true);
      }

      progress = calculateProgress(taskList);
    }

    return {
      success: true,
      action: 'resume',
      sessionId,
      isResuming: true,
      sessionData,
      taskList,
      currentBatch: sessionData.currentBatch,
      processedFiles: sessionData.processedFiles,
      progress,
    };
  } catch (error) {
    throw new Error(`Could not resume session: ${error}`);
  }
}

// Update session progress
async function updateSessionProgress(
  sessionId: string,
  progress: NonNullable<z.infer<typeof sessionManagementInputSchema>['progress']>,
  options: NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
): Promise<SessionManagementResult> {
  if (options.trackProgress) {
    try {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'session-management',
        success: true,
        data: {
          action: 'update',
          progress: {
            batchIndex: progress.batchIndex,
            processedFiles: progress.processedFiles,
            status: progress.status,
            currentPhase: progress.currentPhase,
            lastUpdate: Date.now(),
          },
        },
      });
    } catch (error) {
      logWarn(`Could not update session progress`, { error });
    }
  }

  logInfo(
    `📊 Session ${sessionId} progress updated: ${progress.processedFiles.length} files processed`,
  );

  return {
    success: true,
    action: 'update',
    sessionId,
    currentBatch: progress.batchIndex,
    processedFiles: progress.processedFiles,
  };
}

// Complete session
async function completeSession(
  sessionId: string,
  options: NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
): Promise<SessionManagementResult> {
  if (options.trackProgress) {
    try {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'session-management',
        success: true,
        data: {
          action: 'complete',
          status: 'completed',
          completedAt: Date.now(),
        },
      });
    } catch (error) {
      logWarn(`Could not mark session complete`, { error });
    }
  }

  logInfo(`✅ Analysis session ${sessionId} completed successfully`);

  return {
    success: true,
    action: 'complete',
    sessionId,
    progress: {
      totalTasks: 0,
      completedTasks: 0,
      currentPhase: 'completed',
      percentComplete: 100,
    },
  };
}

// Main session management tool
export const sessionManagementTool = tool({
  description:
    'Manage analysis sessions including creation, resumption, progress tracking, and completion. Provides session persistence and recovery capabilities for long-running code quality analysis workflows.',

  inputSchema: sessionManagementInputSchema,

  execute: async (
    {
      sessionId,
      action,
      userMessage,
      context,
      progress,
      options = { maxSessionAge: 24, createTaskList: true, trackProgress: true },
    }: any,
    _toolOptions: any = { toolCallId: 'session-management', messages: [] },
  ) => {
    try {
      switch (action) {
        case 'create':
          if (!context) {
            throw new Error('Context is required for session creation');
          }
          return await createSession(
            userMessage || '',
            context,
            options as NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
          );

        case 'resume':
          if (!sessionId) {
            throw new Error('Session ID is required for resumption');
          }
          return await resumeSession(
            sessionId,
            options as NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
          );

        case 'update':
          if (!sessionId || !progress) {
            throw new Error('Session ID and progress are required for updates');
          }
          return await updateSessionProgress(
            sessionId,
            progress,
            options as NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
          );

        case 'complete':
          if (!sessionId) {
            throw new Error('Session ID is required for completion');
          }
          return await completeSession(
            sessionId,
            options as NonNullable<z.infer<typeof sessionManagementInputSchema>['options']>,
          );

        case 'cleanup':
          // Clean up old sessions (could be implemented later)
          return {
            success: true,
            action: 'cleanup',
            sessionId: sessionId || 'all',
          };

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      // Store error in MCP if possible
      if (sessionId && (options as any).trackProgress) {
        try {
          await mcpClient.storeResult({
            sessionId,
            timestamp: Date.now(),
            toolName: 'session-management',
            success: false,
            data: {},
            error: (error as Error).message,
          });
        } catch {}
      }

      throw error;
    }
  },

  // Multi-modal result content
  experimental_toToolResultContent: (result: SessionManagementResult) => [
    {
      type: 'text',
      text:
        `📋 Session Management: ${result.action.toUpperCase()}\\n` +
        `🆔 Session ID: ${result.sessionId}\\n` +
        `${result.isResuming ? '📂 Resumed existing session' : '🆕 Created new session'}\\n` +
        `${
          result.progress
            ? `📊 Progress: ${result.progress.completedTasks}/${result.progress.totalTasks} tasks (${result.progress.percentComplete}%)\\n` +
              `🔄 Current Phase: ${result.progress.currentPhase}\\n`
            : ''
        }` +
        `${result.processedFiles ? `📁 Processed Files: ${result.processedFiles.length}\\n` : ''}` +
        `${
          result.sessionData
            ? `📦 Package: ${result.sessionData.packageName}\\n` +
              `⏰ Started: ${new Date(result.sessionData.startTime).toLocaleTimeString()}\\n` +
              `${result.sessionData.isWorktree ? `🌿 Worktree: ${result.sessionData.worktreeBranch || 'Unknown'}\\n` : ''}`
            : ''
        }`,
    },
  ],
} as any) as Tool;

export type { SessionData, SessionManagementResult, TaskItem, TaskList };
