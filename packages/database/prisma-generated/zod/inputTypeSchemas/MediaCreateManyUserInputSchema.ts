import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaTypeSchema } from './MediaTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const MediaCreateManyUserInputSchema: z.ZodType<Prisma.MediaCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string(),
  altText: z.string().optional().nullable(),
  type: z.lazy(() => MediaTypeSchema).optional(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  size: z.number().int().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  articleId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  taxonomyId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  pdpJoinId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  reviewId: z.string().optional().nullable()
}).strict();

export default MediaCreateManyUserInputSchema;
