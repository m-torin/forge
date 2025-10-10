/**
 * Report Generation Tool for Code Quality Analysis
 *
 * Generates comprehensive code quality reports aggregating results from
 * all analysis tools and providing actionable recommendations.
 */

import { tool, type Tool } from 'ai';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v3';
import { mcpClient } from '../mcp-client';
import type { CodeAnalysisResult } from './analysis';
import type { FileDiscoveryResult } from './file-discovery';
import type { PatternDetectionResult } from './pattern-detection';
import type { VercelOptimizationResult } from './vercel-optimization';

// Input schema for report generation
const reportGenerationInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  format: z.enum(['markdown', 'json', 'html']).default('markdown').describe('Report format'),
  options: z
    .object({
      includeFileDetails: z.boolean().default(true).describe('Include detailed file analysis'),
      includeRecommendations: z
        .boolean()
        .default(true)
        .describe('Include actionable recommendations'),
      includeSummaryCharts: z
        .boolean()
        .default(false)
        .describe('Include summary charts (future feature)'),
      outputPath: z.string().optional().describe('Custom output path for the report'),
    })
    .optional()
    .default({
      includeFileDetails: true,
      includeRecommendations: true,
      includeSummaryCharts: false,
    }),
});

// Report data structure
interface QualityReport {
  sessionId: string;
  generatedAt: string;
  packagePath: string;
  summary: {
    totalFiles: number;
    analyzedFiles: number;
    cachedFiles: number;
    totalIssues: number;
    criticalIssues: number;
    optimizationOpportunities: number;
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  fileDiscovery?: FileDiscoveryResult;
  codeAnalysis?: CodeAnalysisResult;
  patternDetection?: PatternDetectionResult;
  vercelOptimization?: VercelOptimizationResult;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    solution: string;
    files?: string[];
  }>;
  reportPath?: string;
}

// Calculate overall quality score
function calculateQualityScore(
  codeAnalysis?: CodeAnalysisResult,
  vercelOptimization?: VercelOptimizationResult,
): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } {
  let score = 100;

  if (codeAnalysis) {
    // Deduct points for issues
    score -= codeAnalysis.summary.errorCount * 10; // 10 points per error
    score -= codeAnalysis.summary.warningCount * 5; // 5 points per warning
    score -= codeAnalysis.summary.infoCount * 1; // 1 point per info issue
    score -= codeAnalysis.summary.highComplexityFiles * 3; // 3 points per high complexity file
  }

  if (vercelOptimization) {
    // Deduct points for optimization issues
    score -= vercelOptimization.summary.highPriorityIssues * 8;
    score -= vercelOptimization.summary.mediumPriorityIssues * 4;
    score -= vercelOptimization.summary.lowPriorityIssues * 2;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Assign grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score: Math.round(score), grade };
}

