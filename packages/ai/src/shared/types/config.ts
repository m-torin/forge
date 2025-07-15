export interface AIConfig {
  defaultProvider?: string;
  enableLogging?: boolean;
  enableRateLimit?: boolean;
  providers?: {
    anthropic?: {
      apiKey?: string;
      baseUrl?: string;
    };
    deepinfra?: {
      apiKey?: string;
      baseUrl?: string;
    };
    google?: {
      apiKey?: string;
    };
    openai?: {
      apiKey?: string;
      baseUrl?: string;
      organization?: string;
    };
    perplexity?: {
      apiKey?: string;
      searchEnabled?: boolean;
      citationsEnabled?: boolean;
      toolsEnabled?: boolean;
      imageEnabled?: boolean;
    };
  };
}

export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
  timeout?: number;
}

export type DirectAnthropicConfig = AnthropicConfig;

export type DirectOpenAIConfig = OpenAIConfig;

export interface GoogleConfig {
  apiKey: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
}
export interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  model?: string;
  organization?: string;
  temperature?: number;
  timeout?: number;
}
