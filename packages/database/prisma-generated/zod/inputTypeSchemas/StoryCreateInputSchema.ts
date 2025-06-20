import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { SeriesCreateNestedOneWithoutStoriesInputSchema } from './SeriesCreateNestedOneWithoutStoriesInputSchema';
import { FandomCreateNestedOneWithoutStoriesInputSchema } from './FandomCreateNestedOneWithoutStoriesInputSchema';
import { ProductCreateNestedManyWithoutStoriesInputSchema } from './ProductCreateNestedManyWithoutStoriesInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutStoriesInputSchema';
import { UserCreateNestedOneWithoutDeletedStoriesInputSchema } from './UserCreateNestedOneWithoutDeletedStoriesInputSchema';

export const StoryCreateInputSchema: z.ZodType<Prisma.StoryCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  displayOrder: z.number().int().optional(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  series: z.lazy(() => SeriesCreateNestedOneWithoutStoriesInputSchema).optional(),
  fandom: z.lazy(() => FandomCreateNestedOneWithoutStoriesInputSchema),
  products: z.lazy(() => ProductCreateNestedManyWithoutStoriesInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectCreateNestedManyWithoutStoriesInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedStoriesInputSchema).optional()
}).strict();

export default StoryCreateInputSchema;
