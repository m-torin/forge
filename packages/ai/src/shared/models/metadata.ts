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
};

export const PERPLEXITY_MODEL_METADATA: Record<string, ModelMetadata> = {
  // Search models (as per official docs)
  sonar: {
    id: 'sonar',
    name: 'Perplexity Sonar',
    description: 'Lightweight, cost-effective search model with grounding',
    provider: 'perplexity',
    capabilities: ['search', 'tools'],
    contextWindow: 128000,
    outputLimit: 4096,
  },
  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    description:
      'Advanced search offering with grounding, supporting complex queries and follow-ups',
    provider: 'perplexity',
    capabilities: ['search', 'tools', 'multimodal'],
    contextWindow: 200000,
    outputLimit: 8192,
  },
  'sonar-deep-research': {
    id: 'sonar-deep-research',
    name: 'Perplexity Deep Research',
    description:
      'Expert-level research model conducting exhaustive searches and generating comprehensive reports',
    provider: 'perplexity',
    capabilities: ['search', 'tools', 'reasoning'],
    contextWindow: 128000,
    outputLimit: 16384,
    reasoning: {
      supported: true,
      // Deep research includes extensive reasoning
    },
  },
  // Reasoning models (as per official docs)
  'sonar-reasoning': {
    id: 'sonar-reasoning',
    name: 'Perplexity Sonar Reasoning',
    description: 'Fast, real-time reasoning model designed for quick problem-solving with search',
    provider: 'perplexity',
    capabilities: ['search', 'reasoning', 'tools'],
    contextWindow: 128000,
    outputLimit: 8192,
    reasoning: {
      supported: true,
      // CoT (Chain of Thought) reasoning
    },
  },
  'sonar-reasoning-pro': {
    id: 'sonar-reasoning-pro',
    name: 'Perplexity Sonar Reasoning Pro',
    description: 'Premier reasoning offering powered by DeepSeek R1 with Chain of Thought',
    provider: 'perplexity',
    capabilities: ['search', 'reasoning', 'tools', 'code'],
    contextWindow: 128000,
    outputLimit: 16384,
    reasoning: {
      supported: true,
      // Advanced CoT reasoning
    },
  },
  // Offline models (as per official docs)
  'r1-1776': {
    id: 'r1-1776',
    name: 'Perplexity R1-1776',
    description: 'Uncensored, unbiased offline model that does not use search subsystem',
    provider: 'perplexity',
    capabilities: ['tools', 'code'],
    contextWindow: 128000,
    outputLimit: 8192,
  },
  // Additional models from API
  'llama-3.1-sonar-small-128k-online': {
    id: 'llama-3.1-sonar-small-128k-online',
    name: 'Llama 3.1 Sonar Small',
    description: 'Small efficient search model based on Llama 3.1',
    provider: 'perplexity',
    capabilities: ['search', 'tools'],
    contextWindow: 128000,
    outputLimit: 4096,
  },
  'llama-3.1-sonar-large-128k-online': {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Llama 3.1 Sonar Large',
    description: 'Large search model based on Llama 3.1',
    provider: 'perplexity',
    capabilities: ['search', 'tools', 'code'],
    contextWindow: 128000,
    outputLimit: 8192,
  },
};

export const XAI_MODEL_METADATA: Record<string, ModelMetadata> = {
  // Grok 2 models (as per XAI official documentation)
  'grok-2-1212': {
    id: 'grok-2-1212',
    name: 'Grok 2',
    description: "XAI's advanced multimodal model with strong reasoning capabilities",
    provider: 'xai',
    capabilities: ['tools', 'vision', 'code', 'multimodal'],
    contextWindow: 131072, // 128K context window
    outputLimit: 8192,
  },
  'grok-2-vision-1212': {
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision',
    description: 'Grok 2 with enhanced vision capabilities for image analysis',
    provider: 'xai',
    capabilities: ['tools', 'vision', 'code', 'multimodal'],
    contextWindow: 131072, // 128K context window
    outputLimit: 8192,
  },
  // Grok 3 models
  'grok-3-mini': {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    description: 'Fast and efficient model with reasoning capabilities',
    provider: 'xai',
    capabilities: ['tools', 'code', 'reasoning'],
    contextWindow: 65536, // 64K context window
    outputLimit: 4096,
    reasoning: {
      supported: true,
      // Grok 3 includes built-in reasoning
    },
  },
  'grok-3-mini-reasoning': {
    id: 'grok-3-mini-reasoning',
    name: 'Grok 3 Mini (Reasoning)',
    description: 'Grok 3 Mini with enhanced reasoning mode for complex problem solving',
    provider: 'xai',
    capabilities: ['tools', 'code', 'reasoning'],
    contextWindow: 65536, // 64K context window
    outputLimit: 8192,
    reasoning: {
      supported: true,
      budgetTokens: 10000,
      // Enhanced reasoning mode
    },
  },
  // Base models
  'grok-2': {
    id: 'grok-2',
    name: 'Grok 2',
    description: "XAI's advanced language model",
    provider: 'xai',
    capabilities: ['tools', 'code'],
    contextWindow: 131072,
    outputLimit: 8192,
  },
};

