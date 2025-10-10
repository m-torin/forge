/**
 * Session Recovery Utility for Crashed Agent Sessions
 *
 * Provides comprehensive session recovery capabilities including progress restoration,
 * state validation, and automatic cleanup of stale sessions.
 */

import { randomUUID } from 'crypto';
import { join } from 'path';
import {
  checkFileAccess,
  getFileStats,
  safeMkdir,
  safeReaddir,
  safeReadFile,
  safeUnlink,
  safeWriteFile,
} from './files';

export interface SessionCheckpoint {
  sessionId: string;
  timestamp: number;
  agentType: string;
  packagePath: string;
  workingDirectory?: string;
  progress: {
    phase: string;
    completedSteps: number;
    totalSteps: number;
    currentStep: string;
    processingState: Record<string, any>;
  };
  analysis: {
    completedFiles: string[];
    pendingFiles: string[];
    results: Record<string, any>;
    errors: Array<{ file: string; error: string; timestamp: number }>;
  };
  context: {
    userMessage?: string;
    options?: Record<string, any>;
    environment?: Record<string, string>;
  };
  metrics: {
    startTime: number;
    lastUpdateTime: number;
    memoryUsage: number;
    filesProcessed: number;
    errorsEncountered: number;
  };
}

export interface RecoveryOptions {
  /** Maximum age of sessions to recover (default: 24 hours) */
  maxSessionAge?: number;
  /** Directory for session storage (default: .claude-sessions) */
  sessionDir?: string;
  /** Enable automatic cleanup of old sessions (default: true) */
  autoCleanup?: boolean;
  /** Retention period for completed sessions (default: 7 days) */
  retentionDays?: number;
  /** Validation function for checkpoint data */
  validateCheckpoint?: (checkpoint: SessionCheckpoint) => boolean;
}

export interface RecoveryResult {
  success: boolean;
  sessionId: string;
  checkpoint?: SessionCheckpoint;
  resumeData?: {
    pendingFiles: string[];
    partialResults: Record<string, any>;
    nextStep: string;
    continuationContext: Record<string, any>;
  };
  error?: string;
  recommendations?: string[];
}

export interface SessionSummary {
  sessionId: string;
  agentType: string;
  lastUpdate: number;
  status: 'active' | 'crashed' | 'completed' | 'stale';
  progress: number;
  filesProcessed: number;
  estimatedCompletion?: number;
}

export class SessionRecoveryManager {
  private options: Required<Omit<RecoveryOptions, 'validateCheckpoint'>> & {
    validateCheckpoint?: (checkpoint: SessionCheckpoint) => boolean;
  };

  constructor(options: RecoveryOptions = {}) {
    this.options = {
      maxSessionAge: options.maxSessionAge ?? 24 * 60 * 60 * 1000, // 24 hours
      sessionDir: options.sessionDir ?? '.claude-sessions',
      autoCleanup: options.autoCleanup ?? true,
      retentionDays: options.retentionDays ?? 7,
      validateCheckpoint: options.validateCheckpoint,
    };
  }

  /**
   * Save checkpoint for current session
   */
  async saveCheckpoint(checkpoint: SessionCheckpoint): Promise<boolean> {
    try {
      await this.ensureSessionDirectory();

      const checkpointPath = this.getCheckpointPath(checkpoint.sessionId);
      const checkpointData = {
        ...checkpoint,
        timestamp: Date.now(),
        metrics: {
          ...checkpoint.metrics,
          lastUpdateTime: Date.now(),
        },
      };

      await safeWriteFile(checkpointPath, JSON.stringify(checkpointData, null, 2), {
        allowedBasePaths: [this.options.sessionDir],
        encoding: 'utf8',
      });
      return true;
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
      return false;
    }
  }

