import { z } from 'zod';

export const MediaScalarFieldEnumSchema = z.enum([
  'id',
  'url',
  'altText',
  'type',
  'width',
  'height',
  'size',
  'mimeType',
  'sortOrder',
  'userId',
  'copy',
  'articleId',
  'brandId',
  'collectionId',
  'productId',
  'taxonomyId',
  'categoryId',
  'pdpJoinId',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
  'reviewId',
]);

export default MediaScalarFieldEnumSchema;
