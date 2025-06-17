export interface ClassificationService {
  batchClassifyProducts(
    products: {
      attributes?: Record<string, unknown>;
      brand?: string;
      description: string;
      id: string;
      price?: number;
      title: string;
    }[],
  ): Promise<
    {
      error?: string;
      productId: string;
      result: {
        categoryId: string;
        confidence: number;
        path: readonly string[];
        reasoning?: string;
      };
    }[]
  >;

  classifyProduct(product: {
    attributes?: Record<string, unknown>;
    brand?: string;
    description: string;
    id: string;
    price?: number;
    title: string;
  }): Promise<{
    categoryId: string;
    confidence: number;
    path: readonly string[];
    reasoning?: string;
  }>;
}

export interface TrainingService {
  addFeedback(
    productId: string,
    predictedCategory: string,
    actualCategory: string,
    confidence: number,
  ): void;

  getAccuracyMetrics(): {
    byCategory: Map<string, number>;
    confidenceAnalysis: {
      high: number;
      low: number;
      medium: number;
    };
    overall: number;
  };

  getProductsNeedingRetraining(threshold?: number): string[];
}
