export interface CategoryHierarchy {
  readonly children?: readonly string[];
  description?: string;
  readonly id: string;
  level: number;
  name: string;
  readonly parent?: string;
}

export interface ProductClassificationResult {
  readonly categoryId: string;
  readonly confidence: number;
  readonly path: readonly string[];
  readonly reasoning?: string;
}

export interface ProductData {
  attributes?: Record<string, unknown>;
  brand?: string;
  description: string;
  readonly id: string;
  images?: readonly string[];
  price?: number;
  title: string;
}
