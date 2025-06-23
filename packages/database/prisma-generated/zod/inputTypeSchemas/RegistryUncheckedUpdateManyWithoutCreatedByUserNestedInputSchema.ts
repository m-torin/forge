import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutCreatedByUserInputSchema } from './RegistryCreateWithoutCreatedByUserInputSchema';
import { RegistryUncheckedCreateWithoutCreatedByUserInputSchema } from './RegistryUncheckedCreateWithoutCreatedByUserInputSchema';
import { RegistryCreateOrConnectWithoutCreatedByUserInputSchema } from './RegistryCreateOrConnectWithoutCreatedByUserInputSchema';
import { RegistryUpsertWithWhereUniqueWithoutCreatedByUserInputSchema } from './RegistryUpsertWithWhereUniqueWithoutCreatedByUserInputSchema';
import { RegistryCreateManyCreatedByUserInputEnvelopeSchema } from './RegistryCreateManyCreatedByUserInputEnvelopeSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateWithWhereUniqueWithoutCreatedByUserInputSchema } from './RegistryUpdateWithWhereUniqueWithoutCreatedByUserInputSchema';
import { RegistryUpdateManyWithWhereWithoutCreatedByUserInputSchema } from './RegistryUpdateManyWithWhereWithoutCreatedByUserInputSchema';
import { RegistryScalarWhereInputSchema } from './RegistryScalarWhereInputSchema';

export const RegistryUncheckedUpdateManyWithoutCreatedByUserNestedInputSchema: z.ZodType<Prisma.RegistryUncheckedUpdateManyWithoutCreatedByUserNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryCreateWithoutCreatedByUserInputSchema).array(),
          z.lazy(() => RegistryUncheckedCreateWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutCreatedByUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryCreateOrConnectWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryCreateOrConnectWithoutCreatedByUserInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => RegistryUpsertWithWhereUniqueWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryUpsertWithWhereUniqueWithoutCreatedByUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryCreateManyCreatedByUserInputEnvelopeSchema).optional(),
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
          z.lazy(() => RegistryUpdateWithWhereUniqueWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryUpdateWithWhereUniqueWithoutCreatedByUserInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => RegistryUpdateManyWithWhereWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryUpdateManyWithWhereWithoutCreatedByUserInputSchema).array(),
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

export default RegistryUncheckedUpdateManyWithoutCreatedByUserNestedInputSchema;
