import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductCreateNestedManyWithoutCastsInputSchema } from './ProductCreateNestedManyWithoutCastsInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema';
import { UserCreateNestedOneWithoutDeletedCastsInputSchema } from './UserCreateNestedOneWithoutDeletedCastsInputSchema';

export const CastCreateInputSchema: z.ZodType<Prisma.CastCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string(),
    slug: z.string(),
    isFictional: z.boolean().optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    products: z.lazy(() => ProductCreateNestedManyWithoutCastsInputSchema).optional(),
    jrFindReplaceRejects: z
      .lazy(() => JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema)
      .optional(),
    deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedCastsInputSchema).optional(),
  })
  .strict();

export default CastCreateInputSchema;
