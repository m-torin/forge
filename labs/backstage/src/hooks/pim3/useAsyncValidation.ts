import { useMemo } from 'react';
import {
  checkSkuUnique,
  checkSlugUnique,
  checkEmailUnique,
  checkNameUnique,
} from '@/actions/pim3/validation';

/**
 * Async validation utilities for common PIM form validations
 * These check uniqueness and other server-side constraints
 */
export function useAsyncValidation() {
  const validators = useMemo(
    () => ({
      // Product SKU uniqueness check
      uniqueSku:
        (excludeId?: string) =>
        async (sku: string): Promise<string | null> => {
          if (!sku || sku.length < 2) return null;

          try {
            const isUnique = await checkSkuUnique(sku, excludeId);
            return isUnique ? null : 'SKU already exists';
          } catch (error) {
            console.error('SKU validation error:', error);
            return null; // Don't block form on validation error
          }
        },

      // Brand/Category/Taxonomy slug uniqueness
      uniqueSlug:
        (type: 'brand' | 'category' | 'taxonomy', excludeId?: string) =>
        async (slug: string): Promise<string | null> => {
          if (!slug || slug.length < 2) return null;

          try {
            const isUnique = await checkSlugUnique(type, slug, excludeId);
            return isUnique ? null : `${type} slug already exists`;
          } catch (error) {
            console.error('Slug validation error:', error);
            return null;
          }
        },

      // User email uniqueness
      uniqueEmail:
        (excludeId?: string) =>
        async (email: string): Promise<string | null> => {
          if (!email || !email.includes('@')) return null;

          try {
            const isUnique = await checkEmailUnique(email, excludeId);
            return isUnique ? null : 'Email address already exists';
          } catch (error) {
            console.error('Email validation error:', error);
            return null;
          }
        },

      // Generic name uniqueness for brands, categories, etc.
      uniqueName:
        (type: 'brand' | 'category' | 'collection', excludeId?: string) =>
        async (name: string): Promise<string | null> => {
          if (!name || name.length < 2) return null;

          try {
            const isUnique = await checkNameUnique(type, name, excludeId);
            return isUnique ? null : `${type} name already exists`;
          } catch (error) {
            console.error('Name validation error:', error);
            return null;
          }
        },

      // Validate parent-child relationships (no circular references)
      validParentRelationship:
        (type: 'brand' | 'category', itemId?: string) =>
        async (parentId: string): Promise<string | null> => {
          if (!parentId || !itemId) return null;

          try {
            // Check if setting this parent would create a circular reference
            const response = await fetch(`/api/validation/parent-relationship`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, itemId, parentId }),
            });

            const result = await response.json();
            return result.valid ? null : 'This would create a circular reference';
          } catch (error) {
            console.error('Parent relationship validation error:', error);
            return null;
          }
        },
    }),
    [],
  );

  return validators;
}

// Type-safe validation builders for specific forms
export function useProductValidation(productId?: string) {
  const validators = useAsyncValidation();

  return {
    sku: validators.uniqueSku(productId),
  };
}

export function useBrandValidation(brandId?: string) {
  const validators = useAsyncValidation();

  return {
    name: validators.uniqueName('brand', brandId),
    slug: validators.uniqueSlug('brand', brandId),
    parentId: validators.validParentRelationship('brand', brandId),
  };
}

export function useCategoryValidation(categoryId?: string) {
  const validators = useAsyncValidation();

  return {
    name: validators.uniqueName('category', categoryId),
    slug: validators.uniqueSlug('category', categoryId),
    parentId: validators.validParentRelationship('category', categoryId),
  };
}

export function useTaxonomyValidation(taxonomyId?: string) {
  const validators = useAsyncValidation();

  return {
    name: validators.uniqueName('collection', taxonomyId), // Using collection type for now
    slug: validators.uniqueSlug('taxonomy', taxonomyId),
  };
}

export function useUserValidation(userId?: string) {
  const validators = useAsyncValidation();

  return {
    email: validators.uniqueEmail(userId),
  };
}
