'use client';

import type { Vote } from '#/lib/db/schema';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { Attachment, ChatMessage } from '#/lib/types';
import { Cloud, Code, Database, Search } from 'lucide-react';
import React from 'react';

/**
 * Generate unique IDs for mock data
 * @returns Unique identifier string
 */
export function generateMockId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Mock user data for testing and demos
 */
export const mockUser = {
  id: 'user-mock-1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '/placeholder-avatar.png',
};

/**
 * Mock conversation messages for testing
 */
export const mockMessages: ChatMessage[] = [
  {
    id: generateMockId(),
    role: 'user',
    parts: [
      {
        type: 'text',
        text: 'Hello! Can you help me understand React hooks?',
      },
    ],
    metadata: {
      createdAt: new Date(Date.now() - 10000).toISOString(),
    },
  },
  {
    id: generateMockId(),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: `React hooks are a powerful feature that let you use state and other React features in functional components. Here are the most common ones:

**useState** - For managing component state
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

**useEffect** - For side effects like API calls
\`\`\`javascript
useEffect(() => {
  fetchData();
}, [dependency]);
\`\`\`

**useContext** - For consuming context values
**useMemo** - For expensive calculations
**useCallback** - For memoizing functions

Would you like me to explain any of these in more detail?`,
      },
    ],
    metadata: {
      createdAt: new Date(Date.now() - 8000).toISOString(),
    },
  },
  {
    id: generateMockId(),
    role: 'user',
    parts: [
      {
        type: 'text',
        text: 'Can you show me a practical example of useEffect?',
      },
    ],
    metadata: {
      createdAt: new Date(Date.now() - 5000).toISOString(),
    },
  },
  {
    id: generateMockId(),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: `Here's a practical example of useEffect for fetching data:

\`\`\`tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This runs when component mounts or userId changes
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // Dependency array - runs when userId changes

  // Cleanup function (optional)
  useEffect(() => {
    return () => {
      logInfo('Component unmounting or userId changed');
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

Key points:
- **Dependency array**: Controls when effect runs
- **Cleanup function**: Returned function runs on unmount/re-run
- **Multiple effects**: You can have multiple useEffect hooks
- **Conditional effects**: Skip effects with empty dependency array \`[]\``,
      },
    ],
    metadata: {
      createdAt: new Date(Date.now() - 2000).toISOString(),
    },
  },
];

// Mock vote data
export const mockVotes: Vote[] = [
  {
    chatId: 'mock-chat-1',
    messageId: mockMessages[1]?.id || '',
    isUpvoted: true,
  },
];

// Mock attachments
export const mockAttachments: Attachment[] = [
  {
    name: 'react-diagram.png',
    url: '/placeholder-image.png',
    contentType: 'image/png',
  },
  {
    name: 'hooks-example.tsx',
    url: '/placeholder-file.tsx',
    contentType: 'text/plain',
  },
];

// Mock MCP tools
export interface MockMCPTool {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'api' | 'compute' | 'storage' | 'search' | 'security';
  icon: React.ComponentType<{ size?: number }>;
  isEnabled: boolean;
  requiresAuth: boolean;
  permissions?: string[];
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

export const mockMCPTools: MockMCPTool[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for current information',
    category: 'search',
    icon: Search,
    isEnabled: true,
    requiresAuth: false,
  },
  {
    id: 'weather-api',
    name: 'Weather API',
    description: 'Get current weather and forecasts',
    category: 'api',
    icon: Cloud,
    isEnabled: true,
    requiresAuth: false,
  },
  {
    id: 'code-interpreter',
    name: 'Code Interpreter',
    description: 'Execute Python code in a sandboxed environment',
    category: 'compute',
    icon: Code,
    isEnabled: false,
    requiresAuth: true,
    permissions: ['execute_code'],
  },
  {
    id: 'file-system',
    name: 'File System',
    description: 'Read and write files in your workspace',
    category: 'storage',
    icon: Database,
    isEnabled: false,
    requiresAuth: true,
    permissions: ['read_files', 'write_files'],
  },
  {
    id: 'database-query',
    name: 'Database Query',
    description: 'Query connected databases',
    category: 'data',
    icon: Database,
    isEnabled: false,
    requiresAuth: true,
    permissions: ['read_database'],
  },
];

