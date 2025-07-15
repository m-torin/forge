/**
 * Prompt Versioning System
 * Version control for prompts with migration support
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import { createHash } from 'node:crypto';

/**
 * Prompt version metadata
 */
export interface PromptVersion {
  id: string;
  version: string;
  content: string;
  checksum: string;
  created: Date;
  author?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  migrationFrom?: string;
  migrationTo?: string;
  migrationFn?: (oldPrompt: string, oldVariables: any) => { prompt: string; variables: any };
}

/**
 * Prompt versioning configuration
 */
export interface PromptVersioningConfig {
  strategy?: 'semantic' | 'timestamp' | 'hash';
  autoMigrate?: boolean;
  keepVersions?: number;
}

/**
 * Prompt version manager
 */
export class PromptVersionManager {
  private versions: Map<string, PromptVersion[]> = new Map();
  private latest: Map<string, string> = new Map(); // promptId -> latest version
  private config: Required<PromptVersioningConfig>;

  constructor(config: PromptVersioningConfig = {}) {
    this.config = {
      strategy: config.strategy || 'semantic',
      autoMigrate: config.autoMigrate ?? true,
      keepVersions: config.keepVersions || 10,
    };
  }

  /**
   * Create a new version
   */
  createVersion(
    promptId: string,
    content: string,
    metadata?: Partial<Omit<PromptVersion, 'id' | 'version' | 'content' | 'checksum' | 'created'>>,
  ): PromptVersion {
    const version = this.generateVersion(promptId);
    const checksum = this.generateChecksum(content);

    const promptVersion: PromptVersion = {
      id: `${promptId}_${version}`,
      version,
      content,
      checksum,
      created: new Date(),
      ...metadata,
    };

    // Store version
    const versions = this.versions.get(promptId) || [];
    versions.push(promptVersion);

    // Keep only specified number of versions
    if (versions.length > this.config.keepVersions) {
      versions.shift(); // Remove oldest
    }

    this.versions.set(promptId, versions);
    this.latest.set(promptId, version);

    logInfo('Prompt Version: Created', {
      operation: 'prompt_version_create',
      metadata: {
        promptId,
        version,
        checksum,
      },
    });

    return promptVersion;
  }

  /**
   * Get a specific version
   */
  getVersion(promptId: string, version?: string): PromptVersion | undefined {
    const versions = this.versions.get(promptId) || [];

    if (!version) {
      // Get latest version
      const latestVersion = this.latest.get(promptId);
      return versions.find(v => v.version === latestVersion);
    }

    return versions.find(v => v.version === version);
  }

  /**
   * Get all versions for a prompt
   */
  getAllVersions(promptId: string): PromptVersion[] {
    return this.versions.get(promptId) || [];
  }

  /**
   * Get version history
   */
  getHistory(promptId: string): Array<{
    version: string;
    created: Date;
    author?: string;
    description?: string;
    checksum: string;
  }> {
    const versions = this.getAllVersions(promptId);
    return versions.map(v => ({
      version: v.version,
      created: v.created,
      author: v.author,
      description: v.description,
      checksum: v.checksum,
    }));
  }

  /**
   * Compare two versions
   */
  compareVersions(
    promptId: string,
    version1: string,
    version2: string,
  ): {
    added: string[];
    removed: string[];
    changed: string[];
    similarity: number;
  } {
    const v1 = this.getVersion(promptId, version1);
    const v2 = this.getVersion(promptId, version2);

    if (!v1 || !v2) {
      throw new Error('Version not found');
    }

    const lines1 = v1.content.split('\n');
    const lines2 = v2.content.split('\n');

    const added = lines2.filter(line => !lines1.includes(line));
    const removed = lines1.filter(line => !lines2.includes(line));
    const changed = lines1.filter((line, i) => lines2[i] && line !== lines2[i]);

    const similarity = this.calculateSimilarity(v1.content, v2.content);

    return { added, removed, changed, similarity };
  }

