/**
 * Vercel Optimization Tool for Code Quality Analysis
 *
 * Analyzes Vercel-specific optimization opportunities including
 * Edge Runtime compatibility, image optimization, and bundle size issues.
 */

import { tool, type Tool } from 'ai';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v3';
import { mcpClient } from '../mcp-client';

// Input schema for Vercel optimization analysis
const vercelOptimizationInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  filePaths: z.array(z.string()).describe('File paths to analyze for Vercel optimizations'),
  options: z
    .object({
      edgeRuntime: z.boolean().default(true).describe('Check Edge Runtime compatibility'),
      imageOptimization: z
        .boolean()
        .default(true)
        .describe('Check image optimization opportunities'),
      bundleSize: z.boolean().default(true).describe('Analyze potential bundle size issues'),
      caching: z.boolean().default(true).describe('Check caching opportunities'),
    })
    .optional()
    .default({
      edgeRuntime: true,
      imageOptimization: true,
      bundleSize: true,
      caching: true,
    }),
});

// Optimization recommendation
interface OptimizationRecommendation {
  type: 'edge-runtime' | 'image' | 'bundle' | 'caching' | 'performance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  impact: string;
  solution: string;
}

// Vercel optimization result
interface VercelOptimizationResult {
  sessionId: string;
  recommendations: OptimizationRecommendation[];
  statistics: {
    edgeRuntimeCompatible: number;
    edgeRuntimeIncompatible: number;
    imageOptimizationOpportunities: number;
    bundleSizeIssues: number;
    cachingOpportunities: number;
  };
  summary: {
    totalFiles: number;
    totalRecommendations: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
  };
}

