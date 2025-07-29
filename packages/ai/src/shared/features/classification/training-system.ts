import { logError } from '@repo/observability';
import { InMemoryTrainingStorage, TrainingStorage } from './training-storage';

export class ClassificationTrainingSystem {
  private autoSave: boolean;

  private feedbackStore = new Map<
    string,
    {
      actual: string;
      confidence: number;
      predicted: string;
      timestamp: Date;
    }[]
  >();
  private storage: TrainingStorage;

  constructor(storage?: TrainingStorage, autoSave = true) {
    this.storage = storage ?? new InMemoryTrainingStorage();
    this.autoSave = autoSave;

    // Load existing data on initialization
    this.loadFromStorage().catch(error => {
      logError(
        'Failed to load training data on initialization',
        error instanceof Error ? error : new Error(String(error)),
      );
    });
  }

  async addFeedback(
    productId: string,
    predictedCategory: string,
    actualCategory: string,
    confidence: number,
  ): Promise<void> {
    const feedback = {
      actual: actualCategory,
      confidence,
      predicted: predictedCategory,
      timestamp: new Date(),
    };

    const existing = this.feedbackStore.get(productId) ?? [];
    existing.push(feedback);
    this.feedbackStore.set(productId, existing);

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveToStorage();
    }
  }

  async clearTrainingData(): Promise<void> {
    this.feedbackStore.clear();
    await this.storage.clear();
  }

  exportTrainingData(): {
    feedbacks: {
      actual: string;
      confidence: number;
      predicted: string;
      timestamp: Date;
    }[];
    productId: string;
  }[] {
    return Array.from(this.feedbackStore.entries()).map(([productId, feedbacks]: any) => ({
      feedbacks,
      productId,
    }));
  }

  getAccuracyMetrics(): {
    byCategory: Map<string, number>;
    confidenceAnalysis: {
      high: number;
      low: number;
      medium: number;
    };
    overall: number;
  } {
    const allFeedback = Array.from(this.feedbackStore.values()).flat();

    if (allFeedback.length === 0) {
      return {
        byCategory: new Map(),
        confidenceAnalysis: { high: 0, low: 0, medium: 0 },
        overall: 0,
      };
    }

    const correct = allFeedback.filter((f: any) => f.predicted === f.actual).length;
    const overall = correct / allFeedback.length;

    const byCategory = new Map<string, number>();
    const categoryGroups = this.groupBy(allFeedback, (f: any) => f.actual);

    for (const [category, feedbacks] of categoryGroups) {
      const categoryCorrect = feedbacks.filter((f: any) => f.predicted === f.actual).length;
      byCategory.set(category, categoryCorrect / feedbacks.length);
    }

    const confidenceAnalysis = {
      high: allFeedback.filter((f: any) => f.confidence >= 0.8).length / allFeedback.length,
      low: allFeedback.filter((f: any) => f.confidence < 0.5).length / allFeedback.length,
      medium:
        allFeedback.filter((f: any) => f.confidence >= 0.5 && f.confidence < 0.8).length /
        allFeedback.length,
    };

    return { byCategory, confidenceAnalysis, overall };
  }

  getProductsNeedingRetraining(threshold = 0.5): string[] {
    const productsToRetrain: string[] = [];

    for (const [productId, feedbacks] of this.feedbackStore) {
      const correct = feedbacks.filter((f: any) => f.predicted === f.actual).length;
      const accuracy = correct / feedbacks.length;

      if (accuracy < threshold) {
        productsToRetrain.push(productId);
      }
    }

    return productsToRetrain;
  }

  getTrainingDataSize(): number {
    return Array.from(this.feedbackStore.values()).reduce(
      (total, feedbacks: any) => total + feedbacks.length,
      0,
    );
  }

  importTrainingData(
    data: {
      feedbacks: {
        actual: string;
        confidence: number;
        predicted: string;
        timestamp: Date;
      }[];
      productId: string;
    }[],
  ): void {
    this.feedbackStore.clear();

    for (const { feedbacks, productId } of data) {
      this.feedbackStore.set(productId, feedbacks);
    }
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();

    for (const item of array) {
      const key = keyFn(item);
      const group = map.get(key) ?? [];
      group.push(item);
      map.set(key, group);
    }

    return map;
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const data = await this.storage.load();
      this.importTrainingData(data);
    } catch (error: any) {
      logError(
        'Failed to load training data from storage',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private async saveToStorage(): Promise<void> {
    const data = this.exportTrainingData();
    await this.storage.save(data);
  }
}
