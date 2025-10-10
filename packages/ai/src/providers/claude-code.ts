/**
 * Claude Code Provider Module
 * Custom/Alternative Provider - Beyond Main Spectrum
 *
 * ARCHITECTURAL DECISION: Custom/Alternative Category Pattern
 * =======================================================
 *
 * Claude Code represents a unique category in our provider ecosystem:
 *
 * PROVIDER SPECTRUM:
 * OpenAI/Custom ←────── Anthropic ←────── xAI ←────── Perplexity | Custom/Alternative
 * (LM Studio)           (Balanced)        (SDK-First)  (Min SDK)    (Claude Code)
 * (Max SDK)                                                        (Community)
 *
 * WHY CUSTOM/ALTERNATIVE:
 * 1. Community Provider - External dependency, not official provider
 * 2. CLI-based Architecture - Uses Claude Code CLI rather than direct API calls
 * 3. Dual Authentication - Both API keys AND Claude subscriptions
 * 4. Built-in Tools - Access to Claude's native tools (Bash, Edit, Read, Write, etc.)
 * 5. MCP Integration - Model Context Protocol server support
 * 6. Extended Thinking - Proper timeout management for 10-minute operations
 *
 * USAGE EXAMPLES:
 *
 * Basic usage with API key authentication:
 * ```typescript
 * import { claudeCode } from '@repo/ai';
 * import { generateText } from 'ai';
 *
 * const result = await generateText({
 *   model: claudeCode('opus'),
 *   prompt: 'Write a vegetarian lasagna recipe for 4 people.',
 * });
 * const text = await result.text;
 * ```
 *
 * Extended thinking with timeout management (official pattern):
 * ```typescript
 * import { claudeCode } from '@repo/ai';
 * import { generateText } from 'ai';
 *
 * const controller = new AbortController();
 * const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes
 *
 * try {
 *   const result = await generateText({
 *     model: claudeCode('opus'),
 *     prompt: 'Solve this complex problem...',
 *     abortSignal: controller.signal,
 *   });
 *   const text = await result.text;
 * } finally {
 *   clearTimeout(timeout);
 * }
 * ```
 *
 * Custom configuration with tool control:
 * ```typescript
 * import { createClaudeCode } from '@repo/ai';
 *
 * const customClaudeCode = createClaudeCode({
 *   allowedTools: ['Read', 'Write', 'Edit'],
 *   disallowedTools: ['Bash'],
 *   mcpServers: ['github', 'postgresql'],
 *   anthropicDir: '~/.claude/custom',
 * });
 *
 * const model = customClaudeCode('sonnet');
 * ```
 *
 * Environment-based configuration:
 * ```bash
 * # Tool control
 * CLAUDE_CODE_ALLOWED_TOOLS="Read,Write,Edit,Grep,LS"
 * CLAUDE_CODE_DISALLOWED_TOOLS="Bash"
 *
 * # MCP server selection
 * CLAUDE_CODE_MCP_SERVERS="github,postgresql,filesystem"
 *
 * # Custom CLI directory (matches docs: anthropicDir)
 * CLAUDE_CODE_ANTHROPIC_DIR="~/.claude/custom"
 * ```
 *
 * SPECTRUM POSITIONING: Custom/Alternative (Community Provider)
 *
 * OpenAI/Custom ←────── Anthropic ←────── xAI ←────── Perplexity | Custom/Alternative
 * (LM Studio)           (Balanced)        (SDK-First)  (Min SDK)    (Claude Code)
 * (Max SDK)                                                        (Community)
 *
 * RATIONALE: Claude Code provides unique CLI-based access to Claude with built-in tools
 * and MCP integration that no other provider offers, warranting its own category.
 */

import { claudeCode as claudeCodeProvider, createClaudeCode } from 'ai-sdk-provider-claude-code';

// Re-export the provider itself and factory function
export { claudeCodeProvider as claudeCode, createClaudeCode };

/**
 * Single source of truth for Claude Code model IDs
 * Based on official Claude Code provider documentation
 */
export const CLAUDE_CODE_MODEL_IDS = {
  // Claude 4 models available through Claude Code
  OPUS: 'opus', // Claude 4 Opus (most capable)
  SONNET: 'sonnet', // Claude 4 Sonnet (balanced performance)
} as const;

/**
 * Model groups for categorization
 * Helps identify capabilities and use cases
 */
const CLAUDE_CODE_MODEL_GROUPS = {
  // All available models (limited set in Claude Code)
  ALL_MODELS: [CLAUDE_CODE_MODEL_IDS.OPUS, CLAUDE_CODE_MODEL_IDS.SONNET] as const,

  // Extended thinking capable models
  EXTENDED_THINKING_MODELS: [
    CLAUDE_CODE_MODEL_IDS.OPUS, // Opus supports extended thinking
  ] as const,

  // Built-in tools capable models (all Claude Code models)
  BUILT_IN_TOOLS_MODELS: [CLAUDE_CODE_MODEL_IDS.OPUS, CLAUDE_CODE_MODEL_IDS.SONNET] as const,
} as const;

/**
 * Claude Code model capabilities matrix
 * Based on provider documentation
 */
