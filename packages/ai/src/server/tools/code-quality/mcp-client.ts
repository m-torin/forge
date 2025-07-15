/**
 * MCP Client wrapper for Code Quality tools
 * Provides memory persistence and session management
 */

import { logError, logInfo } from '@repo/observability';
import type { AnalysisResult, CodeQualitySession } from './types';

export class CodeQualityMCPClient {
  /**
   * Create a new analysis session entity in memory
   */
  async createSession(session: CodeQualitySession): Promise<void> {
    // This would integrate with the actual MCP memory tools
    // For now, we'll use a placeholder that matches the existing pattern
    const entityName = `CodeQualitySession:${session.sessionId}`;

    // Using the MCP memory tools that already exist
    await this.createEntity(entityName, 'CodeQualitySession', [
      `sessionId:${session.sessionId}`,
      `workingDirectory:${session.workingDirectory}`,
      `worktreePath:${session.worktreePath || ''}`,
      `status:${session.status}`,
      `createdAt:${session.createdAt.toISOString()}`,
    ]);
  }

  /**
   * Store analysis result in memory
   */
  async storeResult(result: AnalysisResult): Promise<void> {
    const entityName = `${result.toolName}Result:${result.sessionId}`;

    await this.createEntity(entityName, 'AnalysisResult', [
      `sessionId:${result.sessionId}`,
      `toolName:${result.toolName}`,
      `timestamp:${result.timestamp}`,
      `success:${result.success}`,
      `data:${JSON.stringify(result.data)}`,
      ...(result.error ? [`error:${result.error}`] : []),
    ]);
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: CodeQualitySession['status'],
  ): Promise<void> {
    const entityName = `CodeQualitySession:${sessionId}`;

    await this.addObservation(entityName, `status:${status}`);
    await this.addObservation(entityName, `updatedAt:${new Date().toISOString()}`);
  }

  /**
   * Retrieve session information
   */
  async getSession(sessionId: string): Promise<CodeQualitySession | null> {
    const entityName = `CodeQualitySession:${sessionId}`;

    try {
      const entities = await this.searchEntities(entityName);
      if (entities.length === 0) return null;

      const entity = entities[0];
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
      const entities = await this.searchEntities(`*Result:${sessionId}`);
      return entities.map(entity => this.parseResultFromEntity(entity));
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
      const sessionEntities = await this.searchEntities(`*:${sessionId}`);

      // Delete all related entities
      const entityNames = sessionEntities.map(entity => entity.name);
      if (entityNames.length > 0) {
        await this.deleteEntities(entityNames);
      }
    } catch (error) {
      logError('Error cleaning up session', { error });
    }
  }

  // Private helper methods that would integrate with actual MCP tools
  private async createEntity(
    name: string,
    entityType: string,
    observations: string[],
  ): Promise<void> {
    // This would call the actual MCP memory creation tool
    // For now, using logInfo as placeholder
    logInfo(`Creating entity: ${name} (${entityType})`, { observations });

    // TODO: Integrate with actual MCP client
    // await mcpMemoryClient.createEntities([{
    //   name,
    //   entityType,
    //   observations
    // }]);
  }

  private async addObservation(entityName: string, observation: string): Promise<void> {
    logInfo(`Adding observation to ${entityName}: ${observation}`);

    // TODO: Integrate with actual MCP client
    // await mcpMemoryClient.addObservations([{
    //   entityName,
    //   contents: [observation]
    // }]);
  }

  private async searchEntities(query: string): Promise<any[]> {
    logInfo(`Searching entities: ${query}`);

    // TODO: Integrate with actual MCP client
    // return await mcpMemoryClient.searchNodes(query);
    return [];
  }

  private async deleteEntities(entityNames: string[]): Promise<void> {
    logInfo(`Deleting entities`, { entityNames });

    // TODO: Integrate with actual MCP client
    // await mcpMemoryClient.deleteEntities(entityNames);
  }

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
