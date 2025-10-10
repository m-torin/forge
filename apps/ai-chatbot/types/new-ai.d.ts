declare module '@repo/ai' {
  export const chatFragments: any;
  export function generateText(messages: any, options?: any): Promise<{ text?: string }>;
  export function streamObject(config: any): any;
  export function streamText(config: any): any;
}

declare module '@repo/ai/core' {
  export function executeAIOperation(name: string, config: any): Promise<any>;
}

declare module '@repo/ai/models' {
  export type ModelCapability = string;
  export function getModelConfig(id: string): any;
}

declare module '@repo/ai/providers' {
  export const models: {
    language: (id: string) => any;
  };
}

declare module '@repo/ai/providers/vercel-ai-gateway' {
  export function createVercelAiGateway(): {
    languageModel: (id: string) => any;
  };
}
