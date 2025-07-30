/**
 * Comprehensive model metadata for UI and configuration
 * Safe for both client and server usage
 * Includes capabilities, reasoning config, and provider information
 */

// Model capability types
export type ModelCapability =
  | 'reasoning'
  | 'vision'
  | 'tools'
  | 'computer-use'
  | 'pdf-support'
  | 'search'
  | 'code'
  | 'multimodal';

// Reasoning configuration interface
export interface ReasoningConfig {
  supported: boolean;
  budgetTokens?: number;
  headers?: Record<string, string>;
}

// Complete model metadata interface
export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  provider?: string;
  capabilities?: ModelCapability[];
  contextWindow?: number;
  outputLimit?: number;
  reasoning?: ReasoningConfig;
  deprecated?: boolean;
}

export const ANTHROPIC_MODEL_METADATA: Record<string, ModelMetadata> = {
  // Legacy aliases for backward compatibility
  'claude-chat': {
    id: 'claude-chat',
    name: 'Claude 4 Sonnet',
    description: 'Anthropic Claude 4 - excellent reasoning and conversation',
    provider: 'anthropic',
    capabilities: ['reasoning', 'vision', 'tools', 'multimodal'],
    reasoning: {
      supported: true,
      budgetTokens: 12000,
      headers: { 'anthropic-beta': 'interleaved-thinking-2025-05-14' },
    },
    deprecated: true,
  },
  'claude-reasoning': {
    id: 'claude-reasoning',
    name: 'Claude 4 Sonnet (Reasoning)',
    description: 'Claude 4 with enhanced reasoning capabilities',
    provider: 'anthropic',
    capabilities: ['reasoning', 'vision', 'tools', 'multimodal'],
    reasoning: {
      supported: true,
      budgetTokens: 15000,
      headers: { 'anthropic-beta': 'interleaved-thinking-2025-05-14' },
    },
    deprecated: true,
  },
  'claude-artifacts': {
    id: 'claude-artifacts',
    name: 'Claude 3.5 Sonnet',
    description: 'Claude 3.5 optimized for code and artifacts',
    provider: 'anthropic',
    capabilities: ['tools', 'computer-use', 'vision', 'code'],
    deprecated: true,
  },
  'claude-title': {
    id: 'claude-title',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and efficient Claude model for titles',
    provider: 'anthropic',
    capabilities: ['tools', 'vision'],
    deprecated: true,
  },
  // Claude 4 models (latest) - as per official docs
  'claude-4-opus-20250514': {
    id: 'claude-4-opus-20250514',
    name: 'Claude 4 Opus',
    description: "Anthropic's most powerful model with built-in reasoning capabilities",
    provider: 'anthropic',
    capabilities: ['reasoning', 'vision', 'tools', 'computer-use', 'multimodal'],
    contextWindow: 200000,
    reasoning: {
      supported: true,
      budgetTokens: 15000,
      headers: { 'anthropic-beta': 'interleaved-thinking-2025-05-14' },
    },
  },
  'claude-4-sonnet-20250514': {
    id: 'claude-4-sonnet-20250514',
    name: 'Claude 4 Sonnet',
    description: "Anthropic's balanced model with built-in reasoning capabilities",
    provider: 'anthropic',
    capabilities: ['reasoning', 'vision', 'tools', 'computer-use', 'multimodal'],
    contextWindow: 200000,
    reasoning: {
      supported: true,
      budgetTokens: 12000,
      headers: { 'anthropic-beta': 'interleaved-thinking-2025-05-14' },
    },
  },
  // Claude 3.7 models - as per official docs
  'claude-3-7-sonnet-20250219': {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    description: 'Enhanced Claude model with reasoning capabilities',
    provider: 'anthropic',
    capabilities: ['reasoning', 'vision', 'tools', 'multimodal'],
    contextWindow: 200000,
    reasoning: {
      supported: true,
      budgetTokens: 12000,
      headers: { 'anthropic-beta': 'interleaved-thinking-2025-05-14' },
    },
  },
  // Claude 3.5 models - as per official docs
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (Latest)',
    description: 'Balanced Claude model with computer tools and PDF support',
    provider: 'anthropic',
    capabilities: ['tools', 'computer-use', 'vision', 'pdf-support', 'multimodal'],
    contextWindow: 200000,
  },
  'claude-3-5-sonnet-20240620': {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet',
    description: 'Balanced Claude model with vision and tool capabilities',
    provider: 'anthropic',
    capabilities: ['tools', 'vision', 'pdf-support', 'multimodal'],
    contextWindow: 200000,
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and efficient Claude model',
    provider: 'anthropic',
    capabilities: ['tools', 'vision', 'multimodal'],
    contextWindow: 200000,
  },
  // Claude 3 models (legacy) - as per official docs
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Legacy Claude 3 model with vision and tool capabilities',
    provider: 'anthropic',
    capabilities: ['tools', 'vision', 'multimodal'],
    contextWindow: 200000,
    deprecated: true,
  },
  'claude-3-sonnet-20240229': {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    description: 'Legacy Claude 3 model with vision and tool capabilities',
    provider: 'anthropic',
    capabilities: ['tools', 'vision', 'multimodal'],
    contextWindow: 200000,
    deprecated: true,
  },
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: 'Legacy fast Claude 3 model',
    provider: 'anthropic',
    capabilities: ['tools', 'vision', 'multimodal'],
    contextWindow: 200000,
    deprecated: true,
  },
} as const;

