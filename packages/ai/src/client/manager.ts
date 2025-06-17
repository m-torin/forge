import { AIManager } from '../shared/utils/manager';

import {
  AIManagerConfig,
  ClassificationResult,
  CompletionOptions,
  CompletionResponse,
  EntityResult,
  ModerationResult,
  SentimentResult,
  StreamChunk,
  StreamOptions,
} from '../shared/types';

export class ClientAIManager extends AIManager {
  private baseUrl: string;

  constructor(config?: AIManagerConfig & { baseUrl?: string }) {
    super(config);
    this.baseUrl = config?.baseUrl ?? '';
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const response = await fetch(`${this.baseUrl}/api/ai/sentiment`, {
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<SentimentResult>;
  }

  async classify(text: string, labels?: string[]): Promise<ClassificationResult> {
    const response = await fetch(`${this.baseUrl}/api/ai/classify`, {
      body: JSON.stringify({ labels, text }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<ClassificationResult>;
  }

  // Override methods to proxy to server
  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const response = await fetch(`${this.baseUrl}/api/ai/complete`, {
      body: JSON.stringify(options),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async extractEntities(text: string): Promise<EntityResult> {
    const response = await fetch(`${this.baseUrl}/api/ai/extract`, {
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<EntityResult>;
  }

  async moderate(content: string): Promise<ModerationResult> {
    const response = await fetch(`${this.baseUrl}/api/ai/moderate`, {
      body: JSON.stringify({ content }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<ModerationResult>;
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/ai/stream`, {
      body: JSON.stringify(options),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      let streamComplete = false;

      while (!streamComplete) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              streamComplete = true;
              break;
            }

            try {
              const chunk: StreamChunk = JSON.parse(data);
              if (options.onChunk) {
                options.onChunk(chunk);
              }
              yield chunk;
            } catch (error: any) {
              // eslint-disable-next-line no-console
              console.warn('Failed to parse chunk: ', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
