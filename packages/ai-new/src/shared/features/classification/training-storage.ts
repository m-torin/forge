export interface TrainingData {
  feedbacks: {
    predicted: string;
    actual: string;
    confidence: number;
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
 * In-memory storage implementation (default)
 */
export class InMemoryTrainingStorage implements TrainingStorage {
  private data: TrainingData[] = [];

  async save(data: TrainingData[]): Promise<void> {
    this.data = data;
  }

  async load(): Promise<TrainingData[]> {
    return this.data;
  }

  async clear(): Promise<void> {
    this.data = [];
  }
}

/**
 * File-based storage implementation for Node.js environments
 * Can be extended to use database storage in production
 */
export class FileTrainingStorage implements TrainingStorage {
  constructor(private filePath: string) {}

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
      console.warn('Failed to save training data to file:', error);
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
      // File doesn't exist or is invalid
      return [];
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai_training_data');
      return;
    }

    try {
      const fs = await import('fs/promises');
      await fs.unlink(this.filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }
}