export const PERPLEXITY_MODEL_METADATA = {
  // Search models (as per official docs)
  sonar: {
    id: 'sonar',
    name: 'Perplexity Sonar',
    description: 'Lightweight, cost-effective search model with grounding (128k context)',
  },
  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    description:
      'Advanced search offering with grounding, supporting complex queries and follow-ups (200k context, 8k output limit)',
  },
  'sonar-deep-research': {
    id: 'sonar-deep-research',
    name: 'Perplexity Deep Research',
    description:
      'Expert-level research model conducting exhaustive searches and generating comprehensive reports (128k context, 30+ min processing)',
  },
  // Reasoning models (as per official docs)
  'sonar-reasoning': {
    id: 'sonar-reasoning',
    name: 'Perplexity Sonar Reasoning',
    description:
      'Fast, real-time reasoning model designed for quick problem-solving with search (128k context, CoT responses)',
  },
  'sonar-reasoning-pro': {
    id: 'sonar-reasoning-pro',
    name: 'Perplexity Sonar Reasoning Pro',
    description:
      'Premier reasoning offering powered by DeepSeek R1 with Chain of Thought (CoT) (128k context)',
  },
  // Offline models (as per official docs)
  'r1-1776': {
    id: 'r1-1776',
    name: 'Perplexity R1-1776',
    description:
      'Uncensored, unbiased offline model that does not use search subsystem (128k context)',
  },
} as const;

export const XAI_MODEL_METADATA = {
  'chat-model': {
    id: 'chat-model',
    name: 'Grok 2 Vision',
    description: 'XAI Grok model with vision capabilities',
  },
  'chat-model-reasoning': {
    id: 'chat-model-reasoning',
    name: 'Grok 3 Mini (Reasoning)',
    description: 'XAI Grok with advanced reasoning',
  },
} as const;

export const GOOGLE_MODEL_METADATA = {
  'gemini-1.5-pro-latest': {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    description: "Google's most capable model with 2M context window",
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model with 1M context window',
  },
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    description: 'Next-generation experimental model',
  },
} as const;

export const LMSTUDIO_MODEL_METADATA = {
  'lmstudio-chat': {
    id: 'lmstudio-chat',
    name: 'LM Studio Chat',
    description: 'Local model running via LM Studio',
  },
  'lmstudio-code': {
    id: 'lmstudio-code',
    name: 'LM Studio Code',
    description: 'Code-optimized local model via LM Studio',
  },
  'lmstudio-reasoning': {
    id: 'lmstudio-reasoning',
    name: 'LM Studio Reasoning',
    description: 'Local reasoning model via LM Studio',
  },
} as const;

export const OLLAMA_MODEL_METADATA = {
  'ollama-chat': {
    id: 'ollama-chat',
    name: 'Ollama Chat',
    description: 'Local model running via Ollama',
  },
  'ollama-code': {
    id: 'ollama-code',
    name: 'Ollama Code',
    description: 'Code-optimized local model via Ollama',
  },
  'ollama-reasoning': {
    id: 'ollama-reasoning',
    name: 'Ollama Reasoning',
    description: 'Local reasoning model via Ollama',
  },
} as const;

export const DEEPSEEK_MODEL_METADATA = {
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek conversational model',
  },
  'deepseek-reasoning': {
    id: 'deepseek-reasoning',
    name: 'DeepSeek Reasoner',
    description: 'DeepSeek reasoning model with chain-of-thought',
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'DeepSeek code generation and understanding model',
  },
} as const;

export const OPENAI_COMPATIBLE_MODEL_METADATA = {
  ...LMSTUDIO_MODEL_METADATA,
  ...OLLAMA_MODEL_METADATA,
  ...DEEPSEEK_MODEL_METADATA,
} as const;