  /**
   * Load checkpoint for session recovery
   */
  async loadCheckpoint(sessionId: string): Promise<SessionCheckpoint | null> {
    try {
      const checkpointPath = this.getCheckpointPath(sessionId);
      const data = (await safeReadFile(checkpointPath, {
        allowedBasePaths: [this.options.sessionDir],
        encoding: 'utf8',
      })) as string;
      const checkpoint: SessionCheckpoint = JSON.parse(data);

      // Validate checkpoint if validator provided
      if (this.options.validateCheckpoint && !this.options.validateCheckpoint(checkpoint)) {
        console.warn(`Invalid checkpoint for session ${sessionId}`);
        return null;
      }

      return checkpoint;
    } catch (error) {
      // Session file doesn't exist or is corrupted
      return null;
    }
  }

  /**
   * Recover crashed session and prepare resume data
   */
  async recoverSession(sessionId: string): Promise<RecoveryResult> {
    try {
      const checkpoint = await this.loadCheckpoint(sessionId);

      if (!checkpoint) {
        return {
          success: false,
          sessionId,
          error: 'Checkpoint not found or invalid',
          recommendations: [
            'Session may have been completed or cleaned up',
            'Try starting a new analysis session',
          ],
        };
      }

      // Check if session is too old
      const sessionAge = Date.now() - checkpoint.timestamp;
      if (sessionAge > this.options.maxSessionAge) {
        return {
          success: false,
          sessionId,
          checkpoint,
          error: 'Session is too old to recover',
          recommendations: [
            'Session has exceeded maximum recovery age',
            'Consider starting a fresh analysis',
            `Session age: ${Math.round(sessionAge / (60 * 60 * 1000))} hours`,
          ],
        };
      }

      // Validate session state
      const validation = await this.validateSessionState(checkpoint);
      if (!validation.valid) {
        return {
          success: false,
          sessionId,
          checkpoint,
          error: `Session validation failed: ${validation.reason}`,
          recommendations: validation.recommendations || [
            'Session state appears to be corrupted',
            'Consider starting a new analysis',
          ],
        };
      }

      // Generate resume data
      const resumeData = this.generateResumeData(checkpoint);

      return {
        success: true,
        sessionId,
        checkpoint,
        resumeData,
        recommendations: [
          `Session can be resumed from ${checkpoint.progress.phase}`,
          `${checkpoint.analysis.pendingFiles.length} files remaining to process`,
          `Previous progress: ${this.calculateProgressPercentage(checkpoint)}%`,
        ],
      };
    } catch (error) {
      return {
        success: false,
        sessionId,
        error: `Recovery failed: ${error instanceof Error ? error.message : String(error)}`,
        recommendations: ['Check session directory permissions', 'Verify session data integrity'],
      };
    }
  }

