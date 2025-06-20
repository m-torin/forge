import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { StoryUncheckedCreateNestedManyWithoutFandomInputSchema } from './StoryUncheckedCreateNestedManyWithoutFandomInputSchema';
import { ProductUncheckedCreateNestedManyWithoutFandomsInputSchema } from './ProductUncheckedCreateNestedManyWithoutFandomsInputSchema';
import { LocationUncheckedCreateNestedManyWithoutFandomsInputSchema } from './LocationUncheckedCreateNestedManyWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutFandomsInputSchema';

export const FandomUncheckedCreateWithoutSeriesInputSchema: z.ZodType<Prisma.FandomUncheckedCreateWithoutSeriesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  stories: z.lazy(() => StoryUncheckedCreateNestedManyWithoutFandomInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutFandomsInputSchema).optional(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutFandomsInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutFandomsInputSchema).optional()
}).strict();

export default FandomUncheckedCreateWithoutSeriesInputSchema;