const CLAUDE_CODE_MODEL_CAPABILITIES = {
  [CLAUDE_CODE_MODEL_IDS.OPUS]: {
    textGeneration: true,
    objectGeneration: true,
    imageInput: false, // Not supported by Claude Code provider
    toolUsage: false, // AI SDK tools not supported, uses built-in tools
    toolStreaming: false, // Not supported
    builtInTools: true, // Claude's native tools (Bash, Edit, Read, Write, etc.)
    mcpServers: true, // MCP server integration
    extendedThinking: true, // Claude 4 Opus supports extended thinking (up to 10 minutes)
    maxContextTokens: 200000, // Claude 4 Opus context
  },
  [CLAUDE_CODE_MODEL_IDS.SONNET]: {
    textGeneration: true,
    objectGeneration: true,
    imageInput: false,
    toolUsage: false,
    toolStreaming: false,
    builtInTools: true,
    mcpServers: true,
    extendedThinking: false, // Claude 4 Sonnet - extended thinking not documented
    maxContextTokens: 200000, // Claude 4 Sonnet context
  },
} as const;

/**
 * Claude Code configuration presets
 * Common configurations for different use cases
 */
const CLAUDE_CODE_PRESETS = {
  // Safe mode - limited tools
  SAFE_MODE: {
    allowedTools: ['Read', 'LS', 'Grep'],
    disallowedTools: ['Bash', 'Write', 'Edit'],
  },

  // Development mode - common dev tools
  DEVELOPMENT: {
    allowedTools: ['Read', 'Write', 'Edit', 'LS', 'Grep', 'Bash'],
    mcpServers: ['github', 'filesystem'],
  },

  // Research mode - web access enabled
  RESEARCH: {
    allowedTools: ['Read', 'WebFetch', 'LS', 'Grep'],
    disallowedTools: ['Bash', 'Write', 'Edit'],
  },

  // Full access - all tools enabled
  FULL_ACCESS: {
    allowedTools: undefined, // All tools allowed
    disallowedTools: undefined,
  },
} as const;

/**
 * Built-in tools available in Claude Code
 * These are Claude's native tools, not AI SDK tools
 */
const CLAUDE_CODE_BUILT_IN_TOOLS = [
  'Bash', // Execute shell commands
  'Edit', // Edit files with precise replacements
  'Read', // Read file contents
  'Write', // Write new files
  'LS', // List directory contents
  'Grep', // Search file contents
  'WebFetch', // Fetch and analyze web content
  'Task', // Multi-step task execution
  // Additional tools may be available based on MCP servers
] as const;

/**
 * Type definitions for Claude Code usage
 */
export interface ClaudeCodeConfig {
  allowedTools?: string[];
  disallowedTools?: string[];
  mcpServers?: string[];
  anthropicDir?: string;
}

interface ExtendedThinkingController {
  signal: AbortSignal;
  cleanup: () => void;
}

type ClaudeCodeModelCapabilities =
  (typeof CLAUDE_CODE_MODEL_CAPABILITIES)[keyof typeof CLAUDE_CODE_MODEL_CAPABILITIES];

/**
 * Create extended thinking timeout controller (convenience helper)
 * Manages 10-minute timeout for Claude Opus 4 extended thinking
 *
 * Official pattern (as shown in docs):
 * ```typescript
 * const controller = new AbortController();
 * const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);
 * try {
 *   const result = await generateText({
 *     model: claudeCode('opus'),
 *     prompt: 'Solve this complex problem...',
 *     abortSignal: controller.signal,
 *   });
 *   const text = await result.text;
 * } finally {
 *   clearTimeout(timeout);
 * }
 * ```
 *
 * Convenience helper (alternative):
 * ```typescript
 * const controller = createExtendedThinkingTimeout();
 * try {
 *   const result = await generateText({
 *     model: claudeCode('opus'),
 *     prompt: 'Solve this complex problem...',
 *     abortSignal: controller.signal,
 *   });
 *   const text = await result.text;
 * } finally {
 *   controller.cleanup();
 * }
 * ```
 */
function createExtendedThinkingTimeout(
  timeoutMs: number = 10 * 60 * 1000,
): ExtendedThinkingController {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeout),
  };
}

/**
 * Get model capabilities for a specific Claude Code model
 */
function getModelCapabilities(modelId: string): ClaudeCodeModelCapabilities | null {
  return (
    CLAUDE_CODE_MODEL_CAPABILITIES[modelId as keyof typeof CLAUDE_CODE_MODEL_CAPABILITIES] || null
  );
}

/**
 * Check if model supports extended thinking
 */
export function supportsExtendedThinking(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.extendedThinking || false;
}

/**
 * Check if model supports built-in tools
 */
function supportsBuiltInTools(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.builtInTools || false;
}

/**
 * Check if model supports MCP servers
 */
function supportsMCPServers(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.mcpServers || false;
}

/**
 * Parse tool list from environment variable
 * Supports comma-separated format: "Read,Write,Edit"
 */
function parseToolList(toolsEnv: string): string[] {
  if (!toolsEnv) return [];
  return toolsEnv
    .split(',')
    .map(tool => tool.trim())
    .filter(Boolean);
}

