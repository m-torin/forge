import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { FandomCreateNestedOneWithoutStoriesInputSchema } from './FandomCreateNestedOneWithoutStoriesInputSchema';
import { ProductCreateNestedManyWithoutStoriesInputSchema } from './ProductCreateNestedManyWithoutStoriesInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutStoriesInputSchema';
import { UserCreateNestedOneWithoutDeletedStoriesInputSchema } from './UserCreateNestedOneWithoutDeletedStoriesInputSchema';

export const StoryCreateWithoutSeriesInputSchema: z.ZodType<Prisma.StoryCreateWithoutSeriesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  displayOrder: z.number().int().optional(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  fandom: z.lazy(() => FandomCreateNestedOneWithoutStoriesInputSchema),
  products: z.lazy(() => ProductCreateNestedManyWithoutStoriesInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectCreateNestedManyWithoutStoriesInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedStoriesInputSchema).optional()
}).strict();

export default StoryCreateWithoutSeriesInputSchema;
