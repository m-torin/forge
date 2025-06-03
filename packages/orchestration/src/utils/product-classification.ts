import { createUpstashVectorAdapter } from '@repo/database/upstash';

import type {
  CategoryHierarchy,
  ClassificationResult,
  ProductData,
} from '@repo/ai/providers/product-classification';
import type { UpstashVectorAdapter } from '@repo/database/upstash';
import type { WorkflowContext } from '@upstash/workflow';

// Re-export types from AI package for convenience
export type {
  CategoryHierarchy,
  ClassificationResult,
  ProductData,
} from '@repo/ai/providers/product-classification';

/**
 * Training feedback for continuous learning
 */
export interface TrainingFeedback {
  readonly actualCategory: string;
  readonly confidence: number;
  readonly predictedCategory: string;
  readonly productId: string;
  readonly timestamp: Date;
  readonly userId?: string;
}

/**
 * Product classification operations wrapped for workflows
 */
export class WorkflowProductClassification {
  private readonly adapter: UpstashVectorAdapter;
  private readonly categories: ReadonlyMap<string, CategoryHierarchy>;
  private readonly namespace = 'product-classification';

  constructor(categories: readonly CategoryHierarchy[]) {
    this.adapter = createUpstashVectorAdapter();
    this.categories = new Map(categories.map((cat) => [cat.id, cat]));
  }

  /**
   * Upsert a product into the vector store within a workflow step
   */
  async upsertProduct(
    context: WorkflowContext<any>,
    stepName: string,
    product: ProductData,
    categoryId: string,
  ): Promise<void> {
    return context.run(stepName, async () => {
      const productText = this.createProductText(product);

      await this.adapter.upsertText(
        [
          {
            id: product.id,
            data: productText,
            metadata: {
              brand: product.brand,
              categoryId,
              price: product.price,
              productId: product.id,
              timestamp: Date.now(),
              title: product.title,
            },
          },
        ],
        {
          namespace: this.namespace,
        },
      );
    });
  }

  /**
   * Find similar products using vector similarity search
   */
  async findSimilarProducts(
    context: WorkflowContext<any>,
    stepName: string,
    product: ProductData,
    topK = 5,
  ): Promise<ClassificationResult[]> {
    return context.run(stepName, async () => {
      const productText = this.createProductText(product);

      const results = await this.adapter.queryByText(productText, {
        namespace: this.namespace,
        includeMetadata: true,
        topK,
      });

      return results.map((result) => {
        const category = this.categories.get(result.metadata?.categoryId as string);
        const path = category ? this.getCategoryPath(category) : [];

        return {
          confidence: result.score ?? 0,
          categoryId: result.metadata?.categoryId as string,
          path,
          reasoning: `Similar to: ${result.metadata?.title}`,
        };
      });
    });
  }

  /**
   * Batch upsert products for efficient processing
   */
  async batchUpsertProducts(
    context: WorkflowContext<any>,
    stepName: string,
    products: { product: ProductData; categoryId: string }[],
  ): Promise<void> {
    return context.run(stepName, async () => {
      const upsertData = products.map(({ categoryId, product }) => ({
        id: product.id,
        data: this.createProductText(product),
        metadata: {
          brand: product.brand,
          categoryId,
          price: product.price,
          productId: product.id,
          timestamp: Date.now(),
          title: product.title,
        },
      }));

      await this.adapter.upsertText(upsertData, {
        namespace: this.namespace,
      });
    });
  }

  /**
   * Update product with training feedback
   */
  async applyTrainingFeedback(
    context: WorkflowContext<any>,
    stepName: string,
    feedback: TrainingFeedback,
  ): Promise<void> {
    return context.run(stepName, async () => {
      // Fetch the existing product
      const existing = await this.adapter.fetch(feedback.productId, {
        namespace: this.namespace,
        includeMetadata: true,
      });

      if (existing.length > 0 && feedback.actualCategory !== feedback.predictedCategory) {
        // Update the product with the correct category
        await this.adapter.updateMetadata(
          feedback.productId,
          {
            ...existing[0]?.metadata,
            categoryId: feedback.actualCategory,
            correctionCount: ((existing[0]?.metadata as any)?.correctionCount || 0) + 1,
            lastCorrectedAt: Date.now(),
          },
          { namespace: this.namespace },
        );
      }
    });
  }

  /**
   * Get classification accuracy metrics
   */
  async getAccuracyMetrics(
    context: WorkflowContext<any>,
    stepName: string,
  ): Promise<{
    totalProducts: number;
    correctedProducts: number;
    accuracy: number;
  }> {
    return context.run(stepName, async () => {
      const info = await this.adapter.getInfo();

      // Note: This is a simplified metric. In production, you'd track this separately
      return {
        accuracy: 0, // Would calculate from tracking data
        correctedProducts: 0, // Would need separate tracking
        totalProducts: info.vectorCount || 0,
      };
    });
  }

  /**
   * Create searchable text from product data
   */
  private createProductText(product: ProductData): string {
    const parts = [
      product.title,
      product.description,
      product.brand && `Brand: ${product.brand}`,
      product.attributes &&
        Object.entries(product.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' '),
    ].filter(Boolean);

    return parts.join(' ');
  }

  /**
   * Get the full category path from root to category
   */
  private getCategoryPath(category: CategoryHierarchy): readonly string[] {
    const path: string[] = [category.name];

    if (category.parent) {
      const parent = this.categories.get(category.parent);
      if (parent) {
        path.unshift(...this.getCategoryPath(parent));
      }
    }

    return path;
  }
}

/**
 * Default product categories for testing
 */
export const DEFAULT_PRODUCT_CATEGORIES: readonly CategoryHierarchy[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    level: 1,
  },
  {
    id: 'electronics_computers',
    name: 'Computers & Tablets',
    description: 'Desktop computers, laptops, tablets and accessories',
    level: 2,
    parent: 'electronics',
  },
  {
    id: 'electronics_smartphones',
    name: 'Smartphones & Accessories',
    description: 'Mobile phones, cases, chargers and accessories',
    level: 2,
    parent: 'electronics',
  },
  {
    id: 'clothing',
    name: 'Clothing & Apparel',
    description: 'Fashion and clothing items',
    level: 1,
  },
  {
    id: 'clothing_mens',
    name: "Men's Clothing",
    description: "Men's fashion and apparel",
    level: 2,
    parent: 'clothing',
  },
  {
    id: 'clothing_womens',
    name: "Women's Clothing",
    description: "Women's fashion and apparel",
    level: 2,
    parent: 'clothing',
  },
  {
    id: 'home_garden',
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    level: 1,
  },
] as const;
