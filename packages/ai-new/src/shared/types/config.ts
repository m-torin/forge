export interface AIConfig {
  defaultProvider?: string;
  enableLogging?: boolean;
  enableRateLimit?: boolean;
  providers?: {
    openai?: {
      apiKey?: string;
      baseUrl?: string;
      organization?: string;
    };
    anthropic?: {
      apiKey?: string;
      baseUrl?: string;
    };
    google?: {
      apiKey?: string;
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

export interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  model?: string;
  organization?: string;
  temperature?: number;
  timeout?: number;
}

export interface GoogleConfig {
  apiKey: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

export interface DirectAnthropicConfig extends AnthropicConfig {}
export interface DirectOpenAIConfig extends OpenAIConfig {}