  /**
   * Migrate between versions
   */
  migrate(
    promptId: string,
    fromVersion: string,
    toVersion: string,
    variables: any,
  ): { prompt: string; variables: any } {
    const path = this.findMigrationPath(promptId, fromVersion, toVersion);

    if (path.length === 0) {
      throw new Error(`No migration path from ${fromVersion} to ${toVersion}`);
    }

    let currentPrompt = this.getVersion(promptId, fromVersion)?.content || '';
    let currentVariables = variables;

    for (let i = 0; i < path.length - 1; i++) {
      const version = this.getVersion(promptId, path[i + 1]);
      if (version?.migrationFn) {
        const result = version.migrationFn(currentPrompt, currentVariables);
        currentPrompt = result.prompt;
        currentVariables = result.variables;
      } else {
        // Default migration: just use new prompt
        currentPrompt = version?.content || currentPrompt;
      }
    }

    logInfo('Prompt Version: Migrated', {
      operation: 'prompt_version_migrate',
      metadata: {
        promptId,
        fromVersion,
        toVersion,
        pathLength: path.length,
      },
    });

    return { prompt: currentPrompt, variables: currentVariables };
  }

  /**
   * Mark version as deprecated
   */
  deprecateVersion(promptId: string, version: string, migrateTo?: string): void {
    const promptVersion = this.getVersion(promptId, version);
    if (promptVersion) {
      promptVersion.deprecated = true;
      if (migrateTo) {
        promptVersion.migrationTo = migrateTo;
      }

      logWarn('Prompt Version: Deprecated', {
        operation: 'prompt_version_deprecate',
        metadata: {
          promptId,
          version,
          migrateTo,
        },
      });
    }
  }

  /**
   * Generate version based on strategy
   */
  private generateVersion(promptId: string): string {
    const versions = this.getAllVersions(promptId);

    switch (this.config.strategy) {
      case 'semantic': {
        if (versions.length === 0) return '1.0.0';
        const latest = versions[versions.length - 1].version;
        const [major, minor, patch] = latest.split('.').map(Number);
        return `${major}.${minor}.${patch + 1}`;
      }

      case 'timestamp':
        return new Date().toISOString();

      case 'hash':
        return createHash('sha256')
          .update(`${promptId}_${Date.now()}`)
          .digest('hex')
          .substring(0, 8);

      default:
        return Date.now().toString();
    }
  }

  /**
   * Generate checksum for content
   */
  private generateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Calculate similarity between two strings
   */
  private calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[s2.length][s1.length];
  }

  /**
   * Find migration path between versions
   */
  private findMigrationPath(promptId: string, from: string, to: string): string[] {
    const versions = this.getAllVersions(promptId);
    const fromIndex = versions.findIndex(v => v.version === from);
    const toIndex = versions.findIndex(v => v.version === to);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    if (fromIndex < toIndex) {
      // Forward migration
      return versions.slice(fromIndex, toIndex + 1).map(v => v.version);
    } else {
      // Backward migration (not recommended)
      return versions
        .slice(toIndex, fromIndex + 1)
        .reverse()
        .map(v => v.version);
    }
  }
}

/**
 * Global version manager
 */
export const globalVersionManager = new PromptVersionManager();

/**
 * Versioning patterns
 */
export const versioningPatterns = {
  /**
   * Create an A/B testing setup
   */
  createABTest: <T>(
    promptId: string,
    versions: Array<{ version: string; weight: number }>,
    versionManager = globalVersionManager,
  ) => {
    const totalWeight = versions.reduce((sum, v) => sum + v.weight, 0);

    const selectVersion = (): string => {
      const random = Math.random() * totalWeight;
      let cumulative = 0;

      for (const { version, weight } of versions) {
        cumulative += weight;
        if (random <= cumulative) {
          return version;
        }
      }

      return versions[0].version;
    };

    return {
      selectVersion,

      getPrompt: (variables?: T): string => {
        const version = selectVersion();
        const promptVersion = versionManager?.getVersion?.(promptId, version);
        return promptVersion?.content || '';
      },
    };
  },

  /**
   * Create a staged rollout
   */
  createStagedRollout: (
    promptId: string,
    stages: Array<{
      version: string;
      startDate: Date;
      percentage: number;
    }>,
    versionManager = globalVersionManager,
  ) => {
    return {
      getCurrentVersion: (userId?: string): string => {
        const now = new Date();
        const activeStages = stages.filter(s => s.startDate <= now);

        if (activeStages.length === 0) {
          return versionManager?.getVersion(promptId, 'latest')?.content || '';
        }

        // Use user ID for consistent assignment
        if (userId) {
          const hash = createHash('sha256').update(userId).digest('hex');
          const userValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

          let cumulative = 0;
          for (const stage of activeStages) {
            cumulative += stage.percentage / 100;
            if (userValue <= cumulative) {
              return stage.version;
            }
          }
        }

        // Default to latest stage
        return activeStages[activeStages.length - 1].version;
      },
    };
  },
};
