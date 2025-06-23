import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutDeletedByInputSchema } from './RegistryCreateWithoutDeletedByInputSchema';
import { RegistryUncheckedCreateWithoutDeletedByInputSchema } from './RegistryUncheckedCreateWithoutDeletedByInputSchema';
import { RegistryCreateOrConnectWithoutDeletedByInputSchema } from './RegistryCreateOrConnectWithoutDeletedByInputSchema';
import { RegistryUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './RegistryUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { RegistryCreateManyDeletedByInputEnvelopeSchema } from './RegistryCreateManyDeletedByInputEnvelopeSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './RegistryUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { RegistryUpdateManyWithWhereWithoutDeletedByInputSchema } from './RegistryUpdateManyWithWhereWithoutDeletedByInputSchema';
import { RegistryScalarWhereInputSchema } from './RegistryScalarWhereInputSchema';

export const RegistryUncheckedUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.RegistryUncheckedUpdateManyWithoutDeletedByNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => RegistryUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => RegistryUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryCreateManyDeletedByInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => RegistryWhereUniqueInputSchema),
          z.lazy(() => RegistryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => RegistryWhereUniqueInputSchema),
          z.lazy(() => RegistryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => RegistryWhereUniqueInputSchema),
          z.lazy(() => RegistryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => RegistryWhereUniqueInputSchema),
          z.lazy(() => RegistryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => RegistryUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => RegistryUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => RegistryUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => RegistryUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => RegistryScalarWhereInputSchema),
          z.lazy(() => RegistryScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryUncheckedUpdateManyWithoutDeletedByNestedInputSchema;
