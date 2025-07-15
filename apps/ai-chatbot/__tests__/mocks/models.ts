// Test-safe mock of models for E2E tests
export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider?: string;
  capabilities?: string[];
  reasoning?: boolean;
  deprecated?: boolean;
}

// Static test data that doesn't import server-only modules
export const chatModels: ChatModel[] = [
  {
    id: 'chat-model',
    name: 'Chat Model',
    description: 'Primary model for all-purpose chat (dynamic provider selection)',
    provider: 'Dynamic',
    capabilities: ['tools', 'multimodal', 'reasoning'],
    reasoning: true,
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning Model',
    description: 'Advanced reasoning model (dynamic provider selection)',
    provider: 'Dynamic',
    capabilities: ['reasoning', 'tools', 'multimodal'],
    reasoning: true,
  },
];