  /**
   * List all recoverable sessions
   */
  async listRecoverableSessions(): Promise<SessionSummary[]> {
    try {
      await this.ensureSessionDirectory();
      const files = await safeReaddir(this.options.sessionDir, {
        allowedBasePaths: [this.options.sessionDir],
      });
      const sessionFiles = files.filter(f => f.endsWith('.json'));

      const sessions: SessionSummary[] = [];

      for (const file of sessionFiles) {
        try {
          const sessionId = file.replace('.json', '');
          const checkpoint = await this.loadCheckpoint(sessionId);

          if (!checkpoint) continue;

          const status = this.determineSessionStatus(checkpoint);
          const progress = this.calculateProgressPercentage(checkpoint);

          sessions.push({
            sessionId,
            agentType: checkpoint.agentType,
            lastUpdate: checkpoint.metrics.lastUpdateTime,
            status,
            progress,
            filesProcessed: checkpoint.metrics.filesProcessed,
            estimatedCompletion: this.estimateCompletion(checkpoint),
          });
        } catch (error) {
          // Skip corrupted session files
          continue;
        }
      }

      return sessions.sort((a, b) => b.lastUpdate - a.lastUpdate);
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  /**
   * Clean up old or completed sessions
   */
  async cleanupSessions(): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    const result = { cleaned: 0, errors: [] as string[] };

    try {
      const sessions = await this.listRecoverableSessions();
      const now = Date.now();
      const retentionMs = this.options.retentionDays * 24 * 60 * 60 * 1000;

      for (const session of sessions) {
        try {
          const shouldCleanup =
            (session.status === 'completed' && now - session.lastUpdate > retentionMs) ||
            session.status === 'stale' ||
            now - session.lastUpdate > this.options.maxSessionAge * 2;

          if (shouldCleanup) {
            await this.deleteSession(session.sessionId);
            result.cleaned++;
          }
        } catch (error) {
          result.errors.push(`Failed to cleanup session ${session.sessionId}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(
        `Cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return result;
  }

  /**
   * Delete a specific session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const checkpointPath = this.getCheckpointPath(sessionId);
      await safeUnlink(checkpointPath, {
        allowedBasePaths: [this.options.sessionDir],
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new session checkpoint
   */
  createCheckpoint(
    agentType: string,
    packagePath: string,
    userMessage?: string,
    options?: Record<string, any>,
  ): SessionCheckpoint {
    const sessionId = `session_${Date.now()}_${randomUUID().slice(0, 8)}`;

    return {
      sessionId,
      timestamp: Date.now(),
      agentType,
      packagePath,
      progress: {
        phase: 'initialization',
        completedSteps: 0,
        totalSteps: 0,
        currentStep: 'starting',
        processingState: {},
      },
      analysis: {
        completedFiles: [],
        pendingFiles: [],
        results: {},
        errors: [],
      },
      context: {
        userMessage,
        options: options || {},
        environment: {
          NODE_VERSION: process.version,
          PLATFORM: process.platform,
          MEMORY_LIMIT: '6144', // Default memory limit instead of direct process.env access
        },
      },
      metrics: {
        startTime: Date.now(),
        lastUpdateTime: Date.now(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        filesProcessed: 0,
        errorsEncountered: 0,
      },
    };
  }

  // Private methods

  private async ensureSessionDirectory(): Promise<void> {
    try {
      await checkFileAccess(this.options.sessionDir, {
        allowedBasePaths: [this.options.sessionDir],
      });
    } catch {
      await safeMkdir(this.options.sessionDir, {
        allowedBasePaths: [this.options.sessionDir],
        recursive: true,
      });
    }
  }

  private getCheckpointPath(sessionId: string): string {
    return join(this.options.sessionDir, `${sessionId}.json`);
  }

  private async validateSessionState(checkpoint: SessionCheckpoint): Promise<{
    valid: boolean;
    reason?: string;
    recommendations?: string[];
  }> {
    try {
      // Check if package path still exists
      try {
        await getFileStats(checkpoint.packagePath, {
          allowedBasePaths: [checkpoint.packagePath],
        });
      } catch {
        return {
          valid: false,
          reason: 'Package path no longer exists',
          recommendations: [
            'The project directory may have been moved or deleted',
            'Update the package path or start a new session',
          ],
        };
      }

      // Check if working directory exists (if specified)
      if (checkpoint.workingDirectory) {
        try {
          await getFileStats(checkpoint.workingDirectory, {
            allowedBasePaths: [checkpoint.workingDirectory],
          });
        } catch {
          return {
            valid: false,
            reason: 'Working directory no longer exists',
            recommendations: [
              'The working directory (worktree) may have been cleaned up',
              'Session may need to recreate working environment',
            ],
          };
        }
      }

      // Validate required fields
      if (!checkpoint.sessionId || !checkpoint.agentType || !checkpoint.packagePath) {
        return {
          valid: false,
          reason: 'Missing required checkpoint fields',
          recommendations: ['Checkpoint data appears to be corrupted'],
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private generateResumeData(checkpoint: SessionCheckpoint) {
    const nextStep = this.determineNextStep(checkpoint);

    return {
      pendingFiles: [...checkpoint.analysis.pendingFiles],
      partialResults: { ...checkpoint.analysis.results },
      nextStep,
      continuationContext: {
        phase: checkpoint.progress.phase,
        processingState: checkpoint.progress.processingState,
        previousErrors: checkpoint.analysis.errors,
        lastProcessedFile: checkpoint.analysis.completedFiles.slice(-1)[0],
        environmentContext: checkpoint.context.environment,
      },
    };
  }

  private determineNextStep(checkpoint: SessionCheckpoint): string {
    if (checkpoint.analysis.pendingFiles.length === 0) {
      return 'finalization';
    }

    switch (checkpoint.progress.phase) {
      case 'initialization':
        return 'file_discovery';
      case 'file_discovery':
        return 'analysis';
      case 'analysis':
        return checkpoint.analysis.pendingFiles.length > 0 ? 'continue_analysis' : 'reporting';
      case 'reporting':
        return 'finalization';
      default:
        return 'analysis';
    }
  }

  private calculateProgressPercentage(checkpoint: SessionCheckpoint): number {
    const totalFiles =
      checkpoint.analysis.completedFiles.length + checkpoint.analysis.pendingFiles.length;
    if (totalFiles === 0) return 0;

    return Math.round((checkpoint.analysis.completedFiles.length / totalFiles) * 100);
  }

  private determineSessionStatus(
    checkpoint: SessionCheckpoint,
  ): 'active' | 'crashed' | 'completed' | 'stale' {
    const age = Date.now() - checkpoint.metrics.lastUpdateTime;
    const oneHour = 60 * 60 * 1000;

    if (
      checkpoint.analysis.pendingFiles.length === 0 &&
      checkpoint.progress.phase === 'completed'
    ) {
      return 'completed';
    }

    if (age > oneHour * 2) {
      return 'stale';
    }

    if (age > oneHour && checkpoint.analysis.errors.length > 0) {
      return 'crashed';
    }

    return 'active';
  }

  private estimateCompletion(checkpoint: SessionCheckpoint): number | undefined {
    const totalFiles =
      checkpoint.analysis.completedFiles.length + checkpoint.analysis.pendingFiles.length;
    if (totalFiles === 0 || checkpoint.analysis.completedFiles.length === 0) {
      return undefined;
    }

    const elapsed = checkpoint.metrics.lastUpdateTime - checkpoint.metrics.startTime;
    const averageTimePerFile = elapsed / checkpoint.analysis.completedFiles.length;
    const remainingTime = averageTimePerFile * checkpoint.analysis.pendingFiles.length;

    return Date.now() + remainingTime;
  }
}

/**
 * Global session recovery instance
 */
let globalRecoveryManager: SessionRecoveryManager | null = null;

/**
 * Get or create global session recovery manager
 */
export function getSessionRecoveryManager(options?: RecoveryOptions): SessionRecoveryManager {
  if (!globalRecoveryManager) {
    globalRecoveryManager = new SessionRecoveryManager(options);
  }
  return globalRecoveryManager;
}

/**
 * Utility function to quickly check for recoverable sessions
 */
export async function hasRecoverableSessions(sessionDir?: string): Promise<boolean> {
  const manager = getSessionRecoveryManager({ sessionDir });
  const sessions = await manager.listRecoverableSessions();
  return sessions.filter(s => s.status === 'crashed' || s.status === 'active').length > 0;
}

/**
 * Utility function to auto-recover the most recent session
 */
export async function autoRecoverLatestSession(
  sessionDir?: string,
): Promise<RecoveryResult | null> {
  const manager = getSessionRecoveryManager({ sessionDir });
  const sessions = await manager.listRecoverableSessions();

  const recoverableSession = sessions.find(s => s.status === 'crashed' || s.status === 'active');
  if (!recoverableSession) {
    return null;
  }

  return await manager.recoverSession(recoverableSession.sessionId);
}
