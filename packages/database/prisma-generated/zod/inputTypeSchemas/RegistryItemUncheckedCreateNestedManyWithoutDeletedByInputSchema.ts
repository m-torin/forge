import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutDeletedByInputSchema } from './RegistryItemCreateWithoutDeletedByInputSchema';
import { RegistryItemUncheckedCreateWithoutDeletedByInputSchema } from './RegistryItemUncheckedCreateWithoutDeletedByInputSchema';
import { RegistryItemCreateOrConnectWithoutDeletedByInputSchema } from './RegistryItemCreateOrConnectWithoutDeletedByInputSchema';
import { RegistryItemCreateManyDeletedByInputEnvelopeSchema } from './RegistryItemCreateManyDeletedByInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';

export const RegistryItemUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemUncheckedCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryItemCreateWithoutDeletedByInputSchema),
          z.lazy(() => RegistryItemCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => RegistryItemUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => RegistryItemUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryItemCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => RegistryItemCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryItemCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryItemUncheckedCreateNestedManyWithoutDeletedByInputSchema;
