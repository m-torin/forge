import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutCastsInputSchema } from './ProductUncheckedCreateNestedManyWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutCastsInputSchema';

export const CastUncheckedCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.CastUncheckedCreateWithoutDeletedByInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      isFictional: z.boolean().optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutCastsInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutCastsInputSchema)
        .optional(),
    })
    .strict();

export default CastUncheckedCreateWithoutDeletedByInputSchema;
