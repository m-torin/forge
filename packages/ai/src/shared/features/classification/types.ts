export interface ClassificationService {
  classifyProduct(product: {
    id: string;
    title: string;
    description: string;
    brand?: string;
    price?: number;
    attributes?: Record<string, unknown>;
  }): Promise<{
    categoryId: string;
    confidence: number;
    path: readonly string[];
    reasoning?: string;
  }>;

  batchClassifyProducts(
    products: {
      id: string;
      title: string;
      description: string;
      brand?: string;
      price?: number;
      attributes?: Record<string, unknown>;
    }[],
  ): Promise<
    {
      productId: string;
      result: {
        categoryId: string;
        confidence: number;
        path: readonly string[];
        reasoning?: string;
      };
      error?: string;
    }[]
  >;
}

export interface TrainingService {
  addFeedback(
    productId: string,
    predictedCategory: string,
    actualCategory: string,
    confidence: number,
  ): void;

  getAccuracyMetrics(): {
    overall: number;
    byCategory: Map<string, number>;
    confidenceAnalysis: {
      low: number;
      medium: number;
      high: number;
    };
  };

  getProductsNeedingRetraining(threshold?: number): string[];
}