/**
 * Check if Claude Code CLI is available
 * Tests for global installation and provides helpful error messages
 */
async function checkClaudeCodeCLI(): Promise<{ available: boolean; error?: string }> {
  try {
    // TODO: Convert to dynamic import for ESM-only compliance
    // const { execSync } = require('child_process');
    // Test if claude command exists and is the Code CLI
    // const output = execSync('claude --version 2>/dev/null', { encoding: 'utf8', timeout: 5000 });

    // TODO: Implement with dynamic import
    // if (output && (output.includes('claude-code') || output.includes('anthropic'))) {
    //   return { available: true };
    // } else {
    //   return {
    //     available: false,
    //     error: 'Claude Code CLI found but may not be the correct version. Expected @anthropic-ai/claude-code.'
    //   };
    // }
    return { available: false, error: 'Claude Code CLI check not implemented (ESM-only mode)' };
  } catch (error) {
    return {
      available: false,
      error: 'Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code',
    };
  }
}

/**
 * Check Claude Code authentication status
 * Detects if user is authenticated via subscription or needs API key
 */
async function checkClaudeCodeAuth(): Promise<{
  authenticated: boolean;
  method?: 'subscription' | 'apikey';
  error?: string;
}> {
  // If API key is set, use that
  if (process.env.ANTHROPIC_API_KEY) {
    return { authenticated: true, method: 'apikey' };
  }

  try {
    // TODO: Convert to dynamic import for ESM-only compliance
    // const { execSync } = require('child_process');
    // Check if user is logged in via subscription
    // const output = execSync('claude auth status 2>/dev/null', { encoding: 'utf8', timeout: 5000 });

    // TODO: Implement with dynamic import
    // if (output && output.includes('authenticated')) {
    //   return { authenticated: true, method: 'subscription' };
    // } else {
    //   return {
    //     authenticated: false,
    //     error: 'Not authenticated. Run "claude login" or set ANTHROPIC_API_KEY environment variable.'
    //   };
    // }
    return {
      authenticated: false,
      error:
        'Claude Code auth check not implemented (ESM-only mode). Set ANTHROPIC_API_KEY environment variable.',
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Cannot check authentication status. Ensure Claude Code CLI is installed and working.',
    };
  }
}

/**
 * Get user-configured Claude Code settings from environment
 */
function getUserClaudeCodeConfig(): ClaudeCodeConfig {
  const allowedToolsEnv = process.env.CLAUDE_CODE_ALLOWED_TOOLS;
  const disallowedToolsEnv = process.env.CLAUDE_CODE_DISALLOWED_TOOLS;
  const mcpServersEnv = process.env.CLAUDE_CODE_MCP_SERVERS;
  const anthropicDirEnv = process.env.CLAUDE_CODE_ANTHROPIC_DIR;

  return {
    allowedTools: allowedToolsEnv ? parseToolList(allowedToolsEnv) : undefined,
    disallowedTools: disallowedToolsEnv ? parseToolList(disallowedToolsEnv) : undefined,
    mcpServers: mcpServersEnv ? parseToolList(mcpServersEnv) : undefined,
    anthropicDir: anthropicDirEnv || undefined,
  };
}

/**
 * Claude Code setup instructions and configuration examples
 * Based on official Claude Code provider documentation
 */
const CLAUDE_CODE_INFO = {
  SETUP_STEPS: [
    '1. Install Claude Code CLI: npm install -g @anthropic-ai/claude-code',
    '2. Authenticate: claude login (opens browser for Pro/Max subscription)',
    '3. Install provider: pnpm add ai-sdk-provider-claude-code ai',
    '4. Import and use: claudeCode("opus") or claudeCode("sonnet")',
  ],
  AUTHENTICATION_METHODS: [
    'Claude Pro/Max subscription via "claude login" (recommended)',
    'API key via ANTHROPIC_API_KEY environment variable',
  ],
  BUILT_IN_TOOLS: CLAUDE_CODE_BUILT_IN_TOOLS,
  ENVIRONMENT_EXAMPLES: {
    // Tool control
    ALLOWED_TOOLS: 'CLAUDE_CODE_ALLOWED_TOOLS="Read,Write,Edit,LS,Grep"',
    DISALLOWED_TOOLS: 'CLAUDE_CODE_DISALLOWED_TOOLS="Bash"',

    // MCP servers
    MCP_SERVERS: 'CLAUDE_CODE_MCP_SERVERS="github,postgresql,filesystem"',

    // Custom CLI directory (matches docs: anthropicDir)
    ANTHROPIC_DIR: 'CLAUDE_CODE_ANTHROPIC_DIR="~/.claude/custom"',
  },
  EXAMPLE_MODELS: [
    'opus', // Claude 4 Opus
    'sonnet', // Claude 4 Sonnet
  ],
  UNIQUE_FEATURES: [
    'Built-in tools (Bash, Edit, Read, Write, WebFetch, etc.)',
    'MCP server integration',
    'Extended thinking support (Opus)',
    'Dual authentication (subscription + API key)',
    'CLI-based architecture',
  ],
} as const;