export const GOOGLE_MODEL_METADATA: Record<string, ModelMetadata> = {
  // Gemini 1.5 models
  'gemini-1.5-pro-latest': {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    description: "Google's most capable model with 2M context window",
    provider: 'google',
    capabilities: ['vision', 'tools', 'code', 'multimodal', 'pdf-support'],
    contextWindow: 2097152, // 2M tokens
    outputLimit: 8192,
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: "Google's multimodal model with extended context",
    provider: 'google',
    capabilities: ['vision', 'tools', 'code', 'multimodal', 'pdf-support'],
    contextWindow: 2097152, // 2M tokens
    outputLimit: 8192,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model with 1M context window',
    provider: 'google',
    capabilities: ['vision', 'tools', 'code', 'multimodal'],
    contextWindow: 1048576, // 1M tokens
    outputLimit: 8192,
  },
  'gemini-1.5-flash-8b': {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    description: 'Lightweight fast model for simple tasks',
    provider: 'google',
    capabilities: ['tools', 'code'],
    contextWindow: 1048576, // 1M tokens
    outputLimit: 8192,
  },
  // Gemini 2.0 models
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    description: 'Next-generation experimental model with advanced capabilities',
    provider: 'google',
    capabilities: ['vision', 'tools', 'code', 'multimodal', 'reasoning'],
    contextWindow: 1048576, // 1M tokens
    outputLimit: 8192,
    reasoning: {
      supported: true,
      // Gemini 2.0 has built-in reasoning capabilities
    },
  },
};

export const LMSTUDIO_MODEL_METADATA: Record<string, ModelMetadata> = {
  'lmstudio-chat': {
    id: 'lmstudio-chat',
    name: 'LM Studio Chat',
    description: 'Local model running via LM Studio',
    provider: 'lmstudio',
    capabilities: ['tools'],
    contextWindow: 4096, // Default, varies by loaded model
    outputLimit: 2048,
  },
  'lmstudio-code': {
    id: 'lmstudio-code',
    name: 'LM Studio Code',
    description: 'Code-optimized local model via LM Studio',
    provider: 'lmstudio',
    capabilities: ['tools', 'code'],
    contextWindow: 8192, // Typical for code models
    outputLimit: 4096,
  },
  'lmstudio-reasoning': {
    id: 'lmstudio-reasoning',
    name: 'LM Studio Reasoning',
    description: 'Local reasoning model via LM Studio',
    provider: 'lmstudio',
    capabilities: ['tools', 'reasoning'],
    contextWindow: 8192,
    outputLimit: 4096,
    reasoning: {
      supported: true,
      // Local reasoning models like DeepSeek R1
    },
  },
  'lmstudio-vision': {
    id: 'lmstudio-vision',
    name: 'LM Studio Vision',
    description: 'Multimodal local model via LM Studio',
    provider: 'lmstudio',
    capabilities: ['tools', 'vision', 'multimodal'],
    contextWindow: 4096,
    outputLimit: 2048,
  },
};

