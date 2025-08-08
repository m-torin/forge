/**
 * Complete Next.js Chat Interface Example with AI SDK v5 RAG
 * Demonstrates full integration including streaming, tools, and conversation memory
 */

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import {
  createConversationMemory,
  createHybridSearch,
  createProductionRAG,
  createRAGToolset,
  getProductionConfig,
} from '../index';

/**
 * Initialize RAG system for Next.js application
 */
export function initializeRAGSystem() {
  // Get production-ready configuration
  const config = getProductionConfig('production');

  // Create complete RAG system
  const ragSystem = createProductionRAG({
    languageModel: openai('gpt-4o'),
    databaseConfig: {
      namespace: 'chat-app',
      useUpstashEmbedding: false,
    },
    topK: 5,
    systemPrompt: `You are a helpful AI assistant with access to a comprehensive knowledge base.
Use the available tools to search for relevant information and provide accurate, well-sourced responses.
Always cite your sources and explain your reasoning.`,
  });

  // Create RAG tools
  const tools = createRAGToolset({
    vectorStore: ragSystem.vectorStore,
    enableSourceTracking: true,
    enableBatchProcessing: true,
    maxContextLength: 2000,
  });

  // Create hybrid search for advanced queries
  const hybridSearch = createHybridSearch(ragSystem.vectorStore, config.hybridSearch);

  // Create conversation memory
  const conversationMemory = createConversationMemory(config.conversationMemory);

  return {
    ragSystem,
    tools,
    hybridSearch,
    conversationMemory,
  };
}

/**
 * Next.js API Route Handler for streaming chat
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Initialize RAG system
    const { ragSystem: _ragSystem, tools, conversationMemory } = initializeRAGSystem();

    // Get conversation context if available
    let conversationContext = '';
    if (conversationId) {
      try {
        const context = await conversationMemory.getRelevantContext(
          conversationId,
          messages[messages.length - 1]?.content || '',
        );
        conversationContext = context.conversationContext.map(msg => msg.content).join('\n');
      } catch (error) {
        console.warn('Failed to get conversation context:', error);
      }
    }

    // Create streaming response with all tools
    const result = streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',

          parts: [
            {
              type: 'text',

              text: `You are a helpful AI assistant with access to a comprehensive knowledge base.

  Use the available tools to search for relevant information and provide accurate, well-sourced responses.
  Always cite your sources and explain your reasoning.

  ${
    conversationContext
      ? `
  Conversation Context:
  ${conversationContext}`
      : ''
  }`,
            },
          ],
        },
        ...messages,
      ],
      tools: {
        // Core RAG tools
        searchKnowledge: tools.knowledgeSearch,
        batchProcess: tools.batchDocumentProcessor,
        multiStepReason: tools.multiStepReasoning,
        summarizeContext: tools.contextSummarization,
      },
      stopWhen: [({ steps }: { steps: any[] }) => steps.length >= 5],
      temperature: 0.1,
      onFinish: async result => {
        // Store conversation message for memory
        if (conversationId && result.finishReason === 'stop') {
          try {
            await conversationMemory.addMessage(conversationId, {
              role: 'assistant',
              content: result.text,
              metadata: {
                toolCalls: result.toolCalls || [],
                ragContextUsed: true,
              },
            });
          } catch (error) {
            console.warn('Failed to store conversation message:', error);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Document upload and processing endpoint
 */
export async function uploadDocuments(req: NextRequest) {
  try {
    const { documents } = await req.json();

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: 'Documents array is required' }, { status: 400 });
    }

    const { ragSystem: _ragSystem, tools } = initializeRAGSystem();

    // Process documents in batches
    const result = await tools.batchDocumentProcessor?.execute?.(
      {
        documents: documents.map((doc, index) => ({
          id: `doc_${Date.now()}_${index}`,
          content: doc.content,
          metadata: {
            title: doc.title || `Document ${index + 1}`,
            uploadedAt: new Date().toISOString(),
            source: 'user_upload',
            ...doc.metadata,
          },
        })),
        // batchSize: 10, // Removed invalid property
      },
      { toolCallId: 'batch-process', messages: [] },
    );

    return NextResponse.json({
      success: true,
      processed: result?.processed || 0,
      failed: result?.failed || 0,
      errors: result?.errors || [],
      total: result?.total || 0,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to process documents' }, { status: 500 });
  }
}

/**
 * Advanced search endpoint with hybrid search
 */
