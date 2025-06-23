import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutDeletedByInputSchema } from './RegistryCreateWithoutDeletedByInputSchema';
import { RegistryUncheckedCreateWithoutDeletedByInputSchema } from './RegistryUncheckedCreateWithoutDeletedByInputSchema';
import { RegistryCreateOrConnectWithoutDeletedByInputSchema } from './RegistryCreateOrConnectWithoutDeletedByInputSchema';
import { RegistryCreateManyDeletedByInputEnvelopeSchema } from './RegistryCreateManyDeletedByInputEnvelopeSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';

export const RegistryUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryUncheckedCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutDeletedByInputSchema),
          z.lazy(() => RegistryCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => RegistryUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => RegistryCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => RegistryWhereUniqueInputSchema),
          z.lazy(() => RegistryWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryUncheckedCreateNestedManyWithoutDeletedByInputSchema;