// Edge Runtime incompatible patterns
const edgeIncompatiblePatterns = [
  {
    pattern: /require\s*\(\s*['"`]fs['"`]\s*\)/,
    reason: 'File system access not available in Edge Runtime',
  },
  {
    pattern: /import.*from\s*['"`]fs['"`]/,
    reason: 'File system access not available in Edge Runtime',
  },
  {
    pattern: /require\s*\(\s*['"`]path['"`]\s*\)/,
    reason: 'Path module not fully compatible with Edge Runtime',
  },
  {
    pattern: /require\s*\(\s*['"`]os['"`]\s*\)/,
    reason: 'OS module not available in Edge Runtime',
  },
  {
    pattern: /process\.env\.NODE_ENV/,
    reason: 'Use runtime config instead of process.env in Edge Runtime',
  },
  {
    pattern: /Buffer\.from/,
    reason: 'Buffer is not available in Edge Runtime, use TextEncoder/TextDecoder',
  },
  {
    pattern: /setTimeout\s*\([^,]+,\s*[5-9]\d{3,}/,
    reason: 'Long timeouts may cause issues in Edge Runtime (>5s)',
  },
  { pattern: /eval\s*\(/, reason: 'eval() is not allowed in Edge Runtime' },
  { pattern: /new Function\s*\(/, reason: 'Function constructor is not allowed in Edge Runtime' },
  {
    pattern: /require\s*\(\s*['"`]crypto['"`]\s*\)/,
    reason: 'Use Web Crypto API instead of Node.js crypto in Edge Runtime',
  },
];

// Bundle size issues
const bundleSizePatterns = [
  {
    pattern: /import\s+\*\s+as\s+\w+\s+from\s*['"`][^'"`]+['"`]/,
    reason: 'Wildcard imports can increase bundle size',
  },
  {
    pattern: /import\s*['"`]lodash['"`]/,
    reason: 'Import specific lodash functions instead of entire library',
  },
  {
    pattern: /import\s*['"`]moment['"`]/,
    reason: 'Consider using date-fns or day.js instead of moment.js for smaller bundle',
  },
  {
    pattern: /import\s*['"`]@material-ui\/core['"`]/,
    reason: 'Use tree-shaking compatible imports from @mui/material',
  },
  {
    pattern: /console\.log\s*\(/,
    reason: 'Console statements should be removed in production builds',
  },
  { pattern: /debugger;/, reason: 'Debugger statements should be removed in production builds' },
];

// Image optimization opportunities
const imagePatterns = [
  {
    pattern: /<img\s+src\s*=\s*['"`][^'"`]*\.(jpg|jpeg|png|gif)['"`]/,
    reason: 'Use Next.js Image component for optimization',
  },
  {
    pattern: /background-image:\s*url\s*\(\s*['"`][^'"`]*\.(jpg|jpeg|png|gif)['"`]\s*\)/,
    reason: 'Consider using Next.js Image for background images',
  },
  { pattern: /\.(jpg|jpeg|png|gif)/, reason: 'Consider using WebP format for better compression' },
];

// Caching opportunities
const cachingPatterns = [
  {
    pattern: /fetch\s*\(\s*['"`][^'"`]*api[^'"`]*['"`]/,
    reason: 'Consider using SWR or React Query for API caching',
  },
  {
    pattern: /axios\.(get|post|put|delete)/,
    reason: 'Consider adding caching headers or using SWR for data fetching',
  },
  {
    pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*fetch/,
    reason: 'Consider using SWR or React Query instead of useEffect for data fetching',
  },
];

// Analyze file for Vercel optimizations
async function analyzeFileForOptimizations(
  filePath: string,
  packagePath: string,
  options: {
    edgeRuntime: boolean;
    imageOptimization: boolean;
    bundleSize: boolean;
    caching: boolean;
  },
): Promise<{
  recommendations: OptimizationRecommendation[];
  isEdgeCompatible: boolean;
}> {
  const recommendations: OptimizationRecommendation[] = [];
  let isEdgeCompatible = true;

  try {
    const fullPath = join(packagePath, filePath);
    const content = await readFile(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Check Edge Runtime compatibility
    if (options.edgeRuntime) {
      for (const { pattern, reason } of edgeIncompatiblePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          isEdgeCompatible = false;

          // Find line number
          let lineNumber = 1;
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNumber = i + 1;
              break;
            }
          }

          recommendations.push({
            type: 'edge-runtime',
            priority: 'high',
            title: 'Edge Runtime Incompatibility',
            description: reason,
            filePath,
            lineNumber,
            impact: 'Cannot deploy to Edge Runtime',
            solution: 'Refactor to use Edge Runtime compatible alternatives',
          });
        }
      }
    }

    // Check bundle size issues
    if (options.bundleSize) {
      for (const { pattern, reason } of bundleSizePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          let lineNumber = 1;
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNumber = i + 1;
              break;
            }
          }

          recommendations.push({
            type: 'bundle',
            priority: reason.includes('production') ? 'medium' : 'low',
            title: 'Bundle Size Optimization',
            description: reason,
            filePath,
            lineNumber,
            impact: 'Increases bundle size and loading time',
            solution: 'Optimize import or remove in production',
          });
        }
      }
    }

    // Check image optimization opportunities
    if (options.imageOptimization && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) {
      for (const { pattern, reason } of imagePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          let lineNumber = 1;
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNumber = i + 1;
              break;
            }
          }

          recommendations.push({
            type: 'image',
            priority: 'medium',
            title: 'Image Optimization Opportunity',
            description: reason,
            filePath,
            lineNumber,
            impact: 'Slower loading and larger bandwidth usage',
            solution: 'Use Next.js Image component or WebP format',
          });
        }
      }
    }

    // Check caching opportunities
    if (options.caching) {
      for (const { pattern, reason } of cachingPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          let lineNumber = 1;
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNumber = i + 1;
              break;
            }
          }

          recommendations.push({
            type: 'caching',
            priority: 'medium',
            title: 'Caching Optimization',
            description: reason,
            filePath,
            lineNumber,
            impact: 'Unnecessary API calls and poor user experience',
            solution: 'Implement proper caching strategy',
          });
        }
      }
    }

    return { recommendations, isEdgeCompatible };
  } catch (error) {
    return {
      recommendations: [
        {
          type: 'performance',
          priority: 'low',
          title: 'Analysis Error',
          description: `Could not analyze file: ${(error as Error).message}`,
          filePath,
          impact: 'Unable to determine optimization opportunities',
          solution: 'Check file accessibility and format',
        },
      ],
      isEdgeCompatible: true, // Default to compatible if we can't analyze
    };
  }
}

// Main Vercel optimization tool
export const vercelOptimizationTool = tool({
  description:
    'Analyze Vercel-specific optimization opportunities including Edge Runtime compatibility, image optimization, font optimization, and bundle size issues.',

  inputSchema: vercelOptimizationInputSchema,

  execute: async (
    {
      sessionId,
      filePaths,
      options = { edgeRuntime: true, imageOptimization: true, bundleSize: true, caching: true },
    }: any,
    { toolCallId: _toolCallId }: any,
  ) => {
    try {
      // Get package path from session
      const session = await mcpClient.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const packagePath = session.worktreePath || session.workingDirectory;

      // Analyze files for optimizations
      const allRecommendations: OptimizationRecommendation[] = [];
      let edgeCompatibleCount = 0;
      let edgeIncompatibleCount = 0;

      // Process files in parallel (with concurrency limit)
      const concurrency = 5;
      for (let i = 0; i < filePaths.length; i += concurrency) {
        const batch = filePaths.slice(i, i + concurrency);
        const batchPromises = batch.map((filePath: string) =>
          analyzeFileForOptimizations(filePath, packagePath, options),
        );

        const batchResults = await Promise.all(batchPromises);

        for (const result of batchResults) {
          allRecommendations.push(...result.recommendations);

          if (result.isEdgeCompatible) {
            edgeCompatibleCount++;
          } else {
            edgeIncompatibleCount++;
          }
        }
      }

      // Calculate statistics
      const imageOptimizationOpportunities = allRecommendations.filter(
        r => r.type === 'image',
      ).length;
      const bundleSizeIssues = allRecommendations.filter(r => r.type === 'bundle').length;
      const cachingOpportunities = allRecommendations.filter(r => r.type === 'caching').length;

      const highPriorityIssues = allRecommendations.filter(r => r.priority === 'high').length;
      const mediumPriorityIssues = allRecommendations.filter(r => r.priority === 'medium').length;
      const lowPriorityIssues = allRecommendations.filter(r => r.priority === 'low').length;

      const result: VercelOptimizationResult = {
        sessionId,
        recommendations: allRecommendations,
        statistics: {
          edgeRuntimeCompatible: edgeCompatibleCount,
          edgeRuntimeIncompatible: edgeIncompatibleCount,
          imageOptimizationOpportunities,
          bundleSizeIssues,
          cachingOpportunities,
        },
        summary: {
          totalFiles: filePaths.length,
          totalRecommendations: allRecommendations.length,
          highPriorityIssues,
          mediumPriorityIssues,
          lowPriorityIssues,
        },
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'vercel-optimization',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'vercel-optimization',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  toModelOutput: (result: VercelOptimizationResult) => ({
    type: 'content',
    value: [
      {
        type: 'text',
        text:
          `⚡ Vercel Optimization Analysis:\n` +
          `📁 Files analyzed: ${result.summary.totalFiles}\n` +
          `🎯 Total recommendations: ${result.summary.totalRecommendations}\n` +
          `🚨 High priority: ${result.summary.highPriorityIssues}\n` +
          `⚠️ Medium priority: ${result.summary.mediumPriorityIssues}\n` +
          `ℹ️ Low priority: ${result.summary.lowPriorityIssues}\n` +
          `🌐 Edge Runtime compatible: ${result.statistics.edgeRuntimeCompatible}\n` +
          `❌ Edge Runtime incompatible: ${result.statistics.edgeRuntimeIncompatible}\n` +
          `🖼️ Image optimization opportunities: ${result.statistics.imageOptimizationOpportunities}\n` +
          `📦 Bundle size issues: ${result.statistics.bundleSizeIssues}\n` +
          `💾 Caching opportunities: ${result.statistics.cachingOpportunities}\n` +
          `${result.summary.highPriorityIssues === 0 ? '✅ No critical optimization issues' : '⚠️ High priority optimizations needed'}`,
      },
    ],
  }),
} as any) as Tool;

export type { VercelOptimizationResult };
