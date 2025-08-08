/**
 * MCP Client wrapper for Code Quality tools
 * Provides memory persistence and session management
 */

import { createEntityName } from '@repo/mcp-utils';
import { logError } from '@repo/observability';
import type { AnalysisResult, CodeQualitySession } from './types';

// Import MCP memory tools
declare global {
  const mcp__memory__create_entities: (params: {
    entities: Array<{ name: string; entityType: string; observations: string[] }>;
  }) => Promise<any>;
  const mcp__memory__add_observations: (params: {
    observations: Array<{ entityName: string; contents: string[] }>;
  }) => Promise<any>;
  const mcp__memory__search_nodes: (params: { query: string }) => Promise<{ entities?: any[] }>;
  const mcp__memory__delete_entities: (params: { entityNames: string[] }) => Promise<any>;
}

export class CodeQualityMCPClient {
  /**
   * Create a new analysis session entity in memory
   */
  async createSession(session: CodeQualitySession): Promise<void> {
    const entityName = createEntityName('CodeQualitySession', session.sessionId);

    await mcp__memory__create_entities({
      entities: [
        {
          name: entityName,
          entityType: 'CodeQualitySession',
          observations: [
            `sessionId:${session.sessionId}`,
            `workingDirectory:${session.workingDirectory}`,
            `worktreePath:${session.worktreePath || ''}`,
            `status:${session.status}`,
            `createdAt:${session.createdAt.toISOString()}`,
          ],
        },
      ],
    });
  }

  /**
   * Store analysis result in memory
   */
  async storeResult(result: AnalysisResult): Promise<void> {
    const entityName = createEntityName(`${result.toolName}Result`, result.sessionId);

    await mcp__memory__create_entities({
      entities: [
        {
          name: entityName,
          entityType: 'AnalysisResult',
          observations: [
            `sessionId:${result.sessionId}`,
            `toolName:${result.toolName}`,
            `timestamp:${result.timestamp}`,
            `success:${result.success}`,
            `data:${JSON.stringify(result.data)}`,
            ...(result.error ? [`error:${result.error}`] : []),
          ],
        },
      ],
    });
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: CodeQualitySession['status'],
  ): Promise<void> {
    const entityName = createEntityName('CodeQualitySession', sessionId);

    await mcp__memory__add_observations({
      observations: [
        {
          entityName,
          contents: [`status:${status}`, `updatedAt:${new Date().toISOString()}`],
        },
      ],
    });
  }

  /**
   * Retrieve session information
   */
  async getSession(sessionId: string): Promise<CodeQualitySession | null> {
    const entityName = createEntityName('CodeQualitySession', sessionId);

    try {
      const result = await mcp__memory__search_nodes({ query: entityName });
      if (!result.entities || result.entities.length === 0) return null;

      const entity = result.entities[0];
      return this.parseSessionFromEntity(entity);
    } catch (error) {
      logError('Error retrieving session', { error });
      return null;
    }
  }

  /**
   * Get all results for a session
   */
  async getSessionResults(sessionId: string): Promise<AnalysisResult[]> {
    try {
      const result = await mcp__memory__search_nodes({ query: `*Result:${sessionId}` });
      if (!result.entities) return [];

      return result.entities.map(entity => this.parseResultFromEntity(entity));
    } catch (error) {
      logError('Error retrieving session results', { error });
      return [];
    }
  }

  /**
   * Clean up session data
   */
  async cleanupSession(sessionId: string): Promise<void> {
    try {
      // Find all entities related to this session
      const result = await mcp__memory__search_nodes({ query: `*:${sessionId}` });

      // Delete all related entities
      if (result.entities && result.entities.length > 0) {
        const entityNames = result.entities.map(entity => entity.name);
        await mcp__memory__delete_entities({ entityNames });
      }
    } catch (error) {
      logError('Error cleaning up session', { error });
    }
  }

  // Private helper methods for parsing entity data

  private parseSessionFromEntity(entity: any): CodeQualitySession {
    const observations = entity.observations || [];
    const getObservation = (key: string) => {
      const obs = observations.find((o: string) => o.startsWith(`${key}:`));
      return obs ? obs.substring(key.length + 1) : '';
    };

    return {
      sessionId: getObservation('sessionId'),
      workingDirectory: getObservation('workingDirectory'),
      worktreePath: getObservation('worktreePath') || undefined,
      status: getObservation('status') as CodeQualitySession['status'],
      createdAt: new Date(getObservation('createdAt')),
    };
  }

  private parseResultFromEntity(entity: any): AnalysisResult {
    const observations = entity.observations || [];
    const getObservation = (key: string) => {
      const obs = observations.find((o: string) => o.startsWith(`${key}:`));
      return obs ? obs.substring(key.length + 1) : '';
    };

    return {
      sessionId: getObservation('sessionId'),
      timestamp: parseInt(getObservation('timestamp')),
      toolName: getObservation('toolName'),
      success: getObservation('success') === 'true',
      data: JSON.parse(getObservation('data') || '{}'),
      error: getObservation('error') || undefined,
    };
  }
}

// Export singleton instance
export const mcpClient = new CodeQualityMCPClient();

// Export utility functions for tools
export { createEntityName, safeStringify } from '@repo/mcp-utils';

// Export async logger creator
export function createAsyncLogger(name: string) {
  return async (message: string, data?: any) => {
    // Use observability logging instead of console
    const { logInfo } = await import('@repo/observability');
    logInfo(`[${name}] ${message}`, { data });
  };
}
