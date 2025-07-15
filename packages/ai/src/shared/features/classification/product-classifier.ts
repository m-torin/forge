import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod/v4';

import {
  CategoryHierarchy,
  ProductClassificationResult,
  ProductData,
} from '../../types/classification';

const ClassificationSchema = z.object({
  alternativeCategories: z
    .array(
      z.object({
        categoryId: z.string(),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(3),
  categoryId: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export class AIProductClassifier {
  private readonly categories: readonly CategoryHierarchy[];
  private readonly model: string;

  constructor(categories: readonly CategoryHierarchy[], model = 'gpt-4-turbo') {
    this.categories = categories;
    this.model = model;
  }

  async batchClassifyProducts(
    products: ProductData[],
  ): Promise<{ error?: string; productId: string; result: ProductClassificationResult }[]> {
    const results = await Promise.all(
      products.map(async (product: any) => {
        try {
          const result = await this.classifyProduct(product);
          return { productId: product.id, result };
        } catch (error: any) {
          return {
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
            productId: product.id,
            result: {
              categoryId: 'unknown',
              confidence: 0,
              path: [],
              reasoning: 'Classification failed',
            },
          };
        }
      }),
    );

    return results;
  }

  async classifyProduct(product: ProductData): Promise<ProductClassificationResult> {
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

    const classificationResult = object as z.infer<typeof ClassificationSchema>;
    const category = this.categories.find((c: any) => c.id === classificationResult.categoryId);
    const path = category ? this.getCategoryPath(category) : [];

    return {
      categoryId: classificationResult.categoryId,
      confidence: classificationResult.confidence,
      path,
      reasoning: classificationResult.reasoning,
    };
  }

  async enhanceClassification(
    product: ProductData,
    vectorResults: ProductClassificationResult[],
  ): Promise<ProductClassificationResult> {
    const vectorContext = vectorResults
      .map((r: any) => `${r.categoryId} (confidence: ${r.confidence.toFixed(2)}) - ${r.reasoning}`)
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

    const bestVectorResult = vectorResults[0] ?? {
      categoryId: 'unknown',
      confidence: 0,
      path: [],
      reasoning: 'No similar products found',
    };

    return {
      ...bestVectorResult,
      reasoning: `Enhanced: ${text}`,
    };
  }

  private createCategoryContext(): string {
    const categoryTree = this.categories
      .map((cat: any) => {
        const indent = '  '.repeat(cat.level - 1);
        return `${indent}- ${cat.id}: ${cat.name}${cat.description ? ` (${cat.description})` : ''}`;
      })
      .join('\n');

    return categoryTree;
  }

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

  private getCategoryPath(category: CategoryHierarchy): readonly string[] {
    const path: string[] = [category.name];

    if (category.parent) {
      const parent = this.categories.find((c: any) => c.id === category.parent);
      if (parent) {
        path.unshift(...this.getCategoryPath(parent));
      }
    }

    return path;
  }
}