// Mock MCP connections
export interface MockMCPConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  url: string;
  tools: MockMCPTool[];
  lastConnected?: Date;
  error?: string;
}

export const mockMCPConnections: MockMCPConnection[] = [
  {
    id: 'local-tools',
    name: 'Local Tools Server',
    status: 'connected',
    url: 'mcp://localhost:3001',
    tools: mockMCPTools.slice(0, 3),
    lastConnected: new Date(),
  },
  {
    id: 'cloud-tools',
    name: 'Cloud Tools Server',
    status: 'disconnected',
    url: 'mcp://tools.example.com',
    tools: mockMCPTools.slice(3),
    error: 'Connection timeout',
  },
];

// Mock AI models
export const mockAIModels = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model, best for complex tasks',
    isEnabled: true,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balance of intelligence and speed',
    isEnabled: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Multimodal capabilities',
    isEnabled: false,
  },
];

// Mock conversation history
export const mockConversations = [
  {
    id: 'mock-chat-1',
    title: 'React Hooks Discussion',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 2000),
    messageCount: 4,
  },
  {
    id: 'mock-chat-2',
    title: 'TypeScript Best Practices',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000),
    messageCount: 12,
  },
  {
    id: 'mock-chat-3',
    title: 'API Design Patterns',
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000),
    messageCount: 8,
  },
];

// Mock AI memory items
export interface MockMemoryItem {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'context' | 'instruction';
  tags: string[];
  createdAt: string;
  lastUsed: string;
  importance: 'high' | 'medium' | 'low';
}

export const mockMemoryItems: MockMemoryItem[] = [
  {
    id: '1',
    content: 'User prefers concise responses with code examples',
    type: 'preference',
    tags: ['communication', 'style'],
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    importance: 'high',
  },
  {
    id: '2',
    content: 'Working on a React project with TypeScript and Next.js',
    type: 'context',
    tags: ['project', 'technology', 'react', 'typescript'],
    createdAt: '2024-01-10',
    lastUsed: '2024-01-19',
    importance: 'medium',
  },
  {
    id: '3',
    content: 'Always use functional components over class components',
    type: 'instruction',
    tags: ['react', 'best-practices'],
    createdAt: '2024-01-12',
    lastUsed: '2024-01-18',
    importance: 'high',
  },
  {
    id: '4',
    content: 'User is familiar with backend development and databases',
    type: 'fact',
    tags: ['skills', 'experience'],
    createdAt: '2024-01-08',
    lastUsed: '2024-01-16',
    importance: 'medium',
  },
];

// Mock prompt templates
export interface MockPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: string;
  variables: Array<{
    name: string;
    description: string;
    defaultValue?: string;
  }>;
  createdAt: Date;
  usageCount: number;
}

export const mockPromptTemplates: MockPromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Template for reviewing code with constructive feedback',
    template: `Please review the following {{language}} code:

\`\`\`{{language}}
{{code}}
\`\`\`

Focus on:
- Code quality and best practices
- Performance considerations
- Security concerns
- Readability and maintainability

Provide specific suggestions for improvement.`,
    category: 'Development',
    variables: [
      { name: 'language', description: 'Programming language', defaultValue: 'typescript' },
      { name: 'code', description: 'Code to review' },
    ],
    createdAt: new Date(Date.now() - 86400000),
    usageCount: 15,
  },
  {
    id: 'debug-helper',
    name: 'Debug Helper',
    description: 'Template for debugging issues with context',
    template: `I'm experiencing an issue with {{technology}}:

**Problem**: {{problem}}

**Expected behavior**: {{expected}}

**Actual behavior**: {{actual}}

**Code snippet**:
\`\`\`{{language}}
{{code}}
\`\`\`

**Environment**: {{environment}}

Please help me identify and fix the issue.`,
    category: 'Development',
    variables: [
      { name: 'technology', description: 'Technology or framework' },
      { name: 'problem', description: 'Brief description of the problem' },
      { name: 'expected', description: 'What should happen' },
      { name: 'actual', description: 'What actually happens' },
      { name: 'language', description: 'Programming language', defaultValue: 'typescript' },
      { name: 'code', description: 'Relevant code snippet' },
      { name: 'environment', description: 'Environment details' },
    ],
    createdAt: new Date(Date.now() - 172800000),
    usageCount: 23,
  },
];

