import { logError } from '@repo/observability/shared-env';

export interface TrainingData {
  feedbacks: {
    actual: string;
    confidence: number;
    predicted: string;
    timestamp: Date;
  }[];
  productId: string;
}

export interface TrainingStorage {
  clear(): Promise<void>;
  load(): Promise<TrainingData[]>;
  save(data: TrainingData[]): Promise<void>;
}

/**
 * File-based storage implementation for Node.js environments
 * Can be extended to use database storage in production
 */
export class FileTrainingStorage implements TrainingStorage {
  constructor(private filePath: string) {}

  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai_training_data');
      return;
    }

    try {
      const fs = await import('fs/promises');
      await fs.unlink(this.filePath);
    } catch (_error) {
      // File doesn't exist, ignore
    }
  }

  async load(): Promise<TrainingData[]> {
    if (typeof window !== 'undefined') {
      // In browser, use localStorage
      const stored = localStorage.getItem('ai_training_data');
      return stored ? JSON.parse(stored) : [];
    }

    // In Node.js, use file system
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logError(
        'Failed to load training data',
        error instanceof Error ? error : new Error(String(error)),
      );
      // File doesn't exist or is invalid
      return [];
    }
  }

  async save(data: TrainingData[]): Promise<void> {
    if (typeof window !== 'undefined') {
      // In browser, fall back to localStorage
      localStorage.setItem('ai_training_data', JSON.stringify(data));
      return;
    }

    // In Node.js, use file system
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      logError(
        'Failed to save training data',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

/**
 * In-memory storage implementation (default)
 */
export class InMemoryTrainingStorage implements TrainingStorage {
  private data: TrainingData[] = [];

  async clear(): Promise<void> {
    this.data = [];
  }

  async load(): Promise<TrainingData[]> {
    return this.data;
  }

  async save(data: TrainingData[]): Promise<void> {
    this.data = data;
  }
}
