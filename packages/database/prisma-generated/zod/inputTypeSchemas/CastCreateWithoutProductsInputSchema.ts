import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema';
import { UserCreateNestedOneWithoutDeletedCastsInputSchema } from './UserCreateNestedOneWithoutDeletedCastsInputSchema';

export const CastCreateWithoutProductsInputSchema: z.ZodType<Prisma.CastCreateWithoutProductsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedCastsInputSchema).optional()
}).strict();

export default CastCreateWithoutProductsInputSchema;
