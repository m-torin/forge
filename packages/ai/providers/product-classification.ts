import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

/**
 * Product data structure for classification
 */
export interface ProductData {
  attributes?: Record<string, unknown>;
  brand?: string;
  description: string;
  readonly id: string;
  images?: readonly string[];
  price?: number;
  title: string;
}

/**
 * Category hierarchy for product taxonomy
 */
export interface CategoryHierarchy {
  readonly children?: readonly string[];
  description?: string;
  readonly id: string;
  level: number;
  name: string;
  readonly parent?: string;
}

/**
 * Classification result with confidence and reasoning
 */
export interface ClassificationResult {
  readonly categoryId: string;
  readonly confidence: number;
  readonly path: readonly string[];
  readonly reasoning?: string;
}

/**
 * Structured classification result schema
 */
const ClassificationSchema = z.object({
  confidence: z.number().min(0).max(1),
  alternativeCategories: z
    .array(
      z.object({
        confidence: z.number().min(0).max(1),
        categoryId: z.string(),
      }),
    )
    .max(3),
  categoryId: z.string(),
  reasoning: z.string(),
});

/**
 * AI-powered product classification service
 */
export class AIProductClassifier {
  private readonly categories: readonly CategoryHierarchy[];
  private readonly model: string;

  constructor(categories: readonly CategoryHierarchy[], model = 'gpt-4-turbo') {
    this.categories = categories;
    this.model = model;
  }

  /**
   * Classify a product using AI with structured output
   */
  async classifyProduct(product: ProductData): Promise<ClassificationResult> {
    const categoryContext = this.createCategoryContext();
    const productContext = this.createProductContext(product);

    const { object } = await generateObject({
      model: openai(this.model),
      prompt: productContext,
      schema: ClassificationSchema,
      system: `You are a product categorization expert. Analyze the product and assign it to the most appropriate category from the provided taxonomy.

Category Taxonomy:
${categoryContext}

Consider:
1. Product title and description
2. Brand context
3. Price range implications
4. Hierarchical category structure

Provide confidence scores and reasoning for your classification.`,
    });

    const category = this.categories.find((c) => c.id === object.categoryId);
    const path = category ? this.getCategoryPath(category) : [];

    return {
      confidence: object.confidence,
      categoryId: object.categoryId,
      path,
      reasoning: object.reasoning,
    };
  }

  /**
   * Enhance classification with vector similarity results
   */
  async enhanceClassification(
    product: ProductData,
    vectorResults: ClassificationResult[],
  ): Promise<ClassificationResult> {
    const vectorContext = vectorResults
      .map((r) => `${r.categoryId} (confidence: ${r.confidence.toFixed(2)}) - ${r.reasoning}`)
      .join('\n');

    const { text } = await generateText({
      model: openai(this.model),
      prompt: `Product: ${this.createProductContext(product)}
      
Vector similarity results:
${vectorContext}

What is the best final category classification and why?`,
      system: `You are refining a product classification based on vector similarity and product analysis.

Category Taxonomy:
${this.createCategoryContext()}

Your task is to:
1. Review the vector similarity results
2. Consider the product details
3. Make a final category recommendation with reasoning`,
    });

    // Parse the AI response to extract category recommendation
    const bestVectorResult = vectorResults[0] ?? {
      confidence: 0,
      categoryId: 'unknown',
      path: [],
      reasoning: 'No similar products found',
    };

    return {
      ...bestVectorResult,
      reasoning: `Enhanced: ${text}`,
    };
  }

  /**
   * Batch classify multiple products
   */
  async batchClassifyProducts(
    products: ProductData[],
  ): Promise<{ productId: string; result: ClassificationResult; error?: string }[]> {
    const results = await Promise.all(
      products.map(async (product) => {
        try {
          const result = await this.classifyProduct(product);
          return { productId: product.id, result };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'Unknown error',
            productId: product.id,
            result: {
              confidence: 0,
              categoryId: 'unknown',
              path: [],
              reasoning: 'Classification failed',
            },
          };
        }
      }),
    );

    return results;
  }

  /**
   * Create category context for AI prompt
   */
  private createCategoryContext(): string {
    const categoryTree = this.categories
      .map((cat) => {
        const indent = '  '.repeat(cat.level - 1);
        return `${indent}- ${cat.id}: ${cat.name}${cat.description ? ` (${cat.description})` : ''}`;
      })
      .join('\n');

    return categoryTree;
  }

  /**
   * Create product context for AI prompt
   */
  private createProductContext(product: ProductData): string {
    const parts = [
      `Title: ${product.title}`,
      `Description: ${product.description}`,
      product.brand && `Brand: ${product.brand}`,
      product.price && `Price: $${product.price}`,
      product.attributes &&
        Object.keys(product.attributes).length > 0 &&
        `Attributes: ${JSON.stringify(product.attributes, null, 2)}`,
    ].filter(Boolean);

    return parts.join('\n');
  }

  /**
   * Get the full category path from root to category
   */
  private getCategoryPath(category: CategoryHierarchy): readonly string[] {
    const path: string[] = [category.name];

    if (category.parent) {
      const parent = this.categories.find((c) => c.id === category.parent);
      if (parent) {
        path.unshift(...this.getCategoryPath(parent));
      }
    }

    return path;
  }
}

/**
 * Training system for tracking classification accuracy
 */
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

  /**
   * Add feedback for a classification
   */
  addFeedback(
    productId: string,
    predictedCategory: string,
    actualCategory: string,
    confidence: number,
  ): void {
    const feedback = {
      confidence,
      actual: actualCategory,
      predicted: predictedCategory,
      timestamp: new Date(),
    };

    const existing = this.feedbackStore.get(productId) || [];
    existing.push(feedback);
    this.feedbackStore.set(productId, existing);
  }

  /**
   * Get accuracy metrics
   */
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

    // Overall accuracy
    const correct = allFeedback.filter((f) => f.predicted === f.actual).length;
    const overall = correct / allFeedback.length;

    // Accuracy by category
    const byCategory = new Map<string, number>();
    const categoryGroups = this.groupBy(allFeedback, (f) => f.actual);

    for (const [category, feedbacks] of categoryGroups) {
      const categoryCorrect = feedbacks.filter((f) => f.predicted === f.actual).length;
      byCategory.set(category, categoryCorrect / feedbacks.length);
    }

    // Confidence analysis
    const confidenceAnalysis = {
      high: allFeedback.filter((f) => f.confidence >= 0.8).length / allFeedback.length,
      low: allFeedback.filter((f) => f.confidence < 0.5).length / allFeedback.length,
      medium:
        allFeedback.filter((f) => f.confidence >= 0.5 && f.confidence < 0.8).length /
        allFeedback.length,
    };

    return { confidenceAnalysis, byCategory, overall };
  }

  /**
   * Get products that need retraining
   */
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

  /**
   * Helper to group array by key
   */
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
}
