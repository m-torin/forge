/**
 * Pull Request Creation Tool for Code Quality Analysis
 *
 * Creates pull requests with quality improvements, handles Git operations,
 * and integrates with GitHub CLI for PR creation.
 */

import { logWarn } from '@repo/observability';
import { tool, type Tool } from 'ai';
import { spawn } from 'node:child_process';
import { z } from 'zod';
import { mcpClient } from '../mcp-client';
import type { QualityReport } from './report-generation';

// Input schema for PR creation
const prCreationInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  options: z
    .object({
      title: z.string().optional().describe('Custom PR title'),
      description: z.string().optional().describe('Custom PR description'),
      targetBranch: z.string().default('main').describe('Target branch for the PR'),
      labels: z.array(z.string()).optional().describe('Labels to add to the PR'),
      assignees: z.array(z.string()).optional().describe('Assignees for the PR'),
      draft: z.boolean().default(false).describe('Create as draft PR'),
      autoMerge: z.boolean().default(false).describe('Enable auto-merge if checks pass'),
    })
    .optional()
    .default({
      targetBranch: 'main',
      draft: false,
      autoMerge: false,
    }),
});

// PR creation result
interface PRCreationResult {
  sessionId: string;
  prUrl: string;
  prNumber: number;
  branchName: string;
  commitHash: string;
  title: string;
  description: string;
  filesChanged: string[];
  summary: {
    linesAdded: number;
    linesRemoved: number;
    filesModified: number;
    improvements: string[];
  };
}

// Run git command
async function runGitCommand(
  args: string[],
  cwd: string,
  timeout: number = 30000,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, { cwd, stdio: 'pipe' });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Git command timeout'));
    }, timeout);

    child.on('close', code => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code || 0 });
    });

    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// Run GitHub CLI command
async function runGHCommand(
  args: string[],
  cwd: string,
  timeout: number = 30000,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn('gh', args, { cwd, stdio: 'pipe' });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('GitHub CLI command timeout'));
    }, timeout);

    child.on('close', code => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code || 0 });
    });

    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// Generate PR title and description from report
function generatePRContent(report: QualityReport): { title: string; description: string } {
  const { summary, recommendations } = report;

  // Generate title based on improvements
  let title = 'feat: improve code quality';

  if (summary.criticalIssues > 0) {
    title = `fix: resolve ${summary.criticalIssues} critical code quality issues`;
  } else if (summary.optimizationOpportunities > 0) {
    title = `perf: implement ${summary.optimizationOpportunities} performance optimizations`;
  } else if (recommendations.some(r => r.category === 'Testing')) {
    title = 'test: improve testing setup and coverage';
  }

  // Generate description
  const criticalRecs = recommendations.filter(r => r.priority === 'critical');
  const highRecs = recommendations.filter(r => r.priority === 'high');
  const mediumRecs = recommendations.filter(r => r.priority === 'medium');

  let description = `## Summary\n\nAutomated code quality improvements based on comprehensive analysis.\n\n`;

  description += `### 📊 Quality Score: ${summary.overallScore}/100 (Grade: ${summary.grade})\n\n`;

  if (criticalRecs.length > 0) {
    description += `### 🚨 Critical Issues Fixed (${criticalRecs.length})\n`;
    criticalRecs.forEach(rec => {
      description += `- **${rec.title}**: ${rec.description}\n`;
    });
    description += '\n';
  }

  if (highRecs.length > 0) {
    description += `### ⚠️ High Priority Improvements (${highRecs.length})\n`;
    highRecs.forEach(rec => {
      description += `- **${rec.title}**: ${rec.description}\n`;
    });
    description += '\n';
  }

  if (mediumRecs.length > 0) {
    description += `### 💡 Medium Priority Optimizations (${mediumRecs.length})\n`;
    mediumRecs.forEach(rec => {
      description += `- **${rec.title}**: ${rec.description}\n`;
    });
    description += '\n';
  }

  description += `### 📈 Impact\n`;
  description += `- **Files Analyzed**: ${summary.analyzedFiles}\n`;
  description += `- **Issues Resolved**: ${summary.totalIssues}\n`;
  description += `- **Optimizations Applied**: ${summary.optimizationOpportunities}\n\n`;

  description += `### 🧪 Test Plan\n`;
  description += `- [ ] Run \`pnpm typecheck\` to verify TypeScript compilation\n`;
  description += `- [ ] Run \`pnpm lint\` to verify ESLint compliance\n`;
  description += `- [ ] Run \`pnpm test\` to ensure all tests pass\n`;
  description += `- [ ] Run \`pnpm build\` to verify production build\n\n`;

  description += `🤖 Generated with [Claude Code](https://claude.ai/code)\n\n`;
  description += `Co-Authored-By: Claude <noreply@anthropic.com>`;

  return { title, description };
}

// Check if there are any changes to commit
async function hasChanges(worktreePath: string): Promise<boolean> {
  try {
    const { stdout } = await runGitCommand(['status', '--porcelain'], worktreePath);
    return stdout.trim().length > 0;
  } catch (error) {
    logWarn('Failed to check git status', { error });
    return false;
  }
}

// Get list of changed files
async function getChangedFiles(worktreePath: string): Promise<string[]> {
  try {
    const { stdout } = await runGitCommand(['diff', '--name-only', 'HEAD'], worktreePath);
    return stdout
      .trim()
      .split('\n')
      .filter(line => line.trim());
  } catch (error) {
    logWarn('Failed to get changed files', { error });
    return [];
  }
}