export async function hybridSearch(req: NextRequest) {
  try {
    const { query, searchType = 'hybrid', filters } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const { hybridSearch, ragSystem } = initializeRAGSystem();

    let results;

    switch (searchType) {
      case 'hybrid':
        results = await hybridSearch.search(query, {
          filters,
          boostFields: ['title', 'tags'],
        });
        break;

      case 'vector':
        results = await ragSystem.vectorStore.queryDocuments(query, {
          topK: 10,
          threshold: 0.7,
          includeContent: true,
          filters,
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    return NextResponse.json({
      query,
      searchType,
      results: results.map((result: any) => ({
        id: result.id,
        content: result.content.substring(0, 500) + '...',
        score: 'hybridScore' in result ? result.hybridScore : result.score,
        vectorScore: 'vectorScore' in result ? result.vectorScore : result.score,
        keywordScore: 'keywordScore' in result ? result.keywordScore : 0,
        metadata: result.metadata,
        source: 'source' in result ? result.source : undefined,
      })),
      totalResults: results.length,
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

/**
 * System health check endpoint
 */
export async function healthCheck() {
  try {
    const { ragSystem } = initializeRAGSystem();

    // Check vector store health
    const storeInfo = await ragSystem.vectorStore.getStoreInfo();
    const healthStatus = ragSystem.getHealthStatus();

    return NextResponse.json({
      status: 'healthy',
      vectorStore: {
        vectorCount: storeInfo.vectorCount,
        dimensionCount: storeInfo.dimensionCount,
        embeddingModel: storeInfo.embeddingModel,
      },
      health: healthStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

/**
 * React hook interface for using the RAG chat system
 * This would be used in a React environment
 */
export interface UseRAGChatHook {
  messages: Array<{ role: string; content: string; id: number }>;
  sendMessage: (content: string) => Promise<void>;
  uploadDocuments: (
    documents: Array<{ content: string; title?: string; metadata?: any }>,
  ) => Promise<any>;
  searchDocuments: (query: string, searchType?: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Example implementation of useRAGChat hook
 * This demonstrates the client-side logic for React applications
 */
export function createRAGChatHook(conversationId?: string): UseRAGChatHook {
  // This would use React hooks in a real React environment
  let messages: Array<{ role: string; content: string; id: number }> = [];
  let isLoading = false;
  let error: string | null = null;

  const sendMessage = async (content: string): Promise<void> => {
    isLoading = true;
    error = null;

    const newMessage = { role: 'user', content, id: Date.now() };
    messages = [...messages, newMessage];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      let assistantMessage = { role: 'assistant', content: '', id: Date.now() + 1 };
      messages = [...messages, assistantMessage];

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                assistantMessage.content += data.choices[0].delta.content;
                messages = [...messages.slice(0, -1), { ...assistantMessage }];
              }
            } catch (_e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  };

  const uploadDocuments = async (
    documents: Array<{ content: string; title?: string; metadata?: any }>,
  ): Promise<any> => {
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload documents');
      }

      return await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
      throw err;
    }
  };

  const searchDocuments = async (query: string, searchType = 'hybrid'): Promise<any> => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchType }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      return await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Search failed';
      throw err;
    }
  };

  return {
    messages,
    sendMessage,
    uploadDocuments,
    searchDocuments,
    isLoading,
    error,
  };
}

/**
 * Example usage patterns for Next.js applications
 */
export const nextjsUsageExamples = {
  /**
   * Basic chat page implementation
   */
  basicChatPage: `
    // pages/chat.tsx
    import { useState } from 'react';
    import { createRAGChatHook } from '../path/to/rag-examples';

    export default function ChatPage() {
      const [input, setInput] = useState('');
      // In a real React app, this would use actual React hooks
      const ragChat = createRAGChatHook();

      const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || ragChat.isLoading) return;

        await ragChat.sendMessage(input);
        setInput('');
      };

      return (
        <div className="chat-container">
          <div className="messages">
            {ragChat.messages.map((message) => (
              <div key={message.id} className={\`message \${message.role}\`}>
                <div className="content">{message.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={ragChat.isLoading}
            />
            <button type="submit" disabled={ragChat.isLoading || !input.trim()}>
              {ragChat.isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      );
    }
  `,

  /**
   * Document upload component
   */
  documentUpload: `
    // components/DocumentUpload.tsx
    import { useState } from 'react';

    export function DocumentUpload({ onUpload }: { onUpload: (files: File[]) => void }) {
      const [dragOver, setDragOver] = useState(false);

      const handleFileUpload = async (files: FileList) => {
        const documents = await Promise.all(
          Array.from(files).map(async (file) => ({
            content: await file.text(),
            title: file.name,
            metadata: {
              filename: file.name,
              size: file.size,
              type: file.type,
            },
          }))
        );

        onUpload(documents);
      };

      return (
        <div
          className={\`upload-area \${dragOver ? 'drag-over' : ''}\`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) {
              handleFileUpload(e.dataTransfer.files);
            }
          }}
        >
          <input
            type="file"
            multiple
            accept=".txt,.md,.json,.csv,.pdf"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
          <p>Drop files here or click to upload</p>
        </div>
      );
    }
  `,
};
