import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutDeletedByInputSchema } from './FandomCreateWithoutDeletedByInputSchema';
import { FandomUncheckedCreateWithoutDeletedByInputSchema } from './FandomUncheckedCreateWithoutDeletedByInputSchema';
import { FandomCreateOrConnectWithoutDeletedByInputSchema } from './FandomCreateOrConnectWithoutDeletedByInputSchema';
import { FandomCreateManyDeletedByInputEnvelopeSchema } from './FandomCreateManyDeletedByInputEnvelopeSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';

export const FandomCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.FandomCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FandomCreateWithoutDeletedByInputSchema),
          z.lazy(() => FandomCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => FandomUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => FandomUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => FandomCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => FandomCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => FandomCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => FandomWhereUniqueInputSchema),
          z.lazy(() => FandomWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default FandomCreateNestedManyWithoutDeletedByInputSchema;
