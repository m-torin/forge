import { z } from 'zod';

export const ProductScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'slug',
  'sku',
  'category',
  'status',
  'brand',
  'price',
  'currency',
  'type',
  'variantPrice',
  'compareAtPrice',
  'physicalProperties',
  'displayOrder',
  'isDefault',
  'copy',
  'attributes',
  'parentId',
  'createdAt',
  'updatedAt',
  'createdBy',
  'deletedAt',
  'deletedById',
  'aiGenerated',
  'aiConfidence',
  'aiSources',
]);

export default ProductScalarFieldEnumSchema;