// Generate recommendations from analysis results
function generateRecommendations(
  codeAnalysis?: CodeAnalysisResult,
  patternDetection?: PatternDetectionResult,
  vercelOptimization?: VercelOptimizationResult,
): QualityReport['recommendations'] {
  const recommendations: QualityReport['recommendations'] = [];

  // Code analysis recommendations
  if (codeAnalysis) {
    if (codeAnalysis.summary.errorCount > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Code Quality',
        title: 'Fix Critical Errors',
        description: `${codeAnalysis.summary.errorCount} critical errors found that prevent compilation or cause runtime issues.`,
        impact: 'Application may fail to build or crash at runtime',
        solution: 'Review and fix all TypeScript/ESLint errors before deployment',
        files: codeAnalysis.analyses
          .filter(a => a.issues && a.issues.some(i => i.type === 'error'))
          .map(a => a.path),
      });
    }

    if (codeAnalysis.summary.highComplexityFiles > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Code Quality',
        title: 'Reduce Code Complexity',
        description: `${codeAnalysis.summary.highComplexityFiles} files have high cyclomatic complexity.`,
        impact: 'Harder to maintain, test, and debug',
        solution: 'Refactor complex functions into smaller, more focused functions',
        files: codeAnalysis.analyses.filter(a => (a.complexity || 0) > 10).map(a => a.path),
      });
    }

    if (codeAnalysis.summary.warningCount > 10) {
      recommendations.push({
        priority: 'medium',
        category: 'Code Quality',
        title: 'Address Warnings',
        description: `${codeAnalysis.summary.warningCount} warnings found that could lead to potential issues.`,
        impact: 'Potential bugs and maintainability issues',
        solution: 'Review and address ESLint and TypeScript warnings',
      });
    }
  }

  // Pattern detection recommendations
  if (patternDetection) {
    if (patternDetection.confidence < 70) {
      recommendations.push({
        priority: 'low',
        category: 'Architecture',
        title: 'Clarify Architecture Patterns',
        description: `Architecture pattern confidence is low (${patternDetection.confidence}%). Consider establishing clearer patterns.`,
        impact: 'Inconsistent codebase structure and developer confusion',
        solution: 'Establish and document clear architectural patterns and conventions',
      });
    }

    if (patternDetection.architecture.testing.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'Testing',
        title: 'Add Testing Framework',
        description: 'No testing framework detected in the codebase.',
        impact: 'Higher risk of bugs and regressions',
        solution: 'Set up a testing framework like Jest, Vitest, or Playwright',
      });
    }
  }

  // Vercel optimization recommendations
  if (vercelOptimization) {
    if (vercelOptimization.statistics.edgeRuntimeIncompatible > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Performance',
        title: 'Edge Runtime Compatibility',
        description: `${vercelOptimization.statistics.edgeRuntimeIncompatible} files are incompatible with Edge Runtime.`,
        impact: 'Cannot deploy to Vercel Edge Runtime for better performance',
        solution: 'Refactor incompatible code to use Edge Runtime compatible alternatives',
      });
    }

    if (vercelOptimization.statistics.imageOptimizationOpportunities > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Performance',
        title: 'Optimize Images',
        description: `${vercelOptimization.statistics.imageOptimizationOpportunities} image optimization opportunities found.`,
        impact: 'Slower page loading and higher bandwidth usage',
        solution: 'Use Next.js Image component and WebP format for better performance',
      });
    }

    if (vercelOptimization.statistics.bundleSizeIssues > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Performance',
        title: 'Reduce Bundle Size',
        description: `${vercelOptimization.statistics.bundleSizeIssues} bundle size optimization opportunities found.`,
        impact: 'Larger JavaScript bundles and slower initial page load',
        solution: 'Use tree-shaking, code splitting, and remove unused dependencies',
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Generate markdown report
function generateMarkdownReport(report: QualityReport): string {
  const { summary, recommendations } = report;

  return `# Code Quality Report

Generated on: ${report.generatedAt}
Session ID: ${report.sessionId}
Package: ${report.packagePath}

## 📊 Summary

- **Overall Score**: ${summary.overallScore}/100 (Grade: ${summary.grade})
- **Total Files**: ${summary.totalFiles}
- **Files Analyzed**: ${summary.analyzedFiles}
- **Cached Files**: ${summary.cachedFiles}
- **Total Issues**: ${summary.totalIssues}
- **Critical Issues**: ${summary.criticalIssues}
- **Optimization Opportunities**: ${summary.optimizationOpportunities}

## 🎯 Key Metrics

${
  report.codeAnalysis
    ? `### Code Analysis
- **Errors**: ${report.codeAnalysis.summary.errorCount}
- **Warnings**: ${report.codeAnalysis.summary.warningCount}
- **Info Issues**: ${report.codeAnalysis.summary.infoCount}
- **Average Complexity**: ${report.codeAnalysis.summary.averageComplexity}
- **High Complexity Files**: ${report.codeAnalysis.summary.highComplexityFiles}

`
    : ''
}${
    report.patternDetection
      ? `### Architecture Patterns
- **Primary Framework**: ${report.patternDetection.architecture.framework || 'None detected'}
- **State Management**: ${report.patternDetection.architecture.stateManagement.join(', ') || 'None'}
- **Styling**: ${report.patternDetection.architecture.styling.join(', ') || 'None'}
- **Testing**: ${report.patternDetection.architecture.testing.join(', ') || 'None'}
- **Confidence**: ${report.patternDetection.confidence}%

`
      : ''
  }${
    report.vercelOptimization
      ? `### Vercel Optimizations
- **Edge Runtime Compatible**: ${report.vercelOptimization.statistics.edgeRuntimeCompatible}
- **Edge Runtime Incompatible**: ${report.vercelOptimization.statistics.edgeRuntimeIncompatible}
- **Image Optimization Opportunities**: ${report.vercelOptimization.statistics.imageOptimizationOpportunities}
- **Bundle Size Issues**: ${report.vercelOptimization.statistics.bundleSizeIssues}
- **Caching Opportunities**: ${report.vercelOptimization.statistics.cachingOpportunities}

`
      : ''
  }## 💡 Recommendations

${
  recommendations.length === 0
    ? 'No specific recommendations at this time.'
    : recommendations
        .map(
          rec => `### ${rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '⚠️' : rec.priority === 'medium' ? '💡' : 'ℹ️'} ${rec.title} (${rec.priority.toUpperCase()})

**Category**: ${rec.category}

**Description**: ${rec.description}

**Impact**: ${rec.impact}

**Solution**: ${rec.solution}

${rec.files && rec.files.length > 0 ? `**Affected Files**: ${rec.files.slice(0, 5).join(', ')}${rec.files.length > 5 ? `... and ${rec.files.length - 5} more` : ''}` : ''}

`,
        )
        .join('\n')
}

## 📈 Next Steps

1. **Address Critical Issues**: Start with any critical priority recommendations
2. **Review High Priority Items**: Focus on high-impact improvements
3. **Plan Medium Priority Work**: Schedule medium priority optimizations
4. **Monitor Progress**: Re-run analysis after implementing changes

---

*Report generated by Code Quality Analysis Tool*
`;
}

// Main report generation tool
export const reportGenerationTool = tool({
  description:
    'Generate comprehensive code quality reports aggregating results from all analysis tools and providing actionable recommendations.',

  inputSchema: reportGenerationInputSchema,

  execute: async (
    {
      sessionId,
      format = 'markdown',
      options = {
        includeFileDetails: true,
        includeRecommendations: true,
        includeSummaryCharts: false,
      },
    }: any,
    _toolOptions: any = { toolCallId: 'report-generation', messages: [] },
  ) => {
    try {
      // Get session info
      const session = await mcpClient.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      // Get all analysis results for this session
      const results = await mcpClient.getSessionResults(sessionId);

      // Extract specific analysis results
      const fileDiscovery = results.find(r => r.toolName === 'file-discovery')
        ?.data as FileDiscoveryResult;
      const codeAnalysis = results.find(r => r.toolName === 'code-analysis')
        ?.data as CodeAnalysisResult;
      const patternDetection = results.find(r => r.toolName === 'pattern-detection')
        ?.data as PatternDetectionResult;
      const vercelOptimization = results.find(r => r.toolName === 'vercel-optimization')
        ?.data as VercelOptimizationResult;

      // Calculate quality score
      const { score, grade } = calculateQualityScore(codeAnalysis, vercelOptimization);

      // Generate recommendations
      const recommendations = generateRecommendations(
        codeAnalysis,
        patternDetection,
        vercelOptimization,
      );

      // Create report
      const report: QualityReport = {
        sessionId,
        generatedAt: new Date().toISOString(),
        packagePath: session.worktreePath || session.workingDirectory,
        summary: {
          totalFiles: fileDiscovery?.summary.totalFiles || 0,
          analyzedFiles: fileDiscovery?.summary.toAnalyze || 0,
          cachedFiles: fileDiscovery?.summary.cachedFiles || 0,
          totalIssues: codeAnalysis?.summary.totalIssues || 0,
          criticalIssues: codeAnalysis?.summary.errorCount || 0,
          optimizationOpportunities: vercelOptimization?.summary.totalRecommendations || 0,
          overallScore: score,
          grade,
        },
        fileDiscovery,
        codeAnalysis,
        patternDetection,
        vercelOptimization,
        recommendations,
      };

      // Generate report content based on format
      let reportContent: string;
      let fileName: string;

      switch (format) {
        case 'markdown':
          reportContent = generateMarkdownReport(report);
          fileName = `code-quality-report-${sessionId}.md`;
          break;
        case 'json':
          reportContent = JSON.stringify(report, null, 2);
          fileName = `code-quality-report-${sessionId}.json`;
          break;
        case 'html':
          // For now, use markdown content (could be enhanced later)
          reportContent = generateMarkdownReport(report);
          fileName = `code-quality-report-${sessionId}.html`;
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Write report to file
      const reportPath =
        (options as any).outputPath ||
        join(session.worktreePath || session.workingDirectory, fileName);
      await writeFile(reportPath, reportContent, 'utf-8');

      report.reportPath = reportPath;

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'report-generation',
        success: true,
        data: report,
      });

      return report;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'report-generation',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  toModelOutput: (result: QualityReport) => ({
    type: 'content',
    value: [
      {
        type: 'text' as const,
        text:
          `📊 Code Quality Report Generated!\n` +
          `🎯 Overall Score: ${result.summary.overallScore}/100 (Grade: ${result.summary.grade})\n` +
          `📁 Files Analyzed: ${result.summary.analyzedFiles}/${result.summary.totalFiles}\n` +
          `🚨 Critical Issues: ${result.summary.criticalIssues}\n` +
          `📋 Total Issues: ${result.summary.totalIssues}\n` +
          `💡 Optimization Opportunities: ${result.summary.optimizationOpportunities}\n` +
          `🎯 Recommendations: ${result.recommendations.length}\n` +
          `📄 Report saved to: ${result.reportPath}\n` +
          `${
            result.summary.grade === 'A'
              ? '🎉 Excellent code quality!'
              : result.summary.grade === 'B'
                ? '👍 Good code quality with room for improvement'
                : result.summary.grade === 'C'
                  ? '⚠️ Average code quality - improvements recommended'
                  : result.summary.grade === 'D'
                    ? '🚨 Below average - significant improvements needed'
                    : '❌ Poor code quality - immediate attention required'
          }`,
      },
    ],
  }),
} as any) as Tool;

export type { QualityReport };
