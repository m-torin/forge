/**
 * MCP Tool: Path Manager
 * Manages and caches file paths for agents, especially worktree paths
 */

import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import type { MCPToolResponse } from '../types/mcp';
import { CacheRegistry } from './cache';
import { ok, runTool } from './tool-helpers';
import { validateFilePath, validateSessionId } from './validation';

export interface PathManagerArgs {
  action: 'getWorktreePath' | 'resolveAbsolute' | 'clearCache' | 'generateHash';
  packagePath?: string;
  sessionId?: string;
  inputPath?: string;
  input?: string;
  signal?: AbortSignal;
}

// Use centralized cache registry for path management
const cacheRegistry = new CacheRegistry();
const pathCache = cacheRegistry.create('path-manager', {
  maxSize: 100,
  ttl: 60_000, // 1 minute TTL
});

export const pathManagerTool = {
  name: 'path_manager',
  description: 'Manage and cache file paths for agents',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['getWorktreePath', 'resolveAbsolute', 'clearCache', 'generateHash'],
        description: 'Action to perform',
      },
      packagePath: {
        type: 'string',
        description: 'Package path for worktree operations',
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for caching',
      },
      inputPath: {
        type: 'string',
        description: 'Path to resolve',
      },
      input: {
        type: 'string',
        description: 'Input string for hash generation',
      },
      signal: {
        type: 'object',
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: PathManagerArgs): Promise<MCPToolResponse> {
    return runTool('path_manager', args.action, async () => {
      const { action, packagePath, sessionId, inputPath, input } = args;

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

      // Validate input path if provided
      if (inputPath) {
        const pathValidation = validateFilePath(inputPath, [process.cwd()]);
        if (!pathValidation.isValid) {
          throw new Error(`Invalid input path: ${pathValidation.error}`);
        }
      }

      switch (action) {
        case 'getWorktreePath': {
          if (!packagePath || !sessionId) {
            throw new Error('packagePath and sessionId are required for getWorktreePath');
          }

          const cacheKey = `worktree:${packagePath}:${sessionId}`;

          const cached = pathCache.get(cacheKey);
          if (cached) {
            return ok({
              ...cached,
              cached: true,
            });
          }

          // LRU cache handles size management automatically

          // Resolve to absolute path
          const absolutePath = resolve(packagePath);

          // Generate worktree path based on session - using SHA-256 for security
          const sessionHash = createHash('sha256').update(sessionId).digest('hex').substring(0, 8);
          const worktreeName = `agent-${sessionHash}`;
          const worktreePath = `${absolutePath}-${worktreeName}`;

          const result = {
            absolutePath,
            worktreePath,
            worktreeName,
            sessionId,
            packagePath,
          };

          // Cache the result
          pathCache.set(cacheKey, result);

          return ok({
            ...result,
            cached: false,
          });
        }

        case 'resolveAbsolute': {
          if (!inputPath) {
            throw new Error('inputPath is required for resolveAbsolute');
          }

          const absolutePath = resolve(inputPath);

          return ok({
            inputPath,
            absolutePath,
          });
        }

        case 'clearCache': {
          const analytics = pathCache.getAnalytics();
          const sizeBefore = analytics.currentSize;

          if (sessionId) {
            // Clear cache entries for specific session
            let cleared = 0;
            const keys = Array.from(pathCache.keys());
            for (const key of keys) {
              if (key.includes(sessionId)) {
                pathCache.delete(key);
                cleared++;
              }
            }

            const analyticsAfter = pathCache.getAnalytics();
            return ok({
              action: 'clearCache',
              sessionId,
              sizeBefore,
              cleared,
              sizeAfter: analyticsAfter.currentSize,
            });
          } else {
            // Clear entire cache
            pathCache.clear();

            return ok({
              action: 'clearCache',
              sizeBefore,
              cleared: sizeBefore,
              sizeAfter: 0,
            });
          }
        }

        case 'generateHash': {
          if (!input) {
            throw new Error('input is required for generateHash');
          }

          const hash = createHash('sha256').update(input).digest('hex');
          const shortHash = hash.substring(0, 8);

          return ok({
            input,
            hash,
            shortHash,
          });
        }

        default:
          throw new Error(
            `Unknown action: ${action}. Supported actions: getWorktreePath, resolveAbsolute, clearCache, generateHash`,
          );
      }

      // This should never be reached due to default case throwing
      throw new Error('Unreachable code');
    });
  },
};