// Get commit statistics
async function getCommitStats(
  worktreePath: string,
): Promise<{ linesAdded: number; linesRemoved: number }> {
  try {
    const { stdout } = await runGitCommand(['diff', '--numstat', 'HEAD'], worktreePath);
    let linesAdded = 0;
    let linesRemoved = 0;

    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const [added, removed] = line.split('\t');
      if (added !== '-' && removed !== '-') {
        linesAdded += parseInt(added) || 0;
        linesRemoved += parseInt(removed) || 0;
      }
    }

    return { linesAdded, linesRemoved };
  } catch (error) {
    logWarn('Failed to get commit stats', { error });
    return { linesAdded: 0, linesRemoved: 0 };
  }
}

// Main PR creation tool
export const prCreationTool = tool({
  description:
    'Create pull requests with quality improvements. Handles Git operations, PR description generation, and GitHub CLI integration.',

  inputSchema: prCreationInputSchema,

  execute: async (
    { sessionId, options = { targetBranch: 'main', draft: false, autoMerge: false } }: any,
    _toolOptions: any = { toolCallId: 'pr-creation', messages: [] },
  ) => {
    try {
      // Get session info
      const session = await mcpClient.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const worktreePath = session.worktreePath || session.workingDirectory;

      // Get the quality report
      const results = await mcpClient.getSessionResults(sessionId);
      const reportResult = results.find(r => r.toolName === 'report-generation');

      if (!reportResult) {
        throw new Error('Quality report not found. Please run report generation first.');
      }

      const report = reportResult.data as QualityReport;

      // Check if there are any changes to commit
      const hasGitChanges = await hasChanges(worktreePath);
      if (!hasGitChanges) {
        throw new Error(
          'No changes detected in worktree. Please make improvements before creating PR.',
        );
      }

      // Get changed files and stats
      const filesChanged = await getChangedFiles(worktreePath);
      const { linesAdded, linesRemoved } = await getCommitStats(worktreePath);

      // Generate PR content
      const { title: defaultTitle, description: defaultDescription } = generatePRContent(report);
      const title = options.title || defaultTitle;
      const description = options.description || defaultDescription;

      // Get current branch name
      const { stdout: currentBranch } = await runGitCommand(
        ['branch', '--show-current'],
        worktreePath,
      );
      const branchName = currentBranch.trim();

      // Stage all changes
      await runGitCommand(['add', '.'], worktreePath);

      // Create commit
      const commitMessage = `${title}\n\n${description.split('\n').slice(0, 5).join('\n')}\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;

      const { stdout: _commitResult } = await runGitCommand(
        ['commit', '-m', commitMessage],
        worktreePath,
      );

      // Get commit hash
      const { stdout: commitHash } = await runGitCommand(['rev-parse', 'HEAD'], worktreePath);

      // Push branch to remote
      await runGitCommand(['push', 'origin', branchName, '--set-upstream'], worktreePath);

      // Create PR using GitHub CLI
      const ghArgs = [
        'pr',
        'create',
        '--title',
        title,
        '--body',
        description,
        '--base',
        options.targetBranch,
      ];

      if (options.draft) {
        ghArgs.push('--draft');
      }

      if (options.labels && options.labels.length > 0) {
        ghArgs.push('--label', options.labels.join(','));
      }

      if (options.assignees && options.assignees.length > 0) {
        ghArgs.push('--assignee', options.assignees.join(','));
      }

      const { stdout: prOutput } = await runGHCommand(ghArgs, worktreePath);

      // Extract PR URL and number from output
      const prUrlMatch = prOutput.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/(\d+)/);
      const prUrl = prUrlMatch ? prUrlMatch[0] : '';
      const prNumber = prUrlMatch ? parseInt(prUrlMatch[1]) : 0;

      // Enable auto-merge if requested
      if (options.autoMerge && prNumber > 0) {
        try {
          await runGHCommand(
            ['pr', 'merge', prNumber.toString(), '--auto', '--squash'],
            worktreePath,
          );
        } catch (error) {
          logWarn('Failed to enable auto-merge', { error });
        }
      }

      // Generate improvements list
      const improvements = [
        ...report.recommendations.filter(r => r.priority === 'critical').map(r => r.title),
        ...report.recommendations.filter(r => r.priority === 'high').map(r => r.title),
        ...(report.recommendations.filter(r => r.priority === 'medium').length > 0
          ? report.recommendations
              .filter(r => r.priority === 'medium')
              .slice(0, 3)
              .map(r => r.title)
          : []),
      ];

      const result: PRCreationResult = {
        sessionId,
        prUrl,
        prNumber,
        branchName,
        commitHash: commitHash.trim(),
        title,
        description,
        filesChanged,
        summary: {
          linesAdded,
          linesRemoved,
          filesModified: filesChanged.length,
          improvements,
        },
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'pr-creation',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'pr-creation',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  toModelOutput: (result: PRCreationResult) => [
    {
      type: 'text' as const,
      text:
        `🚀 Pull Request Created Successfully!\n` +
        `🔗 URL: ${result.prUrl}\n` +
        `#️⃣ PR Number: #${result.prNumber}\n` +
        `🌿 Branch: ${result.branchName}\n` +
        `📝 Title: ${result.title}\n` +
        `📁 Files Changed: ${result.summary.filesModified}\n` +
        `➕ Lines Added: ${result.summary.linesAdded}\n` +
        `➖ Lines Removed: ${result.summary.linesRemoved}\n` +
        `🎯 Improvements:\n${result.summary.improvements.map((imp: any) => `  • ${imp}`).join('\n')}\n` +
        `✅ Ready for review and merge!`,
    },
  ],
} as any) as Tool;

export type { PRCreationResult };
