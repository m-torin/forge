import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { SeriesUncheckedCreateNestedManyWithoutFandomInputSchema } from './SeriesUncheckedCreateNestedManyWithoutFandomInputSchema';
import { StoryUncheckedCreateNestedManyWithoutFandomInputSchema } from './StoryUncheckedCreateNestedManyWithoutFandomInputSchema';
import { ProductUncheckedCreateNestedManyWithoutFandomsInputSchema } from './ProductUncheckedCreateNestedManyWithoutFandomsInputSchema';
import { LocationUncheckedCreateNestedManyWithoutFandomsInputSchema } from './LocationUncheckedCreateNestedManyWithoutFandomsInputSchema';

export const FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.FandomUncheckedCreateWithoutJrFindReplaceRejectsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  series: z.lazy(() => SeriesUncheckedCreateNestedManyWithoutFandomInputSchema).optional(),
  stories: z.lazy(() => StoryUncheckedCreateNestedManyWithoutFandomInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutFandomsInputSchema).optional(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutFandomsInputSchema).optional()
}).strict();

export default FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema;