// Mock performance metrics
export interface MockPerformanceMetric {
  timestamp: number;
  fps: number;
  memoryUsed: number;
  memoryTotal: number;
  renderTime: number;
  messageCount: number;
}

export function generateMockPerformanceMetrics(): MockPerformanceMetric[] {
  const metrics: MockPerformanceMetric[] = [];
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    metrics.push({
      timestamp: now - i * 1000, // Every second
      fps: 58 + Math.random() * 4, // 58-62 FPS
      memoryUsed: 45 + Math.random() * 20, // 45-65 MB
      memoryTotal: 128,
      renderTime: 8 + Math.random() * 8, // 8-16ms
      messageCount: mockMessages.length,
    });
  }

  return metrics.reverse();
}

// Mock suggested actions
export const mockSuggestedActions = [
  {
    title: 'Explain React Hooks',
    label: 'What are React hooks and how do I use them?',
    action: 'What are React hooks and how do I use them effectively in my projects?',
  },
  {
    title: 'Code Review',
    label: 'Review my TypeScript code',
    action: 'Can you review my TypeScript code for best practices and potential improvements?',
  },
  {
    title: 'Debug Help',
    label: 'Help debug an issue',
    action: "I'm having trouble with an error in my React component. Can you help me debug it?",
  },
  {
    title: 'Performance Tips',
    label: 'Optimize React performance',
    action: 'What are some best practices for optimizing React application performance?',
  },
];

// Utility functions for mock data generation
export function createMockMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: generateMockId(),
    role,
    parts: [{ type: 'text', text: content }],
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
}

export function createMockTypingMessage(): ChatMessage {
  return {
    id: generateMockId(),
    role: 'assistant',
    parts: [{ type: 'text', text: '' }],
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
}

// Mock streaming response generator
export async function* generateMockStreamResponse(_prompt: string): AsyncGenerator<string> {
  const responses = [
    "I'd be happy to help you with that! ",
    'Let me break this down for you step by step.\n\n',
    "First, it's important to understand that ",
    'this is a common question, and there are several approaches you can take.\n\n',
    "Here's what I recommend:\n\n",
    '1. **Start with the basics** - Make sure you understand the fundamentals\n',
    '2. **Practice regularly** - Consistent practice is key to mastery\n',
    '3. **Build projects** - Apply what you learn in real-world scenarios\n\n',
    'Would you like me to elaborate on any of these points? ',
    "I'm here to help guide you through the learning process!",
  ];

  for (const chunk of responses) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    yield chunk;
  }
}

// Mock data store for prototype mode
export class MockDataStore {
  private messages: ChatMessage[] = [...mockMessages];
  private votes: Vote[] = [...mockVotes];
  private connections: MockMCPConnection[] = [...mockMCPConnections];
  private memoryItems: MockMemoryItem[] = [...mockMemoryItems];
  private chatHistory: any[] = [...mockConversations];

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  updateMessage(id: string, updates: Partial<ChatMessage>): void {
    const index = this.messages.findIndex(m => m.id === id);
    if (index !== -1) {
      this.messages[index] = { ...this.messages[index], ...updates };
    }
  }

  getVotes(): Vote[] {
    return this.votes;
  }

  addVote(vote: Vote): void {
    this.votes.push(vote);
  }

  getConnections(): MockMCPConnection[] {
    return this.connections;
  }

  updateConnection(id: string, updates: Partial<MockMCPConnection>): void {
    const index = this.connections.findIndex(c => c.id === id);
    if (index !== -1) {
      this.connections[index] = { ...this.connections[index], ...updates };
    }
  }

  getMemoryItems(): MockMemoryItem[] {
    return this.memoryItems;
  }

  addMemoryItem(item: MockMemoryItem): void {
    this.memoryItems.push(item);
  }

  removeMemoryItem(id: string): void {
    this.memoryItems = this.memoryItems.filter(item => item.id !== id);
  }

  getChatHistory(): any[] {
    return this.chatHistory;
  }

  deleteChat(chatId: string): void {
    this.chatHistory = this.chatHistory.filter(chat => chat.id !== chatId);
  }
}

// Global mock data store instance
export const mockDataStore = new MockDataStore();

// ===== MOCK RAG FUNCTIONALITY =====

// Mock RAG documents for demo mode
export interface MockRAGDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    source: string;
    category: string;
    addedAt: string;
    userId?: string;
  };
  chunks: Array<{
    id: string;
    content: string;
    embedding?: number[]; // Mock embedding vector
  }>;
}