export const OLLAMA_MODEL_METADATA: Record<string, ModelMetadata> = {
  'ollama-chat': {
    id: 'ollama-chat',
    name: 'Ollama Chat',
    description: 'Local model running via Ollama',
    provider: 'ollama',
    capabilities: ['tools'],
    contextWindow: 4096, // Default, varies by loaded model
    outputLimit: 2048,
  },
  'ollama-code': {
    id: 'ollama-code',
    name: 'Ollama Code',
    description: 'Code-optimized local model via Ollama',
    provider: 'ollama',
    capabilities: ['tools', 'code'],
    contextWindow: 8192, // Typical for code models
    outputLimit: 4096,
  },
  'ollama-reasoning': {
    id: 'ollama-reasoning',
    name: 'Ollama Reasoning',
    description: 'Local reasoning model via Ollama',
    provider: 'ollama',
    capabilities: ['tools', 'reasoning'],
    contextWindow: 8192,
    outputLimit: 4096,
    reasoning: {
      supported: true,
      // Local reasoning models
    },
  },
  'ollama-vision': {
    id: 'ollama-vision',
    name: 'Ollama Vision',
    description: 'Multimodal local model via Ollama',
    provider: 'ollama',
    capabilities: ['tools', 'vision', 'multimodal'],
    contextWindow: 4096,
    outputLimit: 2048,
  },
  // Specific model support
  'ollama-llama3': {
    id: 'ollama-llama3',
    name: 'Ollama Llama 3',
    description: 'Meta Llama 3 via Ollama',
    provider: 'ollama',
    capabilities: ['tools', 'code'],
    contextWindow: 8192,
    outputLimit: 4096,
  },
  'ollama-mixtral': {
    id: 'ollama-mixtral',
    name: 'Ollama Mixtral',
    description: 'Mixtral MOE model via Ollama',
    provider: 'ollama',
    capabilities: ['tools', 'code'],
    contextWindow: 32768,
    outputLimit: 8192,
  },
};

export const DEEPSEEK_MODEL_METADATA: Record<string, ModelMetadata> = {
  // DeepSeek V3 models (latest)
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat V3',
    description: 'DeepSeek conversational model with strong performance',
    provider: 'deepseek',
    capabilities: ['tools', 'code'],
    contextWindow: 65536, // 64K context
    outputLimit: 8192,
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'DeepSeek reasoning model with advanced chain-of-thought',
    provider: 'deepseek',
    capabilities: ['tools', 'reasoning', 'code'],
    contextWindow: 65536, // 64K context
    outputLimit: 16384,
    reasoning: {
      supported: true,
      budgetTokens: 20000,
      // Advanced CoT reasoning
    },
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder V2',
    description: 'DeepSeek code generation and understanding model',
    provider: 'deepseek',
    capabilities: ['tools', 'code'],
    contextWindow: 128000, // 128K for code
    outputLimit: 16384,
  },
};

export const OPENAI_MODEL_METADATA: Record<string, ModelMetadata> = {
  // GPT-4o models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: "OpenAI's most capable multimodal model",
    provider: 'openai',
    capabilities: ['tools', 'vision', 'code', 'multimodal'],
    contextWindow: 128000,
    outputLimit: 16384,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and cost-effective model for simple tasks',
    provider: 'openai',
    capabilities: ['tools', 'code'],
    contextWindow: 128000,
    outputLimit: 16384,
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Previous generation turbo model',
    provider: 'openai',
    capabilities: ['tools', 'vision', 'code', 'multimodal'],
    contextWindow: 128000,
    outputLimit: 4096,
  },
  // O1 reasoning models
  'o1-preview': {
    id: 'o1-preview',
    name: 'O1 Preview',
    description: 'Advanced reasoning model with chain-of-thought',
    provider: 'openai',
    capabilities: ['reasoning', 'tools', 'code'],
    contextWindow: 128000,
    outputLimit: 32768,
    reasoning: {
      supported: true,
      // O1 uses internal reasoning, no external headers needed
    },
  },
  'o1-mini': {
    id: 'o1-mini',
    name: 'O1 Mini',
    description: 'Smaller reasoning model for faster responses',
    provider: 'openai',
    capabilities: ['reasoning', 'tools', 'code'],
    contextWindow: 128000,
    outputLimit: 65536,
    reasoning: {
      supported: true,
    },
  },
};

export const OPENAI_COMPATIBLE_MODEL_METADATA = {
  ...LMSTUDIO_MODEL_METADATA,
  ...OLLAMA_MODEL_METADATA,
  ...DEEPSEEK_MODEL_METADATA,
};
