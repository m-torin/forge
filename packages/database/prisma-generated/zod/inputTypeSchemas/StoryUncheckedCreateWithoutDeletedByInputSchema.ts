import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutStoriesInputSchema } from './ProductUncheckedCreateNestedManyWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutStoriesInputSchema';

export const StoryUncheckedCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.StoryUncheckedCreateWithoutDeletedByInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      seriesId: z.string().optional().nullable(),
      fandomId: z.string(),
      displayOrder: z.number().int().optional(),
      isFictional: z.boolean().optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutStoriesInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutStoriesInputSchema)
        .optional(),
    })
    .strict();

export default StoryUncheckedCreateWithoutDeletedByInputSchema;
