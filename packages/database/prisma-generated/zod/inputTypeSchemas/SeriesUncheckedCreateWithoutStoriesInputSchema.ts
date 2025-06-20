import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutSeriesInputSchema } from './ProductUncheckedCreateNestedManyWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutSeriesInputSchema';

export const SeriesUncheckedCreateWithoutStoriesInputSchema: z.ZodType<Prisma.SeriesUncheckedCreateWithoutStoriesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  fandomId: z.string(),
  displayOrder: z.number().int().optional(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutSeriesInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutSeriesInputSchema).optional()
}).strict();

export default SeriesUncheckedCreateWithoutStoriesInputSchema;
