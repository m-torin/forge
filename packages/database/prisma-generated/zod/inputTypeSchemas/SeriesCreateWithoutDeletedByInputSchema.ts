import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { FandomCreateNestedOneWithoutSeriesInputSchema } from './FandomCreateNestedOneWithoutSeriesInputSchema';
import { StoryCreateNestedManyWithoutSeriesInputSchema } from './StoryCreateNestedManyWithoutSeriesInputSchema';
import { ProductCreateNestedManyWithoutSeriesInputSchema } from './ProductCreateNestedManyWithoutSeriesInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutSeriesInputSchema';

export const SeriesCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesCreateWithoutDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  displayOrder: z.number().int().optional(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  fandom: z.lazy(() => FandomCreateNestedOneWithoutSeriesInputSchema),
  stories: z.lazy(() => StoryCreateNestedManyWithoutSeriesInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutSeriesInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectCreateNestedManyWithoutSeriesInputSchema).optional()
}).strict();

export default SeriesCreateWithoutDeletedByInputSchema;
