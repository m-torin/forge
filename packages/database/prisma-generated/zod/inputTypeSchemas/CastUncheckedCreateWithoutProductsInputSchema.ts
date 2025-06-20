import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutCastsInputSchema';

export const CastUncheckedCreateWithoutProductsInputSchema: z.ZodType<Prisma.CastUncheckedCreateWithoutProductsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutCastsInputSchema).optional()
}).strict();

export default CastUncheckedCreateWithoutProductsInputSchema;
