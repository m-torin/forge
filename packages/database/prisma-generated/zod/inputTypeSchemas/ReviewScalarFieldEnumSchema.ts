import { z } from 'zod';

export const ReviewScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
  'title',
  'content',
  'rating',
  'status',
  'verified',
  'type',
  'sourceId',
  'source',
  'helpfulCount',
  'totalVotes',
  'userId',
  'productId',
]);

export default ReviewScalarFieldEnumSchema;
