// Re-export core AI SDK functionality
export * from 'ai';
export * from 'ai/react';

// Export our enhanced features
export * from './lib/models';
export * from './lib/streaming';
export * from './lib/tools';
export * from './hooks/use-ai-chat';

// Export UI components
export { Message } from './components/message';
export { Thread } from './components/thread';
