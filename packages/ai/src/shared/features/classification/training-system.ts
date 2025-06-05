import { InMemoryTrainingStorage } from './training-storage';

import type { TrainingStorage } from './training-storage';

export class ClassificationTrainingSystem {
  private feedbackStore = new Map<
    string,
    {
      predicted: string;
      actual: string;
      confidence: number;
      timestamp: Date;
    }[]
  >();

  private storage: TrainingStorage;
  private autoSave: boolean;

  constructor(storage?: TrainingStorage, autoSave = true) {
    this.storage = storage || new InMemoryTrainingStorage();
    this.autoSave = autoSave;

    // Load existing data on initialization
    this.loadFromStorage().catch(console.error);
  }

  async addFeedback(
    productId: string,
    predictedCategory: string,
    actualCategory: string,
    confidence: number,
  ): Promise<void> {
    const feedback = {
      confidence,
      actual: actualCategory,
      predicted: predictedCategory,
      timestamp: new Date(),
    };

    const existing = this.feedbackStore.get(productId) || [];
    existing.push(feedback);
    this.feedbackStore.set(productId, existing);

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveToStorage();
    }
  }

  getAccuracyMetrics(): {
    overall: number;
    byCategory: Map<string, number>;
    confidenceAnalysis: {
      low: number;
      medium: number;
      high: number;
    };
  } {
    const allFeedback = Array.from(this.feedbackStore.values()).flat();

    if (allFeedback.length === 0) {
      return {
        confidenceAnalysis: { high: 0, low: 0, medium: 0 },
        byCategory: new Map(),
        overall: 0,
      };
    }

    const correct = allFeedback.filter((f) => f.predicted === f.actual).length;
    const overall = correct / allFeedback.length;

    const byCategory = new Map<string, number>();
    const categoryGroups = this.groupBy(allFeedback, (f) => f.actual);

    for (const [category, feedbacks] of categoryGroups) {
      const categoryCorrect = feedbacks.filter((f) => f.predicted === f.actual).length;
      byCategory.set(category, categoryCorrect / feedbacks.length);
    }

    const confidenceAnalysis = {
      high: allFeedback.filter((f) => f.confidence >= 0.8).length / allFeedback.length,
      low: allFeedback.filter((f) => f.confidence < 0.5).length / allFeedback.length,
      medium:
        allFeedback.filter((f) => f.confidence >= 0.5 && f.confidence < 0.8).length /
        allFeedback.length,
    };

    return { confidenceAnalysis, byCategory, overall };
  }

  getProductsNeedingRetraining(threshold = 0.5): string[] {
    const productsToRetrain: string[] = [];

    for (const [productId, feedbacks] of this.feedbackStore) {
      const correct = feedbacks.filter((f) => f.predicted === f.actual).length;
      const accuracy = correct / feedbacks.length;

      if (accuracy < threshold) {
        productsToRetrain.push(productId);
      }
    }

    return productsToRetrain;
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();

    for (const item of array) {
      const key = keyFn(item);
      const group = map.get(key) || [];
      group.push(item);
      map.set(key, group);
    }

    return map;
  }

  exportTrainingData(): {
    productId: string;
    feedbacks: {
      predicted: string;
      actual: string;
      confidence: number;
      timestamp: Date;
    }[];
  }[] {
    return Array.from(this.feedbackStore.entries()).map(([productId, feedbacks]) => ({
      feedbacks,
      productId,
    }));
  }

  importTrainingData(
    data: {
      productId: string;
      feedbacks: {
        predicted: string;
        actual: string;
        confidence: number;
        timestamp: Date;
      }[];
    }[],
  ): void {
    this.feedbackStore.clear();

    for (const { feedbacks, productId } of data) {
      this.feedbackStore.set(productId, feedbacks);
    }
  }

  async clearTrainingData(): Promise<void> {
    this.feedbackStore.clear();
    await this.storage.clear();
  }

  getTrainingDataSize(): number {
    return Array.from(this.feedbackStore.values()).reduce(
      (total, feedbacks) => total + feedbacks.length,
      0,
    );
  }

  private async saveToStorage(): Promise<void> {
    const data = this.exportTrainingData();
    await this.storage.save(data);
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const data = await this.storage.load();
      this.importTrainingData(data);
    } catch (error) {
      console.error('Failed to load training data from storage:', error);
    }
  }
}
