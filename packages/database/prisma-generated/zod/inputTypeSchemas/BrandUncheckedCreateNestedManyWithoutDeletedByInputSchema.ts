import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutDeletedByInputSchema } from './BrandCreateWithoutDeletedByInputSchema';
import { BrandUncheckedCreateWithoutDeletedByInputSchema } from './BrandUncheckedCreateWithoutDeletedByInputSchema';
import { BrandCreateOrConnectWithoutDeletedByInputSchema } from './BrandCreateOrConnectWithoutDeletedByInputSchema';
import { BrandCreateManyDeletedByInputEnvelopeSchema } from './BrandCreateManyDeletedByInputEnvelopeSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.BrandUncheckedCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutDeletedByInputSchema),
          z.lazy(() => BrandCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => BrandCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default BrandUncheckedCreateNestedManyWithoutDeletedByInputSchema;
