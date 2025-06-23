import { z } from 'zod';

export const ArticleScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
  'title',
  'slug',
  'content',
  'status',
  'userId',
]);

export default ArticleScalarFieldEnumSchema;
