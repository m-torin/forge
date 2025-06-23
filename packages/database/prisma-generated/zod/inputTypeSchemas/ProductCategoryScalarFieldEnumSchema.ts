import { z } from 'zod';

export const ProductCategoryScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'slug',
  'status',
  'copy',
  'parentId',
  'displayOrder',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
]);

export default ProductCategoryScalarFieldEnumSchema;
