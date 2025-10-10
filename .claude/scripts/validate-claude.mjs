#!/usr/bin/env node
/**
 * Claude-Specific Validation Script (Node 22+ Optimized)
 *
 * Validates Claude-specific automation: agents, commands, delegation, and worktree safety.
 * For repository-wide quality gates (contamination, coverage), see scripts/validate.mjs
 *
 * Usage:
 *   node validate-claude.mjs agents      - Validate agent frontmatter
 *   node validate-claude.mjs commands    - Lint command specs
 *   node validate-claude.mjs delegation  - Validate delegation discipline
 *   node validate-claude.mjs worktree    - Verify fullservice safety
 *   node validate-claude.mjs all         - Run all Claude validations in parallel
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - One or more validations failed
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = process.cwd();
const AGENTS_DIR = join(__dirname, '../agents');
const MEMORY_DIR = join(ROOT, '.claude/memory');

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let hasErrors = false;
let hasWarnings = false;

// =============================================================================
// VALIDATOR 1: AGENTS
// =============================================================================

function validateAgents() {
  console.log('🔍 Validating agent files...\n');

  function parseFrontmatter(content, filename) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      console.error(`${RED}❌ ${filename}: No frontmatter found${RESET}`);
      hasErrors = true;
      return null;
    }

    const frontmatter = {};
    const lines = frontmatterMatch[1].split('\n');

    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        frontmatter[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    }

    return frontmatter;
  }

  function validateAgent(filename) {
    const filepath = join(AGENTS_DIR, filename);
    const content = readFileSync(filepath, 'utf-8');
    const frontmatter = parseFrontmatter(content, filename);

    if (!frontmatter) return false;

    const expectedName = basename(filename, '.md');
    const errors = [];

    const required = ['name', 'description', 'model'];
    for (const field of required) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (frontmatter.name && frontmatter.name !== expectedName) {
      errors.push(`name "${frontmatter.name}" doesn't match filename "${expectedName}"`);
    }

    const validModels = [
      'claude-sonnet-4-5',
      'claude-sonnet-4-1',
      'claude-opus-4-1',
      'claude-opus-4',
      'claude-haiku-4-1'
    ];
    if (frontmatter.model && !validModels.includes(frontmatter.model)) {
      errors.push(`Invalid model: ${frontmatter.model}`);
    }

    if (frontmatter.description && frontmatter.description.length < 10) {
      errors.push(`Description too short: "${frontmatter.description}"`);
    }

    if (errors.length > 0) {
      console.error(`${RED}❌ ${filename}:${RESET}`);
      errors.forEach(err => console.error(`   ${err}`));
      hasErrors = true;
      return false;
    }

    console.log(`${GREEN}✅ ${filename}${RESET}`);
    return true;
  }

  try {
    const files = readdirSync(AGENTS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (files.length === 0) {
      console.error(`${RED}❌ No agent files found${RESET}`);
      return false;
    }

    console.log(`Found ${files.length} agent files\n`);
    files.forEach(validateAgent);

    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
      console.error(`${RED}❌ Agent validation failed${RESET}`);
      return false;
    } else {
      console.log(`${GREEN}✅ All ${files.length} agent files are valid${RESET}`);
      return true;
    }
  } catch (error) {
    console.error(`${RED}Error: ${error.message}${RESET}`);
    return false;
  }
}

// =============================================================================
// VALIDATOR 2: COMMANDS
// =============================================================================

function validateCommandSpecs() {
  console.log('🔍 Linting command specs...\n');

  const COMMAND_PATHS = ['.claude/commands/fullservice.md'];
  const FORBIDDEN_PATTERNS = [
    { regex: /\bmkdir\s+-p\b/i, message: 'Use mcp__git__git_worktree instead of mkdir -p' },
    { regex: /\bgit\s+worktree\b/i, message: 'Use mcp__git__git_worktree instead of raw git worktree' },
    { regex: /\bgit\s+rev-parse\b/i, message: 'Use MCP git tools instead of raw git rev-parse' },
    { regex: /\bcd\s+\$?WORKTREE_PATH\b/i, message: 'Avoid instructing Bash to cd; rely on MCP tools' },
    { regex: /&&\s*test\s+-f\b/i, message: 'Use Glob/Read for file existence checks' },
  ];

  let hasFailure = false;

  for (const relativePath of COMMAND_PATHS) {
    const absolutePath = join(ROOT, relativePath);
    const contents = readFileSync(absolutePath, 'utf8');

    FORBIDDEN_PATTERNS.forEach(({ regex, message }) => {
      if (regex.test(contents)) {
        hasFailure = true;
        console.error(`${RED}❌ ${relativePath}${RESET}`);
        console.error(`   ${message}`);
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  if (hasFailure) {
    console.error(`${RED}❌ Command specs validation failed${RESET}`);
    return false;
  } else {
    console.log(`${GREEN}✅ Command specs clean${RESET}`);
    return true;
  }
}

// =============================================================================
// VALIDATOR 3: DELEGATION
// =============================================================================

function validateDelegation() {
  console.log('🔍 Validating delegation discipline...\n');

  function findRecentSessionFiles() {
    if (!existsSync(MEMORY_DIR)) {
      console.error(`${RED}❌ Memory directory not found${RESET}`);
      return null;
    }

    const files = readdirSync(MEMORY_DIR);
    const quickContext = files.find(f => f === 'quick-context.md');
    const toolAudit = files.find(f => f === 'tool-audit.log');
    const sessionReports = files.filter(f => f.startsWith('session-report-'));
    const auditFiles = files.filter(f => f.startsWith('audit-'));
    const checkpointFiles = files.filter(f => f.startsWith('checkpoint-'));

    return {
      quickContext: quickContext ? join(MEMORY_DIR, quickContext) : null,
      toolAudit: toolAudit ? join(MEMORY_DIR, toolAudit) : null,
      hasSessionFiles: sessionReports.length > 0 || auditFiles.length > 0 || checkpointFiles.length > 0
    };
  }

  function checkWhitelistedChanges() {
    try {
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(f => f.length > 0);

      if (stagedFiles.length === 0) return false;

      const whitelistPatterns = [
        /^\.claude\/memory\/.*-template\.md$/,
        /^\.claude\/memory\/quick-context\.md$/,
        /^\.claude\/scripts\//,
        /^scripts\//,
        /^CLAUDE\.md$/,
        /^README\.md$/,
      ];

      const allWhitelisted = stagedFiles.every(file =>
        whitelistPatterns.some(pattern => pattern.test(file))
      );

      if (allWhitelisted) {
        console.log(`${BLUE}ℹ️  All staged changes are delegation system files${RESET}`);
        console.log('   Skipping delegation count validation\n');
      }

      return allWhitelisted;
    } catch {
      return false;
    }
  }

  function validateSpecialistOwners(filepath) {
    if (!filepath || !existsSync(filepath)) {
      console.log(`${YELLOW}⚠️  No quick-context.md found${RESET}`);
      hasWarnings = true;
      return;
    }

    const content = readFileSync(filepath, 'utf-8');
    const specialists = [
      'docs', 'agentic', 'reviewer', 'testing', 'linting',
      'foundations', 'infra', 'stack-ai', 'stack-prisma'
    ];

    const found = specialists.filter(s =>
      new RegExp(`owner.*${s}|${s}.*:`, 'i').test(content)
    );

    if (found.length === 0) {
      console.error(`${RED}❌ No specialist owners found${RESET}`);
      hasErrors = true;
    } else {
      console.log(`${GREEN}✅ Found ${found.length} specialists: ${found.join(', ')}${RESET}`);
    }
  }

  try {
    const files = findRecentSessionFiles();
    if (!files) return false;

    const isWhitelistedOnly = checkWhitelistedChanges();

    if (!isWhitelistedOnly) {
      validateSpecialistOwners(files.quickContext);
    }

    console.log('\n' + '='.repeat(60));
    if (hasErrors) {
      console.error(`${RED}❌ Delegation validation failed${RESET}`);
      return false;
    } else {
      console.log(`${GREEN}✅ Delegation checks passed${RESET}`);
      return true;
    }
  } catch (error) {
    console.error(`${RED}Error: ${error.message}${RESET}`);
    return false;
  }
}

// =============================================================================
// VALIDATOR 4: WORKTREE
// =============================================================================

async function validateWorktree() {
  console.log('🔍 Checking worktree safety...\n');

  const tmpDir = join(ROOT, '.tmp');

  if (!existsSync(tmpDir)) {
    console.log('No active fullservice session\n');
    return true;
  }

  try {
    const entries = readdirSync(tmpDir);
    const fullserviceDir = entries.find(e => e.startsWith('fullservice-'));

    if (!fullserviceDir) {
      console.log('No active fullservice session\n');
      return true;
    }

    // Check for recent commits
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    const recentCommits = execSync('git log --since="10 minutes ago" --oneline 2>/dev/null || true', {
      encoding: 'utf-8'
    }).trim();

    if (recentCommits) {
      console.error(`${RED}⚠️  WARNING: Git commits during /fullservice session!${RESET}\n`);
      console.error(`Recent commits on branch: ${currentBranch}`);
      console.error(recentCommits);
      console.error('\nExpected: No commits on main branch during /fullservice');
      console.error(`Worktree: .tmp/${fullserviceDir}\n`);
      console.error(`${RED}❌ SAFETY VIOLATION DETECTED${RESET}`);
      console.error('\nThis indicates /fullservice worked outside the isolated worktree.');
      console.error(`All work should be in: .tmp/${fullserviceDir}\n`);
      return false;
    }

    // Check if in worktree directory
    const currentDir = process.cwd();
    if (!currentDir.includes('.tmp/fullservice-')) {
      console.log(`${YELLOW}⚠️  WARNING: Not in worktree directory!${RESET}\n`);
      console.log(`Current directory: ${currentDir}`);
      console.log(`Expected worktree: .tmp/${fullserviceDir}\n`);
      console.log(`${YELLOW}⚠️  POTENTIAL SAFETY VIOLATION${RESET}\n`);
      console.log('You should be working in the isolated worktree during /fullservice.\n');
      // Don't fail - just warning
    }

    console.log(`${GREEN}✅ No worktree violations detected${RESET}`);
    return true;
  } catch (err) {
    console.error(`${RED}Error checking worktree: ${err.message}${RESET}`);
    return false;
  }
}

// =============================================================================
// PARALLEL EXECUTION
// =============================================================================

async function validateAll() {
  console.log('🚀 Running all Claude validators in parallel (Node 22+ optimized)...\n');
  console.log('='.repeat(60) + '\n');

  const startTime = performance.now();

  const results = await Promise.allSettled([
    Promise.resolve(validateAgents()),
    Promise.resolve(validateCommandSpecs()),
    Promise.resolve(validateDelegation()),
    validateWorktree()
  ]);

  const duration = performance.now() - startTime;

  const names = ['Agents', 'Commands', 'Delegation', 'Worktree'];
  let allPassed = true;

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL SUMMARY\n');

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value) {
      console.log(`   ${names[idx]}: ${GREEN}✅ PASS${RESET}`);
    } else {
      console.log(`   ${names[idx]}: ${RED}❌ FAIL${RESET}`);
      allPassed = false;
    }
  });

  console.log(`\n   Total time: ${duration.toFixed(0)}ms`);
  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    console.log(`\n${GREEN}✅ All Claude validations passed${RESET}\n`);
    return 0;
  } else {
    console.error(`\n${RED}❌ One or more Claude validations failed${RESET}\n`);
    return 1;
  }
}

// =============================================================================
// MAIN CLI
// =============================================================================

async function main() {
  const subcommand = process.argv[2];

  if (!subcommand) {
    console.error('Usage: node validate-claude.mjs <agents|commands|delegation|worktree|all>');
    process.exit(1);
  }

  let result;

  switch (subcommand) {
    case 'agents':
      result = validateAgents();
      break;
    case 'commands':
      result = validateCommandSpecs();
      break;
    case 'delegation':
      result = validateDelegation();
      break;
    case 'worktree':
      result = await validateWorktree();
      break;
    case 'all':
      process.exit(await validateAll());
    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      console.error('Valid subcommands: agents, commands, delegation, worktree, all');
      process.exit(1);
  }

  process.exit(result ? 0 : 1);
}

main();