export const mockRAGDocuments: MockRAGDocument[] = [
  {
    id: 'doc-1',
    title: 'Next.js Framework Guide',
    content: `Next.js is a React framework that enables functionality such as server-side rendering and generating static websites for React based web applications. It provides features like automatic code splitting, simple client-side routing, built-in CSS support, and API routes. Next.js is production-ready and provides excellent developer experience with features like Fast Refresh, TypeScript support, and built-in optimizations.`,
    metadata: {
      source: 'documentation',
      category: 'web-development',
      addedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    chunks: [
      {
        id: 'chunk-1-1',
        content:
          'Next.js is a React framework that enables functionality such as server-side rendering and generating static websites.',
      },
      {
        id: 'chunk-1-2',
        content:
          'It provides features like automatic code splitting, simple client-side routing, built-in CSS support, and API routes.',
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'Vercel AI SDK Overview',
    content: `Vercel AI SDK is a TypeScript toolkit for building AI-powered applications. It provides React hooks, utilities for streaming AI responses, and integrations with major AI providers like OpenAI, Anthropic, and Google. The SDK simplifies building chatbots, text generation, and other AI features with excellent developer experience.`,
    metadata: {
      source: 'documentation',
      category: 'ai-development',
      addedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    chunks: [
      {
        id: 'chunk-2-1',
        content: 'Vercel AI SDK is a TypeScript toolkit for building AI-powered applications.',
      },
      {
        id: 'chunk-2-2',
        content:
          'It provides React hooks, utilities for streaming AI responses, and integrations with major AI providers.',
      },
    ],
  },
  {
    id: 'doc-3',
    title: 'RAG Explained',
    content: `Retrieval-Augmented Generation (RAG) is a technique that combines the power of large language models with external knowledge sources. It allows AI systems to access and use specific information from documents, databases, or other sources to provide more accurate and contextual responses. RAG works by first retrieving relevant information and then using that context to generate responses.`,
    metadata: {
      source: 'documentation',
      category: 'ai-concepts',
      addedAt: new Date(Date.now() - 259200000).toISOString(),
    },
    chunks: [
      {
        id: 'chunk-3-1',
        content:
          'Retrieval-Augmented Generation (RAG) combines large language models with external knowledge sources.',
      },
      {
        id: 'chunk-3-2',
        content:
          'RAG works by first retrieving relevant information and then using that context to generate responses.',
      },
    ],
  },
];

// Mock RAG knowledge base
export class MockRAGKnowledgeBase {
  private documents: MockRAGDocument[] = [...mockRAGDocuments];

  // Mock semantic search
  search(
    query: string,
    topK: number = 5,
  ): Array<{
    content: string;
    score: number;
    metadata: any;
  }> {
    const results: Array<{ content: string; score: number; metadata: any }> = [];

    // Simple keyword-based scoring for demo purposes
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(word => word.length > 2);

    for (const doc of this.documents) {
      for (const chunk of doc.chunks) {
        const chunkLower = chunk.content.toLowerCase();
        let score = 0;

        // Calculate simple relevance score
        for (const keyword of keywords) {
          if (chunkLower.includes(keyword)) {
            score += 0.3;
          }
        }

        // Add some randomness for demo variety
        score += Math.random() * 0.2;

        if (score > 0.1) {
          // Minimum relevance threshold
          results.push({
            content: chunk.content,
            score: Math.min(score, 1.0),
            metadata: {
              ...doc.metadata,
              documentId: doc.id,
              documentTitle: doc.title,
              chunkId: chunk.id,
            },
          });
        }
      }
    }

    // Sort by score and return top results
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  // Add new document to knowledge base
  addDocument(content: string, metadata?: any): string {
    const id = `doc-${Date.now()}`;
    const chunks = this.chunkText(content);

    const newDoc: MockRAGDocument = {
      id,
      title: metadata?.title || `Document ${this.documents.length + 1}`,
      content,
      metadata: {
        source: metadata?.source || 'user-upload',
        category: metadata?.category || 'general',
        addedAt: new Date().toISOString(),
        userId: metadata?.userId,
        ...metadata,
      },
      chunks: chunks.map((chunk, index) => ({
        id: `${id}-chunk-${index}`,
        content: chunk,
      })),
    };

    this.documents.push(newDoc);
    return `Document "${newDoc.title}" successfully added to knowledge base with ${chunks.length} chunks.`;
  }

  // Simple text chunking for demo
  private chunkText(text: string): string[] {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > 200 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  // Get all documents
  getDocuments(): MockRAGDocument[] {
    return this.documents;
  }

  // Get document by ID
  getDocument(id: string): MockRAGDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  // Delete document
  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      this.documents.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Global mock RAG knowledge base
export const mockRAGKnowledgeBase = new MockRAGKnowledgeBase();

// Mock RAG response templates
export const mockRAGResponses: Record<string, string> = {
  'what is next.js':
    'Based on my knowledge base: Next.js is a React framework that enables functionality such as server-side rendering and generating static websites for React based web applications. It provides features like automatic code splitting, simple client-side routing, built-in CSS support, and API routes.',

  'what is vercel ai sdk':
    'According to the documentation: Vercel AI SDK is a TypeScript toolkit for building AI-powered applications. It provides React hooks, utilities for streaming AI responses, and integrations with major AI providers like OpenAI, Anthropic, and Google.',

  'what is rag':
    'From my knowledge base: Retrieval-Augmented Generation (RAG) is a technique that combines the power of large language models with external knowledge sources. It allows AI systems to access and use specific information from documents, databases, or other sources to provide more accurate and contextual responses.',

  'how does rag work':
    'Based on the information I have: RAG works by first retrieving relevant information from a knowledge base and then using that context to generate responses. This allows the AI to provide more accurate and contextual answers based on specific documents or data sources.',
};

// Mock RAG tools for demo mode
export function createMockRAGTools() {
  return {
    addResource: {
      execute: async ({ content, metadata }: { content: string; metadata?: any }) => {
        return mockRAGKnowledgeBase.addDocument(content, metadata);
      },
    },

    getInformation: {
      execute: async ({ question, topK }: { question: string; topK?: number }) => {
        return mockRAGKnowledgeBase.search(question, topK || 5);
      },
    },
  };
}

// Enhanced mock streaming with RAG awareness
export async function* generateMockRAGStreamResponse(prompt: string): AsyncGenerator<string> {
  const promptLower = prompt.toLowerCase();

  // Check if this looks like a RAG query
  const ragKeywords = ['what is', 'explain', 'how does', 'tell me about', 'describe'];
  const isRAGQuery = ragKeywords.some(keyword => promptLower.includes(keyword));

  if (isRAGQuery) {
    // Try to find a pre-defined response
    const matchingKey = Object.keys(mockRAGResponses).find(key =>
      promptLower.includes(key.replace(/\s+/g, '.*')),
    );

    if (matchingKey) {
      const response = mockRAGResponses[matchingKey];
      const chunks = response.split(' ');

      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        yield chunks[i] + (i < chunks.length - 1 ? ' ' : '');
      }
      return;
    }

    // Search knowledge base for relevant information
    const searchResults = mockRAGKnowledgeBase.search(prompt, 3);

    if (searchResults.length > 0) {
      yield 'Based on my knowledge base: ';
      await new Promise(resolve => setTimeout(resolve, 200));

      const topResult = searchResults[0];
      const responseChunks = topResult.content.split(' ');

      for (let i = 0; i < responseChunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 80));
        yield responseChunks[i] + (i < responseChunks.length - 1 ? ' ' : '');
      }

      if (searchResults.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
        yield '\n\nAdditionally, ';

        const secondResult = searchResults[1];
        const additionalChunks = secondResult.content.split(' ');

        for (let i = 0; i < additionalChunks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 80));
          yield additionalChunks[i] + (i < additionalChunks.length - 1 ? ' ' : '');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 400));
      yield '\n\nWould you like me to explain any of these concepts in more detail?';
      return;
    }
  }

  // Fallback to general mock response
  yield* generateMockStreamResponse(prompt);
}

// Check if RAG is enabled (for compatibility)
export function isRAGEnabled(): boolean {
  return !!(process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN);
}

// Check if we should use mock RAG (prototype mode or no real RAG configured)
export function shouldUseMockRAG(): boolean {
  if (typeof window !== 'undefined') {
    return isPrototypeMode();
  }

  // Server-side: check if real RAG is configured
  return !isRAGEnabled();
}
